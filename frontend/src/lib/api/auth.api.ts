import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SuccessResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from '@/lib/types';
import { apiClient } from './axios';
import { API_ENDPOINTS } from './endpoints';

/**
 * Authentication API functions
 * All API calls related to authentication
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<SuccessResponse<AuthResponse>> => {
    const response = await apiClient.post<SuccessResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<SuccessResponse<{ email: string }>> => {
    const response = await apiClient.post<SuccessResponse<{ email: string }>>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  /**
   * Logout user (clears refresh token cookie on server)
   */
  logout: async (): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  /**
   * Get current user profile
   */
  me: async (): Promise<SuccessResponse<User>> => {
    const response = await apiClient.get<SuccessResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Refresh access token using httpOnly refresh token
   */
  refresh: async (): Promise<SuccessResponse<{ accessToken: string }>> => {
    const response = await apiClient.post<SuccessResponse<{ accessToken: string }>>(API_ENDPOINTS.AUTH.REFRESH);
    return response.data;
  },

  /**
   * Verify email address using token
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    console.log('API verifyEmail response:', response.data);
    return response.data;
  },

  /**
   * Resend email verification
   */
  resendVerification: async (data: ResendVerificationRequest): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data);
    return response.data;
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  },

  /**
   * Reset password using token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data;
  },
};
