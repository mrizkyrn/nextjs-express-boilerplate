import type {
  CreateUserRequest,
  GetUsersParams,
  SuccessResponse,
  UpdatePasswordRequest,
  UpdateUserRequest,
  User,
  UserStats,
} from '@/lib/types';
import { apiClient } from '../client/axios';

const USERS_BASE = '/users';

export const userApi = {
  /**
   * Get paginated list of users (admin only)
   */
  getUsers: async (params?: GetUsersParams): Promise<SuccessResponse<User[]>> => {
    const response = await apiClient.get<SuccessResponse<User[]>>(USERS_BASE, { params });
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
  getCurrentUser: async (): Promise<SuccessResponse<User>> => {
    const response = await apiClient.get<SuccessResponse<User>>(`${USERS_BASE}/me`);
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateCurrentUser: async (data: UpdateUserRequest): Promise<SuccessResponse<User>> => {
    const response = await apiClient.patch<SuccessResponse<User>>(`${USERS_BASE}/me`, data);
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
  getUserById: async (id: string): Promise<SuccessResponse<User>> => {
    const response = await apiClient.get<SuccessResponse<User>>(`${USERS_BASE}/${id}`);
    return response.data;
  },

  /**
   * Create new user (admin only)
   */
  createUser: async (data: CreateUserRequest): Promise<SuccessResponse<User>> => {
    const response = await apiClient.post<SuccessResponse<User>>(USERS_BASE, data);
    return response.data;
  },

  /**
   * Update user by ID (admin only)
   */
  updateUser: async (id: string, data: UpdateUserRequest): Promise<SuccessResponse<User>> => {
    const response = await apiClient.patch<SuccessResponse<User>>(`${USERS_BASE}/${id}`, data);
    return response.data;
  },

  /**
   * Delete user by ID (admin only)
   */
  deleteUser: async (id: string): Promise<SuccessResponse<null>> => {
    const response = await apiClient.delete<SuccessResponse<null>>(`${USERS_BASE}/${id}`);
    return response.data;
  },
};
