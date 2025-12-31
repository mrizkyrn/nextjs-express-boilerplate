import { PAGINATION } from '@/shared/constants';
import type { PaginationMeta } from '@/shared/types/response.type';

/**
 * Calculate pagination metadata
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata
 */
export const calculatePagination = (page: number, limit: number, total: number): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Calculate skip value for database query
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Number of items to skip
 */
export const calculateSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Validate and normalize pagination parameters
 * @param page - Page number (default: 1)
 * @param limit - Items per page
 * @returns Normalized pagination parameters
 */
export const normalizePaginationParams = (
  page?: number | string,
  limit?: number | string
): { page: number; limit: number } => {
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedLimit = Math.min(
    PAGINATION.MAX_PAGE_SIZE,
    Math.max(1, Number(limit) || PAGINATION.DEFAULT_PAGE_SIZE)
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
};
