/**
 * Example usage of the logging system
 * This file demonstrates best practices for using Winston and Morgan loggers
 */

import { logDebug, logError, logger, logInfo, logWarn } from '@/libs/logger.lib';

/**
 * Example 1: Basic logging with helper functions
 */
export const basicLoggingExample = () => {
  // Info level - general application events
  logInfo('Application started successfully');

  // With metadata
  logInfo('User logged in', {
    userId: 'user-123',
    email: 'user@example.com',
    timestamp: new Date().toISOString(),
  });

  // Warning - potential issues
  logWarn('Rate limit approaching threshold', {
    requests: 95,
    limit: 100,
    userId: 'user-456',
  });

  // Debug - detailed information (only in development)
  logDebug('Cache lookup', {
    key: 'user:123',
    hit: false,
    ttl: 3600,
  });
};

/**
 * Example 2: Error logging with proper context
 */
export const errorLoggingExample = async () => {
  try {
    // Simulated operation that might fail
    await riskyOperation();
  } catch (error) {
    // Log error with context
    logError('Payment processing failed', error, {
      userId: 'user-789',
      amount: 99.99,
      currency: 'USD',
      attemptNumber: 1,
    });
  }
};

/**
 * Example 3: Service-level logging
 */
export class ExampleService {
  async processData(userId: string, data: any) {
    logInfo('Starting data processing', { userId, dataSize: data.length });

    try {
      // Process data
      const result = await this.transform(data);

      logInfo('Data processing completed', {
        userId,
        recordsProcessed: result.length,
        duration: '2.5s',
      });

      return result;
    } catch (error) {
      logError('Data processing failed', error, {
        userId,
        step: 'transformation',
      });
      throw error;
    }
  }

  private async transform(data: any) {
    // Transformation logic
    return data;
  }
}

/**
 * Example 4: Direct Winston usage (advanced scenarios)
 */
export const advancedLoggingExample = () => {
  // Use direct logger for custom scenarios
  logger.info('Custom event', {
    eventType: 'user_action',
    action: 'profile_updated',
    metadata: {
      fields: ['name', 'email'],
      source: 'web',
    },
  });

  // Log with specific level
  logger.http('Custom HTTP event', {
    method: 'POST',
    endpoint: '/api/webhook',
    source: 'external',
  });
};

/**
 * Example 5: Conditional logging based on environment
 */
export const conditionalLoggingExample = (data: any) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    // Only log in development
    logDebug('Detailed debug info', {
      rawData: data,
      parsedData: JSON.stringify(data),
    });
  }

  // Always log important events
  logInfo('Operation completed', {
    success: true,
    recordCount: data.length,
  });
};

/**
 * Example 6: Logging in async/await patterns
 */
export const asyncLoggingExample = async () => {
  const startTime = Date.now();

  try {
    logInfo('Starting async operation');

    await Promise.all([operation1(), operation2(), operation3()]);

    const duration = Date.now() - startTime;
    logInfo('All operations completed', { duration: `${duration}ms` });
  } catch (error) {
    logError('One or more operations failed', error, {
      duration: `${Date.now() - startTime}ms`,
    });
  }
};

/**
 * Example 7: Structured logging for monitoring
 */
export const monitoringExample = (metric: string, value: number) => {
  // Log metrics in structured format for easy parsing
  logger.info('Metric recorded', {
    metric,
    value,
    timestamp: new Date().toISOString(),
    tags: {
      environment: process.env.NODE_ENV,
      service: 'api',
    },
  });
};

// Helper functions for examples
async function riskyOperation() {
  throw new Error('Simulated payment failure');
}

async function operation1() {
  return 'op1';
}

async function operation2() {
  return 'op2';
}

async function operation3() {
  return 'op3';
}
