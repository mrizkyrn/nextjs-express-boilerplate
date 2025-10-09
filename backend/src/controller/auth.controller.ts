import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { sendSuccess } from '@/helpers/response.helper';
import { AppError } from '@/helpers/error.helper';
import { ERROR_CODES } from '@/constants/errorCodes.constant';
import { RegisterRequest, LoginRequest, RefreshTokenResponse, RegisterResponse, LoginResponse } from '@/types/auth.type';
import { REFRESH_TOKEN_COOKIE, getCookieOptions } from '@/config/cookie.config';
import { UserResponse } from '@/types/user.type';

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request<{}, any, RegisterRequest>, res: Response, next: NextFunction): Promise<void> {
    const { user, tokens } = await authService.register(req.body);

    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, getCookieOptions());

    sendSuccess<RegisterResponse>(res, 201, 'User registered successfully', {
      user,
      accessToken: tokens.accessToken,
    });
  }

  /**
   * Login user and return access & refresh tokens
   */
  async login(req: Request<{}, any, LoginRequest>, res: Response, next: NextFunction): Promise<void> {
    const { user, tokens } = await authService.login(req.body);

    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, getCookieOptions());

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

    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, getCookieOptions());

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

    res.clearCookie(REFRESH_TOKEN_COOKIE, getCookieOptions());

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
}

export const authController = new AuthController();
