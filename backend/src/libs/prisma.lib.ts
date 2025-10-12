import { env } from '@/config/environment.config';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger.lib';

/**
 * Prisma Client instance with logging configuration
 * Singleton pattern to prevent multiple instances
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'minimal',
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') globalThis.prisma = prisma;

/**
 * Connect to the database
 */
export const connectDatabase = async (retries = 3): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      logger.info('✅ Database connected successfully');
      return;
    } catch (error) {
      logger.warn(`Database connection attempt ${attempt}/${retries} failed:`, error);

      if (attempt === retries) {
        logger.error('❌ All database connection attempts failed');
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};

/**
 * Graceful shutdown handler
 */
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};
