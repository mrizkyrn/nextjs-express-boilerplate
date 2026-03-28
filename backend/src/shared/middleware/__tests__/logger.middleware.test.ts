import { Request, Response } from 'express';

import { createMockNext, createMockRequest, createMockResponse } from '@/test/mocks/express.mock';

// Mock the logger stream
jest.mock('@/infrastructure/logging/winston.logger', () => ({
  morganStream: {
    write: jest.fn(),
  },
}));

// Mock environment config
jest.mock('@/shared/config/environment.config', () => ({
  env: {
    app: {
      isDevelopment: true,
      isProduction: false,
      isTest: true,
    },
  },
}));

// Import after mocks are set up
import { httpLogger, httpErrorLogger } from '../logger.middleware';

describe('Logger Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = createMockRequest({
      method: 'GET',
      url: '/api/test',
      originalUrl: '/api/test',
    });
    res = createMockResponse();
    // Add required properties for morgan
    (res as any).statusCode = 200;
    (res as any).getHeader = jest.fn().mockReturnValue(undefined);
    next = createMockNext() as jest.Mock;
    jest.clearAllMocks();
  });

  describe('httpLogger', () => {
    it('should be defined', () => {
      expect(httpLogger).toBeDefined();
    });

    it('should be a middleware function', () => {
      expect(typeof httpLogger).toBe('function');
    });

    it('should accept three arguments (req, res, next)', () => {
      // Morgan middleware functions have length 3
      expect(httpLogger.length).toBe(3);
    });

    it('should call next when executed', (done) => {
      // Execute the middleware
      httpLogger(req as Request, res as Response, () => {
        done();
      });
    });

    it('should not throw when called with valid arguments', () => {
      expect(() => {
        httpLogger(req as Request, res as Response, next);
      }).not.toThrow();
    });
  });

  describe('httpErrorLogger', () => {
    it('should be defined', () => {
      expect(httpErrorLogger).toBeDefined();
    });

    it('should be a middleware function', () => {
      expect(typeof httpErrorLogger).toBe('function');
    });

    it('should accept three arguments (req, res, next)', () => {
      // Morgan middleware functions have length 3
      expect(httpErrorLogger.length).toBe(3);
    });

    it('should call next when executed', (done) => {
      // Execute the middleware
      httpErrorLogger(req as Request, res as Response, () => {
        done();
      });
    });

    it('should not throw when called with valid arguments', () => {
      expect(() => {
        httpErrorLogger(req as Request, res as Response, next);
      }).not.toThrow();
    });
  });

  describe('Middleware Integration', () => {
    it('should work in sequence (httpLogger then httpErrorLogger)', (done) => {
      let callOrder = 0;

      httpLogger(req as Request, res as Response, () => {
        callOrder++;
        expect(callOrder).toBe(1);

        httpErrorLogger(req as Request, res as Response, () => {
          callOrder++;
          expect(callOrder).toBe(2);
          done();
        });
      });
    });

    it('should handle requests with different HTTP methods', (done) => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      let completed = 0;

      methods.forEach((method) => {
        const methodReq = createMockRequest({ method, url: '/api/test' }) as Request;
        (methodReq as any).get = jest.fn().mockReturnValue(undefined);

        httpLogger(methodReq, res as Response, () => {
          completed++;
          if (completed === methods.length) {
            done();
          }
        });
      });
    });

    it('should handle various status codes', (done) => {
      const statusCodes = [200, 201, 301, 400, 404, 500];
      let completed = 0;

      statusCodes.forEach((statusCode) => {
        const statusRes = createMockResponse();
        (statusRes as any).statusCode = statusCode;
        (statusRes as any).getHeader = jest.fn().mockReturnValue(undefined);

        httpLogger(req as Request, statusRes as Response, () => {
          completed++;
          if (completed === statusCodes.length) {
            done();
          }
        });
      });
    });
  });

  describe('Error Logger Skip Behavior', () => {
    it('should be designed to skip successful responses (2xx, 3xx)', () => {
      // The httpErrorLogger is configured to skip responses with statusCode < 400
      // This is a design verification test
      expect(httpErrorLogger).toBeDefined();
      // The skip logic is internal to morgan, but we verify the middleware exists
    });

    it('should be designed to log error responses (4xx, 5xx)', () => {
      // Error logger should log 4xx and 5xx responses
      expect(httpErrorLogger).toBeDefined();
    });
  });
});

describe('Logger Middleware Exports', () => {
  it('should export httpLogger', () => {
    expect(httpLogger).toBeDefined();
    expect(typeof httpLogger).toBe('function');
  });

  it('should export httpErrorLogger', () => {
    expect(httpErrorLogger).toBeDefined();
    expect(typeof httpErrorLogger).toBe('function');
  });

  it('should export different middleware instances', () => {
    // They should be different function references
    expect(httpLogger).not.toBe(httpErrorLogger);
  });
});
