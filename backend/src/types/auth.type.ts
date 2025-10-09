import { UserResponse } from './user.type';
import { Permission } from '@/constants/permissions';
import { UserRole } from '@/types/user.type';
import { JwtPayload } from 'jsonwebtoken';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: UserResponse;
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

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

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  permissions: Permission[];
}

export interface UserWithPermissions {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  permissions?: Permission[];
}
