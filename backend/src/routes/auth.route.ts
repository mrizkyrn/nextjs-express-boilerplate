import { Router } from 'express';
import { authController } from '@/controller/auth.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { authLimiter } from '@/middlewares/rateLimiter.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { asyncHandler } from '@/helpers/asyncHandler.helper';
import { loginSchema, registerSchema } from '@/schemas/auth.schema';

const router = Router();

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
