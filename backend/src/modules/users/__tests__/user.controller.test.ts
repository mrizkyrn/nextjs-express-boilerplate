import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '@prisma/client';

import { UserController } from '../user.controller';
import type { UserService } from '../user.service';
import type { UserResponse, UserStatsResponse } from '../user.type';
import type { PaginationMeta } from '@/shared/types/response.type';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  createAuthenticatedRequest,
} from '@/test/mocks/express.mock';
import {
  createUserForSelect,
  createTestUsers,
} from '@/test/fixtures/user.fixture';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Create mock UserService
    mockUserService = {
      getUserById: jest.fn(),
      getUsers: jest.fn(),
      getUserStats: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      updatePassword: jest.fn(),
      deleteUser: jest.fn(),
      batchDeleteUsers: jest.fn(),
      batchUpdateRole: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    userController = new UserController(mockUserService);
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  // ==================== Current User Operations ====================

  describe('getCurrentUser', () => {
    it('should return current user profile', async () => {
      // Arrange
      const userId = 'current-user-id';
      mockReq = createAuthenticatedRequest({
        id: userId,
        email: 'current@example.com',
        role: 'USER',
      });
      const userResponse = createUserForSelect({ id: userId });
      mockUserService.getUserById.mockResolvedValue(userResponse as UserResponse);

      // Act
      await userController.getCurrentUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User profile retrieved successfully',
          data: userResponse,
        })
      );
    });

    it('should use authenticated user id from request', async () => {
      // Arrange
      const userId = 'specific-user-id';
      mockReq = createAuthenticatedRequest({
        id: userId,
        email: 'specific@example.com',
        role: 'ADMIN',
      });
      mockUserService.getUserById.mockResolvedValue(createUserForSelect() as UserResponse);

      // Act
      await userController.getCurrentUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateCurrentUser', () => {
    it('should update current user profile', async () => {
      // Arrange
      const userId = 'user-id';
      const updateData = { name: 'Updated Name' };
      mockReq = createAuthenticatedRequest(
        { id: userId, email: 'test@example.com', role: 'USER' },
        { body: updateData }
      );
      const updatedUser = createUserForSelect({ id: userId, name: 'Updated Name' });
      mockUserService.updateUser.mockResolvedValue(updatedUser as UserResponse);

      // Act
      await userController.updateCurrentUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Profile updated successfully',
          data: updatedUser,
        })
      );
    });

    it('should strip role from update data to prevent self-promotion', async () => {
      // Arrange
      const userId = 'user-id';
      const updateDataWithRole = { name: 'New Name', role: UserRole.ADMIN };
      mockReq = createAuthenticatedRequest(
        { id: userId, email: 'test@example.com', role: 'USER' },
        { body: updateDataWithRole }
      );
      mockUserService.updateUser.mockResolvedValue(createUserForSelect() as UserResponse);

      // Act
      await userController.updateCurrentUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert - role should be stripped from the update
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, { name: 'New Name' });
    });

    it('should handle update with email change', async () => {
      // Arrange
      const userId = 'user-id';
      const updateData = { email: 'newemail@example.com' };
      mockReq = createAuthenticatedRequest(
        { id: userId, email: 'old@example.com', role: 'USER' },
        { body: updateData }
      );
      mockUserService.updateUser.mockResolvedValue(
        createUserForSelect({ email: 'newemail@example.com' }) as UserResponse
      );

      // Act
      await userController.updateCurrentUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, { email: 'newemail@example.com' });
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      // Arrange
      const userId = 'user-id';
      const passwordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };
      mockReq = createAuthenticatedRequest(
        { id: userId, email: 'test@example.com', role: 'USER' },
        { body: passwordData }
      );
      mockUserService.updatePassword.mockResolvedValue(undefined);

      // Act
      await userController.updatePassword(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.updatePassword).toHaveBeenCalledWith(userId, passwordData);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Password updated successfully',
        })
      );
    });
  });

  // ==================== User Queries ====================

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      // Arrange
      const query = { page: '1', limit: '10', sortBy: 'createdAt', sortOrder: 'desc' };
      mockReq = createMockRequest({ query });
      const users = createTestUsers(3).map((u) => createUserForSelect(u));
      const pagination: PaginationMeta = {
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
      mockUserService.getUsers.mockResolvedValue({
        users: users as UserResponse[],
        pagination,
      });

      // Act
      await userController.getUsers(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.getUsers).toHaveBeenCalledWith(query);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Users retrieved successfully',
          data: users,
          pagination,
        })
      );
    });

    it('should pass query filters to service', async () => {
      // Arrange
      const query = {
        page: '2',
        limit: '5',
        search: 'john',
        role: [UserRole.USER],
        emailVerified: 'true',
      };
      mockReq = createMockRequest({ query: query as any });
      mockUserService.getUsers.mockResolvedValue({
        users: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: true,
        },
      });

      // Act
      await userController.getUsers(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.getUsers).toHaveBeenCalledWith(query);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      // Arrange
      const userId = 'target-user-id';
      mockReq = createMockRequest({ params: { id: userId } });
      const user = createUserForSelect({ id: userId });
      mockUserService.getUserById.mockResolvedValue(user as UserResponse);

      // Act
      await userController.getUserById(
        mockReq as unknown as Request<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User retrieved successfully',
          data: user,
        })
      );
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      // Arrange
      mockReq = createMockRequest();
      const stats: UserStatsResponse = {
        totalUsers: 100,
        roleDistribution: [
          { role: UserRole.USER, count: 90 },
          { role: UserRole.ADMIN, count: 10 },
        ],
        emailVerificationStats: {
          verified: 85,
          unverified: 15,
        },
      };
      mockUserService.getUserStats.mockResolvedValue(stats);

      // Act
      await userController.getUserStats(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.getUserStats).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User statistics retrieved successfully',
          data: stats,
        })
      );
    });
  });

  // ==================== User Management ====================

  describe('createUser', () => {
    it('should create a new user and return 201', async () => {
      // Arrange
      const createData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
        role: UserRole.USER,
        emailVerified: false,
      };
      mockReq = createMockRequest({ body: createData });
      const createdUser = createUserForSelect({
        email: createData.email,
        name: createData.name,
      });
      mockUserService.createUser.mockResolvedValue(createdUser as UserResponse);

      // Act
      await userController.createUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(createData);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User created successfully',
          data: createdUser,
        })
      );
    });

    it('should create admin user when role is ADMIN', async () => {
      // Arrange
      const createData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'AdminPass123!',
        role: UserRole.ADMIN,
        emailVerified: true,
      };
      mockReq = createMockRequest({ body: createData });
      const adminUser = createUserForSelect({
        email: createData.email,
        name: createData.name,
        role: UserRole.ADMIN,
      });
      mockUserService.createUser.mockResolvedValue(adminUser as UserResponse);

      // Act
      await userController.createUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateUser', () => {
    it('should update user by id', async () => {
      // Arrange
      const userId = 'target-user-id';
      const updateData = { name: 'Updated Name', role: UserRole.ADMIN };
      mockReq = createMockRequest({
        params: { id: userId },
        body: updateData,
      });
      const updatedUser = createUserForSelect({
        id: userId,
        name: 'Updated Name',
        role: UserRole.ADMIN,
      });
      mockUserService.updateUser.mockResolvedValue(updatedUser as UserResponse);

      // Act
      await userController.updateUser(
        mockReq as unknown as Request<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User updated successfully',
          data: updatedUser,
        })
      );
    });

    it('should update user email verification status', async () => {
      // Arrange
      const userId = 'user-id';
      const updateData = { emailVerified: true };
      mockReq = createMockRequest({
        params: { id: userId },
        body: updateData,
      });
      mockUserService.updateUser.mockResolvedValue(
        createUserForSelect({ emailVerified: true }) as UserResponse
      );

      // Act
      await userController.updateUser(
        mockReq as unknown as Request<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, { emailVerified: true });
    });
  });

  describe('deleteUser', () => {
    it('should delete user by id', async () => {
      // Arrange
      const userId = 'user-to-delete';
      mockReq = createMockRequest({ params: { id: userId } });
      mockUserService.deleteUser.mockResolvedValue(undefined);

      // Act
      await userController.deleteUser(
        mockReq as unknown as Request<{ id: string }>,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User deleted successfully',
        })
      );
    });
  });

  // ==================== Batch Operations ====================

  describe('batchDeleteUsers', () => {
    it('should delete multiple users', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];
      mockReq = createMockRequest({ body: { userIds } });
      const result = { count: 3 };
      mockUserService.batchDeleteUsers.mockResolvedValue(result);

      // Act
      await userController.batchDeleteUsers(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.batchDeleteUsers).toHaveBeenCalledWith(userIds);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Successfully deleted 3 users',
          data: result,
        })
      );
    });

    it('should handle partial deletion (some users not found)', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'nonexistent'];
      mockReq = createMockRequest({ body: { userIds } });
      const result = { count: 2 }; // Only 2 deleted
      mockUserService.batchDeleteUsers.mockResolvedValue(result);

      // Act
      await userController.batchDeleteUsers(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Successfully deleted 2 users',
        })
      );
    });
  });

  describe('batchUpdateRole', () => {
    it('should update role for multiple users', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];
      const role = UserRole.ADMIN;
      mockReq = createMockRequest({ body: { userIds, role } });
      const result = { count: 2 };
      mockUserService.batchUpdateRole.mockResolvedValue(result);

      // Act
      await userController.batchUpdateRole(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.batchUpdateRole).toHaveBeenCalledWith(userIds, role);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Successfully updated 2 users',
          data: result,
        })
      );
    });

    it('should update users to USER role', async () => {
      // Arrange
      const userIds = ['admin-1', 'admin-2'];
      const role = UserRole.USER;
      mockReq = createMockRequest({ body: { userIds, role } });
      const result = { count: 2 };
      mockUserService.batchUpdateRole.mockResolvedValue(result);

      // Act
      await userController.batchUpdateRole(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.batchUpdateRole).toHaveBeenCalledWith(userIds, UserRole.USER);
    });
  });

  // ==================== Error Propagation ====================

  describe('error propagation', () => {
    it('should propagate errors from getUserById', async () => {
      // Arrange
      mockReq = createAuthenticatedRequest({
        id: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      });
      const error = new Error('User not found');
      mockUserService.getUserById.mockRejectedValue(error);

      // Act & Assert
      await expect(
        userController.getCurrentUser(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(error);
    });

    it('should propagate errors from updateUser', async () => {
      // Arrange
      mockReq = createAuthenticatedRequest(
        { id: 'user-id', email: 'test@example.com', role: 'USER' },
        { body: { name: 'New Name' } }
      );
      const error = new Error('Email already in use');
      mockUserService.updateUser.mockRejectedValue(error);

      // Act & Assert
      await expect(
        userController.updateCurrentUser(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(error);
    });

    it('should propagate errors from createUser', async () => {
      // Arrange
      mockReq = createMockRequest({
        body: {
          name: 'Test',
          email: 'duplicate@example.com',
          password: 'Password123!',
        },
      });
      const error = new Error('Email already exists');
      mockUserService.createUser.mockRejectedValue(error);

      // Act & Assert
      await expect(
        userController.createUser(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(error);
    });

    it('should propagate errors from deleteUser', async () => {
      // Arrange
      mockReq = createMockRequest({ params: { id: 'nonexistent-id' } });
      const error = new Error('User not found');
      mockUserService.deleteUser.mockRejectedValue(error);

      // Act & Assert
      await expect(
        userController.deleteUser(
          mockReq as unknown as Request<{ id: string }>,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(error);
    });

    it('should propagate errors from updatePassword', async () => {
      // Arrange
      mockReq = createAuthenticatedRequest(
        { id: 'user-id', email: 'test@example.com', role: 'USER' },
        { body: { currentPassword: 'wrong', newPassword: 'NewPass123!' } }
      );
      const error = new Error('Invalid current password');
      mockUserService.updatePassword.mockRejectedValue(error);

      // Act & Assert
      await expect(
        userController.updatePassword(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(error);
    });
  });
});
