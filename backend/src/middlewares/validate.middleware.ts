import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  // Note: params validation is not supported in middleware
}

/**
 * Validation middleware factory
 * Validates request body and query against Zod schemas
 */
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate query
      if (schemas.query) {
        const validatedQuery = schemas.query.parse(req.query);
        // Override the query getter to return validated values
        Object.defineProperty(req, 'query', {
          get: () => validatedQuery,
          configurable: true,
        });
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
};
