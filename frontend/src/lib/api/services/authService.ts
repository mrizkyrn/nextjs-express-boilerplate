import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  SuccessResponse,
  User,
  VerifyEmailRequest,
} from '@/lib/types';
import { apiClient } from '../client/axios';

const AUTH_BASE = '/auth';

export const authApi = {
  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<SuccessResponse<RegisterResponse>> => {
    const response = await apiClient.post<SuccessResponse<RegisterResponse>>(`${AUTH_BASE}/register`, data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<SuccessResponse<LoginResponse>> => {
    const response = await apiClient.post<SuccessResponse<LoginResponse>>(`${AUTH_BASE}/login`, credentials);
    return response.data;
  },

  /**
   * Logout user (clears refresh token cookie on server)
   */
  logout: async (): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(`${AUTH_BASE}/logout`);
    return response.data;
  },

  /**
   * Get current user profile
   */
  me: async (): Promise<SuccessResponse<User>> => {
    const response = await apiClient.get<SuccessResponse<User>>(`${AUTH_BASE}/me`);
    return response.data;
  },

  /**
   * Refresh access token using httpOnly refresh token
   */
  refresh: async (): Promise<SuccessResponse<{ accessToken: string }>> => {
    const response = await apiClient.post<SuccessResponse<{ accessToken: string }>>(`${AUTH_BASE}/refresh`);
    return response.data;
  },

  /**
   * Verify email address using token
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(`${AUTH_BASE}/verify-email`, data);
    return response.data;
  },

  /**
   * Resend email verification
   */
  resendVerification: async (data: ResendVerificationRequest): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(`${AUTH_BASE}/resend-verification`, data);
    return response.data;
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(`${AUTH_BASE}/forgot-password`, data);
    return response.data;
  },

  /**
   * Reset password using token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(`${AUTH_BASE}/reset-password`, data);
    return response.data;
  },
};
