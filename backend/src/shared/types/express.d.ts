import { AuthenticatedUser } from '@/types/auth.type';

// Extend Express Request to include authenticated user info
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
