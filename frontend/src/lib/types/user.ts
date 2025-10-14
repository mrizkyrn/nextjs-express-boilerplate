/**
 * User types and interfaces
 * Matches backend user types and API responses
 */

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User query parameters
 */
export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

/**
 * User statistics response
 */
export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  usersCreatedThisMonth: number;
  usersCreatedToday: number;
}

/**
 * User request payloads
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * User response types
 */
export type UserResponse = User;

export interface UsersListResponse {
  users: User[];
}
