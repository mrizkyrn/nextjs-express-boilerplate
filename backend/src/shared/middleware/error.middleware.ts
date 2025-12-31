import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logError } from '@/infrastructure/logging/winston.logger';
import { env } from '@/shared/config/environment.config';
import { ERROR_CODES } from '@/shared/constant';
import { AppError } from '@/shared/util/error.util';
import { sendErrorResponse } from '@/shared/util/response.util';
import type { ErrorDetail, ErrorResponse } from '@/types/response.type';

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Determine log level based on error type
  const isClientError = err instanceof AppError && err.statusCode < 500;
  const isValidationError = err instanceof ZodError;

  // Log with appropriate level
  if (isClientError || isValidationError) {
    // Client errors and validation errors - log as warning (user mistakes, not system issues)
    logger.warn('Client error occurred', {
      error: err.name,
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  } else {
    // Server errors - log as error (system issues)
    logError('Server error occurred', err, {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details: ErrorDetail[] = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return sendErrorResponse(res, 400, 'Validation failed', ERROR_CODES.VALIDATION_ERROR, details, err.stack);
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const meta = err.meta as { target?: string[] };
      const field = meta?.target?.[0] || 'field';

      return sendErrorResponse(
        res,
        409,
        'A record with this value already exists',
        ERROR_CODES.DUPLICATE_ENTRY,
        [{ field, message: `${field} must be unique` }],
        err.stack
      );
    }

    if (err.code === 'P2025') {
      return sendErrorResponse(res, 404, 'Record not found', ERROR_CODES.NOT_FOUND, undefined, err.stack);
    }

    // Generic Prisma error
    return sendErrorResponse(res, 500, 'Database operation failed', ERROR_CODES.DATABASE_ERROR, undefined, err.stack);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return sendErrorResponse(res, err.statusCode, err.message, err.errorCode, err.details, err.stack);
  }

  // Handle rate limit errors
  if (err.name === 'TooManyRequestsError') {
    return sendErrorResponse(
      res,
      429,
      'Too many requests, please try again later',
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      undefined,
      err.stack
    );
  }

  // Default error - avoid leaking sensitive information in production
  const message = env.app.isDevelopment ? err.message : 'Internal server error';

  return sendErrorResponse(res, 500, message, ERROR_CODES.INTERNAL_SERVER_ERROR, undefined, err.stack);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const response: ErrorResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: {
      code: ERROR_CODES.NOT_FOUND,
    },
  };

  res.status(404).json(response);
};
