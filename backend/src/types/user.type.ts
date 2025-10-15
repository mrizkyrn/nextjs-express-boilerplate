import { BatchDeleteUsersBody, BatchUpdateRoleBody, CreateUserBody, UpdatePasswordBody, UpdateUserBody } from '@/schemas/user.schema';
import { UserRole } from '@prisma/client';

/**
 * Types for API request/response payloads
 */
export type CreateUserRequest = CreateUserBody;
export type UpdateUserRequest = UpdateUserBody;
export type UpdatePasswordRequest = UpdatePasswordBody;
export type BatchDeleteUsersRequest = BatchDeleteUsersBody;
export type BatchUpdateRoleRequest = BatchUpdateRoleBody;

export interface GetUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  emailVerified?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
