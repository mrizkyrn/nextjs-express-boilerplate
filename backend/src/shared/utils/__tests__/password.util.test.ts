import { hashPassword, comparePassword } from '../password.util';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const plainPassword = 'Password123!';
      const hashedPassword = await hashPassword(plainPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    it('should generate different hashes for same password', async () => {
      const plainPassword = 'Password123!';
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2); // bcrypt uses random salt
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const plainPassword = 'Password123!';
      const hashedPassword = await hashPassword(plainPassword);

      const result = await comparePassword(plainPassword, hashedPassword);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const plainPassword = 'Password123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await hashPassword(plainPassword);

      const result = await comparePassword(wrongPassword, hashedPassword);

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hashedPassword = await hashPassword('Password123!');

      const result = await comparePassword('', hashedPassword);

      expect(result).toBe(false);
    });
  });
});
