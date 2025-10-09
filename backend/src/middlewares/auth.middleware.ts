import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/helpers/jwt.helper';
import { asyncHandler } from '@/helpers/asyncHandler.helper';
import { AppError } from '@/helpers/error.helper';
import { ERROR_CODES } from '@/constants/errorCodes.constant';
import { enrichUserWithPermissions } from '@/helpers/rbac.helper';

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
