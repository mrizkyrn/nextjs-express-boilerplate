import { CookieOptions } from 'express';
import { env } from './environment.config';

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
