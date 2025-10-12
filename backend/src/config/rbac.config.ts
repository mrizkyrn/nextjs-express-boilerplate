import { UserRole } from '@prisma/client';

/**
 * System permissions enum
 * Defines all available permissions in the application
 */
export enum Permission {
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_LIST = 'user:list',
  USER_STATS = 'user:stats',
  CURRENT_USER_READ = 'current_user:read',
  CURRENT_USER_UPDATE = 'current_user:update',
}

/**
 * Role-permission mapping
 * Maps each role to its allowed permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_LIST,
    Permission.USER_STATS,
    Permission.CURRENT_USER_READ,
    Permission.CURRENT_USER_UPDATE,
  ],

  [UserRole.USER]: [Permission.USER_READ, Permission.CURRENT_USER_READ, Permission.CURRENT_USER_UPDATE],
};

/**
 * Default role for new users
 */
export const DEFAULT_USER_ROLE = UserRole.USER;
