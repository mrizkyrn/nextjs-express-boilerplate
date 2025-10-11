import { env } from '@/config/environment.config';

/**
 * Generate password reset URL
 * @param token - Reset token
 * @returns Full reset URL
 */
export const generateResetPasswordUrl = (token: string): string => {
  return `${env.FRONTEND_URL}/reset-password?token=${token}`;
};

/**
 * Generate email verification URL
 * @param token - Verification token
 * @returns Full verification URL
 */
export const generateVerifyEmailUrl = (token: string): string => {
  return `${env.FRONTEND_URL}/verify-email?token=${token}`;
};

/**
 * Generate a secure random token
 * @param length - Token length (default: 32)
 * @returns Random hex string
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length];
  }

  return token;
};

/**
 * Calculate token expiration time
 * @param minutes - Minutes until expiration
 * @returns Expiration Date object
 */
export const calculateTokenExpiry = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
