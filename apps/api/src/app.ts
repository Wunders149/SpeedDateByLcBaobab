import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { csrfProtection } from './middleware/csrf.js';
import { requestId } from './middleware/requestId.js';
import authRoutes from './modules/auth/auth.routes.js';
import eventRoutes from './modules/events/events.routes.js';
import registrationRoutes from './modules/registrations/registrations.routes.js';
import questionnaireRoutes from './modules/questionnaires/questionnaires.routes.js';
import matchingRoutes from './modules/matching/matching.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import sessionRoutes from './modules/sessions/sessions.routes.js';
import mongoose from 'mongoose';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(requestId);

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX ?? 100),
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
  },
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
});
app.use('/api/v1/auth/', authLimiter);

// CSRF protection
app.use('/api/v1/', csrfProtection);

// Health check with DB status
app.get('/api/health', (_req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  res.json({
    success: true,
    data: {
      message: 'SpeedDate API is running',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStates[dbStatus] ?? 'unknown',
        connected: dbStatus === 1,
      },
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1', registrationRoutes);
app.use('/api/v1', questionnaireRoutes);
app.use('/api/v1', matchingRoutes);
app.use('/api/v1', sessionRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
