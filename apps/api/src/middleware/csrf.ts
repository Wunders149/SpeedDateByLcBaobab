import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      csrfToken?: string;
    }
  }
}

/**
 * CSRF protection for cookie-authenticated mutations.
 * Uses the double-submit cookie pattern:
 * 1. Server sets a CSRF token cookie
 * 2. Client must send the same token in a header for mutations
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Generate CSRF token if not present
  if (!req.cookies?.csrfToken) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', token, {
      httpOnly: false, // Must be readable by the client
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.COOKIE_SAME_SITE ?? (process.env.NODE_ENV === 'production' ? 'none' : 'strict')) as 'lax' | 'strict' | 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    req.csrfToken = token;
  } else {
    req.csrfToken = req.cookies.csrfToken;
  }

  // Validate CSRF token for unsafe methods
  if (!SAFE_METHODS.has(req.method)) {
    const headerToken = req.headers['x-csrf-token'] as string;
    const cookieToken = req.cookies?.csrfToken;

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_TOKEN_MISMATCH',
          message: 'Invalid or missing CSRF token',
        },
      });
      return;
    }
  }

  next();
}
