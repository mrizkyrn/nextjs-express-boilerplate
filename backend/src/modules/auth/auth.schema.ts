import { PASSWORD } from '@/shared/constants';
import { registerSchema as registerOpenAPISchema } from '@/shared/utils/openapi.util';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

export const loginSchema = registerOpenAPISchema(
  'LoginBody',
  z
    .object({
      email: z.string().email('Invalid email address').openapi({
        description: 'User email address',
        example: 'user@example.com',
      }),
      password: z
        .string()
        .min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`)
        .openapi({
          description: 'User password',
          example: 'SecurePass123!',
        }),
    })
    .openapi({
      description: 'Login credentials',
    })
);

export const registerSchema = registerOpenAPISchema(
  'RegisterBody',
  z
    .object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .openapi({
          description: 'User full name',
          example: 'John Doe',
        }),
      email: z.string().email('Invalid email address').openapi({
        description: 'User email address',
        example: 'john.doe@example.com',
      }),
      password: z
        .string()
        .min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`)
        .max(PASSWORD.MAX_LENGTH, `Password must not exceed ${PASSWORD.MAX_LENGTH} characters`)
        .openapi({
          description: `User password (${PASSWORD.MIN_LENGTH}-${PASSWORD.MAX_LENGTH} characters)`,
          example: 'SecurePass123!',
        }),
    })
    .openapi({
      description: 'User registration data',
    })
);

export const forgotPasswordSchema = registerOpenAPISchema(
  'ForgotPasswordBody',
  z
    .object({
      email: z.string().email('Invalid email address').openapi({
        description: 'Email address for password reset',
        example: 'user@example.com',
      }),
    })
    .openapi({
      description: 'Forgot password request',
    })
);

export const resetPasswordSchema = registerOpenAPISchema(
  'ResetPasswordBody',
  z
    .object({
      token: z.string().min(1, 'Reset token is required').openapi({
        description: 'Password reset token from email',
        example: 'abc123def456',
      }),
      password: z
        .string()
        .min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`)
        .max(PASSWORD.MAX_LENGTH, `Password must not exceed ${PASSWORD.MAX_LENGTH} characters`)
        .openapi({
          description: `New password (${PASSWORD.MIN_LENGTH}-${PASSWORD.MAX_LENGTH} characters)`,
          example: 'NewSecurePass123!',
        }),
    })
    .openapi({
      description: 'Password reset data',
    })
);

export const verifyEmailSchema = registerOpenAPISchema(
  'VerifyEmailBody',
  z
    .object({
      token: z.string().min(1, 'Verification token is required').openapi({
        description: 'Email verification token from email',
        example: 'xyz789abc123',
      }),
    })
    .openapi({
      description: 'Email verification data',
    })
);

export const resendVerificationSchema = registerOpenAPISchema(
  'ResendVerificationBody',
  z
    .object({
      email: z.string().email('Invalid email address').openapi({
        description: 'Email address to resend verification',
        example: 'user@example.com',
      }),
    })
    .openapi({
      description: 'Resend verification request',
    })
);

export type LoginBody = z.infer<typeof loginSchema>;
export type RegisterBody = z.infer<typeof registerSchema>;
export type VerifyEmailBody = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationBody = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
