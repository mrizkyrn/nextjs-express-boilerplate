import { UserResponse } from '@/types/user.type';

/**
 * Create a UserResponse object from a Prisma user
 * @param user - Prisma user object
 * @returns UserResponse object
 */
export const createUserResponse = (user: any): UserResponse => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
