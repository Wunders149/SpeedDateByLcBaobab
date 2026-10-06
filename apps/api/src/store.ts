import { randomUUID } from 'node:crypto';
import type { EventConfig, Profile, Answer } from '@speed-date/shared';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'participant' | 'event_admin' | 'super_admin' | 'moderator';
  password: string;
  city: string;
  age: number;
  bio: string;
  interests: string[];
  isEligible: boolean;
};

export type Registration = {
  id: string;
  eventId: string;
  participantId: string;
  status: 'registered' | 'waitlisted';
  createdAt: string;
};

export const seedEvents: EventConfig[] = [
  {
    id: 'evt-1',
    name: 'Moonlight Mixer',
    city: 'Seattle',
    capacity: 32,
    startsAt: '2026-11-05T19:30:00.000Z',
    venue: 'Harbor Room',
    description: 'An inclusive meet-and-greet with guided conversation cards and live DJ.',
    tags: ['music', 'nightlife', 'first-timers'],
  },
  {
    id: 'evt-2',
    name: 'City Park Speed Date',
    city: 'Portland',
    capacity: 28,
    startsAt: '2026-11-12T18:00:00.000Z',
    venue: 'Rose Pavilion',
    description: 'A relaxed outdoor event focused on easy conversation and quick chemistry.',
    tags: ['outdoor', 'casual', 'social'],
  },
];

export const questionnaireQuestions = [
  { id: 'q1', prompt: 'I enjoy spontaneous plans and last-minute adventures.', value: 3 },
  { id: 'q2', prompt: 'Shared values matter more than instant chemistry.', value: 4 },
  { id: 'q3', prompt: 'I like a partner who is curious and conversational.', value: 5 },
  { id: 'q4', prompt: 'I am comfortable with a light, playful first impression.', value: 2 },
  { id: 'q5', prompt: 'A healthy mix of independence and connection is important.', value: 4 },
];

export const profileSeed: Profile[] = [
  {
    id: 'p-1',
    firstName: 'Leah',
    lastName: 'Nguyen',
    email: 'leah@example.com',
    age: 29,
    city: 'Seattle',
    bio: 'Foodie, runner, and big believer in intentional connection.',
    role: 'participant',
    interests: ['travel', 'hiking', 'coffee', 'music'],
    isEligible: true,
  },
  {
    id: 'p-2',
    firstName: 'Marcus',
    lastName: 'Hale',
    email: 'marcus@example.com',
    age: 31,
    city: 'Seattle',
    bio: 'Weekend explorer who enjoys deep conversations and a little wit.',
    role: 'participant',
    interests: ['music', 'food', 'fitness', 'travel'],
    isEligible: true,
  },
  {
    id: 'p-3',
    firstName: 'Priya',
    lastName: 'Sethi',
    email: 'priya@example.com',
    age: 27,
    city: 'Portland',
    bio: 'Books, brunch, and curious people who like enough adventure to be interesting.',
    role: 'participant',
    interests: ['books', 'coffee', 'art', 'travel'],
    isEligible: true,
  },
  {
    id: 'p-4',
    firstName: 'Dylan',
    lastName: 'Brook',
    email: 'dylan@example.com',
    age: 34,
    city: 'Portland',
    bio: 'Good listener, amateur chef, and fan of low-pressure social plans.',
    role: 'participant',
    interests: ['cooking', 'hiking', 'music', 'fitness'],
    isEligible: true,
  },
];

export const store = {
  users: [
    {
      id: 'admin-1',
      firstName: 'Avery',
      lastName: 'Stone',
      email: 'avery@speeddate.com',
      role: 'event_admin' as const,
      password: 'password123',
      city: 'Seattle',
      age: 36,
      bio: 'Organizes events and keeps the experience warm and fair.',
      interests: ['planning', 'community', 'music'],
      isEligible: true,
    },
    ...profileSeed.map((profile) => ({
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      role: 'participant' as const,
      password: 'password123',
      city: profile.city,
      age: profile.age,
      bio: profile.bio,
      interests: profile.interests,
      isEligible: profile.isEligible,
    })),
  ],
  events: [...seedEvents],
  registrations: [
    { id: 'reg-1', eventId: 'evt-1', participantId: 'p-1', status: 'registered' as const, createdAt: new Date().toISOString() },
    { id: 'reg-2', eventId: 'evt-1', participantId: 'p-2', status: 'registered' as const, createdAt: new Date().toISOString() },
    { id: 'reg-3', eventId: 'evt-2', participantId: 'p-3', status: 'registered' as const, createdAt: new Date().toISOString() },
  ],
  questionnaireResponses: {
    'p-1': [
      { questionId: 'q1', label: 'I enjoy spontaneous plans and last-minute adventures.', value: 5 },
      { questionId: 'q2', label: 'Shared values matter more than instant chemistry.', value: 4 },
      { questionId: 'q3', label: 'I like a partner who is curious and conversational.', value: 5 },
    ],
    'p-2': [
      { questionId: 'q1', label: 'I enjoy spontaneous plans and last-minute adventures.', value: 4 },
      { questionId: 'q2', label: 'Shared values matter more than instant chemistry.', value: 5 },
      { questionId: 'q3', label: 'I like a partner who is curious and conversational.', value: 4 },
    ],
    'p-3': [
      { questionId: 'q1', label: 'I enjoy spontaneous plans and last-minute adventures.', value: 3 },
      { questionId: 'q2', label: 'Shared values matter more than instant chemistry.', value: 4 },
      { questionId: 'q3', label: 'I like a partner who is curious and conversational.', value: 5 },
    ],
    'p-4': [
      { questionId: 'q1', label: 'I enjoy spontaneous plans and last-minute adventures.', value: 2 },
      { questionId: 'q2', label: 'Shared values matter more than instant chemistry.', value: 5 },
      { questionId: 'q3', label: 'I like a partner who is curious and conversational.', value: 4 },
    ],
  } as Record<string, Answer[]>,
};

export function createUserRecord(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  city: string;
  age: number;
  bio: string;
  interests: string[];
  role?: User['role'];
}): User {
  const user: User = {
    id: randomUUID(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,
    city: input.city,
    age: input.age,
    bio: input.bio,
    interests: input.interests,
    isEligible: true,
    role: input.role ?? 'participant',
  };

  store.users.push(user);
  return user;
}
