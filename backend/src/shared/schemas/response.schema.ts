import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { registerSchema as registerOpenAPISchema } from '../utils/openapi.util';

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

/**
 * Base success response wrapper
 */
export const successResponseSchema = z
  .object({
    success: z.literal(true).openapi({ description: 'Indicates successful operation' }),
    message: z.string().openapi({ description: 'Success message', example: 'Operation completed successfully' }),
    data: z.any().optional().openapi({ description: 'Response data payload' }),
  })
  .openapi('SuccessResponse', {
    description: 'Standard success response wrapper',
  });

/**
 * Error response structure
 */
export const errorResponseSchema = z
  .object({
    success: z.literal(false).openapi({ description: 'Indicates failed operation' }),
    message: z.string().openapi({ description: 'Error message', example: 'An error occurred' }),
    errors: z
      .array(
        z.object({
          field: z.string().optional().openapi({ description: 'Field name (for validation errors)', example: 'email' }),
          message: z.string().openapi({ description: 'Error message', example: 'Invalid email address' }),
        })
      )
      .optional()
      .openapi({ description: 'Array of validation errors' }),
  })
  .openapi('ErrorResponse', {
    description: 'Standard error response structure',
  });

/**
 * Pagination metadata
 */
export const paginationMetaSchema = z
  .object({
    page: z.number().int().positive().openapi({ description: 'Current page number', example: 1 }),
    limit: z.number().int().positive().openapi({ description: 'Items per page', example: 10 }),
    total: z.number().int().nonnegative().openapi({ description: 'Total number of items', example: 100 }),
    totalPages: z.number().int().nonnegative().openapi({ description: 'Total number of pages', example: 10 }),
    hasNextPage: z.boolean().openapi({ description: 'Whether there is a next page', example: true }),
    hasPrevPage: z.boolean().openapi({ description: 'Whether there is a previous page', example: false }),
  })
  .openapi('PaginationMeta', {
    description: 'Pagination metadata',
  });

/**
 * Paginated response wrapper
 */
export const paginatedResponseSchema = z
  .object({
    success: z.literal(true).openapi({ description: 'Indicates successful operation' }),
    message: z.string().openapi({ description: 'Success message', example: 'Data retrieved successfully' }),
    data: z.array(z.any()).openapi({ description: 'Array of items' }),
    meta: paginationMetaSchema.openapi({ description: 'Pagination metadata' }),
  })
  .openapi('PaginatedResponse', {
    description: 'Standard paginated response wrapper',
  });

// Register schemas in OpenAPI registry
registerOpenAPISchema('SuccessResponse', successResponseSchema);
registerOpenAPISchema('ErrorResponse', errorResponseSchema);
registerOpenAPISchema('PaginationMeta', paginationMetaSchema);
registerOpenAPISchema('PaginatedResponse', paginatedResponseSchema);

// Export types
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;
