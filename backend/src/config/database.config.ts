import { PrismaClient } from '@prisma/client';
import { env } from './environment.config';

/**
 * Prisma Client instance with logging configuration
 * Singleton pattern to prevent multiple instances
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') globalThis.prisma = prisma;

/**
 * Graceful shutdown handler
 */
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};
