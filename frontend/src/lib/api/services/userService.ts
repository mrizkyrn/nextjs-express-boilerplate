import type { SuccessResponse } from '@/lib/types/api';
import type {
  CreateUserRequest,
  GetUsersParams,
  UpdatePasswordRequest,
  UpdateUserRequest,
  UserResponse,
  UserStats,
} from '@/lib/types/user';
import { apiClient } from '../client/axios';

const USERS_BASE = '/users';

export const userApi = {
  /**
   * Get paginated list of users (admin only)
   */
  getUsers: async (params?: GetUsersParams): Promise<SuccessResponse<UserResponse[]>> => {
    const response = await apiClient.get<SuccessResponse<UserResponse[]>>(USERS_BASE, { params });
    return response.data;
  },

  /**
   * Get user statistics (admin only)
   */
  getUserStats: async (): Promise<SuccessResponse<UserStats>> => {
    const response = await apiClient.get<SuccessResponse<UserStats>>(`${USERS_BASE}/stats`);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<SuccessResponse<UserResponse>> => {
    const response = await apiClient.get<SuccessResponse<UserResponse>>(`${USERS_BASE}/me`);
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateCurrentUser: async (data: UpdateUserRequest): Promise<SuccessResponse<UserResponse>> => {
    const response = await apiClient.patch<SuccessResponse<UserResponse>>(`${USERS_BASE}/me`, data);
    return response.data;
  },

  /**
   * Update current user password
   */
  updatePassword: async (data: UpdatePasswordRequest): Promise<SuccessResponse<null>> => {
    const response = await apiClient.patch<SuccessResponse<null>>(`${USERS_BASE}/me/password`, data);
    return response.data;
  },

  /**
   * Get user by ID (admin only)
   */
  getUserById: async (id: string): Promise<SuccessResponse<UserResponse>> => {
    const response = await apiClient.get<SuccessResponse<UserResponse>>(`${USERS_BASE}/${id}`);
    return response.data;
  },

  /**
   * Create new user (admin only)
   */
  createUser: async (data: CreateUserRequest): Promise<SuccessResponse<UserResponse>> => {
    const response = await apiClient.post<SuccessResponse<UserResponse>>(USERS_BASE, data);
    return response.data;
  },

  /**
   * Update user by ID (admin only)
   */
  updateUser: async (id: string, data: UpdateUserRequest): Promise<SuccessResponse<UserResponse>> => {
    const response = await apiClient.patch<SuccessResponse<UserResponse>>(`${USERS_BASE}/${id}`, data);
    return response.data;
  },

  /**
   * Delete user by ID (admin only)
   */
  deleteUser: async (id: string): Promise<SuccessResponse<null>> => {
    const response = await apiClient.delete<SuccessResponse<null>>(`${USERS_BASE}/${id}`);
    return response.data;
  },

  /**
   * Batch delete multiple users (admin only)
   */
  batchDeleteUsers: async (userIds: string[]): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(`${USERS_BASE}/batch/delete`, { userIds });
    return response.data;
  },

  /**
   * Batch update user roles (admin only)
   */
  batchUpdateRole: async (userIds: string[], role: string): Promise<SuccessResponse<null>> => {
    const response = await apiClient.post<SuccessResponse<null>>(`${USERS_BASE}/batch/update-role`, { userIds, role });
    return response.data;
  },
};
