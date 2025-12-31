import { PrismaClient } from '@prisma/client';

import { logger } from '@/infrastructure/logging/winston.logger';
import { env } from '@/shared/config/environment.config';

/**
 * Prisma Client instance with logging configuration
 * Singleton pattern to prevent multiple instances in development
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: env.app.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: env.app.isDevelopment ? 'pretty' : 'minimal',
  });
};

// Extend global type for TypeScript
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Create new instance in production for better isolation
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Store in global only in non-production to prevent memory leaks
if (!env.app.isProduction) {
  globalThis.prismaGlobal = prisma;
}

/**
 * Connect to the database with retry mechanism
 *
 * @param retries - Number of connection attempts (default: 5)
 * @param delayMs - Initial delay between retries in ms (default: 1000)
 * @returns Promise that resolves when connected
 * @throws Error if all connection attempts fail
 */
export const connectDatabase = async (retries: number = 5, delayMs: number = 1000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();

      // Verify connection with a simple query
      await prisma.$queryRaw`SELECT 1`;

      logger.info(`✅ Database connected successfully with attempt ${attempt}/${retries}`);

      return;
    } catch (error) {
      const isLastAttempt = attempt === retries;

      logger.warn(`Database connection attempt ${attempt}/${retries} failed`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        nextRetry: !isLastAttempt ? `${delayMs * attempt}ms` : 'none',
      });

      if (isLastAttempt) {
        logger.error('❌ All database connection attempts failed', {
          totalAttempts: retries,
          error,
        });
        throw error;
      }

      // Exponential backoff: wait longer on each retry
      const waitTime = delayMs * attempt;
      logger.info(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

/**
 * Graceful shutdown handler
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
};
