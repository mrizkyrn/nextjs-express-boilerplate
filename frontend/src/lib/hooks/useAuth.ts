import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/stores/authStore';
import { queryKeys } from '@/lib/api/queryKeys';

export const useAuth = () => {
  const { user, isAuthenticated, accessToken } = useAuthStore();

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authApi.me,
    enabled: isAuthenticated && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    user: response?.data || user,
    isAuthenticated,
    isLoading,
    isError,
    error,
  };
};
