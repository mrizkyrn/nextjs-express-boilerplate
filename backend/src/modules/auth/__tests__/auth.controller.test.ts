import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AuthController } from '../auth.controller';
import type { AuthService } from '../auth.service';
import { REFRESH_TOKEN_COOKIE } from '@/shared/constants';
import { AppError } from '@/shared/utils/error.util';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  createAuthenticatedRequest,
} from '@/test/mocks/express.mock';
import {
  createValidRegisterData,
  createValidLoginData,
  createValidForgotPasswordData,
  createValidResetPasswordData,
  createValidVerifyEmailData,
  createTestLoginResult,
  createTestRegisterResult,
  createTestTokenPair,
} from '@/test/fixtures/auth.fixture';
import { createUserForSelect } from '@/test/fixtures/user.fixture';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Create mock AuthService
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      verifyEmail: jest.fn(),
      resendVerification: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    authController = new AuthController(mockAuthService);
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  // ==================== Registration ====================

  describe('register', () => {
    it('should register a new user and return 201 status', async () => {
      // Arrange
      const registerData = createValidRegisterData();
      mockReq = createMockRequest({ body: registerData });
      const registerResult = createTestRegisterResult();
      mockAuthService.register.mockResolvedValue(registerResult);

      // Act
      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Registration successful',
          data: { email: registerResult.user.email },
        })
      );
    });

    it('should call authService.register with correct body', async () => {
      // Arrange
      const registerData = createValidRegisterData({
        email: 'custom@test.com',
        name: 'Custom User',
      });
      mockReq = createMockRequest({ body: registerData });
      mockAuthService.register.mockResolvedValue(createTestRegisterResult());

      // Act
      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'custom@test.com',
        password: registerData.password,
        name: 'Custom User',
      });
    });
  });

  // ==================== Login ====================

  describe('login', () => {
    it('should login user and return access token with cookie', async () => {
      // Arrange
      const loginData = createValidLoginData();
      mockReq = createMockRequest({ body: loginData });
      const loginResult = createTestLoginResult();
      mockAuthService.login.mockResolvedValue(loginResult);

      // Act
      await authController.login(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        loginResult.tokens.refreshToken,
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          data: {
            user: loginResult.user,
            accessToken: loginResult.tokens.accessToken,
          },
        })
      );
    });

    it('should set refresh token cookie with correct config', async () => {
      // Arrange
      mockReq = createMockRequest({ body: createValidLoginData() });
      const loginResult = createTestLoginResult();
      mockAuthService.login.mockResolvedValue(loginResult);

      // Act
      await authController.login(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockRes.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        loginResult.tokens.refreshToken,
        expect.objectContaining({
          httpOnly: true,
        })
      );
    });
  });

  // ==================== Token Refresh ====================

  describe('refresh', () => {
    it('should refresh tokens when valid refresh token is provided', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      mockReq = createMockRequest({
        cookies: { [REFRESH_TOKEN_COOKIE]: refreshToken },
      });
      const newTokens = createTestTokenPair({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      mockAuthService.refresh.mockResolvedValue(newTokens);

      // Act
      await authController.refresh(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.refresh).toHaveBeenCalledWith(refreshToken);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        newTokens.refreshToken,
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Token successfully refreshed',
          data: { accessToken: newTokens.accessToken },
        })
      );
    });

    it('should throw error when refresh token is missing', async () => {
      // Arrange
      mockReq = createMockRequest({ cookies: {} });

      // Act & Assert
      await expect(
        authController.refresh(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(AppError);

      await expect(
        authController.refresh(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toMatchObject({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: 'Refresh token not found',
      });
    });

    it('should throw error when refresh token cookie is undefined', async () => {
      // Arrange
      mockReq = createMockRequest({
        cookies: { [REFRESH_TOKEN_COOKIE]: undefined },
      });

      // Act & Assert
      await expect(
        authController.refresh(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(AppError);
    });
  });

  // ==================== Logout ====================

  describe('logout', () => {
    it('should logout user and clear refresh token cookie', async () => {
      // Arrange
      const userId = 'test-user-id';
      mockReq = createAuthenticatedRequest({
        id: userId,
        email: 'test@example.com',
        role: 'USER',
      });
      mockAuthService.logout.mockResolvedValue(undefined);

      // Act
      await authController.logout(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.logout).toHaveBeenCalledWith(userId);
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Logout successful',
        })
      );
    });

    it('should call authService.logout with authenticated user id', async () => {
      // Arrange
      const userId = 'specific-user-id';
      mockReq = createAuthenticatedRequest({
        id: userId,
        email: 'specific@example.com',
        role: 'ADMIN',
      });
      mockAuthService.logout.mockResolvedValue(undefined);

      // Act
      await authController.logout(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.logout).toHaveBeenCalledWith(userId);
    });
  });

  // ==================== Email Verification ====================

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      // Arrange
      const verifyData = createValidVerifyEmailData();
      mockReq = createMockRequest({ body: verifyData });
      mockAuthService.verifyEmail.mockResolvedValue(undefined);

      // Act
      await authController.verifyEmail(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(verifyData);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Email successfully verified',
        })
      );
    });

    it('should call authService.verifyEmail with token from body', async () => {
      // Arrange
      const customToken = 'custom-verification-token';
      mockReq = createMockRequest({ body: { token: customToken } });
      mockAuthService.verifyEmail.mockResolvedValue(undefined);

      // Act
      await authController.verifyEmail(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith({
        token: customToken,
      });
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email successfully', async () => {
      // Arrange
      const resendData = { email: 'test@example.com' };
      mockReq = createMockRequest({ body: resendData });
      mockAuthService.resendVerification.mockResolvedValue(undefined);

      // Act
      await authController.resendVerification(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.resendVerification).toHaveBeenCalledWith(resendData);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'If an account with that email exists, a verification link has been sent',
        })
      );
    });

    it('should return success message regardless of email existence (security)', async () => {
      // Arrange - non-existent email
      const resendData = { email: 'nonexistent@example.com' };
      mockReq = createMockRequest({ body: resendData });
      mockAuthService.resendVerification.mockResolvedValue(undefined);

      // Act
      await authController.resendVerification(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert - same generic message for security
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'If an account with that email exists, a verification link has been sent',
        })
      );
    });
  });

  // ==================== Password Reset ====================

  describe('forgotPassword', () => {
    it('should initiate password reset successfully', async () => {
      // Arrange
      const forgotData = createValidForgotPasswordData();
      mockReq = createMockRequest({ body: forgotData });
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      // Act
      await authController.forgotPassword(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(forgotData);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent',
        })
      );
    });

    it('should return generic message for security (no email enumeration)', async () => {
      // Arrange
      const forgotData = { email: 'unknown@example.com' };
      mockReq = createMockRequest({ body: forgotData });
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      // Act
      await authController.forgotPassword(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'If an account with that email exists, a password reset link has been sent',
        })
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Arrange
      const resetData = createValidResetPasswordData();
      mockReq = createMockRequest({ body: resetData });
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      // Act
      await authController.resetPassword(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetData);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Password successfully reset',
        })
      );
    });

    it('should call authService.resetPassword with token and new password', async () => {
      // Arrange
      const resetData = {
        token: 'specific-reset-token',
        password: 'NewSecureP@ss123',
      };
      mockReq = createMockRequest({ body: resetData });
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      // Act
      await authController.resetPassword(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith({
        token: 'specific-reset-token',
        password: 'NewSecureP@ss123',
      });
    });
  });

  // ==================== Error Propagation ====================

  describe('error propagation', () => {
    it('should propagate errors from authService.register', async () => {
      // Arrange
      mockReq = createMockRequest({ body: createValidRegisterData() });
      const error = new AppError(StatusCodes.CONFLICT, 'Email already exists');
      mockAuthService.register.mockRejectedValue(error);

      // Act & Assert
      await expect(
        authController.register(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(error);
    });

    it('should propagate errors from authService.login', async () => {
      // Arrange
      mockReq = createMockRequest({ body: createValidLoginData() });
      const error = new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(
        authController.login(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(error);
    });

    it('should propagate errors from authService.refresh', async () => {
      // Arrange
      mockReq = createMockRequest({
        cookies: { [REFRESH_TOKEN_COOKIE]: 'invalid-token' },
      });
      const error = new AppError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
      mockAuthService.refresh.mockRejectedValue(error);

      // Act & Assert
      await expect(
        authController.refresh(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(error);
    });

    it('should propagate errors from authService.verifyEmail', async () => {
      // Arrange
      mockReq = createMockRequest({ body: createValidVerifyEmailData() });
      const error = new AppError(StatusCodes.BAD_REQUEST, 'Invalid or expired token');
      mockAuthService.verifyEmail.mockRejectedValue(error);

      // Act & Assert
      await expect(
        authController.verifyEmail(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(error);
    });

    it('should propagate errors from authService.resetPassword', async () => {
      // Arrange
      mockReq = createMockRequest({ body: createValidResetPasswordData() });
      const error = new AppError(StatusCodes.BAD_REQUEST, 'Token expired');
      mockAuthService.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(
        authController.resetPassword(
          mockReq as Request,
          mockRes as Response,
          mockNext
        )
      ).rejects.toThrow(error);
    });
  });
});
