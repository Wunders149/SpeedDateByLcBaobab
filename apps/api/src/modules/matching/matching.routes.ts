import { Router, Request, Response } from 'express';
import { Event } from '../../models/Event.js';
import { Registration } from '../../models/Registration.js';
import { QuestionnaireResponse } from '../../models/QuestionnaireResponse.js';
import { QuestionnaireVersion } from '../../models/QuestionnaireVersion.js';
import { Match } from '../../models/Match.js';
import { MatchRun } from '../../models/MatchRun.js';
import { Interest } from '../../models/Interest.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { generateMatchesSchema } from '@speed-date/shared';
import { logAudit } from '../../utils/audit.js';
import { AppError } from '../../middleware/errorHandler.js';
import { globalOptimalMatching, compatibilityRanking, ALGORITHM_VERSION } from '@speed-date/shared';
import { Notification } from '../../models/Notification.js';

const router = Router();

// ─── Admin: Generate Matches ─────────────────────────────────────────────────

router.post(
  '/admin/events/:eventId/matches/generate',
  authenticate,
  requireAdmin,
  validate(generateMatchesSchema),
  async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { mode, minimumThreshold, dealBreakerAction, allowMultipleMatches, respectNoRepeat } =
      req.body;

    const event = await Event.findById(eventId);
    if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
    if (!event.questionnaireVersionId)
      throw new AppError('NO_QUESTIONNAIRE', 'No questionnaire configured', 404);

    // Get approved registrations
    const registrations = await Registration.find({
      eventId: eventId as string,
      registrationStatus: { $in: ['approved', 'checked_in'] },
    });

    if (registrations.length < 2) {
      throw new AppError('INSUFFICIENT_PARTICIPANTS', 'Need at least 2 approved participants', 400);
    }

    // Get questionnaire responses
    const responses = await QuestionnaireResponse.find({
      eventId: eventId as string,
      questionnaireVersionId: event.questionnaireVersionId,
      completionStatus: 'submitted',
    });

    const responseMap = new Map(responses.map((r) => [r.participantId.toString(), r]));

    // Build participant data
    const questionnaire = await QuestionnaireVersion.findById(event.questionnaireVersionId);
    const participants = registrations
      .filter((reg) => responseMap.has(reg.participantId.toString()))
      .map((reg) => {
        const response = responseMap.get(reg.participantId.toString())!;
        return {
          id: reg.participantId.toString(),
          answers: response.answers as unknown as Array<{
            questionId: string;
            value: number | string | string[];
          }>,
          eligible: true,
          consented: true,
          completedQuestionnaire: true,
          withdrawn: false,
          suspended: false,
        };
      });

    if (participants.length < 2) {
      throw new AppError(
        'INSUFFICIENT_DATA',
        'Need at least 2 participants with completed questionnaires',
        400,
      );
    }

    const config = {
      mode,
      minimumThreshold,
      dealBreakerAction,
      allowMultipleMatches,
      respectNoRepeat,
    };

    // Generate matches
    const matchRun = await MatchRun.create({
      eventId: eventId as string,
      algorithmVersion: ALGORITHM_VERSION,
      configurationSnapshot: {
        mode,
        minimumThreshold,
        dealBreakerAction,
        allowMultipleMatches,
        respectNoRepeat,
        categoryWeights: questionnaire!.categoryWeights,
      },
      questionnaireVersionId: event.questionnaireVersionId,
      status: 'pending',
      initiatedBy: req.user!.userId,
    });

    let matchPairs;
    if (mode === 'global_optimal') {
      matchPairs = globalOptimalMatching(
        participants,
        questionnaire!.questionSnapshots as never,
        config,
        ALGORITHM_VERSION,
      );
    } else {
      const ranking = compatibilityRanking(
        participants,
        questionnaire!.questionSnapshots as never,
        config,
        10,
        ALGORITHM_VERSION,
      );
      // Flatten ranking to unique pairs
      const seen = new Set<string>();
      matchPairs = [];
      for (const [, candidates] of ranking) {
        for (const candidate of candidates) {
          const key = [candidate.participantAId, candidate.participantBId].sort().join('-');
          if (!seen.has(key)) {
            seen.add(key);
            matchPairs.push(candidate);
          }
        }
      }
    }

    // Create match documents
    const matches = await Match.insertMany(
      matchPairs.map((pair) => ({
        eventId: eventId as string,
        matchRunId: matchRun._id,
        participantAId: pair.participantAId,
        participantBId: pair.participantBId,
        directionalScoreAtoB: pair.mutualScore,
        directionalScoreBtoA: pair.mutualScore,
        mutualCompatibilityScore: pair.mutualScore,
        categoryScores: pair.categoryScores,
        eligibilityMetadata: {
          eligible: pair.eligible,
          exclusionReasons: pair.exclusionReasons,
        },
        matchStatus: 'provisional',
      })),
    );

    matchRun.status = 'generated';
    matchRun.generatedAt = new Date();
    await matchRun.save();

    await logAudit(req, 'matches.generated', 'match_run', matchRun._id.toString(), undefined, {
      matchCount: matches.length,
      mode,
    });

    res.json({
      success: true,
      data: {
        matchRun: {
          id: matchRun._id,
          status: matchRun.status,
          matchCount: matches.length,
        },
      },
    });
  },
);

// ─── Admin: Get Matches ──────────────────────────────────────────────────────

router.get(
  '/admin/events/:eventId/matches',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { status, page = '1', limit = '50' } = req.query;

    const query: Record<string, unknown> = { eventId };
    if (status) query.matchStatus = status;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [matches, total] = await Promise.all([
      Match.find(query)
        .populate('participantAId', 'email')
        .populate('participantBId', 'email')
        .sort({ mutualCompatibilityScore: -1 })
        .skip(skip)
        .limit(limitNum),
      Match.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { matches },
      meta: { page: pageNum, limit: limitNum, total },
    });
  },
);

// ─── Admin: Finalize Matches ─────────────────────────────────────────────────

router.post(
  '/admin/events/:eventId/matches/finalize',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const matchRun = await MatchRun.findOne({
      eventId: eventId as string,
      status: 'generated',
    }).sort({ createdAt: -1 });
    if (!matchRun) throw new AppError('NO_MATCH_RUN', 'No generated match run found', 404);

    await Match.updateMany(
      { matchRunId: matchRun._id },
      {
        matchStatus: 'finalized',
        finalizationMetadata: {
          finalizedAt: new Date(),
          finalizedBy: req.user!.userId,
          manuallyAdjusted: false,
        },
      },
    );

    matchRun.status = 'finalized';
    matchRun.finalizedAt = new Date();
    await matchRun.save();

    await logAudit(req, 'matches.finalized', 'match_run', matchRun._id.toString());

    res.json({ success: true, data: { matchRun } });
  },
);

// ─── Admin: Publish Matches ──────────────────────────────────────────────────

router.post(
  '/admin/events/:eventId/matches/publish',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const matchRun = await MatchRun.findOne({
      eventId: eventId as string,
      status: 'finalized',
    }).sort({ createdAt: -1 });
    if (!matchRun) throw new AppError('NO_MATCH_RUN', 'No finalized match run found', 404);

    await Match.updateMany({ matchRunId: matchRun._id }, { matchStatus: 'published' });

    matchRun.status = 'published';
    matchRun.publishedAt = new Date();
    await matchRun.save();

    // Notify participants
    const matches = await Match.find({ matchRunId: matchRun._id });
    const notifications = matches.flatMap((match) => [
      {
        recipientId: match.participantAId,
        eventId,
        type: 'match_results_published',
        title: 'Match Results Available',
        message: 'Your match results are now available. Check your dashboard!',
      },
      {
        recipientId: match.participantBId,
        eventId,
        type: 'match_results_published',
        title: 'Match Results Available',
        message: 'Your match results are now available. Check your dashboard!',
      },
    ]);
    await Notification.insertMany(notifications);

    await logAudit(req, 'matches.published', 'match_run', matchRun._id.toString());

    res.json({ success: true, data: { matchRun } });
  },
);

// ─── Participant: Get My Matches ─────────────────────────────────────────────

router.get('/events/:eventId/my-matches', authenticate, async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const userId = req.user!.userId;

  // Only show published matches
  const publishedRun = await MatchRun.findOne({
    eventId: eventId as string,
    status: 'published',
  }).sort({ createdAt: -1 });
  if (!publishedRun) {
    res.json({ success: true, data: { matches: [], message: 'Results not yet published' } });
    return;
  }

  const matches = await Match.find({
    matchRunId: publishedRun._id,
    $or: [{ participantAId: userId }, { participantBId: userId }],
    matchStatus: 'published',
  }).populate('participantAId participantBId', 'email');

  const formattedMatches = matches.map((match) => {
    const isA = match.participantAId.toString() === userId;
    const otherId = isA ? match.participantBId : match.participantAId;
    return {
      id: match._id,
      participantId: otherId,
      mutualScore: match.mutualCompatibilityScore,
      categoryScores: match.categoryScores,
    };
  });

  res.json({ success: true, data: { matches: formattedMatches } });
});

// ─── Participant: Express Interest ───────────────────────────────────────────

router.post('/events/:eventId/interests', authenticate, async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { toParticipantId } = req.body;
  const fromParticipantId = req.user!.userId;

  if (fromParticipantId === toParticipantId) {
    throw new AppError('SELF_INTEREST', 'Cannot express interest in yourself', 400);
  }

  // Check if match exists and is published
  const publishedRun = await MatchRun.findOne({ eventId: eventId as string, status: 'published' });
  if (!publishedRun) throw new AppError('NOT_PUBLISHED', 'Matches not yet published', 400);

  const match = await Match.findOne({
    matchRunId: publishedRun._id,
    $or: [
      { participantAId: fromParticipantId, participantBId: toParticipantId },
      { participantAId: toParticipantId, participantBId: fromParticipantId },
    ],
    matchStatus: 'published',
  });

  if (!match) throw new AppError('NO_MATCH', 'No published match found with this participant', 404);

  // Check for existing interest
  const existing = await Interest.findOne({
    eventId,
    fromParticipantId,
    toParticipantId,
  });

  if (existing) {
    throw new AppError('ALREADY_EXPRESSED', 'Interest already expressed', 409);
  }

  const interest = await Interest.create({
    eventId: eventId as string,
    fromParticipantId,
    toParticipantId,
    status: 'pending',
  });

  // Check for mutual interest
  const reverseInterest = await Interest.findOne({
    eventId: eventId as string,
    fromParticipantId: toParticipantId,
    toParticipantId: fromParticipantId,
    status: 'pending',
  });

  if (reverseInterest) {
    interest.status = 'mutual';
    reverseInterest.status = 'mutual';
    await interest.save();
    await reverseInterest.save();

    // Notify both participants
    await Notification.create({
      recipientId: fromParticipantId,
      eventId: eventId as string,
      type: 'mutual_match',
      title: 'Mutual Match!',
      message: 'You have a mutual match! Check your results.',
    });
    await Notification.create({
      recipientId: toParticipantId,
      eventId: eventId as string,
      type: 'mutual_match',
      title: 'Mutual Match!',
      message: 'You have a mutual match! Check your results.',
    });
  }

  await logAudit(req, 'interest.created', 'interest', interest._id.toString());

  res.status(201).json({ success: true, data: { interest } });
});

// ─── Participant: Get My Results ─────────────────────────────────────────────

router.get('/events/:eventId/my-results', authenticate, async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const userId = req.user!.userId;

  const publishedRun = await MatchRun.findOne({ eventId: eventId as string, status: 'published' });
  if (!publishedRun) {
    res.json({ success: true, data: { results: null, message: 'Results not yet published' } });
    return;
  }

  const matches = await Match.find({
    matchRunId: publishedRun._id,
    $or: [{ participantAId: userId }, { participantBId: userId }],
    matchStatus: 'published',
  });

  const interests = await Interest.find({
    eventId: eventId as string,
    fromParticipantId: userId,
  });

  const mutualMatches = interests.filter((i) => i.status === 'mutual');

  res.json({
    success: true,
    data: {
      results: {
        totalMatches: matches.length,
        mutualMatches: mutualMatches.length,
        matches: matches.map((m) => ({
          id: m._id,
          score: m.mutualCompatibilityScore,
          categoryScores: m.categoryScores,
        })),
      },
    },
  });
});

export default router;
