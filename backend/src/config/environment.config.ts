import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment schema definition with validation rules
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8000'),

  // Database
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT access secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Frontend
  FRONTEND_URL: z.url('Invalid frontend URL'),

  // Cookie
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z
    .string()
    .transform((val) => val === 'true')
    .default(false),

  // Email
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  EMAIL_FROM: z.string().email('Invalid sender email address'),
});

type EnvironmentVariables = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
const parseEnvironment = (): EnvironmentVariables => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    if (error instanceof z.ZodError) {
      error.issues.forEach((issue) => {
        console.error(`  ${issue.path.join('.')}: ${issue.message}`);
      });
    } else {
      console.error('  Unexpected error:', error);
    }
    process.exit(1);
  }
};

export const env = parseEnvironment();
