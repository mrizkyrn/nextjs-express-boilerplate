import type { AuthResponse, LoginRequest, RegisterRequest, SuccessResponse, User } from '@/lib/types';
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
  register: async (data: RegisterRequest): Promise<SuccessResponse<AuthResponse>> => {
    const response = await apiClient.post<SuccessResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, data);
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
};
