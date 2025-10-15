import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { queryKeys } from '@/lib/api/queryKeys';
import { authApi } from '@/lib/api/services/authService';
import { useAuthStore } from '@/lib/stores/authStore';
import type { ErrorResponse, SuccessResponse } from '@/lib/types/api';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/lib/types/auth';
import { UserRole } from '@/lib/types/user';
import { getErrorMessage, logError } from '@/lib/utils/errorHandler';

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const router = useRouter();

  return useMutation<SuccessResponse<RegisterResponse>, AxiosError<ErrorResponse>, RegisterRequest>({
    mutationFn: async (data: RegisterRequest): Promise<SuccessResponse<RegisterResponse>> => {
      return await authApi.register(data);
    },
    onSuccess: (response) => {
      const { data, message } = response;

      // Save timestamp to limit resends
      localStorage.setItem('email_verification_resend_time', Date.now().toString());

      toast.success(message, { description: `Please check ${data.email} for verification email` });
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    },
    onError: (error) => {
      logError('Registration', error);
      const errorMessage = getErrorMessage(error, 'Unable to create account. Please try again.');
      toast.error('Registration failed', { description: errorMessage });
    },
    retry: false,
  });
};

/**
 * Hook for user login
 */
export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<LoginResponse>, AxiosError<ErrorResponse>, LoginRequest>({
    mutationFn: async (credentials: LoginRequest): Promise<SuccessResponse<LoginResponse>> => {
      return await authApi.login(credentials);
    },
    onSuccess: (response) => {
      const { data, message } = response;
      setAuth(data.user, data.accessToken);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      toast.success(message, { description: `Logged in as ${data.user.email}` });

      if (data.user.role === UserRole.ADMIN) {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    },
    onError: (error) => {
      logError('Login', error);
      const errorMessage = getErrorMessage(error, 'Invalid email or password');
      toast.error('Login failed', { description: errorMessage });
    },
    retry: false,
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, void>({
    mutationFn: async (): Promise<SuccessResponse<null>> => {
      return await authApi.logout();
    },
    onSuccess: (response) => {
      const { message } = response;
      clearAuth();
      queryClient.clear();
      toast.success(message, { description: 'See you next time!' });
      router.push('/login');
    },
    onError: () => {
      // Even if logout fails on server, clear local state for security
      clearAuth();
      queryClient.clear();
      toast.info('Logged out locally', { description: 'Your session has been cleared.' });
      router.push('/login');
    },
    retry: false,
  });
};

/**
 * Hook for email verification
 */
export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, VerifyEmailRequest>({
    mutationFn: async (data: VerifyEmailRequest): Promise<SuccessResponse<null>> => {
      return await authApi.verifyEmail(data);
    },
    onSuccess: (response) => {
      const { message } = response;
      toast.success(message, { description: 'You can now log in to your account' });
      router.push('/login');
    },
    onError: (error) => {
      logError('Email Verification', error);
      const errorMessage = getErrorMessage(error, 'Invalid or expired verification token');
      toast.error('Verification failed', { description: errorMessage });
    },
    retry: false,
  });
};

/**
 * Hook for resending verification email
 */
export const useResendVerification = () => {
  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, ResendVerificationRequest>({
    mutationFn: async (data: ResendVerificationRequest): Promise<SuccessResponse<null>> => {
      return await authApi.resendVerification(data);
    },
    onSuccess: (response) => {
      const { message } = response;
      toast.success(message, { description: 'Please check your email inbox' });
    },
    onError: (error) => {
      logError('Resend Verification', error);
      const errorMessage = getErrorMessage(error, 'Failed to resend verification email');
      toast.error('Resend failed', { description: errorMessage });
    },
    retry: false,
  });
};

/**
 * Hook for requesting password reset
 */
export const useForgotPassword = () => {
  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, ForgotPasswordRequest>({
    mutationFn: async (data: ForgotPasswordRequest): Promise<SuccessResponse<null>> => {
      return await authApi.forgotPassword(data);
    },
    onSuccess: (response) => {
      const { message } = response;
      toast.success(message, { description: 'Please check your email for instructions' });
    },
    onError: (error) => {
      logError('Forgot Password', error);
      const errorMessage = getErrorMessage(error, 'Failed to process password reset request');
      toast.error('Request failed', { description: errorMessage });
    },
    retry: false,
  });
};

/**
 * Hook for resetting password
 */
export const useResetPassword = () => {
  const router = useRouter();

  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, ResetPasswordRequest>({
    mutationFn: async (data: ResetPasswordRequest): Promise<SuccessResponse<null>> => {
      return await authApi.resetPassword(data);
    },
    onSuccess: (response) => {
      const { message } = response;
      toast.success(message, { description: 'You can now log in with your new password' });
      router.push('/login');
    },
    onError: (error) => {
      logError('Password Reset', error);
      const errorMessage = getErrorMessage(error, 'Invalid or expired reset token');
      toast.error('Password reset failed', { description: errorMessage });
    },
    retry: false,
  });
};
