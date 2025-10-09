import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { logger } from '@/config/logger.config';
import { ErrorResponse, ErrorDetail } from '@/types/response.type';
import { ERROR_CODES } from '@/constants/errorCodes.constant';
import { AppError } from '@/helpers/error.helper';
import { sendErrorResponse } from '@/helpers/response.helper';

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error with full context
  logger.error('Error occurred', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

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

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendErrorResponse(res, 401, 'Invalid token', ERROR_CODES.INVALID_TOKEN, undefined, err.stack);
  }

  if (err.name === 'TokenExpiredError') {
    return sendErrorResponse(res, 401, 'Token expired', ERROR_CODES.TOKEN_EXPIRED, undefined, err.stack);
  }

  // Handle rate limit errors
  if (err.name === 'TooManyRequestsError') {
    return sendErrorResponse(res, 429, 'Too many requests, please try again later', ERROR_CODES.RATE_LIMIT_EXCEEDED, undefined, err.stack);
  }

  // Default error - avoid leaking sensitive information in production
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';

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
