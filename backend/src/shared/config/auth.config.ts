import { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';

import { env } from './environment.config';

/**
 * JWT configuration
 */
export const jwtConfig = {
  accessToken: {
    secret: env.jwt.accessSecret,
    expiresIn: env.jwt.accessExpiry as jwt.SignOptions['expiresIn'],
  },
  refreshToken: {
    secret: env.jwt.refreshSecret,
    expiresIn: env.jwt.refreshExpiry as jwt.SignOptions['expiresIn'],
  },
  algorithm: 'HS256' as const,
};

/**
 * Cookie configuration for authentication
 */

export const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.app.isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
  domain: env.cookie.domain === 'localhost' ? undefined : env.cookie.domain,
};
