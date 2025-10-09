/**
 * Data Validation Utilities
 * Helper functions for validating API response data
 */

/**
 * Check if a value is not null or undefined
 */
export const isNotNullish = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Check if a value is a non-empty array
 */
export const isNonEmptyArray = <T>(value: T[]): boolean => {
  return Array.isArray(value) && value.length > 0;
};

/**
 * Check if a value is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a string is not empty (after trimming)
 */
export const isNonEmptyString = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validate user data structure
 */
export const isValidUser = (user: any): boolean => {
  return (
    user &&
    typeof user === 'object' &&
    isNotNullish(user.id) &&
    isNonEmptyString(user.email) &&
    isNonEmptyString(user.name)
  );
};

/**
 * Validate auth response data
 */
export const isValidAuthResponse = (data: any): boolean => {
  return (
    data &&
    typeof data === 'object' &&
    isValidUser(data.user) &&
    isNonEmptyString(data.accessToken)
  );
};

/**
 * Generic data validator with custom validation function
 */
export const validateData = <T>(
  data: T,
  validator: (data: T) => boolean,
  errorMessage = 'Invalid data received'
): { isValid: boolean; error?: string } => {
  const isValid = validator(data);

  return {
    isValid,
    error: isValid ? undefined : errorMessage,
  };
};