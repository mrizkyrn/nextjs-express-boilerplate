import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Preprocess query parameters to handle arrays
 * Supports both comma-separated and repeated params
 */
function preprocessQueryParams(query: Record<string, any>): Record<string, any> {
  const processed: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    // Remove bracket notation if present (?status[]=value)
    const cleanKey = key.endsWith('[]') ? key.slice(0, -2) : key;

    if (value === undefined || value === null) {
      processed[cleanKey] = value;
      continue;
    }

    // Handle arrays (repeated params: ?status=A&status=B)
    if (Array.isArray(value)) {
      processed[cleanKey] = value;
      continue;
    }

    // Handle comma-separated values (?status=A,B)
    if (typeof value === 'string' && value.includes(',')) {
      processed[cleanKey] = value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      continue;
    }

    // Single value
    processed[cleanKey] = value;
  }

  return processed;
}

/**
 * Validation middleware factory
 * Validates request body, query, and params against Zod schemas
 */
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        const processedQuery = preprocessQueryParams(req.query as Record<string, any>);
        const validatedQuery = schemas.query.parse(processedQuery);
        Object.defineProperty(req, 'query', {
          get: () => validatedQuery,
          configurable: true,
          enumerable: true,
        });
      }
      if (schemas.params) {
        Object.assign(req.params, schemas.params.parse(req.params));
      }
      next();
    } catch (error: any) {
      next(error);
    }
  };
};
