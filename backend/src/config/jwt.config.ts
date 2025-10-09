import jwt from 'jsonwebtoken';

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
