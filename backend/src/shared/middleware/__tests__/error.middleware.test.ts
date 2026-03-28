import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { ERROR_CODES } from '@/shared/constants';
import { createMockNext, createMockRequest, createMockResponse } from '@/test/mocks/express.mock';
import { AppError } from '@/shared/utils/error.util';

import { errorHandler, notFoundHandler } from '../error.middleware';

// Mock the logger
jest.mock('@/infrastructure/logging/winston.logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock the environment config
jest.mock('@/shared/config/environment.config', () => ({
  env: {
    app: {
      isDevelopment: false,
      isProduction: true,
      isTest: true,
    },
  },
}));

describe('Error Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockRequest({
      originalUrl: '/api/test',
      method: 'POST',
      ip: '127.0.0.1',
    });
    res = createMockResponse();
    next = createMockNext();
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    describe('ZodError handling', () => {
      it('should handle ZodError and return 400 with validation details', () => {
        // Arrange - Create ZodError by actually parsing invalid data
        const { z } = require('zod');
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        });

        let zodError: ZodError;
        try {
          schema.parse({ email: 123, password: '123' });
        } catch (e) {
          zodError = e as ZodError;
        }

        // Act
        errorHandler(zodError!, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Validation failed',
            error: expect.objectContaining({
              code: ERROR_CODES.VALIDATION_ERROR,
              details: expect.arrayContaining([
                expect.objectContaining({ field: 'email' }),
                expect.objectContaining({ field: 'password' }),
              ]),
            }),
          })
        );
      });

      it('should handle ZodError with nested path', () => {
        // Arrange
        const { z } = require('zod');
        const schema = z.object({
          user: z.object({
            profile: z.object({
              firstName: z.string(),
            }),
          }),
        });

        let zodError: ZodError;
        try {
          schema.parse({ user: { profile: {} } });
        } catch (e) {
          zodError = e as ZodError;
        }

        // Act
        errorHandler(zodError!, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              details: expect.arrayContaining([
                expect.objectContaining({ field: 'user.profile.firstName' }),
              ]),
            }),
          })
        );
      });
    });

    describe('PrismaClientKnownRequestError handling', () => {
      it('should handle P2002 unique constraint error', () => {
        // Arrange
        const prismaError = new PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          meta: { target: ['email'] },
          clientVersion: '5.0.0',
        });

        // Act
        errorHandler(prismaError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'A record with this value already exists',
            error: expect.objectContaining({
              code: ERROR_CODES.DUPLICATE_ENTRY,
              details: [{ field: 'email', message: 'email must be unique' }],
            }),
          })
        );
      });

      it('should handle P2002 without meta target', () => {
        // Arrange
        const prismaError = new PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          meta: {},
          clientVersion: '5.0.0',
        });

        // Act
        errorHandler(prismaError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              details: [{ field: 'field', message: 'field must be unique' }],
            }),
          })
        );
      });

      it('should handle P2025 record not found error', () => {
        // Arrange
        const prismaError = new PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        });

        // Act
        errorHandler(prismaError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Record not found',
            error: expect.objectContaining({
              code: ERROR_CODES.NOT_FOUND,
            }),
          })
        );
      });

      it('should handle other Prisma errors with 500', () => {
        // Arrange
        const prismaError = new PrismaClientKnownRequestError('Database error', {
          code: 'P2003', // Foreign key constraint
          clientVersion: '5.0.0',
        });

        // Act
        errorHandler(prismaError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Database operation failed',
            error: expect.objectContaining({
              code: ERROR_CODES.DATABASE_ERROR,
            }),
          })
        );
      });
    });

    describe('AppError handling', () => {
      it('should handle AppError with correct status and message', () => {
        // Arrange
        const appError = new AppError(401, 'Invalid credentials', ERROR_CODES.UNAUTHORIZED);

        // Act
        errorHandler(appError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Invalid credentials',
            error: expect.objectContaining({
              code: ERROR_CODES.UNAUTHORIZED,
            }),
          })
        );
      });

      it('should handle AppError with details', () => {
        // Arrange
        const details = [{ field: 'token', message: 'Token is invalid' }];
        const appError = new AppError(400, 'Validation error', ERROR_CODES.VALIDATION_ERROR, details);

        // Act
        errorHandler(appError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              code: ERROR_CODES.VALIDATION_ERROR,
              details,
            }),
          })
        );
      });

      it('should handle 403 Forbidden error', () => {
        // Arrange
        const appError = new AppError(403, 'Access denied', ERROR_CODES.FORBIDDEN);

        // Act
        errorHandler(appError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Access denied',
            error: expect.objectContaining({
              code: ERROR_CODES.FORBIDDEN,
            }),
          })
        );
      });

      it('should handle 404 Not Found error', () => {
        // Arrange
        const appError = new AppError(404, 'User not found', ERROR_CODES.NOT_FOUND);

        // Act
        errorHandler(appError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'User not found',
            error: expect.objectContaining({
              code: ERROR_CODES.NOT_FOUND,
            }),
          })
        );
      });
    });

    describe('Rate limit error handling', () => {
      it('should handle TooManyRequestsError', () => {
        // Arrange
        const rateLimitError = new Error('Too many requests');
        rateLimitError.name = 'TooManyRequestsError';

        // Act
        errorHandler(rateLimitError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Too many requests, please try again later',
            error: expect.objectContaining({
              code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
            }),
          })
        );
      });
    });

    describe('Generic error handling', () => {
      it('should handle unknown errors with 500 status', () => {
        // Arrange
        const genericError = new Error('Something went wrong');

        // Act
        errorHandler(genericError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Internal server error', // Production mode hides details
            error: expect.objectContaining({
              code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            }),
          })
        );
      });

      it('should show error message in development mode', () => {
        // Arrange
        const { env } = require('@/shared/config/environment.config');
        env.app.isDevelopment = true;
        env.app.isProduction = false;

        const genericError = new Error('Detailed error message');

        // Act
        errorHandler(genericError, req as Request, res as Response, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Detailed error message',
          })
        );

        // Cleanup
        env.app.isDevelopment = false;
        env.app.isProduction = true;
      });
    });

    describe('Logging', () => {
      it('should log client errors as warnings', () => {
        // Arrange
        const { logger } = require('@/infrastructure/logging/winston.logger');
        const appError = new AppError(400, 'Bad request', ERROR_CODES.INVALID_INPUT);

        // Act
        errorHandler(appError, req as Request, res as Response, next);

        // Assert
        expect(logger.warn).toHaveBeenCalledWith(
          'Client error occurred',
          expect.objectContaining({
            error: 'AppError',
            message: 'Bad request',
            url: '/api/test',
            method: 'POST',
          })
        );
      });

      it('should log validation errors as warnings', () => {
        // Arrange
        const { logger } = require('@/infrastructure/logging/winston.logger');
        const { z } = require('zod');
        const schema = z.object({ field: z.string() });

        let zodError: ZodError;
        try {
          schema.parse({ field: 123 });
        } catch (e) {
          zodError = e as ZodError;
        }

        // Act
        errorHandler(zodError!, req as Request, res as Response, next);

        // Assert
        expect(logger.warn).toHaveBeenCalled();
      });

      it('should log server errors as errors', () => {
        // Arrange
        const { logger } = require('@/infrastructure/logging/winston.logger');
        const serverError = new Error('Database connection failed');

        // Act
        errorHandler(serverError, req as Request, res as Response, next);

        // Assert
        expect(logger.error).toHaveBeenCalledWith(
          'Server error occurred',
          serverError,
          expect.objectContaining({
            url: '/api/test',
            method: 'POST',
          })
        );
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with route information', () => {
      // Arrange
      req.originalUrl = '/api/unknown-route';

      // Act
      notFoundHandler(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route /api/unknown-route not found',
        error: {
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    });

    it('should handle root path', () => {
      // Arrange
      req.originalUrl = '/';

      // Act
      notFoundHandler(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route / not found',
        error: {
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    });

    it('should handle URL with query parameters', () => {
      // Arrange
      req.originalUrl = '/api/users?page=1&limit=10';

      // Act
      notFoundHandler(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route /api/users?page=1&limit=10 not found',
        })
      );
    });
  });
});
