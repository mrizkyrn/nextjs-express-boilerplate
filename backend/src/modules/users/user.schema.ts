import { UserRole } from '@prisma/client';
import { z } from 'zod';

import { PASSWORD } from '@/shared/constant';
import { arrayField, searchAndPaginationFields } from '@/shared/schemas/common.schema';

// ==================== Query Schemas ====================

export const getUsersQuerySchema = z.object({
  ...searchAndPaginationFields,
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'email']).optional().default('createdAt'),
  role: arrayField(z.enum(UserRole)),
  emailVerified: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

// ==================== User Management Schemas ====================

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  email: z.email('Invalid email format'),
  password: z
    .string()
    .min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`)
    .max(PASSWORD.MAX_LENGTH, `Password must not exceed ${PASSWORD.MAX_LENGTH} characters`),
  role: z.enum(UserRole).optional().default(UserRole.USER),
  emailVerified: z.boolean().optional().default(false),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  email: z.email('Invalid email format').optional(),
  role: z.enum(UserRole).optional(),
  emailVerified: z.boolean().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

// ==================== Batch Operations Schemas ====================

export const batchDeleteUsersSchema = z.object({
  userIds: z.array(z.cuid('Invalid user ID format')).min(1, 'At least one user ID is required'),
});

export const batchUpdateRoleSchema = z.object({
  userIds: z.array(z.cuid('Invalid user ID format')).min(1, 'At least one user ID is required'),
  role: z.enum(UserRole),
});

// ==================== Type Exports ====================

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type UpdatePasswordBody = z.infer<typeof updatePasswordSchema>;
export type BatchDeleteUsersBody = z.infer<typeof batchDeleteUsersSchema>;
export type BatchUpdateRoleBody = z.infer<typeof batchUpdateRoleSchema>;
