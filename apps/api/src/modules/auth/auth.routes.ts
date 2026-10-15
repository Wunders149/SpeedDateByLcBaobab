import { Router, Request, Response } from 'express';
import { User } from '../../models/User.js';
import { ParticipantProfile } from '../../models/ParticipantProfile.js';
import { hashPassword, verifyPassword, generateToken } from '../../utils/auth.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@speed-date/shared';
import { logAudit } from '../../utils/audit.js';
import { AppError } from '../../middleware/errorHandler.js';
const router = Router();

// Register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, dateOfBirth, phone } = req.body;

  // Check age (must be 18+)
  const age = (Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 18) {
    throw new AppError('UNDERAGE', 'You must be at least 18 years old to register', 400);
  }

  const existingUser = await User.findOne({ normalizedEmail: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('EMAIL_EXISTS', 'An account with this email already exists', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email,
    normalizedEmail: email.toLowerCase(),
    phone,
    passwordHash,
    roles: ['participant'],
    accountStatus: 'active',
  });

  // Create participant profile
  await ParticipantProfile.create({
    userId: user._id,
    displayName: `${firstName} ${lastName}`,
    dateOfBirth: new Date(dateOfBirth),
    publicProfile: {
      interests: [],
      languages: [],
      values: [],
      conversationStarters: [],
    },
    privateProfile: {
      communicationPreference: 'mutual_opt_in',
    },
    consentRecords: [
      {
        policyVersion: 'v1',
        purpose: 'event_participation',
        consentedAt: new Date(),
      },
      {
        policyVersion: 'v1',
        purpose: 'matching',
        consentedAt: new Date(),
      },
    ],
  });

  const token = generateToken(user);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.COOKIE_SAME_SITE ?? (process.env.NODE_ENV === 'production' ? 'none' : 'strict')) as 'lax' | 'strict' | 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  await logAudit(req, 'user.registered', 'user', user._id.toString());

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName,
        lastName,
        roles: user.roles,
      },
    },
  });
});

// Login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ normalizedEmail: email.toLowerCase() });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  if (user.accountStatus !== 'active') {
    throw new AppError('ACCOUNT_SUSPENDED', 'Your account has been suspended', 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);

  // Set req.user for audit logging
  req.user = { userId: user._id.toString(), roles: user.roles, email: user.email };

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await logAudit(req, 'user.logged_in', 'user', user._id.toString());

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        roles: user.roles,
      },
    },
  });
});

// Logout
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  res.clearCookie('token');
  await logAudit(req, 'user.logged_out', 'user', req.user!.userId);
  res.json({ success: true, data: { message: 'Logged out successfully' } });
});

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId).select('-passwordHash');
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  const profile = await ParticipantProfile.findOne({ userId: user._id });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        roles: user.roles,
        accountStatus: user.accountStatus,
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
      },
      profile: profile
        ? {
            displayName: profile.displayName,
            publicProfile: profile.publicProfile,
            privateProfile: profile.privateProfile,
          }
        : null,
    },
  });
});

// Forgot password
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ normalizedEmail: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (user) {
      // In production, send email with reset link via a notification service
      // For development, this is a no-op
    }

    res.json({
      success: true,
      data: {
        message: 'If an account exists with this email, a password reset link has been sent',
      },
    });
  },
);

// Reset password
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  async (req: Request, res: Response) => {
    // In production, verify token from database and update password
    // For now, this is a placeholder
    res.json({
      success: true,
      data: { message: 'Password has been reset successfully' },
    });
  },
);

export default router;
