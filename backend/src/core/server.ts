import { connectDatabase, disconnectDatabase } from '@/infrastructure/database/prisma.client';
import { logger } from '@/infrastructure/logging/winston.logger';
import { env } from '@/shared/config/environment.config';
import { createApp } from './app';

const startServer = async () => {
  try {
    // Test database connection
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(env.app.port, () => {
      logger.info(`🚀 Server running on port ${env.app.port}`);
      logger.info(`📝 Environment: ${env.app.nodeEnv}`);
      logger.info(`🔗 Frontend URL: ${env.frontend.url}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        logger.info('Database connection closed');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout', new Error('Shutdown timeout'));
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
