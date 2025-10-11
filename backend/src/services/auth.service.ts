import { prisma } from '@/config/database.config';
import { env } from '@/config/environment.config';
import { ERROR_CODES } from '@/constants/errorCodes.constant';
import { DEFAULT_USER_ROLE } from '@/constants/permissions';
import { AppError } from '@/helpers/error.helper';
import { hashPassword, comparePassword } from '@/helpers/password.helper';
import { generateTokenPair, verifyRefreshToken } from '@/helpers/jwt.helper';
import { generateSecureToken, calculateTokenExpiry, generateResetPasswordUrl, generateVerifyEmailUrl } from '@/helpers/email.helper';
import { emailService } from '@/services/email.service';
import {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from '@/types/auth.type';
import { UserResponse } from '@/types/user.type';
import { UserRole } from '@/types/user.type';

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
    const verificationToken = generateSecureToken(64);
    const verificationExpiry = calculateTokenExpiry(24 * 60); // 24 hours

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
      },
    });

    // Generate verification URL
    const verifyUrl = generateVerifyEmailUrl(verificationToken);

    // Send verification email (non-blocking)
    emailService
      .sendVerifyEmail(newUser.email, {
        userName: newUser.name,
        verifyUrl,
        expiresIn: 24 * 60, // 24 hours in minutes
      })
      .catch((error) => {
        // Log error but don't fail registration
        console.error('Failed to send verification email:', error);
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

    const user: UserResponse = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role as UserRole,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt,
    };

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

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
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

    // Generate secure reset token
    const resetToken = generateSecureToken(64);
    const resetTokenExpiry = calculateTokenExpiry(30); // 30 minutes

    // Store hashed token in database
    const hashedToken = await hashPassword(resetToken);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: resetTokenExpiry,
      },
    });

    // Generate reset URL
    const resetUrl = generateResetPasswordUrl(resetToken);

    // Send password reset email (non-blocking)
    emailService
      .sendPasswordResetEmail(user.email, {
        userName: user.name,
        resetUrl,
        expiresIn: 30,
      })
      .catch((error) => {
        // Log error but don't fail the request
        console.error('Failed to send password reset email:', error);
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
        console.error('Failed to send password changed email:', error);
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
        console.error('Failed to send welcome email:', error);
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

    // Generate new verification token
    const verificationToken = generateSecureToken(64);
    const verificationExpiry = calculateTokenExpiry(24 * 60); // 24 hours

    // Hash verification token before storing
    const hashedVerificationToken = await hashPassword(verificationToken);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpiresAt: verificationExpiry,
      },
    });

    // Generate verification URL
    const verifyUrl = generateVerifyEmailUrl(verificationToken);

    // Send verification email (non-blocking)
    emailService
      .sendVerifyEmail(user.email, {
        userName: user.name,
        verifyUrl,
        expiresIn: 24 * 60, // 24 hours in minutes
      })
      .catch((error) => {
        // Log error but don't fail the request
        console.error('Failed to send verification email:', error);
      });
  }
}

export const authService = new AuthService();
