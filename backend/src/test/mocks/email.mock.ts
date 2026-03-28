/**
 * Mock Email Service for testing
 * Prevents actual email sending during tests
 */
export type MockEmailService = {
  sendVerifyEmail: jest.Mock;
  sendWelcomeEmail: jest.Mock;
  sendPasswordResetEmail: jest.Mock;
  sendPasswordChangedEmail: jest.Mock;
  sendEmailSafely: jest.Mock;
};

/**
 * Creates a fresh mock email service for each test
 * All methods return resolved promises by default
 *
 * @returns MockEmailService with all email methods mocked
 *
 * @example
 * ```typescript
 * const mockEmailService = createMockEmailService();
 * mockEmailService.sendVerifyEmail.mockResolvedValue(undefined);
 * const service = new AuthService(mockPrisma, mockEmailService as any);
 * ```
 */
export const createMockEmailService = (): MockEmailService => ({
  sendVerifyEmail: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
  sendPasswordChangedEmail: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
  sendEmailSafely: jest.fn().mockResolvedValue(undefined),
});
