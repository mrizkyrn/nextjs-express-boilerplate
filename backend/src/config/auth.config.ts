import jwt from 'jsonwebtoken';
import { CookieOptions } from 'express';
import { env } from './environment.config';

/**
 * JWT configuration
 */
export const JWT_CONFIG = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'],
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  },
  algorithm: 'HS256' as const,
};

/**
 * Cookie configuration for authentication
 */
export const REFRESH_TOKEN_COOKIE = 'refreshToken';
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const getCookieOptions = (maxAge: number = REFRESH_TOKEN_MAX_AGE): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge,
  path: '/',
  domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
});
