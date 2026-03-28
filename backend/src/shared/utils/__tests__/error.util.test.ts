import { AppError } from '../error.util';
import { ERROR_CODES } from '@/shared/constants';

describe('Error Utilities', () => {
  describe('AppError', () => {
    it('should create error with required parameters', () => {
      const error = new AppError(404, 'Resource not found');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should use default error code when not provided', () => {
      const error = new AppError(500, 'Internal error');

      expect(error.errorCode).toBe(ERROR_CODES.INTERNAL_SERVER_ERROR);
    });

    it('should use provided error code', () => {
      const error = new AppError(404, 'Not found', ERROR_CODES.NOT_FOUND);

      expect(error.errorCode).toBe(ERROR_CODES.NOT_FOUND);
    });

    it('should default isOperational to true', () => {
      const error = new AppError(400, 'Bad request');

      expect(error.isOperational).toBe(true);
    });

    it('should allow setting isOperational to false', () => {
      const error = new AppError(500, 'Programming error', ERROR_CODES.INTERNAL_SERVER_ERROR, undefined, false);

      expect(error.isOperational).toBe(false);
    });

    it('should include error details when provided', () => {
      const details = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = new AppError(400, 'Validation failed', ERROR_CODES.VALIDATION_ERROR, details);

      expect(error.details).toEqual(details);
      expect(error.details).toHaveLength(2);
    });

    it('should handle undefined details', () => {
      const error = new AppError(401, 'Unauthorized');

      expect(error.details).toBeUndefined();
    });

    it('should preserve error stack trace', () => {
      const error = new AppError(500, 'Server error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('error.util.test');
    });

    it('should have correct prototype chain', () => {
      const error = new AppError(404, 'Not found');

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
    });

    it('should be catchable as Error', () => {
      try {
        throw new AppError(400, 'Bad request');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
      }
    });

    it('should handle all common HTTP status codes', () => {
      const error400 = new AppError(400, 'Bad Request', ERROR_CODES.VALIDATION_ERROR);
      const error401 = new AppError(401, 'Unauthorized', ERROR_CODES.UNAUTHORIZED);
      const error403 = new AppError(403, 'Forbidden', ERROR_CODES.FORBIDDEN);
      const error404 = new AppError(404, 'Not Found', ERROR_CODES.NOT_FOUND);
      const error409 = new AppError(409, 'Conflict', ERROR_CODES.DUPLICATE_ENTRY);
      const error500 = new AppError(500, 'Internal Server Error', ERROR_CODES.INTERNAL_SERVER_ERROR);

      expect(error400.statusCode).toBe(400);
      expect(error401.statusCode).toBe(401);
      expect(error403.statusCode).toBe(403);
      expect(error404.statusCode).toBe(404);
      expect(error409.statusCode).toBe(409);
      expect(error500.statusCode).toBe(500);
    });

    it('should handle empty details array', () => {
      const error = new AppError(400, 'Validation error', ERROR_CODES.VALIDATION_ERROR, []);

      expect(error.details).toEqual([]);
      expect(error.details).toHaveLength(0);
    });

    it('should maintain message property', () => {
      const message = 'User not authenticated';
      const error = new AppError(401, message);

      expect(error.message).toBe(message);
      expect(error.toString()).toContain(message);
    });

    it('should handle authentication errors', () => {
      const error = new AppError(401, 'Invalid credentials', ERROR_CODES.UNAUTHORIZED);

      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe(ERROR_CODES.UNAUTHORIZED);
      expect(error.isOperational).toBe(true);
    });

    it('should handle authorization errors', () => {
      const error = new AppError(403, 'Access denied', ERROR_CODES.FORBIDDEN);

      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe(ERROR_CODES.FORBIDDEN);
    });

    it('should handle validation errors with multiple fields', () => {
      const details = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email must be valid' },
        { field: 'age', message: 'Age must be a positive number' },
      ];
      const error = new AppError(400, 'Validation failed', ERROR_CODES.VALIDATION_ERROR, details);

      expect(error.details).toHaveLength(3);
      expect(error.details![0].field).toBe('name');
      expect(error.details![2].field).toBe('age');
    });

    it('should handle rate limit errors', () => {
      const error = new AppError(429, 'Too many requests', ERROR_CODES.RATE_LIMIT_EXCEEDED);

      expect(error.statusCode).toBe(429);
      expect(error.errorCode).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
    });

    it('should be serializable to JSON', () => {
      const error = new AppError(404, 'Not found', ERROR_CODES.NOT_FOUND, [
        { field: 'id', message: 'Invalid ID' },
      ]);

      const serialized = JSON.parse(JSON.stringify({
        statusCode: error.statusCode,
        message: error.message,
        errorCode: error.errorCode,
        details: error.details,
      }));

      expect(serialized.statusCode).toBe(404);
      expect(serialized.message).toBe('Not found');
      expect(serialized.errorCode).toBe(ERROR_CODES.NOT_FOUND);
      expect(serialized.details).toHaveLength(1);
    });

    it('should handle token errors', () => {
      const invalidToken = new AppError(401, 'Invalid token', ERROR_CODES.INVALID_TOKEN);
      const expiredToken = new AppError(401, 'Token expired', ERROR_CODES.TOKEN_EXPIRED);

      expect(invalidToken.errorCode).toBe(ERROR_CODES.INVALID_TOKEN);
      expect(expiredToken.errorCode).toBe(ERROR_CODES.TOKEN_EXPIRED);
    });
  });
});
