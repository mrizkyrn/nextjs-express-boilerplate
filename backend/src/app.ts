import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import { corsConfig } from '@/config/cors.config';
import { errorHandler, notFoundHandler } from '@/middlewares/errorHandler.middleware';
import { httpLogger } from '@/middlewares/httpLogger.middleware';
import { generalLimiter } from '@/middlewares/rateLimiter.middleware';
import routes from '@/routes';

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
