import { prisma } from '@/config/database.config';
import { AppError } from '@/helpers/error.helper';
import { ERROR_CODES } from '@/constants/errorCodes.constant';
import { hashPassword, comparePassword } from '@/helpers/password.helper';
import { generateTokenPair, verifyRefreshToken } from '@/helpers/jwt.helper';
import { RegisterRequest, LoginRequest } from '@/types/auth.type';
import { UserResponse } from '@/types/user.type';
import { DEFAULT_USER_ROLE } from '@/constants/permissions';
import { UserRole } from '@/types/user.type';

export class AuthService {
  /**
   * Register a new user account
   * Creates user with hashed password and generates initial JWT tokens
   */
  async register(data: RegisterRequest): Promise<{ user: UserResponse; tokens: { accessToken: string; refreshToken: string } }> {
    const { email, password, name } = data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already registered', ERROR_CODES.DUPLICATE_ENTRY);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: DEFAULT_USER_ROLE,
      },
    });

    const tokens = generateTokenPair(newUser.id, newUser.email, newUser.role, newUser.name);

    // Store refresh token in database for security
    await prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const user: UserResponse = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as UserRole,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return { user, tokens };
  }

  /**
   * Authenticate user and generate tokens
   * Validates credentials and returns JWT access/refresh tokens
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
}

export const authService = new AuthService();
