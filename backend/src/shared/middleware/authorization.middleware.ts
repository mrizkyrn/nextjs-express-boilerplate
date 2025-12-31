import { UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import { ERROR_CODES } from '@/shared/constants';
import { AppError } from '@/shared/utils/error.util';

/**
 * Require specific roles
 */
export const requireRoles = (allowedRoles: UserRole[], customMessage?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      const message = customMessage || `Access denied: insufficient permissions for role '${req.user.role}'`;
      return next(new AppError(403, message, ERROR_CODES.FORBIDDEN));
    }

    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = () => requireRoles([UserRole.ADMIN], 'Administrator access required');

/**
 * Require non-admin roles (for regular users)
 */
export const requireNonAdmin = () => requireRoles([UserRole.USER], 'Non-administrator access required');
