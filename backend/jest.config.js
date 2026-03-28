import dotenv from 'dotenv';

// Load test environment variables BEFORE Jest runs
dotenv.config({ path: '.env.test' });

export default {
  // Use ts-jest preset for TypeScript
  preset: 'ts-jest',

  // Test environment
  testEnvironment: 'node',

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Path alias support
  },

  // Transform TypeScript files (ts-jest config goes here)
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          types: ['jest', 'node'],
        },
      },
    ],
  },

  // Test file patterns
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.type.ts', // Exclude type files
    '!src/**/*.schema.ts', // Exclude Zod schemas
    '!src/**/*.mapper.ts', // Exclude mappers (can test if complex logic)
    '!src/**/*.route.ts', // Exclude routes (better tested via integration tests)
    '!src/core/server.ts', // Exclude server entry point
    '!src/core/app.ts', // Exclude Express app setup
    '!src/core/container.ts', // Exclude DI container setup
    '!src/api/index.ts', // Exclude route aggregation
    '!src/test/**', // Exclude test utilities
    '!src/**/index.ts', // Exclude barrel exports
    '!src/infrastructure/database/**', // Exclude Prisma client (mocked in tests)
    '!src/infrastructure/logging/**', // Exclude Winston logger setup
    '!src/infrastructure/email/resend.client.ts', // Exclude Resend client setup
    '!src/infrastructure/email/email.service.ts', // Exclude EmailService (uses templates, tested via mock)
    '!src/shared/config/cors.config.ts', // Exclude CORS config
    '!src/shared/config/rbac.config.ts', // Exclude RBAC config
    '!src/shared/types/**', // Exclude type definitions
  ],

  // Coverage thresholds (70% for all metrics)
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },

  // Coverage output
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Setup files - runs BEFORE test framework is loaded (for env vars would go here)
  // setupFiles: ['<rootDir>/src/test/env.setup.ts'],

  // Setup files - runs AFTER test framework is loaded (for reflect-metadata, global mocks)
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  // Verbose output
  verbose: true,

  // Timeout for tests (5 seconds)
  testTimeout: 5000,
};
