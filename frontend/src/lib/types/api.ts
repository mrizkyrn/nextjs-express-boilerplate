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
}

export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface SuccessResponseWithData<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface SuccessResponseWithoutData {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: ErrorObject;
}

export type ApiResponse<T = never> = T extends never ? SuccessResponseWithoutData | ErrorResponse : SuccessResponseWithData<T> | ErrorResponse;
