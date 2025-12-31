import { PASSWORD } from '@/shared/constant';
import bcrypt from 'bcryptjs';

/**
 * Hash a password
 * @param password - Plain text password
 * @return Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, PASSWORD.SALT_ROUNDS);
};

/** Compare a password with its hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @return True if password matches the hash, false otherwise
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
