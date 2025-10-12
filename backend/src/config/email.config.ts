import { env } from './environment.config';

/**
 * Email configuration constants
 */
export const EMAIL_CONFIG = {
  from: env.EMAIL_FROM,
  replyTo: env.EMAIL_FROM,
} as const;

/**
 * Email template subjects
 */
export const EMAIL_SUBJECTS = {
  WELCOME: 'Welcome to Our Service!',
  PASSWORD_RESET: 'Reset Your Password',
  PASSWORD_CHANGED: 'Your Password Has Been Changed',
  VERIFY_EMAIL: 'Verify Your Email Address',
} as const;
