import { APP_CONSTANTS } from '@/config/constants.config';
import { env } from '@/config/environment.config';
import type { UserResponse } from '@/types/user.type';

export const authHelper = {
  /**
   * Generate password reset URL
   * @param token - Reset token
   * @returns Full reset URL
   */
  generateResetPasswordUrl: (token: string): string => {
    return `${env.FRONTEND_URL}/reset-password?token=${token}`;
  },

  /**
   * Generate email verification URL
   * @param token - Verification token
   * @returns Full verification URL
   */
  generateVerifyEmailUrl: (token: string): string => {
    return `${env.FRONTEND_URL}/verify-email?token=${token}`;
  },

  /**
   * Generate a secure random token
   * @param length - Token length (default: APP_CONSTANTS.DEFAULT_TOKEN_LENGTH)
   * @returns Random hex string
   */
  generateSecureToken: (length: number = APP_CONSTANTS.DEFAULT_TOKEN_LENGTH): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      token += chars[randomValues[i] % chars.length];
    }

    return token;
  },

  /**
   * Calculate token expiration time
   * @param minutes - Minutes until expiration
   * @returns Expiration Date object
   */
  calculateTokenExpiry: (minutes: number): Date => {
    return new Date(Date.now() + minutes * 60 * 1000);
  },

  /**
   * Create a UserResponse object from a Prisma user
   * @param user - Prisma user object
   * @returns UserResponse object
   */
  createUserResponse: (user: any): UserResponse => {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
