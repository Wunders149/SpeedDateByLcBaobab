import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { User } from './models/User.js';
import { Event } from './models/Event.js';
import { Question } from './models/Question.js';
import { hashPassword } from './utils/auth.js';

describe('API Endpoints', () => {
  let authToken: string;
  let testEventId: string;

  beforeAll(async () => {
    await connectDatabase();

    // Clean up test data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Question.deleteMany({});

    // Create test admin
    const admin = await User.create({
      email: 'test-admin@test.com',
      normalizedEmail: 'test-admin@test.com',
      passwordHash: await hashPassword('Admin123!'),
      roles: ['event_admin'],
      accountStatus: 'active',
    });

    // Create test participant
    await User.create({
      email: 'test-user@test.com',
      normalizedEmail: 'test-user@test.com',
      passwordHash: await hashPassword('User123!'),
      roles: ['participant'],
      accountStatus: 'active',
    });

    // Create test event
    const event = await Event.create({
      name: 'Test Event',
      slug: 'test-event',
      description: 'A test event',
      venue: 'Test Venue',
      startAt: new Date('2026-12-01T19:00:00'),
      endAt: new Date('2026-12-01T22:00:00'),
      registrationDeadline: new Date('2026-11-25T23:59:59'),
      capacity: 20,
      eligibleGroups: ['all'],
      eventMode: 'in_person',
      organizerContact: 'test@test.com',
      status: 'registration_open',
      createdBy: admin._id,
    });
    testEventId = event._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Event.deleteMany({});
    await Question.deleteMany({});
    await disconnectDatabase();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'newuser@test.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1995-01-01T00:00:00.000Z',
        agreedToRules: true,
        agreedToPrivacy: true,
        consentToMatching: true,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@test.com');
    });

    it('should login with valid credentials', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test-user@test.com',
        password: 'User123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      authToken = response.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1] ?? '';
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test-user@test.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Events', () => {
    it('should list public events', async () => {
      const response = await request(app).get('/api/v1/events');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toBeInstanceOf(Array);
    });

    it('should get event details', async () => {
      const response = await request(app).get(`/api/v1/events/${testEventId}`);
      expect(response.status).toBe(200);
      expect(response.body.data.event.name).toBe('Test Event');
    });
  });

  describe('Authorization', () => {
    it('should reject unauthorized access to admin routes', async () => {
      const response = await request(app).get('/api/v1/admin/dashboard');
      expect(response.status).toBe(401);
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `token=${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe('test-user@test.com');
    });
  });
});
