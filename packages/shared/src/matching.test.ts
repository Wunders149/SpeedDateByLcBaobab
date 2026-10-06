import { describe, it, expect } from 'vitest';
import {
  calculateCompatibility,
  globalOptimalMatching,
  compatibilityRanking,
  calculateCompletion,
  validateCategoryWeights,
  getDefaultMatchingConfig,
  type QuestionDefinition,
  type ParticipantData,
} from './matching.js';
import { QuestionCategory, ScoringModel, DEFAULT_CATEGORY_WEIGHTS } from './types.js';

const createQuestion = (id: string, category: QuestionCategory, overrides: Partial<QuestionDefinition> = {}): QuestionDefinition => ({
  id,
  text: `Question ${id}`,
  type: 'agreement_scale',
  category,
  options: [
    { id: '1', text: 'Strongly Disagree', value: 1 },
    { id: '2', text: 'Disagree', value: 2 },
    { id: '3', text: 'Neutral', value: 3 },
    { id: '4', text: 'Agree', value: 4 },
    { id: '5', text: 'Strongly Agree', value: 5 },
  ],
  weight: 1,
  scoringModel: ScoringModel.Similarity,
  required: true,
  tags: [],
  displayOrder: 0,
  active: true,
  ...overrides,
});

const createParticipant = (id: string, answers: Array<{ questionId: string; value: number | string | string[] }>): ParticipantData => ({
  id,
  answers,
  eligible: true,
  consented: true,
  completedQuestionnaire: true,
  withdrawn: false,
  suspended: false,
});

describe('Matching Algorithm', () => {
  describe('calculateCompatibility', () => {
    it('should return high score for identical answers', () => {
      const questions = [
        createQuestion('q1', QuestionCategory.Values),
        createQuestion('q2', QuestionCategory.Communication),
      ];

      const participantA = createParticipant('a', [
        { questionId: 'q1', value: 5 },
        { questionId: 'q2', value: 4 },
      ]);
      const participantB = createParticipant('b', [
        { questionId: 'q1', value: 5 },
        { questionId: 'q2', value: 4 },
      ]);

      const config = getDefaultMatchingConfig();
      const result = calculateCompatibility(participantA, participantB, questions, config);

      expect(result.mutualScore).toBeGreaterThan(80);
      expect(result.eligible).toBe(true);
    });

    it('should return low score for opposite answers', () => {
      const questions = [
        createQuestion('q1', QuestionCategory.Values),
        createQuestion('q2', QuestionCategory.Communication),
      ];

      const participantA = createParticipant('a', [
        { questionId: 'q1', value: 5 },
        { questionId: 'q2', value: 5 },
      ]);
      const participantB = createParticipant('b', [
        { questionId: 'q1', value: 1 },
        { questionId: 'q2', value: 1 },
      ]);

      const config = getDefaultMatchingConfig();
      const result = calculateCompatibility(participantA, participantB, questions, config);

      expect(result.mutualScore).toBeLessThan(30);
    });

    it('should handle missing answers gracefully', () => {
      const questions = [
        createQuestion('q1', QuestionCategory.Values),
        createQuestion('q2', QuestionCategory.Communication),
      ];

      const participantA = createParticipant('a', [
        { questionId: 'q1', value: 5 },
      ]);
      const participantB = createParticipant('b', [
        { questionId: 'q1', value: 5 },
        { questionId: 'q2', value: 3 },
      ]);

      const config = getDefaultMatchingConfig();
      const result = calculateCompatibility(participantA, participantB, questions, config);

      // Should still calculate based on answered questions
      expect(result.mutualScore).toBeGreaterThan(0);
      expect(result.eligible).toBe(true);
    });

    it('should respect minimum threshold', () => {
      const questions = [createQuestion('q1', QuestionCategory.Values)];
      const participantA = createParticipant('a', [{ questionId: 'q1', value: 1 }]);
      const participantB = createParticipant('b', [{ questionId: 'q1', value: 5 }]);

      const config = { ...getDefaultMatchingConfig(), minimumThreshold: 50 };
      const result = calculateCompatibility(participantA, participantB, questions, config);

      expect(result.eligible).toBe(false);
      expect(result.exclusionReasons).toContain('Below minimum compatibility threshold');
    });

    it('should exclude ineligible participants', () => {
      const questions = [createQuestion('q1', QuestionCategory.Values)];
      const participantA = createParticipant('a', [{ questionId: 'q1', value: 5 }]);
      const participantB = createParticipant('b', [{ questionId: 'q1', value: 5 }]);
      participantB.consented = false;

      const config = getDefaultMatchingConfig();
      const result = calculateCompatibility(participantA, participantB, questions, config);

      expect(result.eligible).toBe(false);
      expect(result.exclusionReasons).toContain('One or both participants have not consented');
    });
  });

  describe('globalOptimalMatching', () => {
    it('should create matches for all participants', () => {
      const questions = [createQuestion('q1', QuestionCategory.Values)];
      const participants = [
        createParticipant('a', [{ questionId: 'q1', value: 5 }]),
        createParticipant('b', [{ questionId: 'q1', value: 5 }]),
        createParticipant('c', [{ questionId: 'q1', value: 4 }]),
        createParticipant('d', [{ questionId: 'q1', value: 4 }]),
      ];

      const config = getDefaultMatchingConfig();
      const matches = globalOptimalMatching(participants, questions, config);

      expect(matches.length).toBe(2);
    });

    it('should handle odd number of participants', () => {
      const questions = [createQuestion('q1', QuestionCategory.Values)];
      const participants = [
        createParticipant('a', [{ questionId: 'q1', value: 5 }]),
        createParticipant('b', [{ questionId: 'q1', value: 5 }]),
        createParticipant('c', [{ questionId: 'q1', value: 4 }]),
      ];

      const config = getDefaultMatchingConfig();
      const matches = globalOptimalMatching(participants, questions, config);

      expect(matches.length).toBe(1);
    });
  });

  describe('compatibilityRanking', () => {
    it('should return top N candidates for each participant', () => {
      const questions = [createQuestion('q1', QuestionCategory.Values)];
      const participants = [
        createParticipant('a', [{ questionId: 'q1', value: 5 }]),
        createParticipant('b', [{ questionId: 'q1', value: 5 }]),
        createParticipant('c', [{ questionId: 'q1', value: 4 }]),
        createParticipant('d', [{ questionId: 'q1', value: 3 }]),
      ];

      const config = getDefaultMatchingConfig();
      const ranking = compatibilityRanking(participants, questions, config, 2);

      expect(ranking.get('a')?.length).toBeLessThanOrEqual(2);
      expect(ranking.get('b')?.length).toBeLessThanOrEqual(2);
    });
  });

  describe('calculateCompletion', () => {
    it('should calculate completion percentage', () => {
      const questions = [
        createQuestion('q1', QuestionCategory.Values),
        createQuestion('q2', QuestionCategory.Communication),
        createQuestion('q3', QuestionCategory.Personality),
      ];

      const answers = [
        { questionId: 'q1', value: 5 },
        { questionId: 'q2', value: 4 },
      ];

      const completion = calculateCompletion(questions, answers);
      expect(completion.completed).toBe(2);
      expect(completion.total).toBe(3);
      expect(completion.percentage).toBeCloseTo(0.67, 1);
    });
  });

  describe('validateCategoryWeights', () => {
    it('should validate correct weights', () => {
      expect(validateCategoryWeights(DEFAULT_CATEGORY_WEIGHTS)).toBe(true);
    });

    it('should reject incorrect weights', () => {
      const badWeights = { ...DEFAULT_CATEGORY_WEIGHTS, [QuestionCategory.Values]: 0.5 };
      expect(validateCategoryWeights(badWeights)).toBe(false);
    });
  });
});
