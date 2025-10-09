import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/stores/authStore';
import { queryKeys } from '@/lib/api/queryKeys';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/lib/types/auth';
import type { ErrorResponse, SuccessResponse } from '@/lib/types/api';

/**
 * Hook for user login
 * @returns Mutation object with login function and state
 */
export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<AuthResponse>, AxiosError<ErrorResponse>, LoginRequest>({
    mutationFn: async (credentials: LoginRequest): Promise<SuccessResponse<AuthResponse>> => {
      return await authApi.login(credentials);
    },
    onSuccess: (response) => {
      const { data, message } = response;

      // Update auth state with the data
      setAuth(data!.user, data!.accessToken);

      // Invalidate user queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });

      // Use API success message for better UX
      toast.success(message, {
        description: `Logged in as ${data!.user.email}`,
      });

      // Navigate to dashboard
      router.push('/dashboard');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Invalid email or password';

      toast.error('Login failed', {
        description: errorMessage,
      });

      // Log error for debugging (remove in production or use proper logging service)
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
    },
    retry: false, // Don't retry auth requests
  });
};

/**
 * Hook for user registration
 * @returns Mutation object with register function and state
 */
export const useRegister = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<AuthResponse>, AxiosError<ErrorResponse>, RegisterRequest>({
    mutationFn: async (data: RegisterRequest): Promise<SuccessResponse<AuthResponse>> => {
      return await authApi.register(data);
    },
    onSuccess: (apiResponse) => {
      const { data, message } = apiResponse;

      // Update auth state
      setAuth(data!.user, data!.accessToken);

      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });

      // Use API success message for better UX
      toast.success(message, {
        description: `Welcome, ${data!.user.name}!`,
      });

      // Navigate to dashboard
      router.push('/dashboard');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Unable to create account. Please try again.';

      toast.error('Registration failed', {
        description: errorMessage,
      });

      // Log error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error);
      }
    },
    retry: false, // Don't retry auth requests
  });
};

/**
 * Hook for user logout
 * @returns Mutation object with logout function and state
 */
export const useLogout = () => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, void>({
    mutationFn: async (): Promise<SuccessResponse<null>> => {
      return await authApi.logout();
    },
    onSuccess: (apiResponse) => {
      const { message } = apiResponse;

      // Clear auth state
      clearAuth();

      // Clear all cached queries
      queryClient.clear();

      // Use API success message
      toast.success(message, {
        description: 'See you next time!',
      });

      // Navigate to login
      router.push('/login');
    },
    onError: (error) => {
      // Even if logout fails on server, clear local state for security
      clearAuth();
      queryClient.clear();

      toast.info('Logged out locally', {
        description: 'Your session has been cleared.',
      });

      // Navigate to login anyway
      router.push('/login');

      // Log error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout error:', error);
      }
    },
    retry: false, // Don't retry logout
  });
};
