import { Router } from 'express';
import { userController } from '@/controller/user.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { requirePermissions } from '@/middlewares/authorization.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { asyncHandler } from '@/helpers/asyncHandler.helper';
import { Permission } from '@/constants/permissions';
import { getUsersQuerySchema, createUserSchema, updateUserSchema, updatePasswordSchema } from '@/schemas/user.schema';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (admin only)
 * @access  Admin
 */
router.get('/stats', requirePermissions([Permission.USER_LIST]), asyncHandler(userController.getUserStats.bind(userController)));

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Authenticated users
 */
router.get('/me', asyncHandler(userController.getCurrentUser.bind(userController)));

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user profile
 * @access  Authenticated users
 */
router.patch('/me', validate({ body: updateUserSchema }), asyncHandler(userController.updateCurrentUser.bind(userController)));

/**
 * @route   PATCH /api/users/me/password
 * @desc    Update current user password
 * @access  Authenticated users
 */
router.patch('/me/password', validate({ body: updatePasswordSchema }), asyncHandler(userController.updatePassword.bind(userController)));

/**
 * @route   GET /api/users
 * @desc    Get paginated list of users
 * @access  Admin
 */
router.get(
  '/',
  requirePermissions([Permission.USER_LIST]),
  validate({ query: getUsersQuerySchema }),
  asyncHandler(userController.getUsers.bind(userController))
);

/**
 * @route   POST /api/users
 * @desc    Create new user (admin only)
 * @access  Admin
 */
router.post(
  '/',
  requirePermissions([Permission.USER_CREATE]),
  validate({ body: createUserSchema }),
  asyncHandler(userController.createUser.bind(userController))
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
router.get('/:id', requirePermissions([Permission.USER_READ]), asyncHandler(userController.getUserById.bind(userController)));

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user by ID
 * @access  Admin
 */
router.patch(
  '/:id',
  requirePermissions([Permission.USER_UPDATE]),
  validate({ body: updateUserSchema }),
  asyncHandler(userController.updateUser.bind(userController))
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Admin
 */
router.delete('/:id', requirePermissions([Permission.USER_DELETE]), asyncHandler(userController.deleteUser.bind(userController)));

export default router;
