import type { PrismaClient } from '@prisma/client';

/**
 * Mock Prisma Client type with all user operations
 * This provides full type safety for tests without needing actual database
 */
export type MockPrismaClient = {
  user: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    deleteMany: jest.Mock;
    updateMany: jest.Mock;
    count: jest.Mock;
    groupBy: jest.Mock;
  };
  $connect: jest.Mock;
  $disconnect: jest.Mock;
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
};

/**
 * Creates a fresh mock Prisma client for each test
 * All methods return undefined by default, allowing tests to configure behavior
 *
 * @returns MockPrismaClient with all methods mocked
 *
 * @example
 * ```typescript
 * const mockPrisma = createMockPrisma();
 * mockPrisma.user.findUnique.mockResolvedValue(testUser);
 * const service = new UserService(mockPrisma as any);
 * ```
 */
export const createMockPrisma = (): MockPrismaClient => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $queryRaw: jest.fn(),
  $transaction: jest.fn((callback) => callback(this)),
});
