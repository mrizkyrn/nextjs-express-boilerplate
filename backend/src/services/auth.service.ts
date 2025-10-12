import { APP_CONSTANTS } from '@/config/constants.config';
import { env } from '@/config/environment.config';
import { ERROR_CODES } from '@/config/error.config';
import { DEFAULT_USER_ROLE } from '@/config/rbac.config';
import { logger } from '@/libs/logger.lib';
import { prisma } from '@/libs/prisma.lib';
import { emailService } from '@/services/email.service';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/types/auth.type';
import type { UserResponse } from '@/types/user.type';
import { AppError } from '@/utils/error.util';
import { createUserResponse } from '@/utils/format.util';
import { generateTokenPair, verifyRefreshToken } from '@/utils/jwt.util';
import { comparePassword, hashPassword } from '@/utils/password.util';
import { calculateTokenExpiry, generateSecureToken } from '@/utils/token.utils';

export class AuthService {
  /**
   * Register a new user account
   * Creates user with hashed password and sends email verification
   */
  async register(data: RegisterRequest): Promise<{ message: string; email: string }> {
    const { email, password, name } = data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already registered', ERROR_CODES.DUPLICATE_ENTRY);
    }

    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const verificationToken = generateSecureToken(APP_CONSTANTS.VERIFICATION_TOKEN_LENGTH);
    const verificationExpiry = calculateTokenExpiry(APP_CONSTANTS.EMAIL_VERIFICATION_EXPIRY_MINUTES); // 24 hours

    // Hash verification token before storing
    const hashedVerificationToken = await hashPassword(verificationToken);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: DEFAULT_USER_ROLE,
        emailVerified: false,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpiresAt: verificationExpiry,
        emailVerificationIssuedAt: new Date(),
      },
    });

    // Generate verification URL
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Send verification email (non-blocking)
    emailService
      .sendVerifyEmail(newUser.email, {
        userName: newUser.name,
        verifyUrl,
        expiresIn: APP_CONSTANTS.EMAIL_VERIFICATION_EXPIRY_MINUTES,
      })
      .catch((error) => {
        // Log error but don't fail registration
        logger.error('Failed to send verification email:', error);
      });

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      email: newUser.email,
    };
  }

  /**
   * Authenticate user and generate tokens
   * Validates credentials and checks email verification
   */
  async login(data: LoginRequest): Promise<{ user: UserResponse; tokens: { accessToken: string; refreshToken: string } }> {
    const { email, password } = data;

    const foundUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!foundUser) {
      throw new AppError(401, 'Invalid credentials', ERROR_CODES.UNAUTHORIZED);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, foundUser.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials', ERROR_CODES.UNAUTHORIZED);
    }

    // Check if email is verified
    if (!foundUser.emailVerified) {
      throw new AppError(403, 'Please verify your email before logging in', ERROR_CODES.EMAIL_NOT_VERIFIED);
    }

    const tokens = generateTokenPair(foundUser.id, foundUser.email, foundUser.role, foundUser.name);

    // Store refresh token in database for security
    await prisma.user.update({
      where: { id: foundUser.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const user = createUserResponse(foundUser);

    return { user, tokens };
  }

  /**
   * Generate new access token using refresh token
   * Validates refresh token and issues new token pair
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError(401, 'User not found', ERROR_CODES.UNAUTHORIZED);
    }

    if (user.refreshToken !== refreshToken) {
      throw new AppError(401, 'Invalid refresh token', ERROR_CODES.INVALID_TOKEN);
    }

    const tokens = generateTokenPair(user.id, user.email, user.role, user.name);

    // Update refresh token in database (rotation for security)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return tokens;
  }

  /**
   * Logout user by clearing refresh token
   * Removes refresh token from database to invalidate sessions
   */
  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Get user profile by ID (used for token validation)
   * Returns user data without sensitive information like password
   */
  async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return createUserResponse(user);
  }

  /**
   * Request password reset
   * Generates reset token and sends email with reset link
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const { email } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists for security reasons
    if (!user) {
      return;
    }

    // Check cooldown period
    if (user.passwordResetIssuedAt) {
      const timeSinceLastEmail = Date.now() - user.passwordResetIssuedAt.getTime();
      const cooldownMs = APP_CONSTANTS.PASSWORD_RESET_COOLDOWN_MINUTES * 60 * 1000;

      if (timeSinceLastEmail < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastEmail) / (60 * 1000));
        throw new AppError(
          429,
          `Please wait ${remainingMinutes} minute(s) before requesting another password reset`,
          ERROR_CODES.RATE_LIMIT_EXCEEDED
        );
      }
    }

    // Generate secure reset token
    const resetToken = generateSecureToken(APP_CONSTANTS.VERIFICATION_TOKEN_LENGTH);
    const resetTokenExpiry = calculateTokenExpiry(APP_CONSTANTS.PASSWORD_RESET_EXPIRY_MINUTES); // 30 minutes

    // Store hashed token in database
    const hashedToken = await hashPassword(resetToken);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: resetTokenExpiry,
        passwordResetIssuedAt: new Date(),
      },
    });

    // Generate reset URL
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send password reset email (non-blocking)
    emailService
      .sendPasswordResetEmail(user.email, {
        userName: user.name,
        resetUrl,
        expiresIn: APP_CONSTANTS.PASSWORD_RESET_EXPIRY_MINUTES,
      })
      .catch((error) => {
        // Log error but don't fail the request
        logger.error('Failed to send password reset email:', error);
      });
  }

  /**
   * Reset password using token
   * Validates reset token and updates user password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const { token, password } = data;

    // Find user with non-expired reset token
    const users = await prisma.user.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpiresAt: { gte: new Date() },
      },
    });

    // Verify token against stored hash
    let validUser = null;
    for (const user of users) {
      if (user.passwordResetToken) {
        const isValid = await comparePassword(token, user.passwordResetToken);
        if (isValid) {
          validUser = user;
          break;
        }
      }
    }

    if (!validUser) {
      throw new AppError(400, 'Invalid or expired reset token', ERROR_CODES.INVALID_RESET_TOKEN);
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: validUser.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        refreshToken: null, // Invalidate all sessions
      },
    });

    // Send password changed confirmation email (non-blocking)
    emailService
      .sendPasswordChangedEmail(validUser.email, {
        userName: validUser.name,
        changeTime: new Date(),
      })
      .catch((error) => {
        // Log error but don't fail the request
        logger.error('Failed to send password changed email:', error);
      });
  }

  /**
   * Verify email address using verification token
   * Marks user's email as verified and sends welcome email
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    const { token } = data;

    // Find users with non-expired verification tokens
    const users = await prisma.user.findMany({
      where: {
        emailVerified: false,
        emailVerificationToken: { not: null },
        emailVerificationExpiresAt: { gte: new Date() },
      },
    });

    // Verify token against stored hash
    let validUser = null;
    for (const user of users) {
      if (user.emailVerificationToken) {
        const isValid = await comparePassword(token, user.emailVerificationToken);
        if (isValid) {
          validUser = user;
          break;
        }
      }
    }

    if (!validUser) {
      throw new AppError(400, 'Invalid or expired verification token', ERROR_CODES.INVALID_VERIFICATION_TOKEN);
    }

    // Mark email as verified and clear verification token
    await prisma.user.update({
      where: { id: validUser.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });

    // Send welcome email (non-blocking)
    emailService
      .sendWelcomeEmail(validUser.email, {
        userName: validUser.name,
        loginUrl: `${env.FRONTEND_URL}/login`,
      })
      .catch((error) => {
        // Log error but don't fail verification
        logger.error('Failed to send welcome email:', error);
      });
  }

  /**
   * Resend email verification
   * Generates new verification token and sends verification email
   */
  async resendVerification(data: ResendVerificationRequest): Promise<void> {
    const { email } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists
    if (!user) {
      return;
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new AppError(400, 'Email is already verified', ERROR_CODES.VALIDATION_ERROR);
    }

    // Check cooldown period
    if (user.emailVerificationIssuedAt) {
      const timeSinceLastEmail = Date.now() - user.emailVerificationIssuedAt.getTime();
      const cooldownMs = APP_CONSTANTS.VERIFICATION_EMAIL_COOLDOWN_MINUTES * 60 * 1000;

      if (timeSinceLastEmail < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastEmail) / (60 * 1000));
        throw new AppError(
          429,
          `Please wait ${remainingMinutes} minute(s) before requesting another verification email`,
          ERROR_CODES.RATE_LIMIT_EXCEEDED
        );
      }
    }

    // Generate new verification token
    const verificationToken = generateSecureToken(APP_CONSTANTS.VERIFICATION_TOKEN_LENGTH);
    const verificationExpiry = calculateTokenExpiry(APP_CONSTANTS.EMAIL_VERIFICATION_EXPIRY_MINUTES); // 24 hours

    // Hash verification token before storing
    const hashedVerificationToken = await hashPassword(verificationToken);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpiresAt: verificationExpiry,
        emailVerificationIssuedAt: new Date(),
      },
    });

    // Generate verification URL
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Send verification email (non-blocking)
    emailService
      .sendVerifyEmail(user.email, {
        userName: user.name,
        verifyUrl,
        expiresIn: APP_CONSTANTS.EMAIL_VERIFICATION_EXPIRY_MINUTES,
      })
      .catch((error) => {
        // Log error but don't fail the request
        logger.error('Failed to send verification email:', error);
      });
  }
}

export const authService = new AuthService();
