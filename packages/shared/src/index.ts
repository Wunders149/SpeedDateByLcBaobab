import { z } from 'zod';

export const userRoleSchema = z.enum(['visitor', 'participant', 'event_admin', 'super_admin', 'moderator']);

export const profileSchema = z.object({
  id: z.string(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().min(18).max(80),
  city: z.string().min(2),
  bio: z.string().min(10).max(220),
  role: userRoleSchema.default('participant'),
  interests: z.array(z.string()).min(1),
  isEligible: z.boolean().default(true),
});

export const answerSchema = z.object({
  questionId: z.string(),
  label: z.string(),
  value: z.number().min(1).max(5),
});

export const questionnaireSubmissionSchema = z.object({
  participantId: z.string(),
  answers: z.array(answerSchema).min(3),
});

export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number().int().positive(),
  city: z.string(),
  startsAt: z.string(),
  venue: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type QuestionnaireSubmission = z.infer<typeof questionnaireSubmissionSchema>;
export type EventConfig = z.infer<typeof eventSchema>;

export type MatchCandidate = {
  participantId: string;
  score: number;
  reason: string;
};

export function computeCompatibility(profileA: Pick<Profile, 'interests' | 'age'>, profileB: Pick<Profile, 'interests' | 'age'>, answersA: Answer[], answersB: Answer[]): number {
  const interestShared = profileA.interests.filter((interest) => profileB.interests.includes(interest)).length;
  const interestScore = (interestShared / Math.max(profileA.interests.length, profileB.interests.length, 1)) * 45;
  const ageDelta = Math.abs(profileA.age - profileB.age);
  const ageScore = Math.max(0, 20 - ageDelta * 2);

  const questionScore = answersA.reduce((sum, answerA) => {
    const match = answersB.find((answerB) => answerB.questionId === answerA.questionId);
    if (!match) {
      return sum;
    }
    const distance = Math.abs(answerA.value - match.value);
    return sum + (5 - distance) * 7;
  }, 0);

  const total = interestScore + ageScore + questionScore;
  return Math.min(100, Math.max(0, Math.round(total)));
}

export function generateMatches(participants: Profile[], responses: Record<string, Answer[]>, eventId: string): MatchCandidate[] {
  return participants
    .flatMap((participant) => {
      const answers = responses[participant.id] ?? [];
      return participants
        .filter((other) => other.id !== participant.id)
        .map((other) => {
          const otherAnswers = responses[other.id] ?? [];
          const score = computeCompatibility(participant, other, answers, otherAnswers);
          const reason = `Shared interests and aligned answers give this pairing ${score}% chemistry.`;
          return { participantId: other.id, score, reason };
        });
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((match) => ({ ...match, reason: `${eventId}: ${match.reason}` }));
}
