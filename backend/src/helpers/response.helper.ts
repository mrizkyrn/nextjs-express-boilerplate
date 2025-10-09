import { Response } from 'express';
import { SuccessResponse, PaginationMeta, ErrorDetail, ErrorResponse } from '@/types/response.type';
import { ErrorCode } from '@/constants/errorCodes.constant';

/**
 * Send a standardized success response
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param message - Success message
 * @param data - Response data (optional)
 */
export const sendSuccess = <T = any>(res: Response, statusCode: number, message: string, data?: T): Response<SuccessResponse<T>> => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized success response with pagination
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param message - Success message
 * @param data - Response data
 * @param pagination - Pagination metadata
 */
export const sendSuccessWithPagination = <T = any>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  pagination: PaginationMeta
): Response<SuccessResponse<T>> => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
    pagination,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized error response
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param message - Error message
 * @param errorCode - Application-specific error code
 * @param details - Array of error details (optional)
 * @param stack - Error stack trace (optional, included only in development)
 * @returns Express response with error details
 */
export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errorCode: ErrorCode,
  details?: ErrorDetail[],
  stack?: string
): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    message,
    error: {
      code: errorCode,
      ...(details && details.length > 0 && { details }),
      ...(process.env.NODE_ENV === 'development' && stack && { stack }),
    },
  };

  return res.status(statusCode).json(response);
};

/**
 * Helper to calculate pagination metadata
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
