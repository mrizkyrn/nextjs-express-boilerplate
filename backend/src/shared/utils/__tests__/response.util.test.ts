import { Response } from 'express';

import { ERROR_CODES } from '@/shared/constants';
import { createMockResponse } from '@/test/mocks/express.mock';

import { sendErrorResponse, sendSuccess, sendSuccessWithPagination } from '../response.util';

// Mock the environment config
jest.mock('@/shared/config/environment.config', () => ({
  env: {
    app: {
      isDevelopment: false,
      isProduction: false,
      isTest: true,
    },
  },
}));

describe('ResponseUtil', () => {
  describe('sendSuccess', () => {
    let mockRes: Response;

    beforeEach(() => {
      mockRes = createMockResponse() as Response;
    });

    it('should send success response with data when data is provided', () => {
      // Arrange
      const statusCode = 200;
      const message = 'Request successful';
      const data = { id: 1, name: 'Test User' };

      // Act
      sendSuccess(mockRes, statusCode, message, data);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
      });
    });

    it('should send success response without data when data is not provided', () => {
      // Arrange
      const statusCode = 204;
      const message = 'Resource deleted successfully';

      // Act
      sendSuccess(mockRes, statusCode, message);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
      });
    });

    it('should include data field when data is null', () => {
      // Arrange
      const statusCode = 200;
      const message = 'No data found';
      const data = null;

      // Act
      sendSuccess(mockRes, statusCode, message, data);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data: null,
      });
    });

    it('should handle different status codes correctly', () => {
      // Arrange
      const testCases = [
        { statusCode: 200, message: 'OK' },
        { statusCode: 201, message: 'Created' },
        { statusCode: 204, message: 'No Content' },
      ];

      testCases.forEach(({ statusCode, message }) => {
        // Reset mocks
        jest.clearAllMocks();

        // Act
        sendSuccess(mockRes, statusCode, message);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(statusCode);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          message,
        });
      });
    });

    it('should handle array data correctly', () => {
      // Arrange
      const statusCode = 200;
      const message = 'Users retrieved';
      const data = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ];

      // Act
      sendSuccess(mockRes, statusCode, message, data);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
      });
    });

    it('should handle empty object data correctly', () => {
      // Arrange
      const statusCode = 200;
      const message = 'Empty object';
      const data = {};

      // Act
      sendSuccess(mockRes, statusCode, message, data);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data: {},
      });
    });

    it('should return the response object for chaining', () => {
      // Arrange
      const statusCode = 200;
      const message = 'Success';
      const data = { test: true };

      // Act
      const result = sendSuccess(mockRes, statusCode, message, data);

      // Assert
      expect(result).toBe(mockRes);
    });
  });

  describe('sendSuccessWithPagination', () => {
    let mockRes: Response;

    beforeEach(() => {
      mockRes = createMockResponse() as Response;
    });

    it('should send success response with pagination metadata', () => {
      // Arrange
      const statusCode = 200;
      const message = 'Users retrieved';
      const data = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ];
      const pagination = {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false,
      };

      // Act
      sendSuccessWithPagination(mockRes, statusCode, message, data, pagination);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
        pagination,
      });
    });

    it('should handle last page pagination correctly', () => {
      // Arrange
      const statusCode = 200;
      const message = 'Last page';
      const data = [{ id: 100, name: 'Last User' }];
      const pagination = {
        page: 10,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNextPage: false,
        hasPrevPage: true,
      };

      // Act
      sendSuccessWithPagination(mockRes, statusCode, message, data, pagination);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
        pagination,
      });
    });

    it('should handle empty data with pagination', () => {
      // Arrange
      const statusCode = 200;
      const message = 'No results found';
      const data: any[] = [];
      const pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };

      // Act
      sendSuccessWithPagination(mockRes, statusCode, message, data, pagination);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data: [],
        pagination,
      });
    });

    it('should handle middle page pagination correctly', () => {
      // Arrange
      const statusCode = 200;
      const message = 'Middle page';
      const data = [{ id: 50, name: 'Middle User' }];
      const pagination = {
        page: 5,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: true,
      };

      // Act
      sendSuccessWithPagination(mockRes, statusCode, message, data, pagination);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
        pagination,
      });
    });

    it('should return the response object for chaining', () => {
      // Arrange
      const statusCode = 200;
      const message = 'Success';
      const data = [{ test: true }];
      const pagination = {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      // Act
      const result = sendSuccessWithPagination(mockRes, statusCode, message, data, pagination);

      // Assert
      expect(result).toBe(mockRes);
    });
  });

  describe('sendErrorResponse', () => {
    let mockRes: Response;

    beforeEach(() => {
      mockRes = createMockResponse() as Response;
    });

    it('should send error response without details or stack when not provided', () => {
      // Arrange
      const statusCode = 400;
      const message = 'Bad request';
      const errorCode = ERROR_CODES.VALIDATION_ERROR;

      // Act
      sendErrorResponse(mockRes, statusCode, message, errorCode);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: {
          code: errorCode,
        },
      });
    });

    it('should include error details when provided', () => {
      // Arrange
      const statusCode = 400;
      const message = 'Validation failed';
      const errorCode = ERROR_CODES.VALIDATION_ERROR;
      const details = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password must be at least 8 characters' },
      ];

      // Act
      sendErrorResponse(mockRes, statusCode, message, errorCode, details);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: {
          code: errorCode,
          details,
        },
      });
    });

    it('should not include details when empty array is provided', () => {
      // Arrange
      const statusCode = 400;
      const message = 'Bad request';
      const errorCode = ERROR_CODES.INVALID_INPUT;
      const details: any[] = [];

      // Act
      sendErrorResponse(mockRes, statusCode, message, errorCode, details);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: {
          code: errorCode,
        },
      });
    });

    it('should include stack trace in development environment', () => {
      // Arrange - mock isDevelopment to true
      const { env } = require('@/shared/config/environment.config');
      env.app.isDevelopment = true;

      const statusCode = 500;
      const message = 'Internal server error';
      const errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
      const stack = 'Error: Test error\n    at testFunction (test.js:10:15)';

      // Act
      sendErrorResponse(mockRes, statusCode, message, errorCode, undefined, stack);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: {
          code: errorCode,
          stack,
        },
      });

      // Cleanup
      env.app.isDevelopment = false;
    });

    it('should not include stack trace in production environment', () => {
      // Arrange - isDevelopment is false by default in mock
      const statusCode = 500;
      const message = 'Internal server error';
      const errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
      const stack = 'Error: Test error\n    at testFunction (test.js:10:15)';

      // Act
      sendErrorResponse(mockRes, statusCode, message, errorCode, undefined, stack);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: {
          code: errorCode,
        },
      });
    });

    it('should include both details and stack in development', () => {
      // Arrange - mock isDevelopment to true
      const { env } = require('@/shared/config/environment.config');
      env.app.isDevelopment = true;

      const statusCode = 400;
      const message = 'Validation failed';
      const errorCode = ERROR_CODES.VALIDATION_ERROR;
      const details = [{ field: 'email', message: 'Invalid email format' }];
      const stack = 'Error: Validation error\n    at validate (validator.js:20:10)';

      // Act
      sendErrorResponse(mockRes, statusCode, message, errorCode, details, stack);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: {
          code: errorCode,
          details,
          stack,
        },
      });

      // Cleanup
      env.app.isDevelopment = false;
    });

    it('should handle different error codes correctly', () => {
      // Arrange
      const testCases = [
        { statusCode: 401, errorCode: ERROR_CODES.UNAUTHORIZED },
        { statusCode: 403, errorCode: ERROR_CODES.FORBIDDEN },
        { statusCode: 404, errorCode: ERROR_CODES.NOT_FOUND },
        { statusCode: 500, errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR },
      ];

      testCases.forEach(({ statusCode, errorCode }) => {
        // Reset mocks
        jest.clearAllMocks();

        // Act
        sendErrorResponse(mockRes, statusCode, 'Error message', errorCode);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(statusCode);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: 'Error message',
          error: {
            code: errorCode,
          },
        });
      });
    });

    it('should return the response object for chaining', () => {
      // Arrange
      const statusCode = 400;
      const message = 'Error';
      const errorCode = ERROR_CODES.INVALID_INPUT;

      // Act
      const result = sendErrorResponse(mockRes, statusCode, message, errorCode);

      // Assert
      expect(result).toBe(mockRes);
    });

    it('should handle authentication errors correctly', () => {
      // Arrange
      const statusCode = 401;
      const message = 'Token expired';
      const errorCode = ERROR_CODES.TOKEN_EXPIRED;

      // Act
      sendErrorResponse(mockRes, statusCode, message, errorCode);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: {
          code: errorCode,
        },
      });
    });

    it('should handle database errors correctly', () => {
      // Arrange
      const statusCode = 409;
      const message = 'Email already exists';
      const errorCode = ERROR_CODES.DUPLICATE_ENTRY;
      const details = [{ field: 'email', message: 'This email is already registered' }];

      // Act
      sendErrorResponse(mockRes, statusCode, message, errorCode, details);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: {
          code: errorCode,
          details,
        },
      });
    });

    it('should handle rate limit errors correctly', () => {
      // Arrange
      const statusCode = 429;
      const message = 'Too many requests';
      const errorCode = ERROR_CODES.RATE_LIMIT_EXCEEDED;

      // Act
      sendErrorResponse(mockRes, statusCode, message, errorCode);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: {
          code: errorCode,
        },
      });
    });

    it('should not include stack in test environment', () => {
      // Arrange - isDevelopment is false by default in mock (test env)
      const statusCode = 500;
      const message = 'Internal server error';
      const errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
      const stack = 'Error: Test error\n    at testFunction (test.js:10:15)';

      // Act
      sendErrorResponse(mockRes, statusCode, message, errorCode, undefined, stack);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: {
          code: errorCode,
        },
      });
    });
  });
});
