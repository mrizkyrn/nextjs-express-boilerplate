import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { queryKeys } from '@/lib/api/queryKeys';
import { userApi } from '@/lib/api/services/userService';
import type { CreateUserRequest, UpdatePasswordRequest, UpdateUserRequest, UserResponse } from '@/lib/types/user';
import type { ErrorResponse, SuccessResponse } from '@/lib/types/api';
import { getErrorMessage, logError } from '@/lib/utils/errorHandler';

/**
 * Create new user (admin only)
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<UserResponse>, AxiosError<ErrorResponse>, CreateUserRequest>({
    mutationFn: async (data: CreateUserRequest): Promise<SuccessResponse<UserResponse>> => {
      return await userApi.createUser(data);
    },
    onSuccess: (response) => {
      const { data, message } = response;
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(message, { description: `User ${data.email} has been added to the system` });
    },
    onError: (error) => {
      logError('Create User', error);
      const errorMessage = getErrorMessage(error, 'Failed to create user');
      toast.error('User creation failed', { description: errorMessage });
    },
    retry: false,
  });
};

/**
 * Update user by ID (admin only)
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<UserResponse>, AxiosError<ErrorResponse>, { id: string; data: UpdateUserRequest }>(
    {
      mutationFn: async ({
        id,
        data,
      }: {
        id: string;
        data: UpdateUserRequest;
      }): Promise<SuccessResponse<UserResponse>> => {
        return await userApi.updateUser(id, data);
      },
      onSuccess: (response, variables) => {
        const { data, message } = response;
        queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        toast.success(message, { description: `User ${data.email} has been updated` });
      },
      onError: (error) => {
        logError('Update User', error);
        const errorMessage = getErrorMessage(error, 'Failed to update user');
        toast.error('User update failed', { description: errorMessage });
      },
      retry: false,
    }
  );
};

/**
 * Delete user by ID (admin only)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, string>({
    mutationFn: async (id: string): Promise<SuccessResponse<null>> => {
      return await userApi.deleteUser(id);
    },
    onSuccess: (response) => {
      const { message } = response;
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(message, { description: 'User has been removed from the system' });
    },
    onError: (error) => {
      logError('Delete User', error);
      const errorMessage = getErrorMessage(error, 'Failed to delete user');
      toast.error('User deletion failed', { description: errorMessage });
    },
    retry: false,
  });
};

/**
 * Update current user profile
 */
export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<UserResponse>, AxiosError<ErrorResponse>, UpdateUserRequest>({
    mutationFn: async (data: UpdateUserRequest): Promise<SuccessResponse<UserResponse>> => {
      return await userApi.updateCurrentUser(data);
    },
    onSuccess: (response) => {
      const { message } = response;
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      toast.success(message, { description: 'Your profile changes have been saved' });
    },
    onError: (error) => {
      logError('Update Profile', error);
      const errorMessage = getErrorMessage(error, 'Failed to update profile');
      toast.error('Profile update failed', { description: errorMessage });
    },
    retry: false,
  });
};

/**
 * Update current user password
 */
export const useUpdatePassword = () => {
  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, UpdatePasswordRequest>({
    mutationFn: async (data: UpdatePasswordRequest): Promise<SuccessResponse<null>> => {
      return await userApi.updatePassword(data);
    },
    onSuccess: (response) => {
      const { message } = response;
      toast.success(message, { description: 'Your password has been changed successfully' });
    },
    onError: (error) => {
      logError('Update Password', error);
      const errorMessage = getErrorMessage(error, 'Failed to update password');
      toast.error('Password update failed', { description: errorMessage });
    },
    retry: false,
  });
};

/**
 * Batch delete multiple users (admin only)
 */
export const useBatchDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, string[]>({
    mutationFn: async (userIds: string[]): Promise<SuccessResponse<null>> => {
      return await userApi.batchDeleteUsers(userIds);
    },
    onSuccess: (response) => {
      const { message } = response;
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(message, { description: 'Selected users have been removed' });
    },
    onError: (error) => {
      logError('Batch Delete Users', error);
      const errorMessage = getErrorMessage(error, 'Failed to delete users');
      toast.error('Batch deletion failed', { description: errorMessage });
    },
    retry: false,
  });
};

/**
 * Batch update user roles (admin only)
 */
export const useBatchUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse<null>, AxiosError<ErrorResponse>, { userIds: string[]; role: string }>({
    mutationFn: async ({ userIds, role }: { userIds: string[]; role: string }): Promise<SuccessResponse<null>> => {
      return await userApi.batchUpdateRole(userIds, role);
    },
    onSuccess: (response) => {
      const { message } = response;
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(message, { description: 'User roles have been updated' });
    },
    onError: (error) => {
      logError('Batch Update Roles', error);
      const errorMessage = getErrorMessage(error, 'Failed to update user roles');
      toast.error('Role update failed', { description: errorMessage });
    },
    retry: false,
  });
};
