import { UserRole } from '@prisma/client';

import { Permission, ROLE_PERMISSIONS } from '@/shared/config/rbac.config';
import type { AuthenticatedUser } from '@/types/auth.type';

/**
 * Get all permissions for a role
 */
const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a role has a specific permission
 */
const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return getRolePermissions(role).includes(permission);
};

/**
 * Check if a user has a specific permission
 * @param user - User object with role and permissions
 * @param permission - Permission to check
 * @return True if user has the permission, false otherwise
 */
export const userHasPermission = (user: AuthenticatedUser, permission: Permission): boolean => {
  if (user.permissions) {
    return user.permissions.includes(permission);
  }
  return hasPermission(user.role, permission);
};

/**
 * Check if a user has any of the specified permissions
 * @param user - User object with role and permissions
 * @param permissions - List of permissions to check
 * @returns True if user has at least one of the permissions, false otherwise
 */
export const userHasAnyPermission = (user: AuthenticatedUser, permissions: Permission[]): boolean => {
  return permissions.some((p) => userHasPermission(user, p));
};

/**
 * Check if a user has all of the specified permissions
 * @param user - User object with role and permissions
 * @param permissions - List of permissions to check
 * @return True if user has all of the permissions, false otherwise
 */
export const userHasAllPermissions = (user: AuthenticatedUser, permissions: Permission[]): boolean => {
  return permissions.every((p) => userHasPermission(user, p));
};

/**
 * Create user with computed permissions
 * @param user - User object with id, email, name, and role
 * @returns User object enriched with permissions
 */
export const enrichUserWithPermissions = (user: {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}): AuthenticatedUser => {
  return {
    ...user,
    permissions: getRolePermissions(user.role),
  };
};
