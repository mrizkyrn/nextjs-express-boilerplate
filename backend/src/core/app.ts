import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';

import routes from '@/api';
import swaggerRoutes from '@/api/swagger.route';
import { env } from '@/shared/config/environment.config';
import { corsConfig } from '@/shared/config/cors.config';
import { errorHandler, notFoundHandler } from '@/shared/middleware/error.middleware';
import { httpLogger } from '@/shared/middleware/logger.middleware';
import { generalLimiter } from '@/shared/middleware/rate-limiter.middleware';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors(corsConfig));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Compression middleware
  app.use(compression());

  // HTTP request logging
  app.use(httpLogger);

  /**
   * @openapi
   * /health:
   *   get:
   *     tags:
   *       - Health
   *     summary: Health check
   *     description: Check if the API server is running and responsive. Returns server status, timestamp, and uptime.
   *     security: []
   *     responses:
   *       200:
   *         description: Server is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: 2024-01-15T10:30:00.000Z
   *                 uptime:
   *                   type: number
   *                   description: Server uptime in seconds
   *                   example: 3600.5
   */
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
  });

  // API Documentation (Swagger) - Only in development/staging
  if (env.app.nodeEnv !== 'production') {
    app.use('/api-docs', swaggerRoutes);
    console.log('📚 Swagger UI available at /api-docs');
  }

  // Rate limiting
  app.use('/api', generalLimiter);

  // API routes
  app.use('/api', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
};
