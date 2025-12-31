import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8000'),

  DATABASE_URL: z.string(),
  DIRECT_URL: z.string(),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT access secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  FRONTEND_URL: z.url('Invalid frontend URL'),

  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z
    .string()
    .transform((val) => val === 'true')
    .default(false),

  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  EMAIL_FROM: z.email('Invalid sender email address'),
});

type EnvironmentVariables = z.infer<typeof envSchema>;

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

const rawEnv = parseEnvironment();

export const env = {
  app: {
    nodeEnv: rawEnv.NODE_ENV,
    port: rawEnv.PORT,
    isDevelopment: rawEnv.NODE_ENV === 'development',
    isProduction: rawEnv.NODE_ENV === 'production',
    isTest: rawEnv.NODE_ENV === 'test',
  },
  database: {
    url: rawEnv.DATABASE_URL,
    directUrl: rawEnv.DIRECT_URL,
  },
  jwt: {
    accessSecret: rawEnv.JWT_ACCESS_SECRET,
    refreshSecret: rawEnv.JWT_REFRESH_SECRET,
    accessExpiry: rawEnv.JWT_ACCESS_EXPIRY,
    refreshExpiry: rawEnv.JWT_REFRESH_EXPIRY,
  },
  frontend: {
    url: rawEnv.FRONTEND_URL,
  },
  cookie: {
    domain: rawEnv.COOKIE_DOMAIN,
    secure: rawEnv.COOKIE_SECURE,
  },
  email: {
    resendApiKey: rawEnv.RESEND_API_KEY,
    from: rawEnv.EMAIL_FROM,
  },
} as const;
