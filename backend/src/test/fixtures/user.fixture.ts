import { User, UserRole } from '@prisma/client';

/**
 * Creates a test user with default values
 * All fields can be overridden for specific test scenarios
 *
 * @param overrides - Properties to override in the test user
 * @returns Complete User object
 *
 * @example
 * ```typescript
 * const user = createTestUser({ email: 'custom@test.com' });
 * const adminUser = createTestUser({ role: UserRole.ADMIN });
 * ```
 */
export const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // hashed "Password123!"
  role: UserRole.USER,
  emailVerified: true,
  emailVerificationToken: null,
  emailVerificationExpiresAt: null,
  emailVerificationIssuedAt: null,
  passwordResetToken: null,
  passwordResetExpiresAt: null,
  passwordResetIssuedAt: null,
  refreshToken: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

/**
 * Creates an unverified user (email not verified)
 * Useful for testing email verification flows
 *
 * @param overrides - Additional properties to override
 * @returns User with emailVerified: false and active verification token
 */
export const createUnverifiedUser = (overrides: Partial<User> = {}): User =>
  createTestUser({
    emailVerified: false,
    emailVerificationToken: '$2a$10$hashedVerificationToken123456',
    emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    emailVerificationIssuedAt: new Date(),
    ...overrides,
  });

/**
 * Creates an admin user
 * Useful for testing admin-only endpoints
 *
 * @param overrides - Additional properties to override
 * @returns User with ADMIN role
 */
export const createAdminUser = (overrides: Partial<User> = {}): User =>
  createTestUser({
    id: 'admin-user-id',
    email: 'admin@example.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    ...overrides,
  });

/**
 * Creates a user with password reset token
 * Useful for testing password reset flows
 *
 * @param overrides - Additional properties to override
 * @returns User with active password reset token
 */
export const createUserWithResetToken = (overrides: Partial<User> = {}): User =>
  createTestUser({
    passwordResetToken: '$2a$10$hashedResetToken123456789012',
    passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    passwordResetIssuedAt: new Date(),
    ...overrides,
  });

/**
 * Creates a user with refresh token
 * Useful for testing authentication and token refresh
 *
 * @param overrides - Additional properties to override
 * @returns User with active refresh token
 */
export const createUserWithRefreshToken = (overrides: Partial<User> = {}): User =>
  createTestUser({
    refreshToken: 'valid-refresh-token-string',
    ...overrides,
  });

/**
 * Creates multiple test users at once
 * Useful for testing pagination and bulk operations
 *
 * @param count - Number of users to create
 * @param baseOverrides - Common overrides for all users
 * @returns Array of User objects
 */
export const createTestUsers = (count: number, baseOverrides: Partial<User> = {}): User[] => {
  return Array.from({ length: count }, (_, index) =>
    createTestUser({
      id: `test-user-${index + 1}`,
      email: `user${index + 1}@example.com`,
      name: `Test User ${index + 1}`,
      ...baseOverrides,
    })
  );
};

/**
 * Creates a user for database select operations (subset of fields)
 * Matches USER_BASE_SELECT from user.mapper.ts
 *
 * @param overrides - Properties to override
 * @returns User with only public fields
 */
export const createUserForSelect = (overrides: Partial<User> = {}) => {
  const user = createTestUser(overrides);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
