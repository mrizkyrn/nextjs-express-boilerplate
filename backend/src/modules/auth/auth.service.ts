import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'tsyringe';

import type { EmailService } from '@/infrastructure/email/email.service';
import { env } from '@/shared/config/environment.config';
import { DI_TYPES, ERROR_CODES, TOKEN } from '@/shared/constants';
import { AppError } from '@/shared/utils/error.util';
import { generateTokenPair, verifyRefreshToken } from '@/shared/utils/jwt.util';
import { comparePassword, hashPassword } from '@/shared/utils/password.util';
import { calculateTokenExpiry, generateSecureToken } from '@/shared/utils/token.utils';
import { mapUserResponse, USER_BASE_SELECT } from '../users/user.mapper';
import type {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResendVerificationBody,
  ResetPasswordBody,
  VerifyEmailBody,
} from './auth.schema';
import type { LoginResult, RegisterResult, TokenPair } from './auth.type';

@injectable()
export class AuthService {
  constructor(
    @inject(DI_TYPES.PrismaClient) private readonly prisma: PrismaClient,
    @inject(DI_TYPES.EmailService) private readonly emailService: EmailService
  ) {}

  // ==================== Private Helper Methods ====================

  /**
   * Finds user by email
   * @param email - Email to search for
   * @returns User object or null
   */
  private async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Generates and stores refresh token for user
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @param name - User name
   * @returns Token pair
   */
  private async generateAndStoreTokens(userId: string, email: string, role: any, name: string): Promise<TokenPair> {
    const tokens = generateTokenPair(userId, email, role, name);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: tokens.refreshToken },
    });

    return tokens;
  }

  /**
   * Finds user by verification token with validation
   * @param tokenType - Type of token to search for
   * @param token - Plain text token
   * @param additionalWhere - Additional where conditions
   * @returns User object or null
   */
  private async findUserByToken(
    tokenType: 'emailVerification' | 'passwordReset',
    token: string,
    additionalWhere?: Prisma.UserWhereInput
  ): Promise<any | null> {
    const tokenField = tokenType === 'emailVerification' ? 'emailVerificationToken' : 'passwordResetToken';
    const expiryField = tokenType === 'emailVerification' ? 'emailVerificationExpiresAt' : 'passwordResetExpiresAt';

    // Find all users with non-null tokens that haven't expired
    const users = await this.prisma.user.findMany({
      where: {
        [tokenField]: { not: null },
        [expiryField]: { gte: new Date() },
        ...additionalWhere,
      },
    });

    // Compare hashed tokens
    for (const user of users) {
      const storedToken = user[tokenField];
      if (storedToken && (await comparePassword(token, storedToken))) {
        return user;
      }
    }

    return null;
  }

  /**
   * Validates cooldown period for token operations
   * @param issuedAt - Last token issued timestamp
   * @param cooldownMinutes - Cooldown period in minutes
   * @param operationName - Name of operation for error message
   */
  private checkCooldown(issuedAt: Date | null, cooldownMinutes: number, operationName: string): void {
    if (!issuedAt) return;

    const timeSinceLastEmail = Date.now() - issuedAt.getTime();
    const cooldownMs = cooldownMinutes * 60 * 1000;

    if (timeSinceLastEmail < cooldownMs) {
      const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastEmail) / (60 * 1000));
      throw new AppError(
        StatusCodes.TOO_MANY_REQUESTS,
        `Harap tunggu ${remainingMinutes} menit sebelum meminta ${operationName} lagi`,
        ERROR_CODES.RATE_LIMIT_EXCEEDED
      );
    }
  }

  /**
   * Generates verification token and prepares email data
   * @returns Verification token data including plain and hashed tokens
   */
  private async generateVerificationToken() {
    const token = generateSecureToken(TOKEN.VERIFICATION_TOKEN_LENGTH);
    const hashedToken = await hashPassword(token);
    const expiry = calculateTokenExpiry(TOKEN.EMAIL_VERIFICATION_EXPIRY_MINUTES);

    return { token, hashedToken, expiry };
  }

  /**
   * Generates password reset token and prepares data
   * @returns Reset token data including plain and hashed tokens
   */
  private async generateResetToken() {
    const token = generateSecureToken(TOKEN.VERIFICATION_TOKEN_LENGTH);
    const hashedToken = await hashPassword(token);
    const expiry = calculateTokenExpiry(TOKEN.PASSWORD_RESET_EXPIRY_MINUTES);

    return { token, hashedToken, expiry };
  }

  /**
   * Sends verification email with error handling
   * @param email - Recipient email
   * @param name - Recipient name
   * @param token - Verification token
   */
  private sendVerificationEmail(email: string, name: string, token: string): void {
    const verifyUrl = `${env.frontend.url}/verify-email?token=${token}`;
    this.emailService.sendEmailSafely(
      this.emailService.sendVerifyEmail(email, {
        userName: name,
        verifyUrl,
        expiresIn: TOKEN.EMAIL_VERIFICATION_EXPIRY_MINUTES,
      }),
      'verification'
    );
  }

  /**
   * Sends password reset email with error handling
   * @param email - Recipient email
   * @param name - Recipient name
   * @param token - Reset token
   */
  private sendResetPasswordEmail(email: string, name: string, token: string): void {
    const resetUrl = `${env.frontend.url}/reset-password?token=${token}`;
    this.emailService.sendEmailSafely(
      this.emailService.sendPasswordResetEmail(email, {
        userName: name,
        resetUrl,
        expiresIn: TOKEN.PASSWORD_RESET_EXPIRY_MINUTES,
      }),
      'password reset'
    );
  }

  // ==================== Authentication ====================

  /**
   * Registers new user account with email verification
   * @param data - Registration data
   * @returns Registration result with user and verification status
   */
  async register(data: RegisterBody): Promise<RegisterResult> {
    const { email, password, name } = data;

    // Validate email availability
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, 'Email sudah terdaftar', ERROR_CODES.DUPLICATE_ENTRY);
    }

    // Generate tokens and hash password
    const { token: verificationToken, hashedToken, expiry } = await this.generateVerificationToken();
    const hashedPassword = await hashPassword(password);

    // Create user with verification token
    const newUser = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: UserRole.USER,
        emailVerified: false,
        emailVerificationToken: hashedToken,
        emailVerificationExpiresAt: expiry,
        emailVerificationIssuedAt: new Date(),
      },
      select: USER_BASE_SELECT,
    });

    // Send verification email
    this.sendVerificationEmail(newUser.email, newUser.name, verificationToken);

    return {
      user: mapUserResponse(newUser),
      verificationSent: true,
    };
  }

  /**
   * Authenticates user and generates session tokens
   * @param data - Login credentials
   * @returns Login result with user and tokens
   */
  async login(data: LoginBody): Promise<LoginResult> {
    const { email, password } = data;

    // Validate credentials
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Kredensial tidak valid', ERROR_CODES.UNAUTHORIZED);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Kredensial tidak valid', ERROR_CODES.UNAUTHORIZED);
    }

    // Check email verification
    if (!user.emailVerified) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Silakan verifikasi email Anda sebelum login',
        ERROR_CODES.EMAIL_NOT_VERIFIED
      );
    }

    // Generate and store tokens
    const tokens = await this.generateAndStoreTokens(user.id, user.email, user.role, user.name);

    return { user: mapUserResponse(user), tokens };
  }

  /**
   * Refreshes access token using refresh token
   * @param refreshToken - Current refresh token
   * @returns New token pair
   */
  async refresh(refreshToken: string): Promise<TokenPair> {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Pengguna tidak ditemukan', ERROR_CODES.UNAUTHORIZED);
    }

    // Validate refresh token matches stored token
    if (user.refreshToken !== refreshToken) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Token refresh tidak valid', ERROR_CODES.INVALID_TOKEN);
    }

    // Generate new token pair (token rotation for security)
    return this.generateAndStoreTokens(user.id, user.email, user.role, user.name);
  }

  /**
   * Logs out user by invalidating refresh token
   * @param userId - User ID to logout
   */
  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // ==================== Email Verification ====================

  /**
   * Verifies user email address using token
   * @param data - Verification token data
   */
  async verifyEmail(data: VerifyEmailBody): Promise<void> {
    const { token } = data;

    const user = await this.findUserByToken('emailVerification', token, {
      emailVerified: false,
    });

    if (!user) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Token verifikasi tidak valid atau sudah kedaluwarsa',
        ERROR_CODES.INVALID_VERIFICATION_TOKEN
      );
    }

    // Mark email as verified and clear verification token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });

    // Send welcome email
    this.emailService.sendEmailSafely(
      this.emailService.sendWelcomeEmail(user.email, {
        userName: user.name,
        loginUrl: `${env.frontend.url}/login`,
      }),
      'welcome'
    );
  }

  /**
   * Resends email verification to user
   * @param data - Email address for resend
   */
  async resendVerification(data: ResendVerificationBody): Promise<void> {
    const { email } = data;
    const user = await this.findUserByEmail(email);

    // Don't reveal if user exists (security)
    if (!user) return;

    // Check if already verified
    if (user.emailVerified) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Email sudah diverifikasi', ERROR_CODES.EMAIL_ALREADY_VERIFIED);
    }

    // Check cooldown period
    this.checkCooldown(user.emailVerificationIssuedAt, TOKEN.VERIFICATION_EMAIL_COOLDOWN_MINUTES, 'verification email');

    // Generate new verification token
    const { token: verificationToken, hashedToken, expiry } = await this.generateVerificationToken();

    // Update user with new token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpiresAt: expiry,
        emailVerificationIssuedAt: new Date(),
      },
    });

    // Send verification email
    this.sendVerificationEmail(user.email, user.name, verificationToken);
  }

  // ==================== Password Reset ====================

  /**
   * Initiates password reset process
   * @param data - Email address for password reset
   */
  async forgotPassword(data: ForgotPasswordBody): Promise<void> {
    const { email } = data;
    const user = await this.findUserByEmail(email);

    // Don't reveal if user exists (security)
    if (!user) return;

    // Check cooldown period
    this.checkCooldown(user.passwordResetIssuedAt, TOKEN.PASSWORD_RESET_COOLDOWN_MINUTES, 'password reset');

    // Generate secure reset token
    const { token: resetToken, hashedToken, expiry } = await this.generateResetToken();

    // Update user with reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: expiry,
        passwordResetIssuedAt: new Date(),
      },
    });

    // Send reset email
    this.sendResetPasswordEmail(user.email, user.name, resetToken);
  }

  /**
   * Resets user password using token
   * @param data - Reset token and new password
   */
  async resetPassword(data: ResetPasswordBody): Promise<void> {
    const { token, password } = data;

    const user = await this.findUserByToken('passwordReset', token);

    if (!user) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Token reset tidak valid atau sudah kedaluwarsa',
        ERROR_CODES.INVALID_RESET_TOKEN
      );
    }

    const hashedPassword = await hashPassword(password);

    // Update password, clear reset token, and invalidate all sessions
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        refreshToken: null,
      },
    });

    // Send password changed confirmation email
    this.emailService.sendEmailSafely(
      this.emailService.sendPasswordChangedEmail(user.email, {
        userName: user.name,
        changeTime: new Date(),
      }),
      'password changed'
    );
  }
}
