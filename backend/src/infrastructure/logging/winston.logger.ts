import path from 'path';
import winston from 'winston';

import { env } from '@/shared/config/environment.config';

/**
 * Logger interface for dependency injection
 * Provides type-safe logging methods for application-wide use
 */
export interface ILogger {
  error(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  info(message: string, meta?: object): void;
  http(message: string): void;
  debug(message: string, meta?: object): void;
}

/**
 * Custom log levels for application logging
 * Includes HTTP level for request/response logging
 */
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Custom colors for log levels in console output
 */
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(logColors);

/**
 * Safely stringify objects, handling circular references
 */
const safeStringify = (obj: any, indent = 2): string => {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (key, value) => {
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      // Skip unnecessary HTTP internals
      if (key === 'req' || key === 'res' || key === 'socket' || key === 'client') {
        return '[Internal]';
      }
      return value;
    },
    indent
  );
};

/**
 * Console format for development (colorized, human-readable)
 * Includes timestamp, level, message, and optional metadata
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    // Format metadata if present - safely handle circular references
    let metaStr = '';
    if (Object.keys(meta).length) {
      try {
        metaStr = `\n${safeStringify(meta, 2)}`;
      } catch (error) {
        metaStr = `\n[Unable to stringify metadata: ${error instanceof Error ? error.message : 'Unknown error'}]`;
      }
    }

    // Include stack trace for errors
    const stackStr = stack ? `\n${stack}` : '';

    return `[${timestamp}] ${level}: ${message}${stackStr}${metaStr}`;
  })
);

/**
 * File format for production (JSON without colors, includes all metadata)
 * Structured for easy parsing by log aggregation tools
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.uncolorize(),
  winston.format.json()
);

/**
 * Winston logger instance with multiple transports
 * - Console: Development-friendly colored output
 * - Error file: Only error-level logs
 * - Combined file: All logs for audit trail
 */
export const logger = winston.createLogger({
  level: env.app.isDevelopment ? 'debug' : 'http',
  levels: logLevels,
  transports: [
    // Console transport - always enabled, colored in development
    new winston.transports.Console({
      format: consoleFormat,
      silent: false,
    }),

    // Error log file - critical errors only
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5, // 5 files
    }),

    // Combined log file - all logs above 'http' level
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10, // 10 files
    }),
  ],
  exitOnError: false,
  silent: false,
});

/**
 * Stream for Morgan to integrate with Winston
 * Pipes HTTP request logs to Winston at 'http' level
 */
export const morganStream = {
  write: (message: string) => {
    // Use 'http' level for request logs, trim newlines
    logger.http(message.trim());
  },
};
