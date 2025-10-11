import { UserResponse } from './user.type';
import { Permission } from '@/constants/permissions';
import { UserRole } from '@/types/user.type';
import { JwtPayload } from 'jsonwebtoken';
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, VerifyEmailInput, ResendVerificationInput } from '@/schemas/auth.schema';

/**
 * Types for API request/response payloads
 */

export type RegisterRequest = RegisterInput;
export type LoginRequest = LoginInput;
export type ForgotPasswordRequest = ForgotPasswordInput;
export type ResetPasswordRequest = ResetPasswordInput;
export type VerifyEmailRequest = VerifyEmailInput;
export type ResendVerificationRequest = ResendVerificationInput;

export interface LoginResponse {
  user: UserResponse;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Types for JWT token payloads and token pairs
 */

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

/**
 * Types for authenticated user data
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  permissions: Permission[];
}
