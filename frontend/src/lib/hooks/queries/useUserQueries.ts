import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/api/queryKeys';
import { userApi } from '@/lib/api/services/userService';
import type { GetUsersParams } from '@/lib/types/user';

/**
 * Get paginated list of users (admin only)
 */
export const useUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: queryKeys.users.list(params as Record<string, unknown>),
    queryFn: () => userApi.getUsers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get user statistics (admin only)
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: () => userApi.getUserStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get user by ID (admin only)
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get current user profile
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => userApi.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
