import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
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
