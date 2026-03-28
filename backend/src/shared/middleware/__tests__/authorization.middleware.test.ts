import { UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import { ERROR_CODES } from '@/shared/constants';
import { createMockNext, createMockRequest, createMockResponse } from '@/test/mocks/express.mock';

import { requireRoles, requireAdmin, requireNonAdmin } from '../authorization.middleware';

describe('Authorization Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
    jest.clearAllMocks();
  });

  describe('requireRoles', () => {
    it('should call next when user has required role', () => {
      // Arrange
      req.user = { id: 'user-1', email: 'user@test.com', role: UserRole.USER };
      const middleware = requireRoles([UserRole.USER]);

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should call next when user has one of multiple allowed roles', () => {
      // Arrange
      req.user = { id: 'admin-1', email: 'admin@test.com', role: UserRole.ADMIN };
      const middleware = requireRoles([UserRole.USER, UserRole.ADMIN]);

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with error when user is not authenticated', () => {
      // Arrange
      req.user = undefined;
      const middleware = requireRoles([UserRole.USER]);

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication required',
          errorCode: ERROR_CODES.UNAUTHORIZED,
        })
      );
    });

    it('should call next with error when user role is not in allowed roles', () => {
      // Arrange
      req.user = { id: 'user-1', email: 'user@test.com', role: UserRole.USER };
      const middleware = requireRoles([UserRole.ADMIN]);

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining('Access denied'),
          errorCode: ERROR_CODES.FORBIDDEN,
        })
      );
    });

    it('should use custom message when provided', () => {
      // Arrange
      req.user = { id: 'user-1', email: 'user@test.com', role: UserRole.USER };
      const customMessage = 'You need special permissions';
      const middleware = requireRoles([UserRole.ADMIN], customMessage);

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: customMessage,
          errorCode: ERROR_CODES.FORBIDDEN,
        })
      );
    });

    it('should include user role in default error message', () => {
      // Arrange
      req.user = { id: 'user-1', email: 'user@test.com', role: UserRole.USER };
      const middleware = requireRoles([UserRole.ADMIN]);

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("'USER'"),
        })
      );
    });

    it('should handle empty allowed roles array', () => {
      // Arrange
      req.user = { id: 'user-1', email: 'user@test.com', role: UserRole.USER };
      const middleware = requireRoles([]);

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          errorCode: ERROR_CODES.FORBIDDEN,
        })
      );
    });
  });

  describe('requireAdmin', () => {
    it('should call next when user is admin', () => {
      // Arrange
      req.user = { id: 'admin-1', email: 'admin@test.com', role: UserRole.ADMIN };
      const middleware = requireAdmin();

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with error when user is not admin', () => {
      // Arrange
      req.user = { id: 'user-1', email: 'user@test.com', role: UserRole.USER };
      const middleware = requireAdmin();

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Administrator access required',
          errorCode: ERROR_CODES.FORBIDDEN,
        })
      );
    });

    it('should call next with error when user is not authenticated', () => {
      // Arrange
      req.user = undefined;
      const middleware = requireAdmin();

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          errorCode: ERROR_CODES.UNAUTHORIZED,
        })
      );
    });
  });

  describe('requireNonAdmin', () => {
    it('should call next when user is regular user', () => {
      // Arrange
      req.user = { id: 'user-1', email: 'user@test.com', role: UserRole.USER };
      const middleware = requireNonAdmin();

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with error when user is admin', () => {
      // Arrange
      req.user = { id: 'admin-1', email: 'admin@test.com', role: UserRole.ADMIN };
      const middleware = requireNonAdmin();

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Non-administrator access required',
          errorCode: ERROR_CODES.FORBIDDEN,
        })
      );
    });

    it('should call next with error when user is not authenticated', () => {
      // Arrange
      req.user = undefined;
      const middleware = requireNonAdmin();

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          errorCode: ERROR_CODES.UNAUTHORIZED,
        })
      );
    });
  });
});
