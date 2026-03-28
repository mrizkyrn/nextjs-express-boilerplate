import { generateAccessToken, generateRefreshToken, generateTokenPair, verifyAccessToken, verifyRefreshToken } from '../jwt.util';
import { ERROR_CODES } from '@/shared/constants';
import { AppError } from '../error.util';

describe('JWT Utilities', () => {
  describe('generateAccessToken', () => {
    it('should generate valid JWT access token', () => {
      const token = generateAccessToken('user-123', 'test@example.com', 'USER', 'Test User');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include all user data in token payload', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const role = 'ADMIN';
      const name = 'Test User';

      const token = generateAccessToken(userId, email, role, name);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.role).toBe(role);
      expect(decoded.name).toBe(name);
      expect(decoded.type).toBe('access');
    });

    it('should work without optional name parameter', () => {
      const token = generateAccessToken('user-123', 'test@example.com', 'USER');
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.name).toBeUndefined();
    });

    it('should include issued at timestamp', () => {
      const beforeTimestamp = Math.floor(Date.now() / 1000);
      const token = generateAccessToken('user-123', 'test@example.com', 'USER');
      const afterTimestamp = Math.floor(Date.now() / 1000);
      const decoded = verifyAccessToken(token);

      expect(decoded.iat).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(decoded.iat).toBeLessThanOrEqual(afterTimestamp);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate valid JWT refresh token', () => {
      const token = generateRefreshToken('user-123');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include userId and tokenId in payload', () => {
      const userId = 'user-123';
      const token = generateRefreshToken(userId);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(userId);
      expect(decoded.tokenId).toBeDefined();
      expect(typeof decoded.tokenId).toBe('string');
      expect(decoded.type).toBe('refresh');
    });

    it('should generate unique token IDs for each token', () => {
      const token1 = generateRefreshToken('user-123');
      const token2 = generateRefreshToken('user-123');

      const decoded1 = verifyRefreshToken(token1);
      const decoded2 = verifyRefreshToken(token2);

      expect(decoded1.tokenId).not.toBe(decoded2.tokenId);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const tokens = generateTokenPair('user-123', 'test@example.com', 'USER', 'Test User');

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should include expiration times', () => {
      const tokens = generateTokenPair('user-123', 'test@example.com', 'USER');

      expect(tokens.accessTokenExpiresIn).toBe(15 * 60 * 1000); // 15 minutes
      expect(tokens.refreshTokenExpiresIn).toBe(7 * 24 * 60 * 60 * 1000); // 7 days
    });

    it('should generate valid tokens that can be verified', () => {
      const tokens = generateTokenPair('user-123', 'test@example.com', 'USER');

      const accessDecoded = verifyAccessToken(tokens.accessToken);
      const refreshDecoded = verifyRefreshToken(tokens.refreshToken);

      expect(accessDecoded.userId).toBe('user-123');
      expect(refreshDecoded.userId).toBe('user-123');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = generateAccessToken('user-123', 'test@example.com', 'USER', 'Test User');
      const decoded = verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should throw AppError for invalid token format', () => {
      expect(() => verifyAccessToken('invalid.token.format'))
        .toThrow(AppError);
    });

    it('should throw AppError with INVALID_TOKEN code for malformed token', () => {
      try {
        verifyAccessToken('not-a-valid-jwt');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).errorCode).toBe(ERROR_CODES.INVALID_TOKEN);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it('should throw error for empty token', () => {
      expect(() => verifyAccessToken(''))
        .toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = generateRefreshToken('user-123');
      const decoded = verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('user-123');
      expect(decoded.tokenId).toBeDefined();
    });

    it('should throw AppError for invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token'))
        .toThrow(AppError);
    });

    it('should reject access token when verifying as refresh token', () => {
      const accessToken = generateAccessToken('user-123', 'test@example.com', 'USER');
      
      // Access token is signed with access secret, so it should fail when verifying with refresh secret
      expect(() => verifyRefreshToken(accessToken)).toThrow(AppError);
    });
  });
});
