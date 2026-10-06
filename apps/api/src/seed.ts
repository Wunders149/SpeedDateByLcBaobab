import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { User } from './models/User.js';
import { Event } from './models/Event.js';
import { Question } from './models/Question.js';
import { Registration } from './models/Registration.js';
import { QuestionnaireResponse } from './models/QuestionnaireResponse.js';
import { QuestionnaireVersion } from './models/QuestionnaireVersion.js';
import { ParticipantProfile } from './models/ParticipantProfile.js';
import { hashPassword } from './utils/auth.js';
import { QuestionCategory, QuestionType, ScoringModel, DEFAULT_CATEGORY_WEIGHTS } from '@speed-date/shared';

dotenv.config();

const QUESTION_BANK = [
  // ─── Values (10 questions) ──────────────────────────────────────────────────
  { text: 'Family is the most important thing in my life.', category: QuestionCategory.Values, type: QuestionType.AgreementScale, weight: 1.5 },
  { text: 'Honesty is more important than being tactful.', category: QuestionCategory.Values, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I value personal growth and self-improvement.', category: QuestionCategory.Values, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'Loyalty is essential in any relationship.', category: QuestionCategory.Values, type: QuestionType.AgreementScale, weight: 1.5 },
  { text: 'I believe in work-life balance.', category: QuestionCategory.Values, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'Financial security is a top priority for me.', category: QuestionCategory.Values, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I value tradition and cultural heritage.', category: QuestionCategory.Values, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'Giving back to the community is important to me.', category: QuestionCategory.Values, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I believe in equality and fairness for all.', category: QuestionCategory.Values, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'Freedom and independence are crucial to my happiness.', category: QuestionCategory.Values, type: QuestionType.AgreementScale, weight: 1 },

  // ─── Communication (8 questions) ───────────────────────────────────────────
  { text: 'I prefer to discuss issues directly rather than avoid them.', category: QuestionCategory.Communication, type: QuestionType.AgreementScale, weight: 1.5 },
  { text: 'I am a good listener.', category: QuestionCategory.Communication, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I express my feelings openly.', category: QuestionCategory.Communication, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I prefer texting over phone calls.', category: QuestionCategory.Communication, type: QuestionType.PreferenceScale, weight: 0.5 },
  { text: 'I enjoy deep, meaningful conversations.', category: QuestionCategory.Communication, type: QuestionType.AgreementScale, weight: 1.5 },
  { text: 'I am comfortable with silence in conversations.', category: QuestionCategory.Communication, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I prefer to resolve conflicts calmly.', category: QuestionCategory.Communication, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I am good at reading non-verbal cues.', category: QuestionCategory.Communication, type: QuestionType.AgreementScale, weight: 1 },

  // ─── Personality (10 questions) ─────────────────────────────────────────────
  { text: 'I consider myself an introvert.', category: QuestionCategory.Personality, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I am highly organized and plan ahead.', category: QuestionCategory.Personality, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I enjoy being the center of attention.', category: QuestionCategory.Personality, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I am very empathetic towards others.', category: QuestionCategory.Personality, type: QuestionType.AgreementScale, weight: 1.5 },
  { text: 'I prefer routine over spontaneity.', category: QuestionCategory.Personality, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I am very curious and love learning new things.', category: QuestionCategory.Personality, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I handle stress well.', category: QuestionCategory.Personality, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I am very competitive.', category: QuestionCategory.Personality, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I am a natural leader.', category: QuestionCategory.Personality, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I am very patient with others.', category: QuestionCategory.Personality, type: QuestionType.AgreementScale, weight: 1 },

  // ─── Lifestyle (10 questions) ───────────────────────────────────────────────
  { text: 'I exercise regularly.', category: QuestionCategory.Lifestyle, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I enjoy cooking at home.', category: QuestionCategory.Lifestyle, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I prefer staying out late over going to bed early.', category: QuestionCategory.Lifestyle, type: QuestionType.PreferenceScale, weight: 0.5 },
  { text: 'I enjoy outdoor activities like hiking and camping.', category: QuestionCategory.Lifestyle, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I am a foodie and love trying new restaurants.', category: QuestionCategory.Lifestyle, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I enjoy traveling to new places.', category: QuestionCategory.Lifestyle, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I prefer a minimalist lifestyle.', category: QuestionCategory.Lifestyle, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I enjoy attending social events and parties.', category: QuestionCategory.Lifestyle, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I have pets and love animals.', category: QuestionCategory.Lifestyle, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I enjoy reading books in my free time.', category: QuestionCategory.Lifestyle, type: QuestionType.AgreementScale, weight: 0.5 },

  // ─── Future Aspirations (7 questions) ───────────────────────────────────────
  { text: 'I want to have children someday.', category: QuestionCategory.FutureAspirations, type: QuestionType.AgreementScale, weight: 2.5, dealBreaker: true },
  { text: 'I plan to advance significantly in my career.', category: QuestionCategory.FutureAspirations, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I want to live in a different country someday.', category: QuestionCategory.FutureAspirations, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I hope to start my own business.', category: QuestionCategory.FutureAspirations, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I want to buy a home in the next 5 years.', category: QuestionCategory.FutureAspirations, type: QuestionType.AgreementScale, weight: 1 },
  { text: 'I plan to pursue further education.', category: QuestionCategory.FutureAspirations, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I want to retire early and travel the world.', category: QuestionCategory.FutureAspirations, type: QuestionType.AgreementScale, weight: 0.5 },

  // ─── Interests (8 questions) ───────────────────────────────────────────────
  { text: 'I enjoy listening to live music.', category: QuestionCategory.Interests, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I am a movie buff.', category: QuestionCategory.Interests, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I enjoy playing sports.', category: QuestionCategory.Interests, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I love art and visiting museums.', category: QuestionCategory.Interests, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I enjoy gardening.', category: QuestionCategory.Interests, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I am interested in technology and gadgets.', category: QuestionCategory.Interests, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I enjoy photography.', category: QuestionCategory.Interests, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I love dancing.', category: QuestionCategory.Interests, type: QuestionType.AgreementScale, weight: 0.5 },

  // ─── Fun & Spontaneity (7 questions) ────────────────────────────────────────
  { text: 'I enjoy trying new and adventurous activities.', category: QuestionCategory.FunSpontaneity, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I like to surprise my partner with spontaneous gestures.', category: QuestionCategory.FunSpontaneity, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I enjoy comedy and making others laugh.', category: QuestionCategory.FunSpontaneity, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I love themed parties and costumes.', category: QuestionCategory.FunSpontaneity, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I enjoy board games and puzzles.', category: QuestionCategory.FunSpontaneity, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I like to keep my schedule flexible.', category: QuestionCategory.FunSpontaneity, type: QuestionType.AgreementScale, weight: 0.5 },
  { text: 'I enjoy karaoke and performing.', category: QuestionCategory.FunSpontaneity, type: QuestionType.AgreementScale, weight: 0.5 },
];

const SCALE_OPTIONS = [
  { id: 'opt-1', text: 'Strongly Disagree', value: 1 },
  { id: 'opt-2', text: 'Disagree', value: 2 },
  { id: 'opt-3', text: 'Neutral', value: 3 },
  { id: 'opt-4', text: 'Agree', value: 4 },
  { id: 'opt-5', text: 'Strongly Agree', value: 5 },
];

async function seed() {
  console.log('[SEED] Starting database seed...');
  await connectDatabase();

  // Clear existing data
  console.log('[SEED] Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Question.deleteMany({}),
    Registration.deleteMany({}),
    QuestionnaireResponse.deleteMany({}),
    QuestionnaireVersion.deleteMany({}),
    ParticipantProfile.deleteMany({}),
  ]);

  // Create users
  console.log('[SEED] Creating users...');
  const superAdmin = await User.create({
    email: 'superadmin@speeddate.dev',
    normalizedEmail: 'superadmin@speeddate.dev',
    passwordHash: await hashPassword('SuperAdmin123!'),
    roles: ['super_admin'],
    accountStatus: 'active',
  });

  const eventAdmin = await User.create({
    email: 'admin@speeddate.dev',
    normalizedEmail: 'admin@speeddate.dev',
    passwordHash: await hashPassword('Admin123!'),
    roles: ['event_admin'],
    accountStatus: 'active',
  });

  const moderator = await User.create({
    email: 'moderator@speeddate.dev',
    normalizedEmail: 'moderator@speeddate.dev',
    passwordHash: await hashPassword('Moderator123!'),
    roles: ['moderator'],
    accountStatus: 'active',
  });

  // Create participants
  const participantData = [
    { firstName: 'Emma', lastName: 'Johnson', email: 'emma@example.com', age: 28, interests: ['travel', 'hiking', 'coffee', 'music'], bio: 'Adventure seeker and coffee lover.' },
    { firstName: 'James', lastName: 'Smith', email: 'james@example.com', age: 32, interests: ['music', 'food', 'fitness', 'travel'], bio: 'Musician and foodie.' },
    { firstName: 'Sofia', lastName: 'Garcia', email: 'sofia@example.com', age: 26, interests: ['books', 'coffee', 'art', 'travel'], bio: 'Bookworm and artist.' },
    { firstName: 'Michael', lastName: 'Brown', email: 'michael@example.com', age: 30, interests: ['cooking', 'hiking', 'music', 'fitness'], bio: 'Chef and outdoor enthusiast.' },
    { firstName: 'Olivia', lastName: 'Davis', email: 'olivia@example.com', age: 29, interests: ['yoga', 'reading', 'travel', 'photography'], bio: 'Yoga instructor and world traveler.' },
    { firstName: 'William', lastName: 'Wilson', email: 'william@example.com', age: 33, interests: ['technology', 'gaming', 'movies', 'music'], bio: 'Tech enthusiast and movie buff.' },
    { firstName: 'Ava', lastName: 'Martinez', email: 'ava@example.com', age: 27, interests: ['dancing', 'fitness', 'food', 'travel'], bio: 'Dancer and foodie.' },
    { firstName: 'Alexander', lastName: 'Anderson', email: 'alexander@example.com', age: 31, interests: ['sports', 'travel', 'music', 'cooking'], bio: 'Sports fan and amateur chef.' },
  ];

  const participants: InstanceType<typeof User>[] = [];
  for (const data of participantData) {
    const user = await User.create({
      email: data.email,
      normalizedEmail: data.email,
      passwordHash: await hashPassword('Password123!'),
      roles: ['participant'],
      accountStatus: 'active',
    });
    participants.push(user);

    await ParticipantProfile.create({
      userId: user._id,
      displayName: `${data.firstName} ${data.lastName}`,
      dateOfBirth: new Date(Date.now() - data.age * 365 * 24 * 60 * 60 * 1000),
      publicProfile: {
        bio: data.bio,
        interests: data.interests,
        languages: ['English'],
        values: ['Honesty', 'Family', 'Adventure'],
        conversationStarters: ['What is your favorite travel destination?'],
      },
      privateProfile: {
        communicationPreference: 'mutual_opt_in',
      },
      consentRecords: [
        { policyVersion: 'v1', purpose: 'event_participation', consentedAt: new Date() },
        { policyVersion: 'v1', purpose: 'matching', consentedAt: new Date() },
      ],
    });
  }

  // Create event
  console.log('[SEED] Creating event...');
  const event = await Event.create({
    name: 'Autumn Speed Dating Mixer',
    slug: 'autumn-speed-dating-2026',
    description: 'Join us for an evening of meaningful connections, guided conversations, and a chance to meet someone special.',
    venue: 'The Grand Ballroom, Downtown',
    timezone: 'America/New_York',
    startAt: new Date('2026-11-15T19:00:00'),
    endAt: new Date('2026-11-15T22:00:00'),
    registrationDeadline: new Date('2026-11-10T23:59:59'),
    capacity: 40,
    eligibleGroups: ['all'],
    eventMode: 'in_person',
    organizerContact: 'events@speeddate.dev',
    instructions: 'Please arrive 15 minutes early. Bring your check-in QR code.',
    status: 'registration_open',
    createdBy: eventAdmin._id,
    matchingConfiguration: {
      mode: 'compatibility_ranking',
      minimumThreshold: 30,
      dealBreakerAction: 'exclude',
      allowMultipleMatches: false,
      respectNoRepeat: true,
    },
    publicationSettings: {
      showCompatibilityScores: true,
      showSharedInterests: true,
      contactSharingMode: 'mutual_opt_in',
    },
  });

  // Create questions
  console.log('[SEED] Creating questions...');
  const questions = QUESTION_BANK.map((q, index) => ({
    text: q.text,
    type: q.type,
    category: q.category,
    options: SCALE_OPTIONS,
    weight: q.weight,
    scoringModel: ScoringModel.Similarity,
    required: true,
    dealBreakerConfig: q.dealBreaker ? { enabled: true, optionIds: ['opt-5'], action: 'exclude' as const } : undefined,
    tags: [q.category],
    displayOrder: index,
    active: true,
    version: 1,
  }));

  const createdQuestions = await Question.insertMany(questions);

  // Create questionnaire version
  console.log('[SEED] Creating questionnaire version...');
  const questionnaire = await QuestionnaireVersion.create({
    eventId: event._id,
    version: 1,
    questionSnapshots: createdQuestions.map((q) => ({
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
    categoryWeights: DEFAULT_CATEGORY_WEIGHTS,
    completionThreshold: 0.8,
    publishedAt: new Date(),
    createdBy: eventAdmin._id,
  });

  event.questionnaireVersionId = questionnaire._id;
  await event.save();

  // Create registrations
  console.log('[SEED] Creating registrations...');
  for (const participant of participants) {
    await Registration.create({
      eventId: event._id,
      participantId: participant._id,
      registrationStatus: 'approved',
      approvalStatus: 'approved',
      questionnaireStatus: 'submitted',
      checkInStatus: 'not_checked_in',
      registeredAt: new Date(),
      approvedAt: new Date(),
    });
  }

  // Create questionnaire responses
  console.log('[SEED] Creating questionnaire responses...');
  for (const participant of participants) {
    const answers = createdQuestions.map((q) => ({
      questionId: q._id,
      value: Math.floor(Math.random() * 5) + 1,
    }));

    await QuestionnaireResponse.create({
      eventId: event._id,
      participantId: participant._id,
      questionnaireVersionId: questionnaire._id,
      answers,
      completionStatus: 'submitted',
      submittedAt: new Date(),
    });
  }

  console.log('[SEED] Seed completed successfully!');
  console.log('');
  console.log('Demo Accounts:');
  console.log('  Super Admin: superadmin@speeddate.dev / SuperAdmin123!');
  console.log('  Event Admin: admin@speeddate.dev / Admin123!');
  console.log('  Moderator: moderator@speeddate.dev / Moderator123!');
  console.log('  Participant: emma@example.com / Password123!');
  console.log('');
  console.log(`Event: ${event.name} (${event.slug})`);
  console.log(`Participants: ${participants.length}`);
  console.log(`Questions: ${createdQuestions.length}`);

  await disconnectDatabase();
  process.exit(0);
}

seed().catch((error) => {
  console.error('[SEED] Error:', error);
  process.exit(1);
});
