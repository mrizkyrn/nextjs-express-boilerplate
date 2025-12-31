import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';

import routes from '@/api';
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

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
  });

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
