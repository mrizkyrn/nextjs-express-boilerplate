import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const getUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
  search: z.string().optional(),
  role: z.enum(UserRole).optional(),
  emailVerified: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'email']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const getUserByIdSchema = z.object({
  id: z.cuid('Invalid user ID format'),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(UserRole).optional().default(UserRole.USER),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters').optional(),
  email: z.email('Invalid email format').optional(),
  role: z.enum(UserRole).optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type GetUserByIdParams = z.infer<typeof getUserByIdSchema>;
export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type UpdatePasswordBody = z.infer<typeof updatePasswordSchema>;
