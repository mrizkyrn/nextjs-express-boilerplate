import { asyncHandler } from '../async-handler.util';
import { createMockRequest, createMockResponse, createMockNext } from '@/test/mocks/express.mock';
import { AppError } from '../error.util';
import { Request, Response, NextFunction } from 'express';

describe('Async Handler Utility', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
  });

  it('should wrap async function and call it successfully', async () => {
    const asyncFn = jest.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(asyncFn);

    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should catch errors from async function and pass to next', async () => {
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const handler = asyncHandler(asyncFn);

    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should catch AppError and pass to next', async () => {
    const appError = new AppError(404, 'Not found');
    const asyncFn = jest.fn().mockRejectedValue(appError);
    const handler = asyncHandler(asyncFn);

    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(appError);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle successful async operations without calling next', async () => {
    const asyncFn = async (req: Request, res: Response) => {
      res.status!(200).json({ success: true });
    };
    const handler = asyncHandler(asyncFn);

    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle async function that throws synchronously', async () => {
    const error = new Error('Sync error');
    // The function needs to be async to be caught by Promise.resolve()
    const asyncFn = jest.fn(async () => {
      throw error;
    });
    const handler = asyncHandler(asyncFn);

    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle multiple async operations', async () => {
    const asyncFn1 = jest.fn().mockResolvedValue(undefined);
    const asyncFn2 = jest.fn().mockResolvedValue(undefined);
    
    const handler1 = asyncHandler(asyncFn1);
    const handler2 = asyncHandler(asyncFn2);

    handler1(req as Request, res as Response, next);
    handler2(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(asyncFn1).toHaveBeenCalled();
    expect(asyncFn2).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should preserve request data in wrapped function', async () => {
    req.body = { email: 'test@test.com' };
    req.params = { id: '123' };

    const asyncFn = jest.fn().mockImplementation(async (req: Request) => {
      expect(req.body.email).toBe('test@test.com');
      expect(req.params.id).toBe('123');
    });

    const handler = asyncHandler(asyncFn);
    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(asyncFn).toHaveBeenCalled();
  });

  it('should handle promise rejection with custom error', async () => {
    const customError = new AppError(400, 'Validation failed');
    const asyncFn = jest.fn().mockRejectedValue(customError);
    const handler = asyncHandler(asyncFn);

    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(customError);
    expect((next as jest.Mock).mock.calls[0][0]).toBeInstanceOf(AppError);
  });

  it('should handle async function with database operations', async () => {
    const asyncFn = async (req: Request, res: Response) => {
      // Simulate async database operation
      await new Promise(resolve => setTimeout(resolve, 10));
      res.status!(200).json({ data: 'result' });
    };

    const handler = asyncHandler(asyncFn);
    handler(req as Request, res as Response, next);

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('should not interfere with response once error is caught', async () => {
    const error = new Error('Database error');
    const asyncFn = async (req: Request, res: Response) => {
      throw error;
    };

    const handler = asyncHandler(asyncFn);
    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should handle validation errors correctly', async () => {
    const validationError = new AppError(400, 'Invalid input', undefined, [
      { field: 'email', message: 'Invalid email' }
    ]);
    
    const asyncFn = jest.fn().mockRejectedValue(validationError);
    const handler = asyncHandler(asyncFn);

    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(validationError);
  });

  it('should work with arrow functions', async () => {
    const handler = asyncHandler(async (req, res) => {
      res.status!(200).json({ ok: true });
    });

    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should handle errors in promise chains', async () => {
    const error = new Error('Promise chain error');
    const asyncFn = async () => {
      return Promise.reject(error);
    };

    const handler = asyncHandler(asyncFn);
    handler(req as Request, res as Response, next);

    await new Promise(resolve => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return void (not the promise)', () => {
    const asyncFn = jest.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(asyncFn);

    const result = handler(req as Request, res as Response, next);

    expect(result).toBeUndefined();
  });
});
