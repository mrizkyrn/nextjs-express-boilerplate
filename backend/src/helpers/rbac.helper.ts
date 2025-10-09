import { ROLE_PERMISSIONS, Permission } from '@/constants/permissions';
import { UserRole } from '@/types/user.type';
import { AuthenticatedUser } from '@/types/auth.type';

/**
 * Get all permissions for a role
 * @param role - User role
 * @returns List of permissions
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a role has a specific permission
 * @param role - User role
 * @param permission - Permission to check
 * @returns True if role has the permission, false otherwise
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
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
 * Check if a role is valid
 * @param role - Role string to validate
 * @return True if valid role, false otherwise
 */
export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

/**
 * Create user with computed permissions
 * @param user - User object with id, email, name, and role
 * @returns User object enriched with permissions
 */
export const enrichUserWithPermissions = (user: { id: string; email: string; name?: string; role: UserRole }): AuthenticatedUser => {
  return {
    ...user,
    permissions: getRolePermissions(user.role),
  };
};

/**
 * Get role display name
 * @param role - User role
 * @returns Role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const names: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.USER]: 'User',
  };
  return names[role] || role;
};
