import { NextFunction, Request, Response } from 'express';
import { getUserByIdSchema } from '@/schemas/user.schema';
import { userService } from '@/services/user.service';
import type {
  BatchDeleteUsersRequest,
  BatchUpdateRoleRequest,
  CreateUserRequest,
  GetUsersQueryParams,
  UpdatePasswordRequest,
  UpdateUserRequest,
} from '@/types/user.type';
import { sendSuccess, sendSuccessWithPagination } from '@/utils/response.util';

export class UserController {
  /**
   * Get paginated list of users (admin only)
   */
  async getUsers(req: Request<{}, {}, {}, GetUsersQueryParams>, res: Response, next: NextFunction): Promise<void> {
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

  /**
   * Batch delete multiple users (admin only)
   */
  async batchDeleteUsers(req: Request<{}, {}, BatchDeleteUsersRequest>, res: Response, next: NextFunction): Promise<void> {
    const result = await userService.batchDeleteUsers(req.body.userIds);
    sendSuccess(res, 200, `Successfully deleted ${result.count} ${result.count === 1 ? 'user' : 'users'}`, result);
  }

  /**
   * Batch update user roles (admin only)
   */
  async batchUpdateRole(req: Request<{}, {}, BatchUpdateRoleRequest>, res: Response, next: NextFunction): Promise<void> {
    const { userIds, role } = req.body;
    const result = await userService.batchUpdateRole(userIds, role);
    sendSuccess(res, 200, `Successfully updated ${result.count} ${result.count === 1 ? 'user' : 'users'}`, result);
  }
}

export const userController = new UserController();
