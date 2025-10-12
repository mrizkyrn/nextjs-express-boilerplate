/**
 * Generate secure random token
 * @param length - Length of the token
 * @returns Random token string
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length];
  }

  return token;
};

/**
 * Calculate token expiration time
 * @param minutes - Minutes until expiration
 * @returns Expiration Date object
 */
export const calculateTokenExpiry = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Check if a token is expired
 * @param expiryDate - Expiration Date of the token
 * @returns True if expired, false otherwise
 */
export const isTokenExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};
