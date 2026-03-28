import type { Logger } from 'winston';

/**
 * Mock Logger for testing
 * Prevents console output during tests and allows verification of logging calls
 */
export type MockLogger = {
  info: jest.Mock;
  error: jest.Mock;
  warn: jest.Mock;
  debug: jest.Mock;
  http: jest.Mock;
};

/**
 * Creates a fresh mock logger for each test
 * All log methods are jest mocks that can be verified
 *
 * @returns MockLogger with all logging methods mocked
 *
 * @example
 * ```typescript
 * const mockLogger = createMockLogger();
 * someFunction(mockLogger);
 * expect(mockLogger.info).toHaveBeenCalledWith('Expected message');
 * ```
 */
export const createMockLogger = (): MockLogger => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
});
