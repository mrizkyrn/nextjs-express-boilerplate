import { UserRole } from '@/types/user.type';

/**
 * System permissions enum
 * Defines all available permissions in the application
 */
export enum Permission {
  // User management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_LIST = 'user:list',

  // Admin permissions
  ADMIN_PANEL = 'admin:panel',
  ADMIN_CONFIG = 'admin:config',
  ADMIN_LOGS = 'admin:logs',
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
    Permission.ADMIN_PANEL,
    Permission.ADMIN_CONFIG,
    Permission.ADMIN_LOGS,
  ],

  [UserRole.USER]: [Permission.USER_READ, Permission.USER_UPDATE],
};

/**
 * Default role for new users
 */
export const DEFAULT_USER_ROLE = UserRole.USER;
