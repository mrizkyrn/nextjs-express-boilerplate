import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

import { createMockNext, createMockRequest, createMockResponse } from '@/test/mocks/express.mock';

import { validate } from '../validation.middleware';

describe('Validation Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
    jest.clearAllMocks();
  });

  describe('validate - body validation', () => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().optional(),
    });

    it('should pass validation and call next when body is valid', () => {
      // Arrange
      req.body = { email: 'test@example.com', password: 'password123' };
      const middleware = validate({ body: bodySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({ email: 'test@example.com', password: 'password123' });
    });

    it('should call next with ZodError when body is invalid', () => {
      // Arrange
      req.body = { email: 'invalid-email', password: '123' };
      const middleware = validate({ body: bodySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should validate optional fields correctly', () => {
      // Arrange
      req.body = { email: 'test@example.com', password: 'password123', name: 'Test User' };
      const middleware = validate({ body: bodySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.body.name).toBe('Test User');
    });

    it('should call next with error when required field is missing', () => {
      // Arrange
      req.body = { email: 'test@example.com' }; // missing password
      const middleware = validate({ body: bodySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should transform validated body data', () => {
      // Arrange
      const transformSchema = z.object({
        email: z.string().email().toLowerCase(),
        age: z.coerce.number(),
      });
      req.body = { email: 'TEST@EXAMPLE.COM', age: '25' };
      const middleware = validate({ body: transformSchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.body.email).toBe('test@example.com');
      expect(req.body.age).toBe(25);
    });
  });

  describe('validate - query validation', () => {
    const querySchema = z.object({
      page: z.coerce.number().optional().default(1),
      limit: z.coerce.number().optional().default(10),
      search: z.string().optional(),
    });

    it('should pass validation and call next when query is valid', () => {
      // Arrange
      req.query = { page: '2', limit: '20' };
      const middleware = validate({ query: querySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.query.page).toBe(2);
      expect(req.query.limit).toBe(20);
    });

    it('should apply default values when query params are missing', () => {
      // Arrange
      req.query = {};
      const middleware = validate({ query: querySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.query.page).toBe(1);
      expect(req.query.limit).toBe(10);
    });

    it('should handle comma-separated values in query', () => {
      // Arrange
      const arrayQuerySchema = z.object({
        status: z.array(z.string()).optional(),
      });
      req.query = { status: 'active,pending,completed' };
      const middleware = validate({ query: arrayQuerySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.query.status).toEqual(['active', 'pending', 'completed']);
    });

    it('should handle bracket notation in query params', () => {
      // Arrange
      const arrayQuerySchema = z.object({
        tags: z.array(z.string()).optional(),
      });
      // Simulate tags[]=value format by having key be 'tags[]'
      req.query = { 'tags[]': ['tag1', 'tag2'] } as any;
      const middleware = validate({ query: arrayQuerySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.query?.tags).toEqual(['tag1', 'tag2']);
    });

    it('should handle array values in query (repeated params)', () => {
      // Arrange
      const arrayQuerySchema = z.object({
        ids: z.array(z.string()).optional(),
      });
      req.query = { ids: ['1', '2', '3'] };
      const middleware = validate({ query: arrayQuerySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.query?.ids).toEqual(['1', '2', '3']);
    });

    it('should handle null and undefined values in query', () => {
      // Arrange
      const nullableSchema = z.object({
        filter: z.string().nullable().optional(),
      });
      req.query = { filter: undefined } as any;
      const middleware = validate({ query: nullableSchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('validate - params validation', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    it('should pass validation and call next when params are valid', () => {
      // Arrange
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      const middleware = validate({ params: paramsSchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.params.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should call next with ZodError when params are invalid', () => {
      // Arrange
      req.params = { id: 'invalid-uuid' };
      const middleware = validate({ params: paramsSchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should call next with error when required param is missing', () => {
      // Arrange
      req.params = {};
      const middleware = validate({ params: paramsSchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(ZodError));
    });
  });

  describe('validate - combined validation', () => {
    const bodySchema = z.object({
      title: z.string().min(1),
      content: z.string(),
    });
    const paramsSchema = z.object({
      postId: z.string().uuid(),
    });
    const querySchema = z.object({
      draft: z.coerce.boolean().optional().default(false),
    });

    it('should validate body, params, and query together', () => {
      // Arrange
      req.body = { title: 'Test Post', content: 'Test content' };
      req.params = { postId: '550e8400-e29b-41d4-a716-446655440000' };
      req.query = { draft: 'true' };
      const middleware = validate({
        body: bodySchema,
        params: paramsSchema,
        query: querySchema,
      });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({ title: 'Test Post', content: 'Test content' });
      expect(req.params.postId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(req.query.draft).toBe(true);
    });

    it('should fail on first invalid schema', () => {
      // Arrange
      req.body = { title: '', content: 'Test' }; // invalid title
      req.params = { postId: '550e8400-e29b-41d4-a716-446655440000' };
      req.query = {};
      const middleware = validate({
        body: bodySchema,
        params: paramsSchema,
        query: querySchema,
      });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(ZodError));
    });
  });

  describe('validate - edge cases', () => {
    it('should call next when no schemas provided', () => {
      // Arrange
      req.body = { anything: 'goes' };
      const middleware = validate({});

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
    });

    it('should handle empty body with empty schema', () => {
      // Arrange
      req.body = {};
      const emptySchema = z.object({});
      const middleware = validate({ body: emptySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
    });

    it('should strip unknown fields with strict schema', () => {
      // Arrange
      const strictSchema = z.object({
        name: z.string(),
      }).strict();
      req.body = { name: 'Test', unknown: 'field' };
      const middleware = validate({ body: strictSchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should handle nested objects in body', () => {
      // Arrange
      const nestedSchema = z.object({
        user: z.object({
          profile: z.object({
            firstName: z.string(),
            lastName: z.string(),
          }),
        }),
      });
      req.body = {
        user: {
          profile: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      };
      const middleware = validate({ body: nestedSchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.body.user.profile.firstName).toBe('John');
    });

    it('should trim whitespace in comma-separated values', () => {
      // Arrange
      const arrayQuerySchema = z.object({
        tags: z.array(z.string()).optional(),
      });
      req.query = { tags: 'tag1,  tag2 , tag3  ' };
      const middleware = validate({ query: arrayQuerySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.query.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should filter empty values in comma-separated string', () => {
      // Arrange
      const arrayQuerySchema = z.object({
        items: z.array(z.string()).optional(),
      });
      req.query = { items: 'a,,b,,,c' };
      const middleware = validate({ query: arrayQuerySchema });

      // Act
      middleware(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(req.query.items).toEqual(['a', 'b', 'c']);
    });
  });
});
