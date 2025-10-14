import { NextFunction, Request, Response } from 'express';
import { ERROR_CODES } from '@/config/error.config';
import { asyncHandler } from '@/utils/asyncHandler.util';
import { AppError } from '@/utils/error.util';
import { verifyAccessToken } from '@/utils/jwt.util';
import { enrichUserWithPermissions } from '@/utils/rbac.util';

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user with permissions to request
 */
export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'Access token required', ERROR_CODES.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  // Enrich user with permissions based on role
  req.user = enrichUserWithPermissions({
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role as any,
  });

  next();
});

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't fail if missing
 */
export const optionalAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const payload = verifyAccessToken(token);
      req.user = enrichUserWithPermissions({
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role as any,
      });
    } catch (error) {
      // Token invalid, continue without user
    }
  }

  next();
});
