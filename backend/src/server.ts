import { env } from '@/config/environment.config';
import { logError, logInfo } from '@/libs/logger.lib';
import { connectDatabase, disconnectDatabase } from '@/libs/prisma.lib';
import { createApp } from './app';

const startServer = async () => {
  try {
    // Test database connection
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(env.PORT, () => {
      logInfo(`🚀 Server running on port ${env.PORT}`);
      logInfo(`📝 Environment: ${env.NODE_ENV}`);
      logInfo(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logInfo(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logInfo('HTTP server closed');
        await disconnectDatabase();
        logInfo('Database connection closed');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logError('Forced shutdown after timeout', new Error('Shutdown timeout'));
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logError('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
