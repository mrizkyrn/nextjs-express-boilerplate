import { NextFunction, Request, Response } from 'express';

import { ERROR_CODES } from '@/shared/constant';
import { asyncHandler } from '@/shared/util/async-handler.util';
import { AppError } from '@/shared/util/error.util';
import { verifyAccessToken } from '@/shared/util/jwt.util';
import { enrichUserWithPermissions } from '@/shared/util/rbac.util';

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
