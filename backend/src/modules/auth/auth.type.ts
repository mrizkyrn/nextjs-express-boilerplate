import { UserRole } from '@prisma/client';
import type { JwtPayload } from 'jsonwebtoken';

import type { UserResponse } from '@/modules/users/user.type';

// ==================== Service Layer Types (Domain) ====================

export interface RegisterResult {
  user: UserResponse;
  verificationSent: boolean;
}

export interface LoginResult {
  user: UserResponse;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// ==================== API Response Types (DTOs) ====================

export interface RegisterResponse {
  email: string;
}

export interface LoginResponse {
  user: UserResponse;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// ==================== JWT Token Payloads ====================

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  email: string;
  name?: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  tokenId: string;
  type: 'refresh';
}

export type TokenPayload = AccessTokenPayload | RefreshTokenPayload;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

// ==================== Authenticated User Type ====================

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}
