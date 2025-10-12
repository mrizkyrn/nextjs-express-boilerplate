import { NextFunction, Request, Response } from 'express';
import { logger } from '@/libs/logger.lib';

/**
 * HTTP request logging middleware
 * Logs all incoming HTTP requests with method, URL, status, duration, and IP
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};
