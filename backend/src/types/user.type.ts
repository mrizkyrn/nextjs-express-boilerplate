import { CreateUserBody, UpdatePasswordBody, UpdateUserBody } from '@/schemas/user.schema';
import { UserRole } from '@prisma/client';

/**
 * Types for API request/response payloads
 */
export type CreateUserRequest = CreateUserBody;
export type UpdateUserRequest = UpdateUserBody;
export type UpdatePasswordRequest = UpdatePasswordBody;

export interface GetUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
