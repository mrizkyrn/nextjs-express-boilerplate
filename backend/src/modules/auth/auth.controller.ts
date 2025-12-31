import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { cookieConfig } from '@/shared/config/auth.config';
import { ERROR_CODES, REFRESH_TOKEN_COOKIE } from '@/shared/constants';
import { AppError } from '@/shared/utils/error.util';
import { sendSuccess } from '@/shared/utils/response.util';
import type {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResendVerificationBody,
  ResetPasswordBody,
  VerifyEmailBody,
} from './auth.schema';
import type { AuthService } from './auth.service';
import type { LoginResponse, RefreshTokenResponse, RegisterResponse } from './auth.type';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== Authentication ====================

  async register(req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction) {
    const result = await this.authService.register(req.body);
    sendSuccess<RegisterResponse>(res, StatusCodes.CREATED, 'Registrasi Berhasil', {
      email: result.user.email,
    });
  }

  async login(req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) {
    const result = await this.authService.login(req.body);
    res.cookie(REFRESH_TOKEN_COOKIE, result.tokens.refreshToken, cookieConfig);
    sendSuccess<LoginResponse>(res, StatusCodes.OK, 'Login Berhasil', {
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Refresh token tidak ditemukan', ERROR_CODES.UNAUTHORIZED);
    }

    const result = await this.authService.refresh(refreshToken);
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, cookieConfig);

    sendSuccess<RefreshTokenResponse>(res, StatusCodes.OK, 'Token berhasil diperbarui', {
      accessToken: result.accessToken,
    });
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    await this.authService.logout(userId);
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieConfig);
    sendSuccess(res, StatusCodes.OK, 'Logout berhasil');
  }

  // ==================== Email Verification ====================

  async verifyEmail(req: Request<{}, {}, VerifyEmailBody>, res: Response, next: NextFunction) {
    await this.authService.verifyEmail(req.body);
    sendSuccess(res, StatusCodes.OK, 'Email berhasil diverifikasi');
  }

  async resendVerification(req: Request<{}, {}, ResendVerificationBody>, res: Response, next: NextFunction) {
    await this.authService.resendVerification(req.body);
    sendSuccess(res, StatusCodes.OK, 'Jika akun dengan email tersebut ada, tautan verifikasi telah dikirim');
  }

  // ==================== Password Reset ====================

  async forgotPassword(req: Request<{}, {}, ForgotPasswordBody>, res: Response, next: NextFunction) {
    await this.authService.forgotPassword(req.body);
    sendSuccess(res, StatusCodes.OK, 'Jika akun dengan email tersebut ada, tautan reset password telah dikirim');
  }

  async resetPassword(req: Request<{}, {}, ResetPasswordBody>, res: Response, next: NextFunction) {
    await this.authService.resetPassword(req.body);
    sendSuccess(res, StatusCodes.OK, 'Password berhasil direset');
  }
}
