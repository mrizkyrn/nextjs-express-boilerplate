import type { UserResponse } from '@/modules/users/user.type';
import type { User, UserRole } from '@prisma/client';

export const USER_BASE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const ADMIN_MINIMAL_SELECT = {
  id: true,
  name: true,
} as const;

export const USER_MINIMAL_SELECT = {
  id: true,
  name: true,
  email: true,
} as const;

/**
 * Maps Prisma User to UserResponse DTO
 *
 * @param user - Prisma user object with base fields
 * @returns Sanitized user object for API response
 */
export function mapUserResponse(user: Pick<User, keyof typeof USER_BASE_SELECT>): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Maps array of Prisma Users to UserResponse array
 *
 * @param users - Array of Prisma user objects
 * @returns Array of UserResponse objects
 */
export function mapUsersResponse(users: Pick<User, keyof typeof USER_BASE_SELECT>[]): UserResponse[] {
  return users.map(mapUserResponse);
}
