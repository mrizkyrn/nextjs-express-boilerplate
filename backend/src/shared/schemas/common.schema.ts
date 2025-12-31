import { z } from 'zod';

// Pagination fields
export const searchAndPaginationFields = {
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
};

// ID param schema
export const idParamSchema = z.object({
  id: z.cuid('Invalid ID format'),
});

// Helper to create array field that accepts comma-separated or array
export const arrayField = <T extends z.ZodTypeAny>(schema: T) => {
  return z
    .union([schema, z.array(schema)])
    .transform((val) => {
      return Array.isArray(val) ? val : [val];
    })
    .optional();
};

export type IdParam = z.infer<typeof idParamSchema>;
