import { ERROR_CODES } from '@/config/error.config';
import { userHelper } from '@/helpers/user.helper';
import { prisma } from '@/libs/prisma.lib';
import type { PaginationMeta } from '@/types/response.type';
import type { CreateUserRequest, GetUsersQueryParams, UpdatePasswordRequest, UpdateUserRequest, UserResponse } from '@/types/user.type';
import { AppError } from '@/utils/error.util';
import { calculatePagination, calculateSkip, normalizePaginationParams } from '@/utils/pagination.util';
import { comparePassword, hashPassword } from '@/utils/password.util';
import { Prisma, UserRole } from '@prisma/client';

export class UserService {
  /**
   * Get paginated list of users with filtering and sorting
   */
  async getUsers(query: GetUsersQueryParams): Promise<{ users: UserResponse[]; pagination: PaginationMeta }> {
    const { page, limit } = normalizePaginationParams(query.page, query.limit);
    const { search, role, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = calculateSkip(page, limit);

    // Build where clause for filtering
    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(search && {
        OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }],
      }),
    };

    // Execute count and find queries in parallel for better performance
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: userHelper.getUserSelect(),
      }),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return { users: users.map(userHelper.createUserResponse), pagination };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userHelper.getUserSelect(),
    });

    if (!user) {
      throw new AppError(404, 'User not found', ERROR_CODES.NOT_FOUND);
    }

    return userHelper.createUserResponse(user);
  }

  /**
   * Create new user (admin only)
   */
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const { email, password, name, role = UserRole.USER } = data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already registered', ERROR_CODES.DUPLICATE_ENTRY, [{ field: 'email', message: 'This email is already in use' }]);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: userHelper.getUserSelect(),
    });

    return userHelper.createUserResponse(user);
  }

  /**
   * Update user by ID
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new AppError(404, 'User not found', ERROR_CODES.NOT_FOUND);
    }

    // If email is being updated, check if it's already taken
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new AppError(409, 'Email already in use', ERROR_CODES.DUPLICATE_ENTRY, [{ field: 'email', message: 'This email is already in use' }]);
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data,
      select: userHelper.getUserSelect(),
    });

    return userHelper.createUserResponse(user);
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id: string): Promise<void> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, 'User not found', ERROR_CODES.NOT_FOUND);
    }

    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, data: UpdatePasswordRequest): Promise<void> {
    const { currentPassword, newPassword } = data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found', ERROR_CODES.NOT_FOUND);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Current password is incorrect', ERROR_CODES.UNAUTHORIZED);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStats(): Promise<{ total: number; byRole: Record<string, number> }> {
    const [total, roleStats] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    const byRole = roleStats.reduce(
      (acc, stat) => {
        acc[stat.role] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return { total, byRole };
  }
}

export const userService = new UserService();
