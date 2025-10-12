import path from 'path';
import winston from 'winston';
import { env } from '@/config/environment.config';

const isDevelopment = env.NODE_ENV !== 'production';

// Console format for development (colorized, human-readable)
const consoleFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${stack ? `\n${stack}` : ''}${metaStr}`;
  })
);

// File format (JSON without colors, includes all metadata)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  transports: [
    // Console transport with colors for development
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Error log file (errors only, no colors)
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: fileFormat,
    }),

    // Combined log file (all logs, no colors)
    new winston.transports.File({
      filename: path.join('logs', 'all.log'),
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});
