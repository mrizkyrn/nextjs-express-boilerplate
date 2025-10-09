import { Request, Response, NextFunction } from 'express';
import { userService } from '@/services/user.service';
import { sendSuccess, sendSuccessWithPagination } from '@/helpers/response.helper';
import type { GetUsersQuery, CreateUserRequest, UpdateUserRequest, UpdatePasswordRequest } from '@/types/user.type';
import { getUserByIdSchema } from '@/schemas/user.schema';

export class UserController {
  /**
   * Get paginated list of users
   */
  async getUsers(req: Request<{}, {}, {}, GetUsersQuery>, res: Response, next: NextFunction): Promise<void> {
    const { users, pagination } = await userService.getUsers(req.query);
    sendSuccessWithPagination(res, 200, 'Users retrieved successfully', users, pagination);
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    const { id } = getUserByIdSchema.parse(req.params);
    const user = await userService.getUserById(id);
    sendSuccess(res, 200, 'User retrieved successfully', user);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user!.id;
    const user = await userService.getUserById(userId);
    sendSuccess(res, 200, 'User profile retrieved successfully', user);
  }

  /**
   * Create new user (admin only)
   */
  async createUser(req: Request<{}, {}, CreateUserRequest>, res: Response, next: NextFunction): Promise<void> {
    const user = await userService.createUser(req.body);
    sendSuccess(res, 201, 'User created successfully', user);
  }

  /**
   * Update user by ID
   */
  async updateUser(req: Request<{ id: string }, {}, UpdateUserRequest>, res: Response, next: NextFunction): Promise<void> {
    const { id } = getUserByIdSchema.parse(req.params);
    const user = await userService.updateUser(id, req.body);
    sendSuccess(res, 200, 'User updated successfully', user);
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(req: Request<{}, {}, UpdateUserRequest>, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user!.id;

    // Prevent users from changing their own role
    const { role, ...updateData } = req.body;

    const user = await userService.updateUser(userId, updateData);
    sendSuccess(res, 200, 'Profile updated successfully', user);
  }

  /**
   * Delete user by ID
   */
  async deleteUser(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    const { id } = getUserByIdSchema.parse(req.params);
    await userService.deleteUser(id);
    sendSuccess(res, 200, 'User deleted successfully');
  }

  /**
   * Update user password
   */
  async updatePassword(req: Request<{}, {}, UpdatePasswordRequest>, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user!.id;
    await userService.updatePassword(userId, req.body);
    sendSuccess(res, 200, 'Password updated successfully');
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    const stats = await userService.getUserStats();
    sendSuccess(res, 200, 'User statistics retrieved successfully', stats);
  }
}

export const userController = new UserController();
