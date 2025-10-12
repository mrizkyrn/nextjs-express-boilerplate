import type { UserResponse } from '@/types/user.type';

/**
 * User helper functions
 * Contains utility functions for user-related operations
 */
export const userHelper = {
  /**
   * Get the standard user select object for database queries
   * Excludes sensitive fields like password and tokens
   */
  getUserSelect: () => ({
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  }),

  /**
   * Create a UserResponse object from a Prisma user
   * @param user - Prisma user object
   * @returns UserResponse object
   */
  createUserResponse: (user: any): UserResponse => {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
