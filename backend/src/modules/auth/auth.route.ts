import { Router } from 'express';

import { container } from '@/core/container';
import { DI_TYPES } from '@/shared/constants';
import { authenticate } from '@/shared/middleware/authentication.middleware';
import { authLimiter } from '@/shared/middleware/rate-limiter.middleware';
import { validate } from '@/shared/middleware/validation.middleware';
import { asyncHandler } from '@/shared/utils/async-handler.util';
import { AuthController } from './auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schema';
import { AuthService } from './auth.service';

const router = Router();

// Resolve controller from DI container
const authService = container.resolve<AuthService>(DI_TYPES.AuthService);
const authController = new AuthController(authService);

// ==================== Authentication Routes ====================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register.bind(authController))
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return access & refresh tokens
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login.bind(authController))
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address using token
 * @access  Public
 */
router.post(
  '/verify-email',
  validate({ body: verifyEmailSchema }),
  asyncHandler(authController.verifyEmail.bind(authController))
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post(
  '/resend-verification',
  authLimiter,
  validate({ body: resendVerificationSchema }),
  asyncHandler(authController.resendVerification.bind(authController))
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword.bind(authController))
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post(
  '/reset-password',
  authLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword.bind(authController))
);

// ===== PRIVATE AUTH ROUTES =====

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear refresh token cookie
 * @access  Private
 */
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));

export default router;
