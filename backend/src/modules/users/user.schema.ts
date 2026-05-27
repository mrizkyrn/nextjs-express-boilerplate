import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

import { PASSWORD } from '@/shared/constants';
import { arrayField, searchAndPaginationFields } from '@/shared/schemas/common.schema';
import { registerSchema as registerOpenAPISchema } from '@/shared/utils/openapi.util';

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

// ==================== Query Schemas ====================

export const getUsersQuerySchema = registerOpenAPISchema(
  'GetUsersQuery',
  z
    .object({
      ...searchAndPaginationFields,
      sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'email']).optional().default('createdAt').openapi({
        description: 'Field to sort by',
        example: 'createdAt',
      }),
      role: arrayField(z.enum(UserRole)).openapi({
        description: 'Filter by user roles (comma-separated for multiple)',
        example: 'USER,ADMIN',
      }),
      emailVerified: z
        .string()
        .optional()
        .transform((val) => {
          if (val === 'true') return true;
          if (val === 'false') return false;
          return undefined;
        })
        .openapi({
          description: 'Filter by email verification status',
          example: 'true',
        }),
    })
    .openapi({
      description: 'Query parameters for retrieving users',
    })
);

// ==================== User Management Schemas ====================

export const createUserSchema = registerOpenAPISchema(
  'CreateUserBody',
  z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters').openapi({
        description: 'User full name',
        example: 'Jane Smith',
      }),
      email: z.string().email('Invalid email format').openapi({
        description: 'User email address',
        example: 'jane.smith@example.com',
      }),
      password: z
        .string()
        .min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`)
        .max(PASSWORD.MAX_LENGTH, `Password must not exceed ${PASSWORD.MAX_LENGTH} characters`)
        .openapi({
          description: `User password (${PASSWORD.MIN_LENGTH}-${PASSWORD.MAX_LENGTH} characters)`,
          example: 'SecurePass123!',
        }),
      role: z.enum(UserRole).optional().default(UserRole.USER).openapi({
        description: 'User role',
        example: UserRole.USER,
      }),
      emailVerified: z.boolean().optional().default(false).openapi({
        description: 'Email verification status',
        example: false,
      }),
    })
    .openapi({
      description: 'User creation data',
    })
);

export const updateUserSchema = registerOpenAPISchema(
  'UpdateUserBody',
  z
    .object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .optional()
        .openapi({
          description: 'User full name',
          example: 'Jane Smith',
        }),
      email: z.string().email('Invalid email format').optional().openapi({
        description: 'User email address',
        example: 'jane.smith@example.com',
      }),
      role: z.enum(UserRole).optional().openapi({
        description: 'User role',
        example: UserRole.USER,
      }),
      emailVerified: z.boolean().optional().openapi({
        description: 'Email verification status',
        example: true,
      }),
    })
    .openapi({
      description: 'User update data',
    })
);

export const updatePasswordSchema = registerOpenAPISchema(
  'UpdatePasswordBody',
  z
    .object({
      currentPassword: z.string().min(1, 'Current password is required').openapi({
        description: 'Current password',
        example: 'OldPass123!',
      }),
      newPassword: z.string().min(6, 'Password must be at least 6 characters').openapi({
        description: 'New password (minimum 6 characters)',
        example: 'NewPass123!',
      }),
    })
    .openapi({
      description: 'Password update data',
    })
);

// ==================== Batch Operations Schemas ====================

export const batchDeleteUsersSchema = registerOpenAPISchema(
  'BatchDeleteUsersBody',
  z
    .object({
      userIds: z.array(z.cuid('Invalid user ID format')).min(1, 'At least one user ID is required').openapi({
        description: 'Array of user IDs to delete',
        example: ['clxxx1234567890', 'clxxx0987654321'],
      }),
    })
    .openapi({
      description: 'Batch delete users data',
    })
);

export const batchUpdateRoleSchema = registerOpenAPISchema(
  'BatchUpdateRoleBody',
  z
    .object({
      userIds: z.array(z.cuid('Invalid user ID format')).min(1, 'At least one user ID is required').openapi({
        description: 'Array of user IDs to update',
        example: ['clxxx1234567890', 'clxxx0987654321'],
      }),
      role: z.enum(UserRole).openapi({
        description: 'New role to assign to users',
        example: UserRole.ADMIN,
      }),
    })
    .openapi({
      description: 'Batch update user roles data',
    })
);

// ==================== Type Exports ====================

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type UpdatePasswordBody = z.infer<typeof updatePasswordSchema>;
export type BatchDeleteUsersBody = z.infer<typeof batchDeleteUsersSchema>;
export type BatchUpdateRoleBody = z.infer<typeof batchUpdateRoleSchema>;
