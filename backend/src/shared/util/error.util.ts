import { ERROR_CODES, ErrorCode } from '@/shared/constant';
import type { ErrorDetail } from '@/types/response.type';

/**
 * Custom error class with error code support
 *
 */
export class AppError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly details?: ErrorDetail[];

  constructor(
    public statusCode: number,
    public message: string,
    errorCode?: ErrorCode,
    details?: ErrorDetail[],
    public isOperational = true
  ) {
    super(message);
    this.errorCode = errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
