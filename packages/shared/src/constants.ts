import { QuestionCategory } from './types.js';

export const ALGORITHM_VERSION = 'v1.0.0';

export const DEFAULT_QUESTIONNAIRE_COMPLETION_THRESHOLD = 0.8;

export const MAX_QUESTIONS_PER_QUESTIONNAIRE = 100;

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_PAGE_SIZE = 100;

export const SOCKET_EVENTS = {
  REGISTRATION_UPDATED: 'event:registration-updated',
  CHECK_IN_UPDATED: 'event:check-in-updated',
  SESSION_STARTED: 'event:session-started',
  SESSION_PAUSED: 'event:session-paused',
  SESSION_ENDED: 'event:session-ended',
  QUESTIONNAIRE_STATUS: 'questionnaire:status-updated',
  MATCH_RESULTS_PUBLISHED: 'match:results-published',
  NOTIFICATION_CREATED: 'notification:created',
} as const;

export const AUDIT_ACTIONS = {
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  PROFILE_UPDATED: 'profile.updated',
  REGISTRATION_CREATED: 'registration.created',
  REGISTRATION_UPDATED: 'registration.updated',
  REGISTRATION_WITHDRAWN: 'registration.withdrawn',
  QUESTIONNAIRE_SUBMITTED: 'questionnaire.submitted',
  QUESTIONNAIRE_DRAFT_SAVED: 'questionnaire.draft_saved',
  MATCHES_GENERATED: 'matches.generated',
  MATCHES_FINALIZED: 'matches.finalized',
  MATCHES_PUBLISHED: 'matches.published',
  INTEREST_CREATED: 'interest.created',
  INTEREST_WITHDRAWN: 'interest.withdrawn',
  CHECK_IN: 'check_in.completed',
  CHECK_IN_REVERSED: 'check_in.reversed',
  ADMIN_CREATED: 'admin.created',
  ADMIN_UPDATED: 'admin.updated',
  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_PUBLISHED: 'event.published',
  EVENT_ARCHIVED: 'event.archived',
  QUESTION_CREATED: 'question.created',
  QUESTION_UPDATED: 'question.updated',
  QUESTIONNAIRE_PUBLISHED: 'questionnaire.published',
  SESSION_CREATED: 'session.created',
  SESSION_STARTED: 'session.started',
  SESSION_ENDED: 'session.ended',
  NOTIFICATION_SENT: 'notification.sent',
  PASSWORD_RESET_REQUESTED: 'password.reset_requested',
  PASSWORD_RESET_COMPLETED: 'password.reset_completed',
  PARTICIPANT_SUSPENDED: 'participant.suspended',
  PARTICIPANT_REACTIVATED: 'participant.reactivated',
} as const;

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  [QuestionCategory.Values]: 'Values',
  [QuestionCategory.Communication]: 'Communication',
  [QuestionCategory.Personality]: 'Personality',
  [QuestionCategory.Lifestyle]: 'Lifestyle',
  [QuestionCategory.FutureAspirations]: 'Future Aspirations',
  [QuestionCategory.Interests]: 'Interests',
  [QuestionCategory.FunSpontaneity]: 'Fun & Spontaneity',
};

export const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  pending_review: 'Pending Review',
  approved: 'Approved',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  checked_in: 'Checked In',
  completed: 'Completed',
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  registration_open: 'Registration Open',
  registration_closed: 'Registration Closed',
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};
