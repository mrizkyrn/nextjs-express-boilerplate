import { UserRole } from '@prisma/client';

import { ERROR_CODES } from '@/shared/constants';
import { createMockPrisma, MockPrismaClient } from '@/test/mocks/prisma.mock';
import { createMockEmailService, MockEmailService } from '@/test/mocks/email.mock';
import {
  createTestUser,
  createUnverifiedUser,
  createUserWithResetToken,
  createUserWithRefreshToken,
  createUserForSelect,
} from '@/test/fixtures/user.fixture';
import {
  createValidRegisterData,
  createValidLoginData,
  createValidForgotPasswordData,
  createValidResetPasswordData,
  createValidVerifyEmailData,
} from '@/test/fixtures/auth.fixture';

import { AuthService } from '../auth.service';

// Mock dependencies
jest.mock('@/shared/utils/password.util', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('@/shared/utils/jwt.util', () => ({
  generateTokenPair: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.mock('@/shared/utils/token.util', () => ({
  generateSecureToken: jest.fn().mockReturnValue('mock-secure-token'),
  calculateTokenExpiry: jest.fn().mockReturnValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
}));

jest.mock('@/shared/config/environment.config', () => ({
  env: {
    frontend: { url: 'http://localhost:3000' },
  },
}));

// Import mocked modules
import { hashPassword, comparePassword } from '@/shared/utils/password.util';
import { generateTokenPair, verifyRefreshToken } from '@/shared/utils/jwt.util';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: MockPrismaClient;
  let mockEmailService: MockEmailService;

  const mockTokenPair = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    accessTokenExpiresIn: 15 * 60 * 1000,
    refreshTokenExpiresIn: 7 * 24 * 60 * 60 * 1000,
  };

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    mockEmailService = createMockEmailService();
    authService = new AuthService(mockPrisma as any, mockEmailService as any);
    jest.clearAllMocks();

    // Setup default mock implementations
    (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
    (comparePassword as jest.Mock).mockResolvedValue(true);
    (generateTokenPair as jest.Mock).mockReturnValue(mockTokenPair);
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      // Arrange
      const registerData = createValidRegisterData();
      const createdUser = createUserForSelect({
        email: registerData.email,
        name: registerData.name,
        emailVerified: false,
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(createdUser);

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(result.user.email).toBe(registerData.email);
      expect(result.verificationSent).toBe(true);
      expect(hashPassword).toHaveBeenCalledWith(registerData.password);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: registerData.email,
            name: registerData.name,
            role: UserRole.USER,
            emailVerified: false,
          }),
        })
      );
      expect(mockEmailService.sendEmailSafely).toHaveBeenCalled();
    });

    it('should throw DUPLICATE_ENTRY error when email already exists', async () => {
      // Arrange
      const existingUser = createTestUser();
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(
        authService.register(createValidRegisterData({ email: existingUser.email }))
      ).rejects.toMatchObject({
        statusCode: 409,
        errorCode: ERROR_CODES.DUPLICATE_ENTRY,
      });
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      // Arrange
      const loginData = createValidLoginData();
      const user = createTestUser({ email: loginData.email });

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({ ...user, refreshToken: mockTokenPair.refreshToken });

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(result.user.email).toBe(user.email);
      expect(result.tokens).toEqual(mockTokenPair);
      expect(comparePassword).toHaveBeenCalledWith(loginData.password, user.password);
      expect(generateTokenPair).toHaveBeenCalledWith(user.id, user.email, user.role, user.name);
    });

    it('should throw UNAUTHORIZED error when user not found', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(createValidLoginData())).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid credentials',
        errorCode: ERROR_CODES.UNAUTHORIZED,
      });
    });

    it('should throw UNAUTHORIZED error when password is invalid', async () => {
      // Arrange
      const user = createTestUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(createValidLoginData())).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid credentials',
        errorCode: ERROR_CODES.UNAUTHORIZED,
      });
    });

    it('should throw FORBIDDEN error when email is not verified', async () => {
      // Arrange
      const unverifiedUser = createUnverifiedUser();
      mockPrisma.user.findUnique.mockResolvedValue(unverifiedUser);

      // Act & Assert
      await expect(authService.login(createValidLoginData())).rejects.toMatchObject({
        statusCode: 403,
        errorCode: ERROR_CODES.EMAIL_NOT_VERIFIED,
      });
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      // Arrange
      const user = createUserWithRefreshToken({
        refreshToken: 'old-refresh-token',
      });
      (verifyRefreshToken as jest.Mock).mockReturnValue({ userId: user.id });
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({ ...user, refreshToken: mockTokenPair.refreshToken });

      // Act
      const result = await authService.refresh('old-refresh-token');

      // Assert
      expect(result).toEqual(mockTokenPair);
      expect(verifyRefreshToken).toHaveBeenCalledWith('old-refresh-token');
    });

    it('should throw UNAUTHORIZED error when user not found', async () => {
      // Arrange
      (verifyRefreshToken as jest.Mock).mockReturnValue({ userId: 'non-existent' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refresh('some-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'User not found',
        errorCode: ERROR_CODES.UNAUTHORIZED,
      });
    });

    it('should throw INVALID_TOKEN error when refresh token does not match', async () => {
      // Arrange
      const user = createUserWithRefreshToken({
        refreshToken: 'stored-refresh-token',
      });
      (verifyRefreshToken as jest.Mock).mockReturnValue({ userId: user.id });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      // Act & Assert
      await expect(authService.refresh('different-refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid refresh token',
        errorCode: ERROR_CODES.INVALID_TOKEN,
      });
    });
  });

  describe('logout', () => {
    it('should logout user by clearing refresh token', async () => {
      // Arrange
      const userId = 'test-user-id';
      mockPrisma.user.update.mockResolvedValue({ id: userId });

      // Act
      await authService.logout(userId);

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: null },
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully with valid token', async () => {
      // Arrange
      const unverifiedUser = createUnverifiedUser();
      mockPrisma.user.findMany.mockResolvedValue([unverifiedUser]);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue({ ...unverifiedUser, emailVerified: true });

      // Act
      await authService.verifyEmail(createValidVerifyEmailData());

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: unverifiedUser.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiresAt: null,
        },
      });
      expect(mockEmailService.sendEmailSafely).toHaveBeenCalled();
    });

    it('should throw error when verification token is invalid', async () => {
      // Arrange
      mockPrisma.user.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(authService.verifyEmail(createValidVerifyEmailData())).rejects.toMatchObject({
        statusCode: 400,
        errorCode: ERROR_CODES.INVALID_VERIFICATION_TOKEN,
      });
    });

    it('should throw error when token does not match', async () => {
      // Arrange
      const unverifiedUser = createUnverifiedUser();
      mockPrisma.user.findMany.mockResolvedValue([unverifiedUser]);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.verifyEmail(createValidVerifyEmailData())).rejects.toMatchObject({
        statusCode: 400,
        errorCode: ERROR_CODES.INVALID_VERIFICATION_TOKEN,
      });
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email successfully', async () => {
      // Arrange
      const unverifiedUser = createUnverifiedUser({
        emailVerificationIssuedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      });
      mockPrisma.user.findUnique.mockResolvedValue(unverifiedUser);
      mockPrisma.user.update.mockResolvedValue(unverifiedUser);

      // Act
      await authService.resendVerification({ email: unverifiedUser.email });

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalled();
      expect(mockEmailService.sendEmailSafely).toHaveBeenCalled();
    });

    it('should silently return when user not found (security)', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert - should not throw
      await expect(
        authService.resendVerification({ email: 'nonexistent@example.com' })
      ).resolves.not.toThrow();
    });

    it('should throw error when email is already verified', async () => {
      // Arrange
      const verifiedUser = createTestUser({ emailVerified: true });
      mockPrisma.user.findUnique.mockResolvedValue(verifiedUser);

      // Act & Assert
      await expect(
        authService.resendVerification({ email: verifiedUser.email })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: ERROR_CODES.EMAIL_ALREADY_VERIFIED,
      });
    });

    it('should throw RATE_LIMIT error when cooldown not elapsed', async () => {
      // Arrange
      const unverifiedUser = createUnverifiedUser({
        emailVerificationIssuedAt: new Date(), // Just now
      });
      mockPrisma.user.findUnique.mockResolvedValue(unverifiedUser);

      // Act & Assert
      await expect(
        authService.resendVerification({ email: unverifiedUser.email })
      ).rejects.toMatchObject({
        statusCode: 429,
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      });
    });
  });

  describe('forgotPassword', () => {
    it('should initiate password reset successfully', async () => {
      // Arrange
      const user = createTestUser({
        passwordResetIssuedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      });
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue(user);

      // Act
      await authService.forgotPassword(createValidForgotPasswordData());

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: user.id },
          data: expect.objectContaining({
            passwordResetToken: 'hashed-password',
          }),
        })
      );
      expect(mockEmailService.sendEmailSafely).toHaveBeenCalled();
    });

    it('should silently return when user not found (security)', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert - should not throw
      await expect(
        authService.forgotPassword({ email: 'nonexistent@example.com' })
      ).resolves.not.toThrow();
    });

    it('should throw RATE_LIMIT error when cooldown not elapsed', async () => {
      // Arrange
      const user = createTestUser({
        passwordResetIssuedAt: new Date(), // Just now
      });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      // Act & Assert
      await expect(
        authService.forgotPassword(createValidForgotPasswordData())
      ).rejects.toMatchObject({
        statusCode: 429,
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with valid token', async () => {
      // Arrange
      const userWithResetToken = createUserWithResetToken();
      mockPrisma.user.findMany.mockResolvedValue([userWithResetToken]);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue(userWithResetToken);

      // Act
      await authService.resetPassword(createValidResetPasswordData());

      // Assert
      expect(hashPassword).toHaveBeenCalledWith('NewPassword123!');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userWithResetToken.id },
        data: {
          password: 'hashed-password',
          passwordResetToken: null,
          passwordResetExpiresAt: null,
          refreshToken: null,
        },
      });
      expect(mockEmailService.sendEmailSafely).toHaveBeenCalled();
    });

    it('should throw error when reset token is invalid', async () => {
      // Arrange
      mockPrisma.user.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(authService.resetPassword(createValidResetPasswordData())).rejects.toMatchObject({
        statusCode: 400,
        errorCode: ERROR_CODES.INVALID_RESET_TOKEN,
      });
    });

    it('should throw error when token does not match', async () => {
      // Arrange
      const userWithResetToken = createUserWithResetToken();
      mockPrisma.user.findMany.mockResolvedValue([userWithResetToken]);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.resetPassword(createValidResetPasswordData())).rejects.toMatchObject({
        statusCode: 400,
        errorCode: ERROR_CODES.INVALID_RESET_TOKEN,
      });
    });
  });
});
