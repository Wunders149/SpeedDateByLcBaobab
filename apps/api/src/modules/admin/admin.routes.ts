import { Router, Request, Response } from 'express';
import { User } from '../../models/User.js';
import { Event } from '../../models/Event.js';
import { Registration } from '../../models/Registration.js';
import { AuditLog } from '../../models/AuditLog.js';
import { Notification } from '../../models/Notification.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createAdminSchema, updateAdminSchema, createNotificationSchema } from '@speed-date/shared';
import { logAudit } from '../../utils/audit.js';
import { AppError } from '../../middleware/errorHandler.js';
import { hashPassword } from '../../utils/auth.js';

const router = Router();

// ─── Dashboard Overview ──────────────────────────────────────────────────────

router.get('/dashboard', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  const [
    totalParticipants,
    totalEvents,
    pendingRegistrations,
    approvedRegistrations,
    waitlistedRegistrations,
    checkedInParticipants,
    recentActivity,
  ] = await Promise.all([
    User.countDocuments({ roles: 'participant', accountStatus: 'active' }),
    Event.countDocuments(),
    Registration.countDocuments({ registrationStatus: 'pending_review' }),
    Registration.countDocuments({ registrationStatus: 'approved' }),
    Registration.countDocuments({ registrationStatus: 'waitlisted' }),
    Registration.countDocuments({ checkInStatus: 'checked_in' }),
    AuditLog.find().sort({ timestamp: -1 }).limit(10),
  ]);

  const events = await Event.find().sort({ startAt: -1 }).limit(5);

  res.json({
    success: true,
    data: {
      overview: {
        totalParticipants,
        totalEvents,
        pendingRegistrations,
        approvedRegistrations,
        waitlistedRegistrations,
        checkedInParticipants,
      },
      recentActivity,
      upcomingEvents: events,
    },
  });
});

// ─── Participant Management ───────────────────────────────────────────────────

router.get('/participants', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { status, eventId, search, page = '1', limit = '20' } = req.query;

  const query: Record<string, unknown> = { roles: 'participant' };
  if (status) query.accountStatus = status;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  let participants = await User.find(query)
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Filter by event if specified
  if (eventId) {
    const registrations = await Registration.find({ eventId: eventId as string });
    const participantIds = registrations.map((r) => r.participantId.toString());
    participants = participants.filter((p) => participantIds.includes(p._id.toString()));
  }

  // Search filter
  if (search) {
    const searchLower = (search as string).toLowerCase();
    participants = participants.filter((p) => p.email.toLowerCase().includes(searchLower));
  }

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: { participants },
    meta: { page: pageNum, limit: limitNum, total },
  });
});

router.get(
  '/participants/:participantId',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const participant = await User.findById(req.params.participantId).select('-passwordHash');
    if (!participant) throw new AppError('NOT_FOUND', 'Participant not found', 404);

    const registrations = await Registration.find({ participantId: participant._id }).populate(
      'eventId',
      'name slug startAt',
    );

    res.json({
      success: true,
      data: { participant, registrations },
    });
  },
);

// ─── Admin Management ────────────────────────────────────────────────────────

router.get('/admins', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  const admins = await User.find({ roles: { $in: ['event_admin', 'super_admin', 'moderator'] } })
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: { admins } });
});

router.post(
  '/admins',
  authenticate,
  requireAdmin,
  validate(createAdminSchema),
  async (req: Request, res: Response) => {
    const { email, role } = req.body;

    const existing = await User.findOne({ normalizedEmail: email.toLowerCase() });
    if (existing) throw new AppError('EMAIL_EXISTS', 'A user with this email already exists', 409);

    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await hashPassword(tempPassword);

    const admin = await User.create({
      email,
      normalizedEmail: email.toLowerCase(),
      passwordHash,
      roles: [role],
      accountStatus: 'active',
    });

    await logAudit(req, 'admin.created', 'user', admin._id.toString(), undefined, { role, email });

    res.status(201).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          roles: admin.roles,
        },
        tempPassword, // In production, send via email
      },
    });
  },
);

router.patch(
  '/admins/:adminId',
  authenticate,
  requireAdmin,
  validate(updateAdminSchema),
  async (req: Request, res: Response) => {
    const admin = await User.findById(req.params.adminId);
    if (!admin) throw new AppError('NOT_FOUND', 'Admin not found', 404);

    // Prevent self-demotion
    if (admin._id.toString() === req.user!.userId && req.body.role) {
      throw new AppError('SELF_MODIFICATION', 'Cannot change your own role', 400);
    }

    Object.assign(admin, req.body);
    await admin.save();

    await logAudit(req, 'admin.updated', 'user', admin._id.toString());

    res.json({ success: true, data: { admin } });
  },
);

// ─── Audit Logs ──────────────────────────────────────────────────────────────

router.get('/audit-logs', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { eventId, action, page = '1', limit = '50' } = req.query;

  const query: Record<string, unknown> = {};
  if (eventId) query.eventId = eventId;
  if (action) query.action = action;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limitNum),
    AuditLog.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: { logs },
    meta: { page: pageNum, limit: limitNum, total },
  });
});

// ─── Notifications ───────────────────────────────────────────────────────────

router.post(
  '/notifications',
  authenticate,
  requireAdmin,
  validate(createNotificationSchema),
  async (req: Request, res: Response) => {
    const notification = await Notification.create(req.body);
    await logAudit(req, 'notification.sent', 'notification', notification._id.toString());
    res.status(201).json({ success: true, data: { notification } });
  },
);

// ─── Analytics ───────────────────────────────────────────────────────────────

router.get(
  '/events/:eventId/analytics',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);

    const [
      totalRegistrations,
      approvedCount,
      waitlistedCount,
      checkedInCount,
      questionnaireSubmittedCount,
    ] = await Promise.all([
      Registration.countDocuments({ eventId }),
      Registration.countDocuments({ eventId, registrationStatus: 'approved' }),
      Registration.countDocuments({ eventId, registrationStatus: 'waitlisted' }),
      Registration.countDocuments({ eventId, checkInStatus: 'checked_in' }),
      Registration.countDocuments({ eventId, questionnaireStatus: 'submitted' }),
    ]);

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          name: event.name,
          capacity: event.capacity,
        },
        registrations: {
          total: totalRegistrations,
          approved: approvedCount,
          waitlisted: waitlistedCount,
          checkedIn: checkedInCount,
          questionnaireSubmitted: questionnaireSubmittedCount,
        },
        rates: {
          approvalRate: totalRegistrations > 0 ? approvedCount / totalRegistrations : 0,
          checkInRate: approvedCount > 0 ? checkedInCount / approvedCount : 0,
          questionnaireCompletionRate:
            approvedCount > 0 ? questionnaireSubmittedCount / approvedCount : 0,
        },
      },
    });
  },
);

// ─── Reports ─────────────────────────────────────────────────────────────────

router.get(
  '/events/:eventId/reports',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);

    const registrations = await Registration.find({ eventId }).populate('participantId', 'email');

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          name: event.name,
          startAt: event.startAt,
          capacity: event.capacity,
        },
        registrations: registrations.map((r) => ({
          id: r._id,
          participantId: r.participantId,
          status: r.registrationStatus,
          registeredAt: r.registeredAt,
          approvedAt: r.approvedAt,
          checkedInAt: r.checkedInAt,
        })),
      },
    });
  },
);

// ─── Export ──────────────────────────────────────────────────────────────────

router.get(
  '/events/:eventId/exports/participants',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const registrations = await Registration.find({
      eventId: eventId as string,
      registrationStatus: { $in: ['approved', 'checked_in'] },
    }).populate('participantId', 'email');

    const csv = [
      'Email,Status,Registered At,Approved At,Checked In At',
      ...registrations.map(
        (r) =>
          `${(r.participantId as unknown as { email: string }).email},${r.registrationStatus},${r.registeredAt},${r.approvedAt ?? ''},${r.checkedInAt ?? ''}`,
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="participants-${eventId}.csv"`);
    res.send(csv);
  },
);

export default router;
