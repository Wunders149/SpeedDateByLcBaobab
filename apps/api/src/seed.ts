import './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { Question } from './models/Question.js';
import {
  QuestionCategory,
  QuestionType,
  ScoringModel,
} from '@speed-date/shared';

const QUESTION_BANK = [
  // ─── Values (10 questions) ──────────────────────────────────────────────────
  {
    text: 'Family is the most important thing in my life.',
    category: QuestionCategory.Values,
    type: QuestionType.AgreementScale,
    weight: 1.5,
  },
  {
    text: 'Honesty is more important than being tactful.',
    category: QuestionCategory.Values,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I value personal growth and self-improvement.',
    category: QuestionCategory.Values,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'Loyalty is essential in any relationship.',
    category: QuestionCategory.Values,
    type: QuestionType.AgreementScale,
    weight: 1.5,
  },
  {
    text: 'I believe in work-life balance.',
    category: QuestionCategory.Values,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'Financial security is a top priority for me.',
    category: QuestionCategory.Values,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I value tradition and cultural heritage.',
    category: QuestionCategory.Values,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'Giving back to the community is important to me.',
    category: QuestionCategory.Values,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I believe in equality and fairness for all.',
    category: QuestionCategory.Values,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'Freedom and independence are crucial to my happiness.',
    category: QuestionCategory.Values,
    type: QuestionType.AgreementScale,
    weight: 1,
  },

  // ─── Communication (8 questions) ───────────────────────────────────────────
  {
    text: 'I prefer to discuss issues directly rather than avoid them.',
    category: QuestionCategory.Communication,
    type: QuestionType.AgreementScale,
    weight: 1.5,
  },
  {
    text: 'I am a good listener.',
    category: QuestionCategory.Communication,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I express my feelings openly.',
    category: QuestionCategory.Communication,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I prefer texting over phone calls.',
    category: QuestionCategory.Communication,
    type: QuestionType.PreferenceScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy deep, meaningful conversations.',
    category: QuestionCategory.Communication,
    type: QuestionType.AgreementScale,
    weight: 1.5,
  },
  {
    text: 'I am comfortable with silence in conversations.',
    category: QuestionCategory.Communication,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I prefer to resolve conflicts calmly.',
    category: QuestionCategory.Communication,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I am good at reading non-verbal cues.',
    category: QuestionCategory.Communication,
    type: QuestionType.AgreementScale,
    weight: 1,
  },

  // ─── Personality (10 questions) ─────────────────────────────────────────────
  {
    text: 'I consider myself an introvert.',
    category: QuestionCategory.Personality,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I am highly organized and plan ahead.',
    category: QuestionCategory.Personality,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I enjoy being the center of attention.',
    category: QuestionCategory.Personality,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I am very empathetic towards others.',
    category: QuestionCategory.Personality,
    type: QuestionType.AgreementScale,
    weight: 1.5,
  },
  {
    text: 'I prefer routine over spontaneity.',
    category: QuestionCategory.Personality,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I am very curious and love learning new things.',
    category: QuestionCategory.Personality,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I handle stress well.',
    category: QuestionCategory.Personality,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I am very competitive.',
    category: QuestionCategory.Personality,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I am a natural leader.',
    category: QuestionCategory.Personality,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I am very patient with others.',
    category: QuestionCategory.Personality,
    type: QuestionType.AgreementScale,
    weight: 1,
  },

  // ─── Lifestyle (10 questions) ───────────────────────────────────────────────
  {
    text: 'I exercise regularly.',
    category: QuestionCategory.Lifestyle,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I enjoy cooking at home.',
    category: QuestionCategory.Lifestyle,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I prefer staying out late over going to bed early.',
    category: QuestionCategory.Lifestyle,
    type: QuestionType.PreferenceScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy outdoor activities like hiking and camping.',
    category: QuestionCategory.Lifestyle,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I am a foodie and love trying new restaurants.',
    category: QuestionCategory.Lifestyle,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy traveling to new places.',
    category: QuestionCategory.Lifestyle,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I prefer a minimalist lifestyle.',
    category: QuestionCategory.Lifestyle,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy attending social events and parties.',
    category: QuestionCategory.Lifestyle,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I have pets and love animals.',
    category: QuestionCategory.Lifestyle,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy reading books in my free time.',
    category: QuestionCategory.Lifestyle,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },

  // ─── Future Aspirations (7 questions) ───────────────────────────────────────
  {
    text: 'I want to have children someday.',
    category: QuestionCategory.FutureAspirations,
    type: QuestionType.AgreementScale,
    weight: 2.5,
    dealBreaker: true,
  },
  {
    text: 'I plan to advance significantly in my career.',
    category: QuestionCategory.FutureAspirations,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I want to live in a different country someday.',
    category: QuestionCategory.FutureAspirations,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I hope to start my own business.',
    category: QuestionCategory.FutureAspirations,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I want to buy a home in the next 5 years.',
    category: QuestionCategory.FutureAspirations,
    type: QuestionType.AgreementScale,
    weight: 1,
  },
  {
    text: 'I plan to pursue further education.',
    category: QuestionCategory.FutureAspirations,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I want to retire early and travel the world.',
    category: QuestionCategory.FutureAspirations,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },

  // ─── Interests (8 questions) ───────────────────────────────────────────────
  {
    text: 'I enjoy listening to live music.',
    category: QuestionCategory.Interests,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I am a movie buff.',
    category: QuestionCategory.Interests,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy playing sports.',
    category: QuestionCategory.Interests,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I love art and visiting museums.',
    category: QuestionCategory.Interests,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy gardening.',
    category: QuestionCategory.Interests,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I am interested in technology and gadgets.',
    category: QuestionCategory.Interests,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy photography.',
    category: QuestionCategory.Interests,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I love dancing.',
    category: QuestionCategory.Interests,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },

  // ─── Fun & Spontaneity (7 questions) ────────────────────────────────────────
  {
    text: 'I enjoy trying new and adventurous activities.',
    category: QuestionCategory.FunSpontaneity,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I like to surprise my partner with spontaneous gestures.',
    category: QuestionCategory.FunSpontaneity,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy comedy and making others laugh.',
    category: QuestionCategory.FunSpontaneity,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I love themed parties and costumes.',
    category: QuestionCategory.FunSpontaneity,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy board games and puzzles.',
    category: QuestionCategory.FunSpontaneity,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I like to keep my schedule flexible.',
    category: QuestionCategory.FunSpontaneity,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
  {
    text: 'I enjoy karaoke and performing.',
    category: QuestionCategory.FunSpontaneity,
    type: QuestionType.AgreementScale,
    weight: 0.5,
  },
];

const SCALE_OPTIONS = [
  { id: 'opt-1', text: 'Strongly Disagree', value: 1 },
  { id: 'opt-2', text: 'Disagree', value: 2 },
  { id: 'opt-3', text: 'Neutral', value: 3 },
  { id: 'opt-4', text: 'Agree', value: 4 },
  { id: 'opt-5', text: 'Strongly Agree', value: 5 },
];

async function seed() {
  console.log('[SEED] Initializing default questionnaire questions...');
  await connectDatabase();
  try {
    const existingCount = await Question.countDocuments();
    if (existingCount > 0) {
      console.log(`[SEED] Question bank already contains ${existingCount} questions; no changes made.`);
      return;
    }

    const questions = QUESTION_BANK.map((question, index) => ({
      text: question.text,
      type: question.type,
      category: question.category,
      options: SCALE_OPTIONS,
      weight: question.weight,
      scoringModel: ScoringModel.Similarity,
      required: true,
      dealBreakerConfig: question.dealBreaker
        ? { enabled: true, optionIds: ['opt-5'], action: 'exclude' as const }
        : undefined,
      tags: [question.category],
      displayOrder: index,
      active: true,
      version: 1,
    }));

    await Question.insertMany(questions);
    console.log(`[SEED] Added ${questions.length} default questionnaire questions.`);
  } finally {
    await disconnectDatabase();
  }
}
seed().catch((error) => {
  console.error('[SEED] Error:', error);
  process.exit(1);
});
