// ─── Core Domain Types ───────────────────────────────────────────────────────

export const UserRole = {
  Visitor: 'visitor',
  Participant: 'participant',
  EventAdmin: 'event_admin',
  SuperAdmin: 'super_admin',
  Moderator: 'moderator',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AccountStatus = {
  Active: 'active',
  Suspended: 'suspended',
  Deactivated: 'deactivated',
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const EventStatus = {
  Draft: 'draft',
  Published: 'published',
  RegistrationOpen: 'registration_open',
  RegistrationClosed: 'registration_closed',
  InProgress: 'in_progress',
  Completed: 'completed',
  Archived: 'archived',
} as const;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export const RegistrationStatus = {
  Draft: 'draft',
  Submitted: 'submitted',
  PendingReview: 'pending_review',
  Approved: 'approved',
  Waitlisted: 'waitlisted',
  Rejected: 'rejected',
  Withdrawn: 'withdrawn',
  CheckedIn: 'checked_in',
  Completed: 'completed',
} as const;
export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export const QuestionnaireStatus = {
  NotStarted: 'not_started',
  InProgress: 'in_progress',
  Submitted: 'submitted',
} as const;
export type QuestionnaireStatus = (typeof QuestionnaireStatus)[keyof typeof QuestionnaireStatus];

export const MatchStatus = {
  Provisional: 'provisional',
  Finalized: 'finalized',
  Published: 'published',
} as const;
export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const InterestStatus = {
  Pending: 'pending',
  Mutual: 'mutual',
  Declined: 'declined',
} as const;
export type InterestStatus = (typeof InterestStatus)[keyof typeof InterestStatus];

export const SessionStatus = {
  Scheduled: 'scheduled',
  Active: 'active',
  Paused: 'paused',
  Ended: 'ended',
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

// ─── Question Types ──────────────────────────────────────────────────────────

export const QuestionType = {
  SingleChoice: 'single_choice',
  MultipleChoice: 'multiple_choice',
  AgreementScale: 'agreement_scale',
  PreferenceScale: 'preference_scale',
  Ranking: 'ranking',
  ShortText: 'short_text',
  DealBreaker: 'deal_breaker',
  Icebreaker: 'icebreaker',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export const ScoringModel = {
  Similarity: 'similarity',
  Complementarity: 'complementarity',
} as const;
export type ScoringModel = (typeof ScoringModel)[keyof typeof ScoringModel];

export const QuestionCategory = {
  Values: 'values',
  Communication: 'communication',
  Personality: 'personality',
  Lifestyle: 'lifestyle',
  FutureAspirations: 'future_aspirations',
  Interests: 'interests',
  FunSpontaneity: 'fun_spontaneity',
} as const;
export type QuestionCategory = (typeof QuestionCategory)[keyof typeof QuestionCategory];

export const DEFAULT_CATEGORY_WEIGHTS: Record<QuestionCategory, number> = {
  [QuestionCategory.Values]: 0.25,
  [QuestionCategory.Communication]: 0.15,
  [QuestionCategory.Personality]: 0.2,
  [QuestionCategory.Lifestyle]: 0.15,
  [QuestionCategory.FutureAspirations]: 0.1,
  [QuestionCategory.Interests]: 0.1,
  [QuestionCategory.FunSpontaneity]: 0.05,
};

// ─── Matching Types ──────────────────────────────────────────────────────────

export interface CategoryScore {
  category: QuestionCategory;
  score: number; // 0-1
  weight: number;
  answeredCount: number;
  totalCount: number;
}

export interface CompatibilityResult {
  participantAId: string;
  participantBId: string;
  directionalScoreAtoB: number; // 0-100
  directionalScoreBtoA: number; // 0-100
  mutualScore: number; // 0-100
  categoryScores: CategoryScore[];
  eligible: boolean;
  exclusionReasons: string[];
  algorithmVersion: string;
  calculatedAt: string;
}

export interface MatchPair {
  participantAId: string;
  participantBId: string;
  mutualScore: number;
  categoryScores: CategoryScore[];
  eligible: boolean;
  exclusionReasons: string[];
}

export interface MatchingConfig {
  mode: 'compatibility_ranking' | 'global_optimal';
  minimumThreshold: number;
  dealBreakerAction: 'exclude' | 'flag';
  allowMultipleMatches: boolean;
  respectNoRepeat: boolean;
  groupConstraints?: {
    enabled: boolean;
    groups: string[];
  };
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
