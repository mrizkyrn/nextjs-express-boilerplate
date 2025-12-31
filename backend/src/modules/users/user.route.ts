import { Router } from 'express';

import { container } from '@/core/container';
import { DI_TYPES } from '@/shared/constants';
import { authenticate } from '@/shared/middleware/authentication.middleware';
import { requireAdmin } from '@/shared/middleware/authorization.middleware';
import { validate } from '@/shared/middleware/validation.middleware';
import { asyncHandler } from '@/shared/utils/async-handler.util';
import { UserController } from './user.controller';
import {
  batchDeleteUsersSchema,
  batchUpdateRoleSchema,
  createUserSchema,
  getUsersQuerySchema,
  updatePasswordSchema,
  updateUserSchema,
} from './user.schema';
import type { UserService } from './user.service';

const router = Router();

// Resolve controller from DI container
const userService = container.resolve<UserService>(DI_TYPES.UserService);
const userController = new UserController(userService);

// All user routes require authentication
router.use(authenticate);

// ==================== Current User Routes ====================

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
router.patch(
  '/me',
  validate({ body: updateUserSchema }),
  asyncHandler(userController.updateCurrentUser.bind(userController))
);

/**
 * @route   PATCH /api/users/me/password
 * @desc    Update current user password
 * @access  Authenticated users
 */
router.patch(
  '/me/password',
  validate({ body: updatePasswordSchema }),
  asyncHandler(userController.updatePassword.bind(userController))
);

// ==================== User Queries ====================

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Admin
 */
router.get('/stats', requireAdmin(), asyncHandler(userController.getUserStats.bind(userController)));

/**
 * @route   GET /api/users
 * @desc    Get paginated list of users
 * @access  Admin
 */
router.get(
  '/',
  requireAdmin(),
  validate({ query: getUsersQuerySchema }),
  asyncHandler(userController.getUsers.bind(userController))
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
router.get('/:id', requireAdmin(), asyncHandler(userController.getUserById.bind(userController)));

// ==================== User Management ====================

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Admin
 */
router.post(
  '/',
  requireAdmin(),
  validate({ body: createUserSchema }),
  asyncHandler(userController.createUser.bind(userController))
);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user by ID
 * @access  Admin
 */
router.patch(
  '/:id',
  requireAdmin(),
  validate({ body: updateUserSchema }),
  asyncHandler(userController.updateUser.bind(userController))
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Admin
 */
router.delete('/:id', requireAdmin(), asyncHandler(userController.deleteUser.bind(userController)));

// ==================== Batch Operations ====================

/**
 * @route   POST /api/users/batch/delete
 * @desc    Batch delete multiple users
 * @access  Admin
 */
router.post(
  '/batch/delete',
  requireAdmin(),
  validate({ body: batchDeleteUsersSchema }),
  asyncHandler(userController.batchDeleteUsers.bind(userController))
);

/**
 * @route   POST /api/users/batch/update-role
 * @desc    Batch update user roles
 * @access  Admin
 */
router.post(
  '/batch/update-role',
  requireAdmin(),
  validate({ body: batchUpdateRoleSchema }),
  asyncHandler(userController.batchUpdateRole.bind(userController))
);

export default router;
