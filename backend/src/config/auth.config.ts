import { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { env } from './environment.config';

/**
 * JWT configuration
 */
export const jwtConfig = {
  accessToken: {
    secret: env.JWT_ACCESS_SECRET,
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  },
  refreshToken: {
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
  },
  algorithm: 'HS256' as const,
};

/**
 * Cookie configuration for authentication
 */
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
  domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
};
