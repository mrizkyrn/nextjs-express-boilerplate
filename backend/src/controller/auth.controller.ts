import { NextFunction, Request, Response } from 'express';
import { cookieConfig, REFRESH_TOKEN_COOKIE } from '@/config/auth.config';
import { ERROR_CODES } from '@/config/error.config';
import { authService } from '@/services/auth.service';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/types/auth.type';
import type { UserResponse } from '@/types/user.type';
import { AppError } from '@/utils/error.util';
import { sendSuccess } from '@/utils/response.util';

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request<{}, any, RegisterRequest>, res: Response, next: NextFunction): Promise<void> {
    const result = await authService.register(req.body);
    sendSuccess(res, 201, result.message, { email: result.email });
  }

  /**
   * Login user and return access & refresh tokens
   */
  async login(req: Request<{}, any, LoginRequest>, res: Response, next: NextFunction): Promise<void> {
    const { user, tokens } = await authService.login(req.body);
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookieConfig);
    sendSuccess<LoginResponse>(res, 200, 'Login successful', {
      user,
      accessToken: tokens.accessToken,
    });
  }

  /**
   * Refresh access token
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new AppError(401, 'Refresh token not found', ERROR_CODES.UNAUTHORIZED);
    }

    const tokens = await authService.refresh(refreshToken);
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookieConfig);

    sendSuccess<RefreshTokenResponse>(res, 200, 'Token refreshed successfully', {
      accessToken: tokens.accessToken,
    });
  }

  /**
   * Logout user and clear refresh token cookie
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'User not authenticated', ERROR_CODES.UNAUTHORIZED);
    }

    await authService.logout(req.user.id);
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieConfig);

    sendSuccess(res, 200, 'Logout successful');
  }

  /**
   * Get current user profile
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'User not authenticated', ERROR_CODES.UNAUTHORIZED);
    }

    const user = await authService.getUserById(req.user.id);
    if (!user) {
      throw new AppError(404, 'User not found', ERROR_CODES.NOT_FOUND);
    }

    sendSuccess<UserResponse>(res, 200, 'User retrieved successfully', user);
  }

  /**
   * Request password reset
   */
  async forgotPassword(req: Request<{}, any, ForgotPasswordRequest>, res: Response, next: NextFunction): Promise<void> {
    await authService.forgotPassword(req.body);
    // Always return success to prevent email enumeration
    sendSuccess(res, 200, 'If an account with that email exists, a password reset link has been sent');
  }

  /**
   * Reset password using token
   */
  async resetPassword(req: Request<{}, any, ResetPasswordRequest>, res: Response, next: NextFunction): Promise<void> {
    await authService.resetPassword(req.body);
    sendSuccess(res, 200, 'Password has been reset successfully');
  }

  /**
   * Verify email address using verification token
   */
  async verifyEmail(req: Request<{}, any, VerifyEmailRequest>, res: Response, next: NextFunction): Promise<void> {
    await authService.verifyEmail(req.body);
    sendSuccess(res, 200, 'Email verified successfully. You can now log in to your account.');
  }

  /**
   * Resend email verification
   */
  async resendVerification(req: Request<{}, any, ResendVerificationRequest>, res: Response, next: NextFunction): Promise<void> {
    await authService.resendVerification(req.body);
    sendSuccess(res, 200, 'If an account with that email exists, a verification link has been sent');
  }
}

export const authController = new AuthController();
