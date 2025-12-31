import morgan from 'morgan';

import { morganStream } from '@/infrastructure/logging/winston.logger';
import { env } from '@/shared/config/environment.config';

const isDevelopment = env.app.isDevelopment;

/**
 * Morgan tokens for custom logging format
 */
morgan.token('status-colored', (req, res) => {
  const status = res.statusCode;
  const color = status >= 500 ? 31 : status >= 400 ? 33 : status >= 300 ? 36 : status >= 200 ? 32 : 0;
  return isDevelopment ? `\x1b[${color}m${status}\x1b[0m` : String(status);
});

/**
 * HTTP request logging middleware using Morgan
 *
 * Development format: Short, colored, human-readable
 * Production format: Combined Apache-style with response time
 *
 * All logs are streamed to Winston for consistent handling
 */
export const httpLogger = morgan(
  isDevelopment
    ? // Development: Concise format with colors
      ':method :url :status-colored :response-time ms - :res[content-length]'
    : // Production: Detailed Apache combined format
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  {
    stream: morganStream,
    // Skip logging for successful health checks in production to reduce noise
    skip: (req, res) => {
      return !isDevelopment && req.url === '/health' && res.statusCode === 200;
    },
  }
);

/**
 * Separate Morgan logger for errors (4xx and 5xx responses)
 * Useful for debugging failed requests
 */
export const httpErrorLogger = morgan(':method :url :status :response-time ms - :res[content-length] - :remote-addr', {
  stream: morganStream,
  // Only log errors
  skip: (req, res) => res.statusCode < 400,
});
