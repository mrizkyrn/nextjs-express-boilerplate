import { randomBytes } from 'crypto';
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { jwtConfig } from '@/config/auth.config';
import { ERROR_CODES } from '@/config/error.config';
import type { AccessTokenPayload, RefreshTokenPayload, TokenPair, TokenPayload } from '@/types/auth.type';
import { AppError } from '@/utils/error.util';

/**
 * Generate a unique token ID for refresh tokens
 */
const generateTokenId = (): string => {
  return randomBytes(16).toString('hex');
};

/**
 * Sign a JWT token with proper error handling
 */
const signToken = (payload: TokenPayload, secret: string, options: SignOptions): string => {
  try {
    return jwt.sign(payload, secret, {
      ...options,
      algorithm: jwtConfig.algorithm,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to generate token', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Verify a JWT token with proper error handling
 */
const verifyToken = <T extends TokenPayload>(token: string, secret: string, options?: VerifyOptions): T => {
  try {
    const decoded = jwt.verify(token, secret, {
      ...options,
      algorithms: [jwtConfig.algorithm],
    }) as T;

    // Additional validation
    if (!decoded || typeof decoded !== 'object') {
      throw new AppError(401, 'Invalid token structure', ERROR_CODES.INVALID_TOKEN);
    }

    // Check if token has expired (additional check beyond JWT library)
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new AppError(401, 'Token expired', ERROR_CODES.TOKEN_EXPIRED);
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token', ERROR_CODES.INVALID_TOKEN);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Token expired', ERROR_CODES.TOKEN_EXPIRED);
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new AppError(401, 'Token not active', ERROR_CODES.INVALID_TOKEN);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Token verification failed', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Generate an access token
 * @param userId - User ID
 * @param email - User email
 * @param role - User role (required)
 * @param name - Optional user name
 * @returns Signed access token
 */
export const generateAccessToken = (userId: string, email: string, role: string, name?: string): string => {
  const payload: AccessTokenPayload = {
    userId,
    email,
    name,
    role,
    type: 'access',
    iat: Math.floor(Date.now() / 1000), // Issued at
  };

  return signToken(payload, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn,
  });
};

/**
 * Generate a refresh token
 * @param userId - User ID
 * @returns Signed refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  const tokenId = generateTokenId();
  const payload: RefreshTokenPayload = {
    userId,
    tokenId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000), // Issued at
  };

  return signToken(payload, jwtConfig.refreshToken.secret, {
    expiresIn: jwtConfig.refreshToken.expiresIn,
  });
};

/**
 * Generate both access and refresh tokens
 * @param userId - User ID
 * @param email - User email
 * @param role - User role (required)
 * @param name - Optional user name
 * @returns Token pair with expiration info
 */
export const generateTokenPair = (userId: string, email: string, role: string, name?: string): TokenPair => {
  const accessToken = generateAccessToken(userId, email, role, name);
  const refreshToken = generateRefreshToken(userId);

  // Calculate expiration times in milliseconds
  const accessTokenExpiresIn = 15 * 60 * 1000; // 15 minutes
  const refreshTokenExpiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn,
    refreshTokenExpiresIn,
  };
};

/**
 * Verify an access token
 * @param token - Access token to verify
 * @returns Decoded access token payload
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return verifyToken<AccessTokenPayload>(token, jwtConfig.accessToken.secret);
};

/**
 * Verify a refresh token
 * @param token - Refresh token to verify
 * @returns Decoded refresh token payload
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return verifyToken<RefreshTokenPayload>(token, jwtConfig.refreshToken.secret);
};
