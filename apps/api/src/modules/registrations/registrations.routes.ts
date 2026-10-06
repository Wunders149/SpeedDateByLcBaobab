import { Router, Request, Response } from 'express';
import { Event } from '../../models/Event.js';
import { Registration } from '../../models/Registration.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createRegistrationSchema, updateRegistrationSchema } from '@speed-date/shared';
import { logAudit } from '../../utils/audit.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Notification } from '../../models/Notification.js';

const router = Router();

// Participant: Register for event
router.post('/:eventId/registrations', authenticate, validate(createRegistrationSchema), async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const userId = req.user!.userId;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('NOT_FOUND', 'Event not found', 404);
  }

  if (event.status !== 'registration_open') {
    throw new AppError('REGISTRATION_CLOSED', 'Registration is not open for this event', 400);
  }

  if (new Date() > event.registrationDeadline) {
    throw new AppError('DEADLINE_PASSED', 'Registration deadline has passed', 400);
  }

  // Check for existing registration
  const existing = await Registration.findOne({ eventId: eventId as string, participantId: userId });
  if (existing && existing.registrationStatus !== 'withdrawn') {
    throw new AppError('ALREADY_REGISTERED', 'You are already registered for this event', 409);
  }

  // Check capacity
  const approvedCount = await Registration.countDocuments({
    eventId: eventId as string,
    registrationStatus: { $in: ['approved', 'checked_in'] },
  });

  const isWaitlisted = approvedCount >= event.capacity;

  const registration = await Registration.create({
    eventId: eventId as string,
    participantId: userId,
    registrationStatus: isWaitlisted ? 'waitlisted' : 'submitted',
    approvalStatus: isWaitlisted ? 'waitlisted' : 'pending',
    questionnaireStatus: 'not_started',
    checkInStatus: 'not_checked_in',
  });

  // Create notification
  await Notification.create({
    recipientId: userId,
    eventId: eventId as string,
    type: 'registration_received',
    title: isWaitlisted ? 'Added to Waitlist' : 'Registration Received',
    message: isWaitlisted
      ? `You have been added to the waitlist for ${event.name}.`
      : `Your registration for ${event.name} has been received and is pending review.`,
  });

  await logAudit(req, 'registration.created', 'registration', registration._id.toString(), undefined, { eventId, waitlisted: isWaitlisted });

  res.status(201).json({
    success: true,
    data: { registration },
  });
});

// Participant: Get my registration
router.get('/:eventId/my-registration', authenticate, async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const userId = req.user!.userId;

  const registration = await Registration.findOne({ eventId: eventId as string, participantId: userId });
  if (!registration) {
    throw new AppError('NOT_FOUND', 'Registration not found', 404);
  }

  res.json({
    success: true,
    data: { registration },
  });
});

// Participant: Withdraw registration
router.post('/:eventId/withdraw', authenticate, async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const userId = req.user!.userId;

  const registration = await Registration.findOne({ eventId: eventId as string, participantId: userId });
  if (!registration) {
    throw new AppError('NOT_FOUND', 'Registration not found', 404);
  }

  if (registration.registrationStatus === 'withdrawn') {
    throw new AppError('ALREADY_WITHDRAWN', 'Registration already withdrawn', 400);
  }

  registration.registrationStatus = 'withdrawn';
  registration.withdrawalAt = new Date();
  await registration.save();

  await logAudit(req, 'registration.withdrawn', 'registration', registration._id.toString());

  res.json({
    success: true,
    data: { registration },
  });
});

// Admin: List registrations for event
router.get('/admin/events/:eventId/registrations', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { status, page = '1', limit = '20' } = req.query;

  const query: Record<string, unknown> = { eventId: eventId as string };
  if (status) query.registrationStatus = status;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [registrations, total] = await Promise.all([
    Registration.find(query)
      .populate('participantId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Registration.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: { registrations },
    meta: { page: pageNum, limit: limitNum, total },
  });
});

// Admin: Update registration
router.patch('/admin/registrations/:registrationId', authenticate, requireAdmin, validate(updateRegistrationSchema), async (req: Request, res: Response) => {
  const { registrationId } = req.params;
  const { status, reason } = req.body;

  const registration = await Registration.findById(registrationId);
  if (!registration) {
    throw new AppError('NOT_FOUND', 'Registration not found', 404);
  }

  const oldStatus = registration.registrationStatus;
  registration.registrationStatus = status;

  if (status === 'approved') {
    registration.approvalStatus = 'approved';
    registration.approvedAt = new Date();
  } else if (status === 'rejected') {
    registration.approvalStatus = 'rejected';
  } else if (status === 'waitlisted') {
    registration.approvalStatus = 'waitlisted';
  }

  if (reason) registration.organizerMessage = reason;

  await registration.save();

  // Notify participant
  await Notification.create({
    recipientId: registration.participantId,
    eventId: registration.eventId,
    type: 'registration_status_changed',
    title: 'Registration Status Updated',
    message: `Your registration status has been changed to: ${status}`,
  });

  await logAudit(req, 'registration.updated', 'registration', registration._id.toString(), reason, { oldStatus, newStatus: status });

  res.json({
    success: true,
    data: { registration },
  });
});

// Admin: Check in participant
router.post('/admin/events/:eventId/check-in', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { participantId } = req.body;

  const registration = await Registration.findOne({ eventId: eventId as string, participantId });
  if (!registration) {
    throw new AppError('NOT_FOUND', 'Registration not found', 404);
  }

  if (registration.registrationStatus !== 'approved') {
    throw new AppError('INVALID_STATE', 'Only approved participants can check in', 400);
  }

  if (registration.checkInStatus === 'checked_in') {
    throw new AppError('ALREADY_CHECKED_IN', 'Participant already checked in', 400);
  }

  registration.checkInStatus = 'checked_in';
  registration.registrationStatus = 'checked_in';
  registration.checkedInAt = new Date();
  await registration.save();

  await logAudit(req, 'check_in.completed', 'registration', registration._id.toString());

  res.json({
    success: true,
    data: { registration },
  });
});

export default router;
