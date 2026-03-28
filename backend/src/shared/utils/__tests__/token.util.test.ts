import { generateSecureToken, calculateTokenExpiry, isTokenExpired } from '../token.util';

describe('Token Utilities', () => {
  describe('generateSecureToken', () => {
    it('should generate token with default length of 32', () => {
      const token = generateSecureToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(32);
    });

    it('should generate token with custom length', () => {
      const token = generateSecureToken(64);

      expect(token.length).toBe(64);
    });

    it('should generate token with short length', () => {
      const token = generateSecureToken(8);

      expect(token.length).toBe(8);
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      const token3 = generateSecureToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });

    it('should only contain alphanumeric characters', () => {
      const token = generateSecureToken(100);
      const alphanumericRegex = /^[A-Za-z0-9]+$/;

      expect(alphanumericRegex.test(token)).toBe(true);
    });

    it('should generate different tokens for same length', () => {
      const tokens = Array.from({ length: 10 }, () => generateSecureToken(32));
      const uniqueTokens = new Set(tokens);

      expect(uniqueTokens.size).toBe(10);
    });

    it('should handle minimum length of 1', () => {
      const token = generateSecureToken(1);

      expect(token.length).toBe(1);
      expect(/[A-Za-z0-9]/.test(token)).toBe(true);
    });

    it('should generate very long tokens', () => {
      const token = generateSecureToken(256);

      expect(token.length).toBe(256);
    });
  });

  describe('calculateTokenExpiry', () => {
    it('should calculate expiry date correctly', () => {
      const minutes = 60;
      const beforeTime = Date.now();
      const expiryDate = calculateTokenExpiry(minutes);
      const afterTime = Date.now();

      const expectedTime = beforeTime + minutes * 60 * 1000;
      const actualTime = expiryDate.getTime();

      expect(actualTime).toBeGreaterThanOrEqual(expectedTime);
      expect(actualTime).toBeLessThanOrEqual(afterTime + minutes * 60 * 1000);
    });

    it('should calculate expiry for 15 minutes', () => {
      const expiryDate = calculateTokenExpiry(15);
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 15 * 60 * 1000);

      const timeDiff = Math.abs(expiryDate.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(100); // Allow 100ms tolerance
    });

    it('should calculate expiry for 24 hours (1440 minutes)', () => {
      const expiryDate = calculateTokenExpiry(1440);
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 1440 * 60 * 1000);

      const timeDiff = Math.abs(expiryDate.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(100);
    });

    it('should return Date object', () => {
      const expiryDate = calculateTokenExpiry(30);

      expect(expiryDate).toBeInstanceOf(Date);
    });

    it('should calculate expiry for very short duration', () => {
      const expiryDate = calculateTokenExpiry(1);
      const expectedTime = Date.now() + 60 * 1000;

      expect(expiryDate.getTime()).toBeGreaterThanOrEqual(expectedTime - 100);
      expect(expiryDate.getTime()).toBeLessThanOrEqual(expectedTime + 100);
    });

    it('should calculate expiry for 7 days (10080 minutes)', () => {
      const expiryDate = calculateTokenExpiry(10080);
      const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;

      const timeDiff = Math.abs(expiryDate.getTime() - sevenDaysFromNow);
      expect(timeDiff).toBeLessThan(100);
    });

    it('should handle zero minutes', () => {
      const expiryDate = calculateTokenExpiry(0);
      const now = Date.now();

      expect(expiryDate.getTime()).toBeGreaterThanOrEqual(now - 10);
      expect(expiryDate.getTime()).toBeLessThanOrEqual(now + 10);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for future expiry date', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      expect(isTokenExpired(futureDate)).toBe(false);
    });

    it('should return true for past expiry date', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

      expect(isTokenExpired(pastDate)).toBe(true);
    });

    it('should return true for expiry date that just passed', () => {
      const justExpired = new Date(Date.now() - 1000); // 1 second ago

      expect(isTokenExpired(justExpired)).toBe(true);
    });

    it('should return false for expiry date in near future', () => {
      const nearFuture = new Date(Date.now() + 1000); // 1 second from now

      expect(isTokenExpired(nearFuture)).toBe(false);
    });

    it('should handle expiry date exactly now', () => {
      const now = new Date(Date.now());
      
      // Could be true or false depending on execution time
      const result = isTokenExpired(now);
      expect(typeof result).toBe('boolean');
    });

    it('should return true for very old dates', () => {
      const veryOld = new Date('2020-01-01');

      expect(isTokenExpired(veryOld)).toBe(true);
    });

    it('should return false for far future dates', () => {
      const farFuture = new Date('2030-01-01');

      expect(isTokenExpired(farFuture)).toBe(false);
    });

    it('should work with calculated expiry dates', () => {
      const futureExpiry = calculateTokenExpiry(30);
      const pastExpiry = new Date(Date.now() - 30 * 60 * 1000);

      expect(isTokenExpired(futureExpiry)).toBe(false);
      expect(isTokenExpired(pastExpiry)).toBe(true);
    });
  });

  describe('Integration: Token generation and expiry', () => {
    it('should create token with future expiry that is not expired', () => {
      const token = generateSecureToken(32);
      const expiry = calculateTokenExpiry(60);

      expect(token).toBeDefined();
      expect(isTokenExpired(expiry)).toBe(false);
    });

    it('should work together for complete token lifecycle', () => {
      // Generate token
      const token = generateSecureToken(64);
      expect(token.length).toBe(64);

      // Set expiry for 1 minute
      const expiry = calculateTokenExpiry(1);
      expect(expiry.getTime()).toBeGreaterThan(Date.now());

      // Check not expired
      expect(isTokenExpired(expiry)).toBe(false);

      // Simulate past expiry
      const pastExpiry = new Date(Date.now() - 1000);
      expect(isTokenExpired(pastExpiry)).toBe(true);
    });
  });
});
