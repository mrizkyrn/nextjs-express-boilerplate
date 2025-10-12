import { Response } from 'express';
import { ErrorCode } from '@/config/error.config';
import type { ErrorDetail, ErrorResponse, PaginationMeta, SuccessResponse } from '@/types/response.type';

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
