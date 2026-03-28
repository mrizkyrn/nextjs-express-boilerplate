import type { NextFunction, Request, Response } from 'express';

/**
 * Creates a mock Express Request object with type safety
 * Provides default values and allows overrides
 *
 * @param overrides - Properties to override in the mock request
 * @returns Partial Express Request object
 *
 * @example
 * ```typescript
 * const req = createMockRequest({
 *   body: { email: 'test@test.com' },
 *   params: { id: '123' },
 *   user: { id: 'user-id', email: 'test@test.com', role: 'USER' }
 * });
 * ```
 */
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  const headers = overrides.headers || {};
  
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: undefined,
    method: 'GET',
    url: '/test',
    originalUrl: '/test',
    get: jest.fn((header: string): string | undefined => {
      // Normalize header name to lowercase for lookup
      const normalizedHeader = header.toLowerCase();
      return (headers as Record<string, string>)[normalizedHeader] || 
             (headers as Record<string, string>)[header] || 
             undefined;
    }) as Request['get'],
    ...overrides,
  };
};

/**
 * Creates a mock Express Response object with chainable methods
 * All methods return the response object for chaining
 *
 * @returns Partial Express Response object with jest mocks
 *
 * @example
 * ```typescript
 * const res = createMockResponse();
 * await controller.method(req, res);
 * expect(res.status).toHaveBeenCalledWith(200);
 * expect(res.json).toHaveBeenCalledWith({ success: true });
 * ```
 */
export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Creates a mock Express NextFunction
 *
 * @returns Jest mock function that can be used as NextFunction
 *
 * @example
 * ```typescript
 * const next = createMockNext();
 * await middleware(req, res, next);
 * expect(next).toHaveBeenCalled();
 * ```
 */
export const createMockNext = (): NextFunction => jest.fn();

/**
 * Helper to create authenticated request with user data
 *
 * @param userData - User data to attach to request
 * @param overrides - Additional request properties
 * @returns Mock request with user attached
 */
export const createAuthenticatedRequest = (
  userData: { id: string; email: string; role: string; name?: string },
  overrides: Partial<Request> = {}
): Partial<Request> => {
  return createMockRequest({
    user: userData,
    headers: {
      authorization: 'Bearer mock-token',
    },
    ...overrides,
  });
};
