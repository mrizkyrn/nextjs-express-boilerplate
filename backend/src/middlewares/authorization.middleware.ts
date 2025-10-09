import { Request, Response, NextFunction } from 'express';
import { Permission } from '@/constants/permissions';
import { UserRole } from '@/types/user.type';
import { AuthenticatedUser } from '@/types/auth.type';
import { userHasPermission, userHasAnyPermission, userHasAllPermissions } from '@/helpers/rbac.helper';
import { AppError } from '@/helpers/error.helper';
import { ERROR_CODES } from '@/constants/errorCodes.constant';

/**
 * Extend Express Request
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Require specific permission
 */
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED));
    }

    if (!userHasPermission(req.user, permission)) {
      return next(new AppError(403, 'Insufficient permissions', ERROR_CODES.FORBIDDEN));
    }

    next();
  };
};

/**
 * Require any of the specified permissions
 */
export const requirePermissions = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED));
    }
    if (!userHasAnyPermission(req.user, permissions)) {
      return next(new AppError(403, 'Insufficient permissions', ERROR_CODES.FORBIDDEN));
    }

    next();
  };
};

/**
 * Require all of the specified permissions
 */
export const requireAllPermissions = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED));
    }

    if (!userHasAllPermissions(req.user, permissions)) {
      return next(new AppError(403, 'Insufficient permissions', ERROR_CODES.FORBIDDEN));
    }

    next();
  };
};

/**
 * Require specific roles
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient role permissions', ERROR_CODES.FORBIDDEN));
    }

    next();
  };
};

/**
 * Admin only access
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Check resource ownership or admin
 */
export const requireOwnershipOrAdmin = (getUserId: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED));
    }

    const resourceUserId = getUserId(req);
    const isOwner = req.user.id === resourceUserId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      return next(new AppError(403, 'Access denied', ERROR_CODES.FORBIDDEN));
    }

    next();
  };
};
