import { AxiosError } from 'axios';

import type { ErrorResponse } from '@/lib/types/api';

/**
 * User-friendly error messages based on HTTP status codes
 */
const STATUS_MESSAGES: Record<number, string> = {
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
  504: 'Request timeout. Please try again.',
};

/**
 * Extract user-friendly error message from API error
 * @param error - Axios error object
 * @param fallbackMessage - Default message if no suitable message found
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: AxiosError<ErrorResponse> | null, fallbackMessage?: string): string => {
  // Network error or no response
  if (!error?.response) {
    return 'Network error. Please check your connection and try again.';
  }

  const { status, data } = error.response;

  // For 500 errors, never use backend message to avoid exposing internal details
  if (status >= 500) {
    return STATUS_MESSAGES[status] || 'Server error. Please try again later.';
  }

  // For all other statuses, trust the backend message if provided
  if (data?.message) {
    return data.message;
  }

  // Use predefined user-friendly message based on status code
  const statusMessage = STATUS_MESSAGES[status];
  if (statusMessage) {
    return statusMessage;
  }

  // Fallback to custom message or generic one
  return fallbackMessage || 'Something went wrong. Please try again.';
};

/**
 * Log error for debugging (only in development)
 * @param context - Context where error occurred (e.g., "Login", "Registration")
 * @param error - Axios error object
 */
export const logError = (context: string, error: AxiosError<ErrorResponse> | null): void => {
  if (process.env.NODE_ENV === 'development' && error) {
    console.group(`🔴 ${context} Error`);
    console.error('Message:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method?.toUpperCase());

    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  }
};

/**
 * Check if error is a specific type
 */
export const isErrorType = {
  network: (error: AxiosError | null): boolean => {
    return !error?.response;
  },

  unauthorized: (error: AxiosError | null): boolean => {
    return error?.response?.status === 401;
  },

  forbidden: (error: AxiosError | null): boolean => {
    return error?.response?.status === 403;
  },

  notFound: (error: AxiosError | null): boolean => {
    return error?.response?.status === 404;
  },

  validation: (error: AxiosError | null): boolean => {
    return error?.response?.status === 400 || error?.response?.status === 422;
  },

  rateLimit: (error: AxiosError | null): boolean => {
    return error?.response?.status === 429;
  },

  server: (error: AxiosError | null): boolean => {
    const status = error?.response?.status;
    return !!status && status >= 500 && status < 600;
  },
};
