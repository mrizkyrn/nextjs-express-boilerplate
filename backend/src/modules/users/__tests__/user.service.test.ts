import { UserRole } from '@prisma/client';

import { ERROR_CODES } from '@/shared/constants';
import { createMockPrisma, MockPrismaClient } from '@/test/mocks/prisma.mock';
import {
  createAdminUser,
  createTestUser,
  createTestUsers,
  createUserForSelect,
} from '@/test/fixtures/user.fixture';
import type { GetUsersQuery } from '../user.schema';

import { UserService } from '../user.service';

// Mock password utilities
jest.mock('@/shared/utils/password.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  comparePassword: jest.fn(),
}));

// Import mocked modules
import { hashPassword, comparePassword } from '@/shared/utils/password.util';

/**
 * Helper to create default query params for getUsers
 */
const createGetUsersQuery = (overrides: Partial<GetUsersQuery> = {}): GetUsersQuery => ({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  emailVerified: undefined,
  ...overrides,
});

describe('UserService', () => {
  let userService: UserService;
  let mockPrisma: MockPrismaClient;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    userService = new UserService(mockPrisma as any);
    jest.clearAllMocks();
    // Re-setup mock implementations after clearAllMocks
    (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
  });

  describe('getUsers', () => {
    it('should return paginated users with default parameters', async () => {
      // Arrange
      const testUsers = createTestUsers(3).map(createUserForSelect);
      mockPrisma.user.count.mockResolvedValue(3);
      mockPrisma.user.findMany.mockResolvedValue(testUsers);

      // Act
      const result = await userService.getUsers(createGetUsersQuery());

      // Assert
      expect(result.users).toHaveLength(3);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
      expect(mockPrisma.user.count).toHaveBeenCalled();
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should filter users by role', async () => {
      // Arrange
      const adminUsers = [createUserForSelect({ role: UserRole.ADMIN })];
      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findMany.mockResolvedValue(adminUsers);

      // Act
      const result = await userService.getUsers(createGetUsersQuery({
        role: [UserRole.ADMIN],
      }));

      // Assert
      expect(result.users).toHaveLength(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: { in: [UserRole.ADMIN] },
          }),
        })
      );
    });

    it('should filter users by email verification status', async () => {
      // Arrange
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.user.findMany.mockResolvedValue([]);

      // Act
      await userService.getUsers(createGetUsersQuery({
        emailVerified: true,
      }));

      // Assert
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            emailVerified: true,
          }),
        })
      );
    });

    it('should search users by name or email', async () => {
      // Arrange
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.user.findMany.mockResolvedValue([]);

      // Act
      await userService.getUsers(createGetUsersQuery({
        search: 'test',
      }));

      // Assert
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'test', mode: 'insensitive' } },
              { email: { contains: 'test', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const testUsers = createTestUsers(5).map(createUserForSelect);
      mockPrisma.user.count.mockResolvedValue(15);
      mockPrisma.user.findMany.mockResolvedValue(testUsers);

      // Act
      const result = await userService.getUsers(createGetUsersQuery({
        page: 2,
        limit: 5,
      }));

      // Assert
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true,
      });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it('should sort users by specified field and order', async () => {
      // Arrange
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.user.findMany.mockResolvedValue([]);

      // Act
      await userService.getUsers(createGetUsersQuery({
        sortBy: 'name',
        sortOrder: 'asc',
      }));

      // Assert
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const testUser = createUserForSelect();
      mockPrisma.user.findUnique.mockResolvedValue(testUser);

      // Act
      const result = await userService.getUserById('test-user-id');

      // Assert
      expect(result).toEqual(testUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        select: expect.any(Object),
      });
    });

    it('should throw NOT_FOUND error when user does not exist', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById('non-existent-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
        errorCode: ERROR_CODES.NOT_FOUND,
      });
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      // Arrange
      mockPrisma.user.count
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(90) // verified
        .mockResolvedValueOnce(10); // unverified
      mockPrisma.user.groupBy.mockResolvedValue([
        { role: UserRole.USER, _count: { role: 80 } },
        { role: UserRole.ADMIN, _count: { role: 20 } },
      ]);

      // Act
      const result = await userService.getUserStats();

      // Assert
      expect(result).toEqual({
        totalUsers: 100,
        roleDistribution: [
          { role: UserRole.USER, count: 80 },
          { role: UserRole.ADMIN, count: 20 },
        ],
        emailVerificationStats: {
          verified: 90,
          unverified: 10,
        },
      });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const createData = {
        email: 'new@example.com',
        password: 'Password123!',
        name: 'New User',
        role: UserRole.USER,
        emailVerified: false,
      };
      const createdUser = createUserForSelect({
        email: createData.email,
        name: createData.name,
        role: createData.role,
        emailVerified: createData.emailVerified,
      });

      mockPrisma.user.findUnique.mockResolvedValue(null); // No existing user
      mockPrisma.user.create.mockResolvedValue(createdUser);

      // Act
      const result = await userService.createUser(createData);

      // Assert
      expect(result.email).toBe(createData.email);
      expect(hashPassword).toHaveBeenCalledWith(createData.password);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: createData.email,
          password: 'hashed-password',
          name: createData.name,
          role: createData.role,
        }),
        select: expect.any(Object),
      });
    });

    it('should throw DUPLICATE_ENTRY error when email already exists', async () => {
      // Arrange
      const existingUser = createTestUser();
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(
        userService.createUser({
          email: existingUser.email,
          password: 'Password123!',
          name: 'New User',
          role: UserRole.USER,
          emailVerified: false,
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email already in use',
        errorCode: ERROR_CODES.DUPLICATE_ENTRY,
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const existingUser = createTestUser();
      const updatedUser = createUserForSelect({ name: 'Updated Name' });

      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: existingUser.id }) // ensureUserExists
        .mockResolvedValueOnce(null); // validateEmailUniqueness (no conflict)
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await userService.updateUser(existingUser.id, {
        name: 'Updated Name',
      });

      // Assert
      expect(result.name).toBe('Updated Name');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: { name: 'Updated Name' },
        select: expect.any(Object),
      });
    });

    it('should throw NOT_FOUND error when user does not exist', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        userService.updateUser('non-existent-id', { name: 'New Name' })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
        errorCode: ERROR_CODES.NOT_FOUND,
      });
    });

    it('should validate email uniqueness when updating email', async () => {
      // Arrange
      const existingUser = createTestUser();
      const otherUser = createTestUser({ id: 'other-user-id', email: 'other@example.com' });

      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: existingUser.id }) // ensureUserExists
        .mockResolvedValueOnce({ id: otherUser.id }); // validateEmailUniqueness (conflict)

      // Act & Assert
      await expect(
        userService.updateUser(existingUser.id, { email: 'other@example.com' })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email already in use',
        errorCode: ERROR_CODES.DUPLICATE_ENTRY,
      });
    });

    it('should allow updating to same email (own email)', async () => {
      // Arrange
      const existingUser = createTestUser();
      const updatedUser = createUserForSelect();

      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: existingUser.id }) // ensureUserExists
        .mockResolvedValueOnce({ id: existingUser.id }); // validateEmailUniqueness (same user)
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await userService.updateUser(existingUser.id, {
        email: existingUser.email,
      });

      // Assert
      expect(result).toBeDefined();
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully when current password is correct', async () => {
      // Arrange
      const user = createTestUser();
      mockPrisma.user.findUnique.mockResolvedValue({ id: user.id, password: user.password });
      (comparePassword as jest.Mock).mockResolvedValue(true);

      // Act
      await userService.updatePassword(user.id, {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
      });

      // Assert
      expect(comparePassword).toHaveBeenCalledWith('Password123!', user.password);
      expect(hashPassword).toHaveBeenCalledWith('NewPassword123!');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { password: 'hashed-password' },
      });
    });

    it('should throw NOT_FOUND error when user does not exist', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        userService.updatePassword('non-existent-id', {
          currentPassword: 'Password123!',
          newPassword: 'NewPassword123!',
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
        errorCode: ERROR_CODES.NOT_FOUND,
      });
    });

    it('should throw UNAUTHORIZED error when current password is incorrect', async () => {
      // Arrange
      const user = createTestUser();
      mockPrisma.user.findUnique.mockResolvedValue({ id: user.id, password: user.password });
      (comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        userService.updatePassword(user.id, {
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
        })
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Current password is incorrect',
        errorCode: ERROR_CODES.UNAUTHORIZED,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const user = createTestUser();
      mockPrisma.user.findUnique.mockResolvedValue({ id: user.id });
      mockPrisma.user.delete.mockResolvedValue(user);

      // Act
      await userService.deleteUser(user.id);

      // Assert
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('should throw NOT_FOUND error when user does not exist', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser('non-existent-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
        errorCode: ERROR_CODES.NOT_FOUND,
      });
    });
  });

  describe('batchDeleteUsers', () => {
    it('should delete multiple users successfully', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];
      mockPrisma.user.findMany.mockResolvedValue(
        userIds.map((id) => ({ id }))
      );
      mockPrisma.user.deleteMany.mockResolvedValue({ count: 3 });

      // Act
      const result = await userService.batchDeleteUsers(userIds);

      // Assert
      expect(result).toEqual({ count: 3 });
      expect(mockPrisma.user.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
      });
    });

    it('should throw NOT_FOUND error when no users exist', async () => {
      // Arrange
      mockPrisma.user.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(
        userService.batchDeleteUsers(['non-existent-1', 'non-existent-2'])
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
        errorCode: ERROR_CODES.NOT_FOUND,
      });
    });

    it('should delete only existing users when some IDs are invalid', async () => {
      // Arrange
      const requestedIds = ['user-1', 'non-existent', 'user-2'];
      const existingUsers = [{ id: 'user-1' }, { id: 'user-2' }];
      mockPrisma.user.findMany.mockResolvedValue(existingUsers);
      mockPrisma.user.deleteMany.mockResolvedValue({ count: 2 });

      // Act
      const result = await userService.batchDeleteUsers(requestedIds);

      // Assert
      expect(result).toEqual({ count: 2 });
    });
  });

  describe('batchUpdateRole', () => {
    it('should update roles for multiple users successfully', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];
      mockPrisma.user.findMany.mockResolvedValue(userIds.map((id) => ({ id })));
      mockPrisma.user.updateMany.mockResolvedValue({ count: 2 });

      // Act
      const result = await userService.batchUpdateRole(userIds, UserRole.ADMIN);

      // Assert
      expect(result).toEqual({ count: 2 });
      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
        data: { role: UserRole.ADMIN },
      });
    });

    it('should throw NOT_FOUND error when no users exist', async () => {
      // Arrange
      mockPrisma.user.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(
        userService.batchUpdateRole(['non-existent-1'], UserRole.ADMIN)
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
        errorCode: ERROR_CODES.NOT_FOUND,
      });
    });
  });
});
