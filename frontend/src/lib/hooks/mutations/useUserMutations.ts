import { queryKeys } from '@/lib/api/queryKeys';
import { userApi } from '@/lib/api/services/userService';
import type { CreateUserRequest, UpdatePasswordRequest, UpdateUserRequest } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Create new user (admin only)
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.createUser(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(response.message || 'User created successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(errorMessage);
    },
  });
};

/**
 * Update user by ID (admin only)
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => userApi.updateUser(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success(response.message || 'User updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      toast.error(errorMessage);
    },
  });
};

/**
 * Delete user by ID (admin only)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(response.message || 'User deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
    },
  });
};

/**
 * Update current user profile
 */
export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userApi.updateCurrentUser(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      toast.success(response.message || 'Profile updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    },
  });
};

/**
 * Update current user password
 */
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => userApi.updatePassword(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Password updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      toast.error(errorMessage);
    },
  });
};

/**
 * Batch delete multiple users (admin only)
 */
export const useBatchDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => userApi.batchDeleteUsers(userIds),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(response.message || 'Users deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete users';
      toast.error(errorMessage);
    },
  });
};

/**
 * Batch update user roles (admin only)
 */
export const useBatchUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, role }: { userIds: string[]; role: string }) => userApi.batchUpdateRole(userIds, role),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(response.message || 'User roles updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user roles';
      toast.error(errorMessage);
    },
  });
};
