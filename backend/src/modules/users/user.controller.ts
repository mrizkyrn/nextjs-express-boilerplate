import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { IdParam } from '@/shared/schemas/common.schema';
import { sendSuccess, sendSuccessWithPagination } from '@/shared/utils/response.util';
import { assertType } from '@/shared/utils/type.util';
import type {
  BatchDeleteUsersBody,
  BatchUpdateRoleBody,
  CreateUserBody,
  GetUsersQuery,
  UpdatePasswordBody,
  UpdateUserBody,
} from './user.schema';
import type { UserService } from './user.service';
import type { UserResponse } from './user.type';

export class UserController {
  constructor(private readonly userService: UserService) {}

  // ==================== Current User ====================

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    const user = await this.userService.getUserById(userId);
    sendSuccess<UserResponse>(res, StatusCodes.OK, 'Profil pengguna berhasil diambil', user);
  }

  async updateCurrentUser(req: Request<{}, {}, UpdateUserBody>, res: Response, next: NextFunction) {
    const userId = req.user!.id;

    // Prevent users from changing their own role
    const { role, ...updateData } = req.body;

    const user = await this.userService.updateUser(userId, updateData);
    sendSuccess<UserResponse>(res, StatusCodes.OK, 'Profil berhasil diperbarui', user);
  }

  async updatePassword(req: Request<{}, {}, UpdatePasswordBody>, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    await this.userService.updatePassword(userId, req.body);
    sendSuccess(res, StatusCodes.OK, 'Password berhasil diperbarui');
  }

  // ==================== User Queries ====================

  async getUsers(req: Request, res: Response, next: NextFunction) {
    const query = assertType<GetUsersQuery>(req.query);
    const { users, pagination } = await this.userService.getUsers(query);
    sendSuccessWithPagination<UserResponse[]>(res, StatusCodes.OK, 'Pengguna berhasil diambil', users, pagination);
  }

  async getUserById(req: Request<IdParam>, res: Response, next: NextFunction) {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);
    sendSuccess<UserResponse>(res, StatusCodes.OK, 'Pengguna berhasil diambil', user);
  }

  async getUserStats(req: Request, res: Response, next: NextFunction) {
    const stats = await this.userService.getUserStats();
    sendSuccess(res, StatusCodes.OK, 'Statistik pengguna berhasil diambil', stats);
  }

  // ==================== User Management ====================

  async createUser(req: Request<{}, {}, CreateUserBody>, res: Response, next: NextFunction) {
    const user = await this.userService.createUser(req.body);
    sendSuccess<UserResponse>(res, StatusCodes.CREATED, 'Pengguna berhasil dibuat', user);
  }

  async updateUser(req: Request<IdParam, {}, UpdateUserBody>, res: Response, next: NextFunction) {
    const { id } = req.params;
    const user = await this.userService.updateUser(id, req.body);
    sendSuccess<UserResponse>(res, StatusCodes.OK, 'Pengguna berhasil diperbarui', user);
  }

  async deleteUser(req: Request<IdParam>, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.userService.deleteUser(id);
    sendSuccess(res, StatusCodes.OK, 'Pengguna berhasil dihapus');
  }

  // ==================== Batch Operations ====================

  async batchDeleteUsers(req: Request<{}, {}, BatchDeleteUsersBody>, res: Response, next: NextFunction) {
    const result = await this.userService.batchDeleteUsers(req.body.userIds);
    sendSuccess(res, StatusCodes.OK, `Berhasil menghapus ${result.count} pengguna`, result);
  }

  async batchUpdateRole(req: Request<{}, {}, BatchUpdateRoleBody>, res: Response, next: NextFunction) {
    const { userIds, role } = req.body;
    const result = await this.userService.batchUpdateRole(userIds, role);
    sendSuccess(res, StatusCodes.OK, `Berhasil memperbarui ${result.count} pengguna`, result);
  }
}
