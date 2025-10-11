import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/stores/authStore';
import { queryKeys } from '@/lib/api/queryKeys';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from '@/lib/types/auth';
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

  return useMutation<SuccessResponse<{ email: string }>, AxiosError<ErrorResponse>, RegisterRequest>({
    mutationFn: async (data: RegisterRequest): Promise<SuccessResponse<{ email: string }>> => {
      return await authApi.register(data);
    },
    onSuccess: (apiResponse) => {
      const { data, message } = apiResponse;

      // Use API success message for better UX
      toast.success(message, {
        description: `Please check ${data?.email} for verification email`,
      });

      // Navigate to verify-email page with email as query param
      router.push(`/verify-email?email=${encodeURIComponent(data?.email || '')}`);
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

/**
 * Hook for email verification
 * @returns Mutation object with verifyEmail function and state
 */
export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, VerifyEmailRequest>({
    mutationFn: async (data: VerifyEmailRequest): Promise<SuccessResponse<null>> => {
      return await authApi.verifyEmail(data);
    },
    onSuccess: (apiResponse) => {
      const { message } = apiResponse;

      toast.success(message, {
        description: 'You can now log in to your account',
      });

      // Navigate to login
      router.push('/login');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Invalid or expired verification token';

      toast.error('Verification failed', {
        description: errorMessage,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Verification error:', error);
      }
    },
    retry: false,
  });
};

/**
 * Hook for resending verification email
 * @returns Mutation object with resendVerification function and state
 */
export const useResendVerification = () => {
  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, ResendVerificationRequest>({
    mutationFn: async (data: ResendVerificationRequest): Promise<SuccessResponse<null>> => {
      return await authApi.resendVerification(data);
    },
    onSuccess: (apiResponse) => {
      const { message } = apiResponse;

      toast.success(message, {
        description: 'Please check your email inbox',
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Failed to resend verification email';

      toast.error('Resend failed', {
        description: errorMessage,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Resend verification error:', error);
      }
    },
    retry: false,
  });
};

/**
 * Hook for requesting password reset
 * @returns Mutation object with forgotPassword function and state
 */
export const useForgotPassword = () => {
  const router = useRouter();

  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, ForgotPasswordRequest>({
    mutationFn: async (data: ForgotPasswordRequest): Promise<SuccessResponse<null>> => {
      return await authApi.forgotPassword(data);
    },
    onSuccess: (apiResponse) => {
      const { message } = apiResponse;

      toast.success(message, {
        description: 'Please check your email for instructions',
      });

      // Navigate to a confirmation page or back to login
      router.push('/login');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Failed to process password reset request';

      toast.error('Request failed', {
        description: errorMessage,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Forgot password error:', error);
      }
    },
    retry: false,
  });
};

/**
 * Hook for resetting password
 * @returns Mutation object with resetPassword function and state
 */
export const useResetPassword = () => {
  const router = useRouter();

  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, ResetPasswordRequest>({
    mutationFn: async (data: ResetPasswordRequest): Promise<SuccessResponse<null>> => {
      return await authApi.resetPassword(data);
    },
    onSuccess: (apiResponse) => {
      const { message } = apiResponse;

      toast.success(message, {
        description: 'You can now log in with your new password',
      });

      // Navigate to login
      router.push('/login');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Invalid or expired reset token';

      toast.error('Password reset failed', {
        description: errorMessage,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Reset password error:', error);
      }
    },
    retry: false,
  });
};
