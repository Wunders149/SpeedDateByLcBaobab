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
import { createNotificationServiceFromEnv } from '../../services/notifications.service.js';
import { AppError } from '../../middleware/errorHandler.js';
import { hashPassword } from '../../utils/auth.js';
import { Match } from '../../models/Match.js';
import { MatchRun } from '../../models/MatchRun.js';
import { ParticipantProfile } from '../../models/ParticipantProfile.js';
import { randomBytes } from 'node:crypto';

const router = Router();

// Organizer event list. Public event listing intentionally excludes drafts.
router.get('/events', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  const events = await Event.find().sort({ startAt: -1 }).lean();
  const counts = await Promise.all(
    events.map((event) => Registration.countDocuments({
      eventId: event._id,
      registrationStatus: { $in: ['submitted', 'pending_review', 'approved', 'checked_in'] },
    })),
  );
  res.json({ success: true, data: { events: events.map((event, index) => ({ ...event, registeredCount: counts[index] })) } });
});

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
    Registration.countDocuments({ registrationStatus: { $in: ['submitted', 'pending_review'] } }),
    Registration.countDocuments({ registrationStatus: { $in: ['approved', 'checked_in'] } }),
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
  if (search) {
    const escapedSearch = (search as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.email = { $regex: escapedSearch, $options: 'i' };
  }

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

    const [profile, registrations] = await Promise.all([
      ParticipantProfile.findOne({ userId: participant._id }).lean(),
      Registration.find({ participantId: participant._id }).populate(
      'eventId',
      'name slug startAt',
      ),
    ]);

    res.json({
      success: true,
      data: { participant, profile, registrations },
    });
  },
);

router.patch('/participants/:participantId/status', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const status = req.body.accountStatus;
  if (!['active', 'suspended', 'deactivated'].includes(status)) throw new AppError('INVALID_STATUS', 'Invalid account status', 400);
  const participant = await User.findOneAndUpdate(
    { _id: req.params.participantId, roles: 'participant' },
    { accountStatus: status },
    { new: true },
  ).select('-passwordHash');
  if (!participant) throw new AppError('NOT_FOUND', 'Participant not found', 404);
  await logAudit(req, `participant.${status}`, 'user', participant._id.toString());
  res.json({ success: true, data: { participant } });
});

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

    const tempPassword = randomBytes(18).toString('base64url');
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

    if (admin._id.toString() === req.user!.userId && (req.body.role || req.body.accountStatus)) {
      throw new AppError('SELF_MODIFICATION', 'Cannot change your own role or account status', 400);
    }

    if (req.body.role) admin.roles = [req.body.role];
    if (req.body.accountStatus) admin.accountStatus = req.body.accountStatus;
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
    const { recipientId, eventId, type, title, message, channels } = req.body;

    const recipient = await User.findById(recipientId).select('email').lean();

    const service = createNotificationServiceFromEnv(async (payload) => {
      return Notification.create({
        recipientId: payload.recipientId,
        eventId: payload.eventId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
      });
    });

    const results = await service.send({
      recipientId,
      eventId,
      email: recipient?.email as string | undefined,
      type,
      title,
      message,
      channels: channels ?? ['in_app'],
    });

    await logAudit(req, 'notification.sent', 'notification', recipientId, undefined, {
      type,
      channels: channels ?? ['in_app'],
    });

    res.status(201).json({ success: true, data: { results } });
  },
);

router.post('/events/:eventId/announcements', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { title, message, channels = ['in_app'] } = req.body as { title?: string; message?: string; channels?: string[] };
  if (typeof title !== 'string' || title.trim().length < 2 || title.length > 200 || typeof message !== 'string' || message.trim().length < 2 || message.length > 5000) {
    throw new AppError('INVALID_ANNOUNCEMENT', 'Title and message are required and must be within the supported length', 400);
  }
  if (!Array.isArray(channels) || channels.some((channel) => !['in_app', 'email', 'sms'].includes(channel))) {
    throw new AppError('INVALID_CHANNELS', 'Choose valid notification channels', 400);
  }
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
  const registrations = await Registration.find({ eventId, registrationStatus: { $in: ['submitted', 'pending_review', 'approved', 'waitlisted', 'checked_in'] } }).select('participantId');
  const participantIds = [...new Set(registrations.map((registration) => registration.participantId.toString()))];
  const recipients = await User.find({ _id: { $in: participantIds }, accountStatus: 'active' }).select('email phone').lean();
  const service = createNotificationServiceFromEnv(async (payload) => Notification.create({
    recipientId: payload.recipientId, eventId, type: 'event_announcement', title: title.trim(), message: message.trim(),
  }));
  const results = await Promise.all(recipients.map((recipient) => service.send({
    recipientId: recipient._id.toString(), eventId, email: recipient.email, phone: recipient.phone,
    type: 'event_announcement', title: title.trim(), message: message.trim(),
    channels: channels as Array<'in_app' | 'email' | 'sms'>,
  })));
  await logAudit(req, 'event.announcement_sent', 'event', eventId, undefined, { recipientCount: recipients.length, channels });
  res.status(201).json({ success: true, data: { recipientCount: recipients.length, deliveries: results.flat() } });
});

// ─── Analytics ───────────────────────────────────────────────────────────────

router.get(
  '/events/:eventId/analytics',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;

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
      Registration.countDocuments({ eventId, registrationStatus: { $in: ['approved', 'checked_in'] } }),
      Registration.countDocuments({ eventId, registrationStatus: 'waitlisted' }),
      Registration.countDocuments({ eventId, checkInStatus: 'checked_in' }),
      Registration.countDocuments({ eventId, questionnaireStatus: 'submitted' }),
    ]);
    const publishedRun = await MatchRun.findOne({ eventId, status: 'published' }).sort({ publishedAt: -1 });
    const publishedMatches = publishedRun ? await Match.find({ matchRunId: publishedRun._id, matchStatus: 'published' }).select('participantAId participantBId mutualCompatibilityScore').lean() : [];
    const matchedParticipants = new Set(publishedMatches.flatMap((match) => [match.participantAId.toString(), match.participantBId.toString()]));
    const scoreDistribution = [0, 0, 0, 0, 0];
    for (const match of publishedMatches) scoreDistribution[Math.min(4, Math.floor(match.mutualCompatibilityScore / 20))] += 1;
    const averageCompatibility = publishedMatches.length
      ? publishedMatches.reduce((sum, match) => sum + match.mutualCompatibilityScore, 0) / publishedMatches.length
      : 0;

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
          matchCount: publishedMatches.length,
          matchedParticipants: matchedParticipants.size,
          averageCompatibility: Math.round(averageCompatibility * 10) / 10,
          scoreDistribution,
        },
        rates: {
          approvalRate: totalRegistrations > 0 ? approvedCount / totalRegistrations : 0,
          checkInRate: approvedCount > 0 ? checkedInCount / approvedCount : 0,
          questionnaireCompletionRate:
            approvedCount > 0 ? questionnaireSubmittedCount / approvedCount : 0,
          matchRate: approvedCount > 0 ? matchedParticipants.size / approvedCount : 0,
        },
      },
    });
  },
);

router.get('/events/:eventId/match-runs', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const runs = await MatchRun.find({ eventId: req.params.eventId }).sort({ createdAt: -1 }).lean();
  const data = await Promise.all(runs.map(async (run) => ({
    ...run,
    matchCount: await Match.countDocuments({ matchRunId: run._id }),
  })));
  res.json({ success: true, data: { runs: data } });
});

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

    const csvCell = (value: unknown) => {
      const text = String(value ?? '');
      const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const csv = [
      ['Email', 'Status', 'Registered At', 'Approved At', 'Checked In At'].map(csvCell).join(','),
      ...registrations.map((r) => [
        (r.participantId as unknown as { email: string }).email,
        r.registrationStatus,
        r.registeredAt.toISOString(),
        r.approvedAt?.toISOString(),
        r.checkedInAt?.toISOString(),
      ].map(csvCell).join(',')),
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="participants-${eventId}.csv"`);
    res.send(csv);
  },
);

router.get('/events/:eventId/exports/matches', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const run = await MatchRun.findOne({ eventId: req.params.eventId, status: 'published' }).sort({ publishedAt: -1 });
  if (!run) throw new AppError('NO_RESULTS', 'No published results are available to export', 404);
  const matches = await Match.find({ matchRunId: run._id, matchStatus: 'published' })
    .populate('participantAId', 'email').populate('participantBId', 'email').lean();
  const csvCell = (value: unknown) => {
    const text = String(value ?? '');
    const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = [
    ['Participant A', 'Participant B', 'Compatibility Score'].map(csvCell).join(','),
    ...matches.map((match) => [
      (match.participantAId as unknown as { email?: string }).email,
      (match.participantBId as unknown as { email?: string }).email,
      match.mutualCompatibilityScore,
    ].map(csvCell).join(',')),
  ].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="matches-${req.params.eventId}.csv"`);
  res.send(csv);
});

export default router;
