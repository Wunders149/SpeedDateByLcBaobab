import { Router, Request, Response } from 'express';
import { Event } from '../../models/Event.js';
import { Question } from '../../models/Question.js';
import { QuestionnaireVersion } from '../../models/QuestionnaireVersion.js';
import { QuestionnaireResponse } from '../../models/QuestionnaireResponse.js';
import { Registration } from '../../models/Registration.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  saveDraftSchema,
  submitQuestionnaireSchema,
  createQuestionSchema,
  updateQuestionSchema,
  categoryWeightsSchema,
} from '@speed-date/shared';
import { logAudit } from '../../utils/audit.js';
import { AppError } from '../../middleware/errorHandler.js';
import { calculateCompletion } from '@speed-date/shared';

const router = Router();

router.get('/admin/events/:eventId/questionnaires', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
  const versions = await QuestionnaireVersion.find({ eventId: event._id }).sort({ version: -1 }).lean();
  res.json({ success: true, data: { versions, currentQuestionnaireId: event.questionnaireVersionId?.toString() ?? null } });
});

// ─── Public Question Bank (Admin) ────────────────────────────────────────────

// Admin: List questions
router.get('/admin/questions', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  const questions = await Question.find().sort({ displayOrder: 1 });
  res.json({ success: true, data: { questions } });
});

// Admin: Create question
router.post(
  '/admin/questions',
  authenticate,
  requireAdmin,
  validate(createQuestionSchema),
  async (req: Request, res: Response) => {
    const question = await Question.create(req.body);
    await logAudit(req, 'question.created', 'question', question._id.toString());
    res.status(201).json({ success: true, data: { question } });
  },
);

// Admin: Update question
router.patch(
  '/admin/questions/:questionId',
  authenticate,
  requireAdmin,
  validate(updateQuestionSchema),
  async (req: Request, res: Response) => {
    const question = await Question.findByIdAndUpdate(req.params.questionId, req.body, {
      new: true,
    });
    if (!question) throw new AppError('NOT_FOUND', 'Question not found', 404);
    await logAudit(req, 'question.updated', 'question', question._id.toString());
    res.json({ success: true, data: { question } });
  },
);

// ─── Questionnaire Version (Admin) ───────────────────────────────────────────

// Admin: Create questionnaire version for event
router.post(
  '/admin/events/:eventId/questionnaires',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { questionIds, categoryWeights, completionThreshold } = req.body;

    if (!Array.isArray(questionIds) || !questionIds.length || questionIds.length > 200) {
      throw new AppError('INVALID_QUESTIONS', 'Select between 1 and 200 questions', 400);
    }
    const weightsResult = categoryWeightsSchema.safeParse(categoryWeights);
    if (!weightsResult.success) throw new AppError('INVALID_WEIGHTS', 'Category weights must be valid and sum to 100%', 400);
    const threshold = completionThreshold ?? 0.8;
    if (typeof threshold !== 'number' || threshold <= 0 || threshold > 1) {
      throw new AppError('INVALID_THRESHOLD', 'Completion threshold must be above 0 and at most 100%', 400);
    }

    const event = await Event.findById(eventId);
    if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);

    // Get questions
    const questions = await Question.find({
      _id: { $in: questionIds as string[] },
      active: true,
    }).sort({ displayOrder: 1 });
    if (questions.length === 0)
      throw new AppError('NO_QUESTIONS', 'No valid questions provided', 400);

    // Get latest version number
    const latestVersion = await QuestionnaireVersion.findOne({ eventId }).sort({ version: -1 });
    const nextVersion = (latestVersion?.version ?? 0) + 1;

    const questionnaire = await QuestionnaireVersion.create({
      eventId: eventId as string,
      version: nextVersion,
      questionSnapshots: questions.map((q) => ({
        questionId: q._id,
        text: q.text,
        type: q.type,
        category: q.category,
        options: q.options,
        weight: q.weight,
        scoringModel: q.scoringModel,
        required: q.required,
        dealBreakerConfig: q.dealBreakerConfig,
        tags: q.tags,
        displayOrder: q.displayOrder,
      })),
      categoryWeights,
      completionThreshold: threshold,
      createdBy: req.user!.userId,
    });

    await logAudit(
      req,
      'questionnaire.created',
      'questionnaire',
      questionnaire._id.toString(),
      undefined,
      { eventId, version: nextVersion },
    );

    res.status(201).json({ success: true, data: { questionnaire } });
  },
);

// Admin: Publish questionnaire
router.post(
  '/admin/events/:eventId/questionnaires/:versionId/publish',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { eventId, versionId } = req.params;

    const questionnaire = await QuestionnaireVersion.findById(versionId);
    if (!questionnaire) throw new AppError('NOT_FOUND', 'Questionnaire not found', 404);

    if (questionnaire.eventId.toString() !== eventId) {
      throw new AppError('FORBIDDEN', 'Questionnaire does not belong to this event', 403);
    }

    questionnaire.publishedAt = new Date();
    await questionnaire.save();

    // Update event with questionnaire reference
    await Event.findByIdAndUpdate(eventId, { questionnaireVersionId: questionnaire._id });

    await logAudit(req, 'questionnaire.published', 'questionnaire', questionnaire._id.toString());

    res.json({ success: true, data: { questionnaire } });
  },
);

// ─── Participant Questionnaire ────────────────────────────────────────────────

// Participant: Get questionnaire for event
router.get('/events/:eventId/questionnaire', authenticate, async (req: Request, res: Response) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);

  if (!event.questionnaireVersionId) {
    throw new AppError('NO_QUESTIONNAIRE', 'No questionnaire configured for this event', 404);
  }

  const questionnaire = await QuestionnaireVersion.findById(event.questionnaireVersionId);
  if (!questionnaire) throw new AppError('NOT_FOUND', 'Questionnaire not found', 404);

  // Get existing response
  const response = await QuestionnaireResponse.findOne({
    eventId: eventId as string,
    participantId: req.user!.userId,
    questionnaireVersionId: questionnaire._id,
  });

  res.json({
    success: true,
    data: {
      questionnaire: {
        id: questionnaire._id,
        version: questionnaire.version,
        questions: questionnaire.questionSnapshots,
        categoryWeights: questionnaire.categoryWeights,
        completionThreshold: questionnaire.completionThreshold,
      },
      response: response
        ? {
            answers: response.answers,
            completionStatus: response.completionStatus,
            submittedAt: response.submittedAt,
          }
        : null,
    },
  });
});

// Participant: Save draft
router.put(
  '/events/:eventId/questionnaire/draft',
  authenticate,
  validate(saveDraftSchema),
  async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { answers } = req.body;

    const event = await Event.findById(eventId);
    if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
    if (!event.questionnaireVersionId)
      throw new AppError('NO_QUESTIONNAIRE', 'No questionnaire configured', 404);

    // Check if already submitted
    const existing = await QuestionnaireResponse.findOne({
      eventId,
      participantId: req.user!.userId,
      questionnaireVersionId: event.questionnaireVersionId,
    });

    if (existing?.completionStatus === 'submitted') {
      throw new AppError('ALREADY_SUBMITTED', 'Questionnaire already submitted', 400);
    }

    const response = await QuestionnaireResponse.findOneAndUpdate(
      {
        eventId: eventId as string,
        participantId: req.user!.userId,
        questionnaireVersionId: event.questionnaireVersionId,
      },
      {
        answers,
        completionStatus: 'draft',
      },
      { upsert: true, new: true },
    );

    await logAudit(
      req,
      'questionnaire.draft_saved',
      'questionnaire_response',
      response._id.toString(),
    );

    res.json({ success: true, data: { response } });
  },
);

// Participant: Submit questionnaire
router.post(
  '/events/:eventId/questionnaire/submit',
  authenticate,
  validate(submitQuestionnaireSchema),
  async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { answers } = req.body;

    const event = await Event.findById(eventId);
    if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
    if (!event.questionnaireVersionId)
      throw new AppError('NO_QUESTIONNAIRE', 'No questionnaire configured', 404);

    const questionnaire = await QuestionnaireVersion.findById(event.questionnaireVersionId);

    // Check completion threshold
    const completion = calculateCompletion(
      questionnaire!.questionSnapshots as never,
      answers as never,
    );

    if (completion.percentage < questionnaire!.completionThreshold) {
      throw new AppError(
        'INCOMPLETE',
        `Questionnaire must be at least ${questionnaire!.completionThreshold * 100}% complete`,
        400,
      );
    }

    const response = await QuestionnaireResponse.findOneAndUpdate(
      {
        eventId: eventId as string,
        participantId: req.user!.userId,
        questionnaireVersionId: event.questionnaireVersionId,
      },
      {
        answers,
        completionStatus: 'submitted',
        submittedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    // Update registration questionnaire status
    await Registration.findOneAndUpdate(
      { eventId: eventId as string, participantId: req.user!.userId },
      { questionnaireStatus: 'submitted' },
    );

    await logAudit(
      req,
      'questionnaire.submitted',
      'questionnaire_response',
      response._id.toString(),
    );

    res.json({ success: true, data: { response } });
  },
);

// Participant: Get questionnaire progress
router.get(
  '/events/:eventId/questionnaire/progress',
  authenticate,
  async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);

    const response = await QuestionnaireResponse.findOne({
      eventId: eventId as string,
      participantId: req.user!.userId,
      questionnaireVersionId: event.questionnaireVersionId,
    });

    if (!response) {
      res.json({
        success: true,
        data: { completed: 0, total: 0, percentage: 0, status: 'not_started' },
      });
      return;
    }

    const questionnaire = await QuestionnaireVersion.findById(event.questionnaireVersionId);
    const completion = calculateCompletion(
      questionnaire!.questionSnapshots as never,
      response.answers as never,
    );

    res.json({
      success: true,
      data: {
        ...completion,
        status: response.completionStatus,
      },
    });
  },
);

export default router;
