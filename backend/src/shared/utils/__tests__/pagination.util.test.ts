import { calculatePagination, calculateSkip, normalizePaginationParams } from '../pagination.util';
import { PAGINATION } from '@/shared/constants';

describe('Pagination Utilities', () => {
  describe('calculatePagination', () => {
    it('should calculate pagination metadata correctly for first page', () => {
      const result = calculatePagination(1, 10, 50);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('should calculate pagination metadata correctly for middle page', () => {
      const result = calculatePagination(3, 10, 50);

      expect(result).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it('should calculate pagination metadata correctly for last page', () => {
      const result = calculatePagination(5, 10, 50);

      expect(result).toEqual({
        page: 5,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });

    it('should handle partial last page correctly', () => {
      const result = calculatePagination(3, 10, 25);

      expect(result).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });

    it('should handle empty results', () => {
      const result = calculatePagination(1, 10, 0);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('should handle single page of results', () => {
      const result = calculatePagination(1, 10, 5);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('should calculate correct total pages with remainder', () => {
      const result = calculatePagination(1, 10, 23);

      expect(result.totalPages).toBe(3);
      expect(result.hasNextPage).toBe(true);
    });
  });

  describe('calculateSkip', () => {
    it('should calculate skip value for first page', () => {
      const skip = calculateSkip(1, 10);

      expect(skip).toBe(0);
    });

    it('should calculate skip value for second page', () => {
      const skip = calculateSkip(2, 10);

      expect(skip).toBe(10);
    });

    it('should calculate skip value for page 5', () => {
      const skip = calculateSkip(5, 20);

      expect(skip).toBe(80);
    });

    it('should calculate skip value for large page numbers', () => {
      const skip = calculateSkip(100, 50);

      expect(skip).toBe(4950);
    });

    it('should handle page 1 with different limits', () => {
      expect(calculateSkip(1, 5)).toBe(0);
      expect(calculateSkip(1, 25)).toBe(0);
      expect(calculateSkip(1, 100)).toBe(0);
    });
  });

  describe('normalizePaginationParams', () => {
    it('should use defaults when no parameters provided', () => {
      const result = normalizePaginationParams();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    });

    it('should use default page when undefined', () => {
      const result = normalizePaginationParams(undefined, 20);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should use default limit when undefined', () => {
      const result = normalizePaginationParams(2, undefined);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    });

    it('should normalize valid numeric parameters', () => {
      const result = normalizePaginationParams(3, 25);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
    });

    it('should convert string parameters to numbers', () => {
      const result = normalizePaginationParams('5', '30');

      expect(result.page).toBe(5);
      expect(result.limit).toBe(30);
    });

    it('should enforce minimum page of 1', () => {
      expect(normalizePaginationParams(0, 10).page).toBe(1);
      expect(normalizePaginationParams(-5, 10).page).toBe(1);
    });

    it('should enforce minimum limit of 1', () => {
      expect(normalizePaginationParams(1, 0).limit).toBe(1);
      expect(normalizePaginationParams(1, -10).limit).toBe(1);
    });

    it('should enforce maximum limit', () => {
      const result = normalizePaginationParams(1, 200);

      expect(result.limit).toBe(PAGINATION.MAX_PAGE_SIZE);
    });

    it('should handle invalid string inputs', () => {
      const result = normalizePaginationParams('invalid', 'bad');

      expect(result.page).toBe(1);
      expect(result.limit).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    });

    it('should handle NaN values', () => {
      const result = normalizePaginationParams(NaN, NaN);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    });

    it('should handle decimal values by converting to integer', () => {
      const result = normalizePaginationParams(2.7, 15.3);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
    });

    it('should cap extremely large limit values', () => {
      const result = normalizePaginationParams(1, 999999);

      expect(result.limit).toBe(PAGINATION.MAX_PAGE_SIZE);
    });
  });
});
