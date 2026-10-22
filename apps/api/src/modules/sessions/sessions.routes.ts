import { Router, Request, Response } from 'express';
import { Event } from '../../models/Event.js';
import { Registration } from '../../models/Registration.js';
import { SpeedDatingSession } from '../../models/SpeedDatingSession.js';
import { ParticipantProfile } from '../../models/ParticipantProfile.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logAudit } from '../../utils/audit.js';

const router = Router();

router.get('/my-sessions', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const sessions = await SpeedDatingSession.find({
    $or: [{ 'schedule.participantAId': userId }, { 'schedule.participantBId': userId }],
  }).populate('eventId', 'name venue startAt endAt').sort({ startAt: -1 });
  const participantIds = new Set<string>();
  for (const session of sessions) for (const pairing of session.schedule) {
    participantIds.add(pairing.participantAId.toString());
    participantIds.add(pairing.participantBId.toString());
  }
  const profiles = await ParticipantProfile.find({ userId: { $in: [...participantIds] } }).select('userId displayName').lean();
  const names = new Map(profiles.map((profile) => [profile.userId.toString(), profile.displayName]));
  const results = sessions.map((session) => ({
    id: session._id,
    name: session.name,
    status: session.status,
    rounds: session.rounds,
    event: session.eventId,
    schedule: session.schedule.filter((pairing) => pairing.participantAId.toString() === userId || pairing.participantBId.toString() === userId).map((pairing) => {
      const isA = pairing.participantAId.toString() === userId;
      const partnerId = isA ? pairing.participantBId : pairing.participantAId;
      return { round: pairing.round, tableNumber: pairing.tableNumber, startTime: pairing.startTime, endTime: pairing.endTime, partnerName: names.get(partnerId.toString()) ?? 'Participant' };
    }),
  }));
  res.json({ success: true, data: { sessions: results } });
});

router.get('/admin/events/:eventId/sessions', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const sessions = await SpeedDatingSession.find({ eventId: req.params.eventId })
    .populate('schedule.participantAId', 'email')
    .populate('schedule.participantBId', 'email')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: { sessions } });
});

router.post('/admin/events/:eventId/sessions/generate', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const rounds = Number(req.body.rounds);
  const durationMinutes = Number(req.body.durationMinutes);
  const tableCount = Number(req.body.tableCount);
  if (!Number.isInteger(rounds) || rounds < 1 || rounds > 30 || !Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 120 || !Number.isInteger(tableCount) || tableCount < 1 || tableCount > 100) {
    throw new AppError('INVALID_CONFIGURATION', 'Rounds, duration, and table count must be valid positive integers', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
  const registrations = await Registration.find({ eventId, registrationStatus: { $in: ['approved', 'checked_in'] } })
    .select('participantId').sort({ registeredAt: 1 });
  if (registrations.length < 2) throw new AppError('INSUFFICIENT_PARTICIPANTS', 'At least two approved participants are required', 400);

  const ids = registrations.map((registration) => registration.participantId);
  if (tableCount < Math.floor(ids.length / 2)) throw new AppError('INSUFFICIENT_TABLES', `At least ${Math.floor(ids.length / 2)} tables are needed`, 400);
  const roster: Array<typeof ids[number] | null> = [...ids];
  if (roster.length % 2) roster.push(null);
  const maxRounds = roster.length - 1;
  if (rounds > maxRounds) throw new AppError('TOO_MANY_ROUNDS', `At most ${maxRounds} rounds are possible without repeating a pair`, 400);
  const intervalMs = durationMinutes * 60_000;
  const startAt = new Date(req.body.startAt ?? event.startAt);
  const endAt = new Date(startAt.getTime() + rounds * intervalMs);
  if (!Number.isFinite(startAt.getTime()) || startAt < event.startAt || endAt > event.endAt) {
    throw new AppError('INVALID_SCHEDULE', 'The requested rotation must fit within the event dates', 400);
  }

  const schedule: Array<{ round: number; participantAId: typeof ids[number]; participantBId: typeof ids[number]; tableNumber: number; startTime: Date; endTime: Date }> = [];
  const rotating = [...roster];
  for (let round = 1; round <= rounds; round += 1) {
    const roundStart = new Date(startAt.getTime() + (round - 1) * intervalMs);
    const roundEnd = new Date(roundStart.getTime() + intervalMs);
    for (let i = 0; i < rotating.length / 2; i += 1) {
      const a = rotating[i];
      const b = rotating[rotating.length - 1 - i];
      if (a && b) schedule.push({ round, participantAId: a, participantBId: b, tableNumber: (i % tableCount) + 1, startTime: roundStart, endTime: roundEnd });
    }
    const fixed = rotating[0];
    const rest = rotating.slice(1);
    rest.unshift(rest.pop()!);
    rotating.splice(0, rotating.length, fixed, ...rest);
  }

  const session = await SpeedDatingSession.create({
    eventId, name: req.body.name?.trim() || `${event.name} rotation`, rounds, schedule,
    startAt, endAt, status: 'scheduled',
  });
  await logAudit(req, 'session.rotation_generated', 'session', session._id.toString(), undefined, { eventId, rounds, participants: ids.length });
  res.status(201).json({ success: true, data: { session } });
});

router.patch('/admin/events/:eventId/sessions/:sessionId/status', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const allowed = ['scheduled', 'active', 'paused', 'ended'];
  const status = req.body.status;
  if (!allowed.includes(status)) throw new AppError('INVALID_STATUS', 'Invalid session status', 400);
  const session = await SpeedDatingSession.findOne({ _id: req.params.sessionId, eventId: req.params.eventId });
  if (!session) throw new AppError('NOT_FOUND', 'Session not found', 404);
  const allowedTransitions: Record<string, string[]> = { scheduled: ['active'], active: ['paused', 'ended'], paused: ['active', 'ended'], ended: [] };
  if (!allowedTransitions[session.status].includes(status)) throw new AppError('INVALID_STATE', `Cannot change a ${session.status} session to ${status}`, 400);
  session.status = status;
  await session.save();
  await logAudit(req, `session.${status}`, 'session', session._id.toString());
  res.json({ success: true, data: { session } });
});

export default router;
