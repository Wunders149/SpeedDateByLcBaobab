import {
  CategoryScore,
  CompatibilityResult,
  DEFAULT_CATEGORY_WEIGHTS,
  MatchPair,
  MatchingConfig,
  QuestionCategory,
  ScoringModel,
} from './types.js';

// ─── Question & Answer Types ─────────────────────────────────────────────────

export interface QuestionDefinition {
  id: string;
  text: string;
  type: string;
  category: QuestionCategory;
  options: Array<{ id: string; text: string; value?: number; weight?: number }>;
  weight: number;
  scoringModel: ScoringModel;
  required: boolean;
  dealBreakerConfig?: {
    enabled: boolean;
    optionIds: string[];
    action: 'exclude' | 'flag';
  };
  tags: string[];
  displayOrder: number;
  active: boolean;
}

export interface Answer {
  questionId: string;
  value: number | string | string[];
}

export interface ParticipantData {
  id: string;
  answers: Answer[];
  eligible: boolean;
  consented: boolean;
  completedQuestionnaire: boolean;
  withdrawn: boolean;
  suspended: boolean;
  group?: string;
}

// ─── Scoring Functions ───────────────────────────────────────────────────────

/**
 * Calculate similarity score for two answers on a single question.
 * Returns a value between 0 and 1.
 */
function calculateSimilarity(answerA: number, answerB: number, maxDistance: number = 4): number {
  const distance = Math.abs(answerA - answerB);
  return 1 - distance / maxDistance;
}

/**
 * Calculate complementarity score for two answers.
 * Complementarity rewards compatible differences.
 * For example, if A prefers "leader" and B prefers "follower", that's complementary.
 */
function calculateComplementarity(answerA: number, answerB: number): number {
  // For complementarity, we check if the combination is a "compatible difference"
  // This is a simplified model: moderate differences can be complementary
  const distance = Math.abs(answerA - answerB);
  if (distance === 0) return 0.6; // Same answer: moderate score
  if (distance === 1) return 1.0; // Adjacent: high complementarity
  if (distance === 2) return 0.7; // Moderate difference: good
  if (distance === 3) return 0.3; // Large difference: low
  return 0.1; // Maximum difference: very low
}

/**
 * Calculate score for a single question pair.
 */
function scoreQuestionPair(
  question: QuestionDefinition,
  answerA: Answer | undefined,
  answerB: Answer | undefined,
): number | null {
  // If either answer is missing, return null (don't score)
  if (!answerA || !answerB) return null;

  const valA = answerA.value;
  const valB = answerB.value;

  // Handle different question types
  switch (question.type) {
    case 'agreement_scale':
    case 'preference_scale': {
      if (typeof valA !== 'number' || typeof valB !== 'number') return null;
      if (question.scoringModel === ScoringModel.Complementarity) {
        return calculateComplementarity(valA, valB);
      }
      return calculateSimilarity(valA, valB);
    }

    case 'single_choice': {
      if (typeof valA !== 'string' || typeof valB !== 'string') return null;
      if (question.scoringModel === ScoringModel.Complementarity) {
        // For complementarity, different choices can be complementary
        return valA !== valB ? 0.8 : 0.5;
      }
      return valA === valB ? 1.0 : 0.0;
    }

    case 'multiple_choice': {
      if (!Array.isArray(valA) || !Array.isArray(valB)) return null;
      const setA = new Set(valA);
      const setB = new Set(valB);
      const intersection = [...setA].filter((x) => setB.has(x));
      const union = new Set([...setA, ...setB]);
      if (union.size === 0) return null;
      return intersection.length / union.size;
    }

    case 'ranking': {
      if (!Array.isArray(valA) || !Array.isArray(valB)) return null;
      // Calculate rank correlation
      const commonItems = valA.filter((item) => valB.includes(item));
      if (commonItems.length === 0) return 0;
      let correlation = 0;
      for (const item of commonItems) {
        const rankA = valA.indexOf(item);
        const rankB = valB.indexOf(item);
        correlation += 1 - Math.abs(rankA - rankB) / Math.max(valA.length, valB.length);
      }
      return correlation / commonItems.length;
    }

    case 'deal_breaker': {
      if (typeof valA !== 'string' || typeof valB !== 'string') return null;
      // Deal-breaker: if both selected the same deal-breaker option, it's a problem
      if (valA === valB && question.dealBreakerConfig?.enabled) {
        return 0.0; // Both have the same deal-breaker
      }
      return 1.0;
    }

    case 'icebreaker':
    case 'short_text':
      // Icebreakers and text don't contribute to scoring
      return null;

    default:
      return null;
  }
}

// ─── Category-Level Scoring ──────────────────────────────────────────────────

/**
 * Calculate category-level scores for a pair of participants.
 */
function calculateCategoryScores(
  questions: QuestionDefinition[],
  answersA: Answer[],
  answersB: Answer[],
): CategoryScore[] {
  const categoryMap = new Map<
    QuestionCategory,
    { totalWeight: number; weightedScore: number; answered: number; total: number }
  >();

  for (const question of questions) {
    if (!question.active) continue;
    if (question.type === 'icebreaker' || question.type === 'short_text') continue;

    const answerA = answersA.find((a) => a.questionId === question.id);
    const answerB = answersB.find((a) => a.questionId === question.id);

    const score = scoreQuestionPair(question, answerA, answerB);

    const existing = categoryMap.get(question.category) ?? {
      totalWeight: 0,
      weightedScore: 0,
      answered: 0,
      total: 0,
    };

    existing.total += 1;
    if (score !== null) {
      existing.answered += 1;
      existing.totalWeight += question.weight;
      existing.weightedScore += score * question.weight;
    }

    categoryMap.set(question.category, existing);
  }

  const results: CategoryScore[] = [];
  for (const [category, data] of categoryMap) {
    const score = data.totalWeight > 0 ? data.weightedScore / data.totalWeight : 0;
    results.push({
      category,
      score,
      weight: DEFAULT_CATEGORY_WEIGHTS[category] ?? 0,
      answeredCount: data.answered,
      totalCount: data.total,
    });
  }

  return results;
}

// ─── Deal-Breaker Evaluation ─────────────────────────────────────────────────

/**
 * Check if a pair violates any deal-breaker rules.
 */
function evaluateDealBreakers(
  questions: QuestionDefinition[],
  answersA: Answer[],
  answersB: Answer[],
): string[] {
  const violations: string[] = [];

  for (const question of questions) {
    if (!question.dealBreakerConfig?.enabled) continue;
    if (question.type !== 'deal_breaker' && question.type !== 'single_choice') continue;

    const answerA = answersA.find((a) => a.questionId === question.id);
    const answerB = answersB.find((a) => a.questionId === question.id);

    if (!answerA || !answerB) continue; // Missing answers are NOT deal-breakers

    const valA = answerA.value;
    const valB = answerB.value;

    if (question.type === 'deal_breaker') {
      if (valA === valB && question.dealBreakerConfig.optionIds.includes(String(valA))) {
        violations.push(`Both participants selected deal-breaker: ${question.text}`);
      }
    }
  }

  return violations;
}

// ─── Eligibility Check ───────────────────────────────────────────────────────

/**
 * Check if a pair is eligible for matching.
 */
function checkEligibility(
  participantA: ParticipantData,
  participantB: ParticipantData,
  questions: QuestionDefinition[],
  answersA: Answer[],
  answersB: Answer[],
  config: MatchingConfig,
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (participantA.id === participantB.id) {
    return { eligible: false, reasons: ['Same participant'] };
  }

  if (!participantA.eligible || !participantB.eligible) {
    reasons.push('One or both participants are not eligible');
  }

  if (!participantA.consented || !participantB.consented) {
    reasons.push('One or both participants have not consented');
  }

  if (!participantA.completedQuestionnaire || !participantB.completedQuestionnaire) {
    reasons.push('One or both participants have not completed the questionnaire');
  }

  if (participantA.withdrawn || participantB.withdrawn) {
    reasons.push('One or both participants have withdrawn');
  }

  if (participantA.suspended || participantB.suspended) {
    reasons.push('One or both participants are suspended');
  }

  // Check group constraints
  if (config.groupConstraints?.enabled) {
    if (participantA.group && participantB.group && participantA.group === participantB.group) {
      reasons.push('Participants are in the same group');
    }
  }

  // Check deal-breakers
  const dealBreakerViolations = evaluateDealBreakers(questions, answersA, answersB);
  if (dealBreakerViolations.length > 0 && config.dealBreakerAction === 'exclude') {
    reasons.push(...dealBreakerViolations);
  }

  return { eligible: reasons.length === 0, reasons };
}

// ─── Main Compatibility Calculation ──────────────────────────────────────────

/**
 * Calculate full compatibility between two participants.
 */
export function calculateCompatibility(
  participantA: ParticipantData,
  participantB: ParticipantData,
  questions: QuestionDefinition[],
  config: MatchingConfig,
  algorithmVersion: string = 'v1.0.0',
): CompatibilityResult {
  const answersA = participantA.answers;
  const answersB = participantB.answers;

  // Calculate category scores
  const categoryScores = calculateCategoryScores(questions, answersA, answersB);

  // Calculate directional scores (A→B and B→A)
  // For symmetric models, both directions are the same
  // For asymmetric models, we'd need different logic per direction
  const totalWeight = categoryScores.reduce((sum, cs) => sum + cs.weight, 0);
  const weightedSum = categoryScores.reduce((sum, cs) => sum + cs.score * cs.weight, 0);
  const directionalScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

  // For this implementation, we use symmetric scoring
  // In a more complex system, A→B and B→A could differ
  const directionalScoreAtoB = directionalScore;
  const directionalScoreBtoA = directionalScore;

  // Mutual score using geometric mean
  const mutualScore = 100 * Math.sqrt((directionalScoreAtoB / 100) * (directionalScoreBtoA / 100));

  // Check eligibility
  const { eligible, reasons } = checkEligibility(
    participantA,
    participantB,
    questions,
    answersA,
    answersB,
    config,
  );

  // Check minimum threshold
  const meetsThreshold = mutualScore >= config.minimumThreshold;

  return {
    participantAId: participantA.id,
    participantBId: participantB.id,
    directionalScoreAtoB: Math.round(directionalScoreAtoB * 100) / 100,
    directionalScoreBtoA: Math.round(directionalScoreBtoA * 100) / 100,
    mutualScore: Math.round(mutualScore * 100) / 100,
    categoryScores,
    eligible: eligible && meetsThreshold,
    exclusionReasons: eligible
      ? meetsThreshold
        ? []
        : ['Below minimum compatibility threshold']
      : reasons,
    algorithmVersion,
    calculatedAt: new Date().toISOString(),
  };
}

// ─── Global Matching ─────────────────────────────────────────────────────────

/**
 * Generate all eligible pairs with compatibility scores.
 */
export function generateAllPairs(
  participants: ParticipantData[],
  questions: QuestionDefinition[],
  config: MatchingConfig,
  algorithmVersion: string = 'v1.0.0',
): MatchPair[] {
  const pairs: MatchPair[] = [];

  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const result = calculateCompatibility(
        participants[i],
        participants[j],
        questions,
        config,
        algorithmVersion,
      );
      pairs.push({
        participantAId: result.participantAId,
        participantBId: result.participantBId,
        mutualScore: result.mutualScore,
        categoryScores: result.categoryScores,
        eligible: result.eligible,
        exclusionReasons: result.exclusionReasons,
      });
    }
  }

  return pairs.sort((a, b) => b.mutualScore - a.mutualScore);
}

/**
 * Global optimal matching using a greedy maximum-weight matching algorithm.
 * For production use with large groups, consider using the Blossom algorithm.
 *
 * Time complexity: O(n² log n) for sorting + O(n²) for greedy matching
 * Space complexity: O(n²) for the pair list
 */
export function globalOptimalMatching(
  participants: ParticipantData[],
  questions: QuestionDefinition[],
  config: MatchingConfig,
  algorithmVersion: string = 'v1.0.0',
): MatchPair[] {
  const allPairs = generateAllPairs(participants, questions, config, algorithmVersion);
  const eligiblePairs = allPairs.filter((p) => p.eligible);

  // Sort by mutual score descending
  eligiblePairs.sort((a, b) => b.mutualScore - a.mutualScore);

  const matched = new Set<string>();
  const matches: MatchPair[] = [];

  for (const pair of eligiblePairs) {
    if (matched.has(pair.participantAId) || matched.has(pair.participantBId)) {
      continue;
    }
    matches.push(pair);
    matched.add(pair.participantAId);
    matched.add(pair.participantBId);

    // If multiple matches are allowed, we could continue matching
    // but for now we enforce one match per participant
    if (!config.allowMultipleMatches) {
      continue;
    }
  }

  return matches;
}

/**
 * Compatibility ranking mode: return top N candidates for each participant.
 */
export function compatibilityRanking(
  participants: ParticipantData[],
  questions: QuestionDefinition[],
  config: MatchingConfig,
  topN: number = 5,
  algorithmVersion: string = 'v1.0.0',
): Map<string, MatchPair[]> {
  const allPairs = generateAllPairs(participants, questions, config, algorithmVersion);
  const result = new Map<string, MatchPair[]>();

  for (const participant of participants) {
    const candidates = allPairs
      .filter((p) => p.eligible)
      .filter((p) => p.participantAId === participant.id || p.participantBId === participant.id)
      .map((p) => {
        // Normalize so the current participant is always "A"
        if (p.participantBId === participant.id) {
          return {
            ...p,
            participantAId: p.participantBId,
            participantBId: p.participantAId,
          };
        }
        return p;
      })
      .sort((a, b) => b.mutualScore - a.mutualScore)
      .slice(0, topN);

    result.set(participant.id, candidates);
  }

  return result;
}

// ─── Utility Functions ───────────────────────────────────────────────────────

/**
 * Calculate questionnaire completion percentage.
 */
export function calculateCompletion(
  questions: QuestionDefinition[],
  answers: Answer[],
): { completed: number; total: number; percentage: number } {
  const activeQuestions = questions.filter((q) => q.active && q.required);
  const answeredIds = new Set(answers.map((a) => a.questionId));
  const completed = activeQuestions.filter((q) => answeredIds.has(q.id)).length;
  const total = activeQuestions.length;
  return {
    completed,
    total,
    percentage: total > 0 ? completed / total : 0,
  };
}

/**
 * Validate that category weights sum to 1.0.
 */
export function validateCategoryWeights(weights: Record<QuestionCategory, number>): boolean {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  return Math.abs(total - 1) < 0.001;
}

/**
 * Get default matching configuration.
 */
export function getDefaultMatchingConfig(): MatchingConfig {
  return {
    mode: 'compatibility_ranking',
    minimumThreshold: 0,
    dealBreakerAction: 'exclude',
    allowMultipleMatches: false,
    respectNoRepeat: true,
  };
}
