import type { LoginBody, RegisterBody, ForgotPasswordBody, ResetPasswordBody, VerifyEmailBody } from '@/modules/auth/auth.schema';
import type { LoginResult, RegisterResult, TokenPair } from '@/modules/auth/auth.type';
import { createTestUser, createUserForSelect } from './user.fixture';

/**
 * Valid registration data for testing
 */
export const createValidRegisterData = (overrides: Partial<RegisterBody> = {}): RegisterBody => ({
  email: 'newuser@example.com',
  password: 'Password123!',
  name: 'New User',
  ...overrides,
});

/**
 * Valid login credentials for testing
 */
export const createValidLoginData = (overrides: Partial<LoginBody> = {}): LoginBody => ({
  email: 'test@example.com',
  password: 'Password123!',
  ...overrides,
});

/**
 * Valid forgot password request data
 */
export const createValidForgotPasswordData = (overrides: Partial<ForgotPasswordBody> = {}): ForgotPasswordBody => ({
  email: 'test@example.com',
  ...overrides,
});

/**
 * Valid reset password data
 */
export const createValidResetPasswordData = (overrides: Partial<ResetPasswordBody> = {}): ResetPasswordBody => ({
  token: 'valid-reset-token',
  password: 'NewPassword123!',
  ...overrides,
});

/**
 * Valid verify email data
 */
export const createValidVerifyEmailData = (overrides: Partial<VerifyEmailBody> = {}): VerifyEmailBody => ({
  token: 'valid-verification-token',
  ...overrides,
});

/**
 * Token pair for testing JWT operations
 */
export const createTestTokenPair = (overrides: Partial<TokenPair> = {}): TokenPair => ({
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  accessTokenExpiresIn: 15 * 60 * 1000, // 15 minutes
  refreshTokenExpiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
  ...overrides,
});

/**
 * Login result for testing authentication responses
 */
export const createTestLoginResult = (overrides: Partial<LoginResult> = {}): LoginResult => {
  const user = createUserForSelect();
  return {
    user,
    tokens: createTestTokenPair(),
    ...overrides,
  };
};

/**
 * Register result for testing registration responses
 */
export const createTestRegisterResult = (overrides: Partial<RegisterResult> = {}): RegisterResult => {
  const user = createUserForSelect({ emailVerified: false });
  return {
    user,
    verificationSent: true,
    ...overrides,
  };
};
