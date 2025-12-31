import { UserRole } from '@prisma/client';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStatsResponse {
  totalUsers: number;
  roleDistribution: { role: UserRole; count: number }[];
  emailVerificationStats: { verified: number; unverified: number };
}
