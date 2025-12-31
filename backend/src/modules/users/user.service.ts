import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'tsyringe';

import { DI_TYPES, ERROR_CODES } from '@/shared/constants';
import type { PaginationMeta } from '@/shared/types/response.type';
import { AppError } from '@/shared/utils/error.util';
import { calculatePagination, calculateSkip, normalizePaginationParams } from '@/shared/utils/pagination.util';
import { comparePassword, hashPassword } from '@/shared/utils/password.util';
import { mapUserResponse, mapUsersResponse, USER_BASE_SELECT } from './user.mapper';
import type { CreateUserBody, GetUsersQuery, UpdatePasswordBody, UpdateUserBody } from './user.schema';
import type { UserResponse, UserStatsResponse } from './user.type';

@injectable()
export class UserService {
  constructor(@inject(DI_TYPES.PrismaClient) private readonly prisma: PrismaClient) {}

  // ==================== Private Helper Methods ====================

  /**
   * Validates user existence by ID
   * @param id - User ID to check
   */
  private async ensureUserExists(id: string): Promise<void> {
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Pengguna tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }
  }

  /**
   * Validates multiple users exist and returns their IDs
   * @param userIds - Array of user IDs to validate
   * @returns Array of existing user IDs
   */
  private async ensureUsersExist(userIds: string[]): Promise<string[]> {
    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });

    if (existingUsers.length === 0) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Pengguna tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    return existingUsers.map((u) => u.id);
  }

  /**
   * Validates email uniqueness across users
   * @param email - Email address to validate
   * @param excludeUserId - Optional user ID to exclude from validation
   */
  private async validateEmailUniqueness(email: string, excludeUserId?: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new AppError(StatusCodes.CONFLICT, 'Email sudah digunakan', ERROR_CODES.DUPLICATE_ENTRY);
    }
  }

  /**
   * Builds Prisma where clause for user filtering
   * @param query - Query parameters for filtering
   * @returns Prisma where clause object
   */
  private buildUserWhereClause(query: GetUsersQuery): Prisma.UserWhereInput {
    const { search, role, emailVerified } = query;

    return {
      ...(role && { role: { in: role } }),
      ...(emailVerified !== undefined && { emailVerified }),
      ...(search && {
        OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }],
      }),
    };
  }

  // ==================== User Queries ====================

  /**
   * Retrieves paginated users with filtering and sorting
   * @param query - Query parameters for pagination, filtering and sorting
   * @returns Paginated user list with metadata
   */
  async getUsers(query: GetUsersQuery): Promise<{ users: UserResponse[]; pagination: PaginationMeta }> {
    const { page, limit } = normalizePaginationParams(query.page, query.limit);
    const { sortBy, sortOrder } = query;
    const skip = calculateSkip(page, limit);
    const where = this.buildUserWhereClause(query);

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: USER_BASE_SELECT,
      }),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return { users: mapUsersResponse(users), pagination };
  }

  /**
   * Retrieves user by ID
   * @param id - User ID to fetch
   * @returns User response object
   */
  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_BASE_SELECT,
    });

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Pengguna tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    return mapUserResponse(user);
  }

  /**
   * Retrieves user statistics for admin dashboard
   * @returns User statistics including counts and distributions
   */
  async getUserStats(): Promise<UserStatsResponse> {
    const [totalUsers, roleDistribution, verifiedCount, unverifiedCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      this.prisma.user.count({ where: { emailVerified: true } }),
      this.prisma.user.count({ where: { emailVerified: false } }),
    ]);

    return {
      totalUsers,
      roleDistribution: roleDistribution.map((item) => ({
        role: item.role,
        count: item._count.role,
      })),
      emailVerificationStats: {
        verified: verifiedCount,
        unverified: unverifiedCount,
      },
    };
  }

  // ==================== User Management ====================

  /**
   * Creates new user account
   * @param data - User creation data
   * @returns Created user response
   */
  async createUser(data: CreateUserBody): Promise<UserResponse> {
    const { email, password, name, role, emailVerified } = data;

    await this.validateEmailUniqueness(email);
    const hashedPassword = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        emailVerified,
      },
      select: USER_BASE_SELECT,
    });

    return mapUserResponse(user);
  }

  /**
   * Updates user profile information
   * @param id - User ID to update
   * @param data - Update data
   * @returns Updated user response
   */
  async updateUser(id: string, data: UpdateUserBody): Promise<UserResponse> {
    await this.ensureUserExists(id);

    // Only validate email uniqueness if email is being changed
    if (data.email) {
      await this.validateEmailUniqueness(data.email, id);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: USER_BASE_SELECT,
    });

    return mapUserResponse(user);
  }

  /**
   * Updates user password after verification
   * @param userId - User ID whose password to update
   * @param data - Password update data
   */
  async updatePassword(userId: string, data: UpdatePasswordBody): Promise<void> {
    const { currentPassword, newPassword } = data;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Pengguna tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    // Verify current password before allowing change
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Password saat ini salah', ERROR_CODES.UNAUTHORIZED);
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Deletes user account
   * @param id - User ID to delete
   */
  async deleteUser(id: string): Promise<void> {
    await this.ensureUserExists(id);

    await this.prisma.user.delete({
      where: { id },
    });
  }

  // ==================== Batch Operations ====================

  /**
   * Deletes multiple users in batch
   * @param userIds - Array of user IDs to delete
   * @returns Count of deleted users
   */
  async batchDeleteUsers(userIds: string[]): Promise<{ count: number }> {
    await this.ensureUsersExist(userIds);

    const result = await this.prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    return { count: result.count };
  }

  /**
   * Updates roles for multiple users
   * @param userIds - Array of user IDs to update
   * @param role - New role to assign
   * @returns Count of updated users
   */
  async batchUpdateRole(userIds: string[], role: UserRole): Promise<{ count: number }> {
    await this.ensureUsersExist(userIds);

    const result = await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { role },
    });

    return { count: result.count };
  }
}
