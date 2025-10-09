export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ErrorObject {
  code: string;
  details?: ErrorDetail[];
  stack?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  pagination?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: ErrorObject;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;
