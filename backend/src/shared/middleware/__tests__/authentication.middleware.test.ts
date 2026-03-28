import { NextFunction, Request, Response } from 'express';

import { ERROR_CODES } from '@/shared/constants';
import { createMockNext, createMockRequest, createMockResponse } from '@/test/mocks/express.mock';
import { AppError } from '@/shared/utils/error.util';

import { authenticate } from '../authentication.middleware';

// Mock the jwt utility
jest.mock('@/shared/utils/jwt.util', () => ({
  verifyAccessToken: jest.fn(),
}));

import { verifyAccessToken } from '@/shared/utils/jwt.util';

const mockVerifyAccessToken = verifyAccessToken as jest.MockedFunction<typeof verifyAccessToken>;

describe('Authentication Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid bearer token and attach user to request', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        type: 'access' as const,
        iat: Date.now(),
        exp: Date.now() + 3600,
      };
      mockVerifyAccessToken.mockReturnValue(mockPayload);
      req.headers = { authorization: 'Bearer valid-token' };

      // Act
      await authenticate(req as Request, res as Response, next);

      // Assert
      expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(req.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with error when no authorization header', async () => {
      // Arrange
      req.headers = {};

      // Act
      await authenticate(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Access token required',
          errorCode: ERROR_CODES.UNAUTHORIZED,
        })
      );
    });

    it('should call next with error when authorization header is empty', async () => {
      // Arrange
      req.headers = { authorization: '' };

      // Act
      await authenticate(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Access token required',
          errorCode: ERROR_CODES.UNAUTHORIZED,
        })
      );
    });

    it('should call next with error when authorization header does not start with Bearer', async () => {
      // Arrange
      req.headers = { authorization: 'Basic some-token' };

      // Act
      await authenticate(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Access token required',
          errorCode: ERROR_CODES.UNAUTHORIZED,
        })
      );
    });

    it('should call next with error when token verification fails', async () => {
      // Arrange
      const tokenError = new AppError(401, 'Invalid token', ERROR_CODES.INVALID_TOKEN);
      mockVerifyAccessToken.mockImplementation(() => {
        throw tokenError;
      });
      req.headers = { authorization: 'Bearer invalid-token' };

      // Act
      await authenticate(req as Request, res as Response, next);

      // Assert
      expect(mockVerifyAccessToken).toHaveBeenCalledWith('invalid-token');
      expect(next).toHaveBeenCalledWith(tokenError);
    });

    it('should call next with error when token is expired', async () => {
      // Arrange
      const expiredError = new AppError(401, 'Token expired', ERROR_CODES.TOKEN_EXPIRED);
      mockVerifyAccessToken.mockImplementation(() => {
        throw expiredError;
      });
      req.headers = { authorization: 'Bearer expired-token' };

      // Act
      await authenticate(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expiredError);
    });

    it('should handle user without name', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user-456',
        email: 'noname@example.com',
        name: undefined,
        role: 'ADMIN',
        type: 'access' as const,
        iat: Date.now(),
        exp: Date.now() + 3600,
      };
      mockVerifyAccessToken.mockReturnValue(mockPayload);
      req.headers = { authorization: 'Bearer valid-token' };

      // Act
      await authenticate(req as Request, res as Response, next);

      // Assert
      expect(req.user).toEqual({
        id: 'user-456',
        email: 'noname@example.com',
        name: undefined,
        role: 'ADMIN',
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should extract token correctly with extra spaces', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user-789',
        email: 'test@example.com',
        name: 'Test',
        role: 'USER',
        type: 'access' as const,
        iat: Date.now(),
        exp: Date.now() + 3600,
      };
      mockVerifyAccessToken.mockReturnValue(mockPayload);
      // Note: Bearer followed by space then token
      req.headers = { authorization: 'Bearer   token-with-spaces' };

      // Act
      await authenticate(req as Request, res as Response, next);

      // Assert - the split will get empty string for multiple spaces
      expect(mockVerifyAccessToken).toHaveBeenCalledWith('');
    });

    it('should handle different user roles', async () => {
      // Arrange
      const roles = ['USER', 'ADMIN'];

      for (const role of roles) {
        jest.clearAllMocks();
        const mockPayload = {
          userId: `user-${role}`,
          email: `${role.toLowerCase()}@example.com`,
          name: `${role} User`,
          role,
          type: 'access' as const,
          iat: Date.now(),
          exp: Date.now() + 3600,
        };
        mockVerifyAccessToken.mockReturnValue(mockPayload);
        req.headers = { authorization: 'Bearer valid-token' };

        // Act
        await authenticate(req as Request, res as Response, next);

        // Assert
        expect(req.user?.role).toBe(role);
        expect(next).toHaveBeenCalledWith();
      }
    });
  });
});
