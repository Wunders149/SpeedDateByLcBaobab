import { Router, Request, Response } from 'express';
import { Event } from '../../models/Event.js';
import { Registration } from '../../models/Registration.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createEventSchema, updateEventSchema } from '@speed-date/shared';
import { logAudit } from '../../utils/audit.js';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();

// Public: List events
router.get('/', async (_req: Request, res: Response) => {
  const events = await Event.find({
    status: { $in: ['published', 'registration_open', 'registration_closed', 'in_progress'] },
  })
    .sort({ startAt: 1 })
    .limit(50);

  const eventsWithCount = await Promise.all(
    events.map(async (event) => {
      const registeredCount = await Registration.countDocuments({
        eventId: event._id,
        registrationStatus: { $in: ['submitted', 'pending_review', 'approved', 'checked_in'] },
      });
      return {
        id: event._id,
        name: event.name,
        slug: event.slug,
        description: event.description,
        venue: event.venue,
        timezone: event.timezone,
        startAt: event.startAt,
        endAt: event.endAt,
        registrationDeadline: event.registrationDeadline,
        capacity: event.capacity,
        registeredCount,
        eventMode: event.eventMode,
        status: event.status,
      };
    }),
  );

  res.json({ success: true, data: { events: eventsWithCount } });
});

// Public: Get event details
router.get('/:eventId', async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    throw new AppError('NOT_FOUND', 'Event not found', 404);
  }

  const registeredCount = await Registration.countDocuments({
    eventId: event._id,
    registrationStatus: { $in: ['submitted', 'pending_review', 'approved', 'checked_in'] },
  });

  res.json({
    success: true,
    data: {
      event: {
        id: event._id,
        name: event.name,
        slug: event.slug,
        description: event.description,
        venue: event.venue,
        timezone: event.timezone,
        startAt: event.startAt,
        endAt: event.endAt,
        registrationDeadline: event.registrationDeadline,
        capacity: event.capacity,
        registeredCount,
        eligibleGroups: event.eligibleGroups,
        eventMode: event.eventMode,
        organizerContact: event.organizerContact,
        instructions: event.instructions,
        status: event.status,
      },
    },
  });
});

// Admin: Create event
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createEventSchema),
  async (req: Request, res: Response) => {
    const startAt = new Date(req.body.startAt);
    const endAt = new Date(req.body.endAt);
    const deadline = new Date(req.body.registrationDeadline);
    if (!(startAt < endAt) || deadline > startAt) {
      throw new AppError('INVALID_DATES', 'The event must end after it starts, and registration must close by the start time', 400);
    }
    const event = await Event.create({
      ...req.body,
      createdBy: req.user!.userId,
      status: 'draft',
    });

    await logAudit(req, 'event.created', 'event', event._id.toString(), undefined, {
      name: event.name,
    });

    res.status(201).json({
      success: true,
      data: { event },
    });
  },
);

// Admin: Update event
router.patch(
  '/:eventId',
  authenticate,
  requireAdmin,
  validate(updateEventSchema),
  async (req: Request, res: Response) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      throw new AppError('NOT_FOUND', 'Event not found', 404);
    }

    // Prevent editing finalized events
    if (event.status === 'completed' || event.status === 'archived') {
      throw new AppError('INVALID_STATE', 'Cannot modify a completed or archived event', 400);
    }

    const nextStart = req.body.startAt ? new Date(req.body.startAt) : event.startAt;
    const nextEnd = req.body.endAt ? new Date(req.body.endAt) : event.endAt;
    const nextDeadline = req.body.registrationDeadline ? new Date(req.body.registrationDeadline) : event.registrationDeadline;
    if (!(nextStart < nextEnd) || nextDeadline > nextStart) {
      throw new AppError('INVALID_DATES', 'The event must end after it starts, and registration must close by the start time', 400);
    }

    Object.assign(event, req.body);
    await event.save();

    await logAudit(req, 'event.updated', 'event', event._id.toString());

    res.json({
      success: true,
      data: { event },
    });
  },
);

// Admin: Publish event
router.post(
  '/:eventId/publish',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      throw new AppError('NOT_FOUND', 'Event not found', 404);
    }

    if (event.status !== 'draft') {
      throw new AppError('INVALID_STATE', 'Only draft events can be published', 400);
    }

    event.status = 'published';
    await event.save();

    await logAudit(req, 'event.published', 'event', event._id.toString());

    res.json({
      success: true,
      data: { event },
    });
  },
);

// Admin: Open registration
router.post(
  '/:eventId/open-registration',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      throw new AppError('NOT_FOUND', 'Event not found', 404);
    }

    if (event.status !== 'published') {
      throw new AppError(
        'INVALID_STATE',
        'Event must be published before opening registration',
        400,
      );
    }

    event.status = 'registration_open';
    await event.save();

    await logAudit(req, 'event.registration_opened', 'event', event._id.toString());

    res.json({
      success: true,
      data: { event },
    });
  },
);

// Admin: Close registration
router.post(
  '/:eventId/close-registration',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      throw new AppError('NOT_FOUND', 'Event not found', 404);
    }

    if (event.status !== 'registration_open') {
      throw new AppError('INVALID_STATE', 'Only an event with open registration can be closed', 400);
    }

    event.status = 'registration_closed';
    await event.save();

    await logAudit(req, 'event.registration_closed', 'event', event._id.toString());

    res.json({
      success: true,
      data: { event },
    });
  },
);

router.post('/:eventId/start', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
  if (!['registration_open', 'registration_closed'].includes(event.status)) {
    throw new AppError('INVALID_STATE', 'Close registration before starting the event', 400);
  }
  event.status = 'in_progress';
  await event.save();
  await logAudit(req, 'event.started', 'event', event._id.toString());
  res.json({ success: true, data: { event } });
});

router.post('/:eventId/complete', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
  if (event.status !== 'in_progress') throw new AppError('INVALID_STATE', 'Only an in-progress event can be completed', 400);
  event.status = 'completed';
  await event.save();
  await logAudit(req, 'event.completed', 'event', event._id.toString());
  res.json({ success: true, data: { event } });
});

// Admin: Archive event
router.post(
  '/:eventId/archive',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      throw new AppError('NOT_FOUND', 'Event not found', 404);
    }

    event.status = 'archived';
    await event.save();

    await logAudit(req, 'event.archived', 'event', event._id.toString());

    res.json({
      success: true,
      data: { event },
    });
  },
);

export default router;
