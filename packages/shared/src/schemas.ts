import { z } from 'zod';
import { QuestionCategory, QuestionType, ScoringModel, UserRole } from './types.js';

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().datetime(),
  phone: z.string().max(20).optional(),
  genderIdentity: z.string().max(50).optional(),
  matchingPreference: z.string().max(50).optional(),
  agreedToRules: z.literal(true),
  agreedToPrivacy: z.literal(true),
  consentToMatching: z.literal(true),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

// ─── Profile Schemas ─────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string().max(50)).max(20).optional(),
  languages: z.array(z.string().max(50)).max(10).optional(),
  relationshipIntention: z.string().max(100).optional(),
  values: z.array(z.string().max(100)).max(10).optional(),
  aspirations: z.string().max(500).optional(),
  conversationStarters: z.array(z.string().max(200)).max(5).optional(),
  communicationPreference: z.enum(['in_app', 'organizer_mediated', 'mutual_opt_in']).optional(),
  profilePhotoUrl: z.string().max(500).nullable().optional(),
});

// ─── Event Schemas ───────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000),
  venue: z.string().max(200),
  timezone: z.string().max(50).default('UTC'),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  registrationDeadline: z.string().datetime(),
  capacity: z.number().int().positive().max(1000),
  eligibleGroups: z.array(z.string().max(50)).min(1),
  eventMode: z.enum([
    'in_person',
    'quiz_based',
    'guided_conversation',
    'post_event_matching',
    'organizer_mediated',
  ]),
  organizerContact: z.string().max(200),
  instructions: z.string().max(5000).optional(),
});

export const updateEventSchema = createEventSchema.partial();

// ─── Question Schemas ────────────────────────────────────────────────────────

export const answerOptionSchema = z.object({
  id: z.string().min(1).max(50),
  text: z.string().min(1).max(500),
  value: z.number().min(-10).max(10).optional(),
  weight: z.number().min(0).max(10).optional(),
});

export const dealBreakerConfigSchema = z.object({
  enabled: z.boolean(),
  optionIds: z.array(z.string()).min(1),
  action: z.enum(['exclude', 'flag']),
});

export const createQuestionSchema = z.object({
  text: z.string().min(5).max(500),
  type: z.nativeEnum(QuestionType),
  category: z.nativeEnum(QuestionCategory),
  options: z.array(answerOptionSchema).min(2),
  weight: z.number().min(0.1).max(10).default(1),
  scoringModel: z.nativeEnum(ScoringModel).default(ScoringModel.Similarity),
  required: z.boolean().default(true),
  dealBreakerConfig: dealBreakerConfigSchema.optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const categoryWeightsSchema = z
  .record(z.nativeEnum(QuestionCategory), z.number().min(0).max(1))
  .refine(
    (weights) => {
      const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
      return Math.abs(total - 1) < 0.001;
    },
    { message: 'Category weights must sum to 1.0' },
  );

// ─── Questionnaire Schemas ───────────────────────────────────────────────────

export const saveDraftSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: z.union([z.number(), z.string(), z.array(z.string())]),
    }),
  ),
});

export const submitQuestionnaireSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        value: z.union([z.number(), z.string(), z.array(z.string())]),
      }),
    )
    .min(1),
});

// ─── Registration Schemas ────────────────────────────────────────────────────

export const createRegistrationSchema = z.object({
  eventId: z.string().min(1),
});

export const updateRegistrationSchema = z.object({
  status: z.enum([
    'submitted',
    'pending_review',
    'approved',
    'waitlisted',
    'rejected',
    'withdrawn',
    'checked_in',
    'completed',
  ]),
  reason: z.string().max(500).optional(),
});

// ─── Interest Schemas ────────────────────────────────────────────────────────

export const createInterestSchema = z.object({
  toParticipantId: z.string().min(1),
});

// ─── Matching Schemas ────────────────────────────────────────────────────────

export const generateMatchesSchema = z.object({
  mode: z.enum(['compatibility_ranking', 'global_optimal']).default('compatibility_ranking'),
  minimumThreshold: z.number().min(0).max(100).default(0),
  dealBreakerAction: z.enum(['exclude', 'flag']).default('exclude'),
  allowMultipleMatches: z.boolean().default(false),
  respectNoRepeat: z.boolean().default(true),
});

// ─── Admin Schemas ───────────────────────────────────────────────────────────

export const createAdminSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum([UserRole.EventAdmin, UserRole.Moderator]),
  eventIds: z.array(z.string()).default([]),
});

export const updateAdminSchema = z.object({
  role: z.enum([UserRole.EventAdmin, UserRole.Moderator]).optional(),
  eventIds: z.array(z.string()).optional(),
  accountStatus: z.enum(['active', 'suspended', 'deactivated']).optional(),
});

// ─── Session Schemas ─────────────────────────────────────────────────────────

export const createSessionSchema = z.object({
  name: z.string().min(1).max(200),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  roundDuration: z.number().int().positive(), // minutes
  breakDuration: z.number().int().nonnegative(), // minutes
  rotationEnabled: z.boolean().default(true),
});

// ─── Notification Schemas ────────────────────────────────────────────────────

export const createNotificationSchema = z.object({
  recipientId: z.string().min(1),
  eventId: z.string().min(1),
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  channels: z.array(z.enum(['in_app', 'email', 'sms'])).optional(),
});

// ─── Audit Schemas ───────────────────────────────────────────────────────────

export const auditActionSchema = z.object({
  action: z.string().min(1).max(100),
  targetType: z.string().min(1).max(50),
  targetId: z.string().min(1),
  reason: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});
