import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongooseError } from 'mongoose';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ERROR]', error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.issues,
      },
    });
    return;
  }

  if (error instanceof MongooseError) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Database validation failed',
          details: error.message,
        },
      });
      return;
    }
    if (error.name === 'CastError') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid identifier format',
        },
      });
      return;
    }
  }

  // Duplicate key error
  if ((error as { code?: number }).code === 11000) {
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: 'A record with this information already exists',
      },
    });
    return;
  }

  // Generic error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
    },
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
    },
  });
}
