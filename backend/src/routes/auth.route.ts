import { Router } from 'express';
import { authController } from '@/controller/auth.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { authLimiter } from '@/middlewares/rateLimiter.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@/schemas/auth.schema';
import { asyncHandler } from '@/utils/asyncHandler.util';

const router = Router();

// ===== PUBLIC AUTH ROUTES =====

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, validate({ body: registerSchema }), asyncHandler(authController.register.bind(authController)));

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return access & refresh tokens
 * @access  Public
 */
router.post('/login', authLimiter, validate({ body: loginSchema }), asyncHandler(authController.login.bind(authController)));

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
router.post('/verify-email', validate({ body: verifyEmailSchema }), asyncHandler(authController.verifyEmail.bind(authController)));

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
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), asyncHandler(authController.resetPassword.bind(authController)));

// ===== PRIVATE AUTH ROUTES =====

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear refresh token cookie
 * @access  Private
 */
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(authController.me.bind(authController)));

export default router;
