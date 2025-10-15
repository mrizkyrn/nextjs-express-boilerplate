'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, User as UserIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useCreateUser, useUpdateUser } from '@/lib/hooks/mutations/useUserMutations';
import type { CreateUserInput, UpdateUserInput } from '@/lib/schemas/userSchema';
import { createUserSchema, updateUserSchema } from '@/lib/schemas/userSchema';
import type { User, UserRole } from '@/lib/types/user';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  mode: 'create' | 'edit';
}

/**
 * Dialog component for creating and editing users
 * Handles both create and edit modes with proper form validation
 *
 * @example
 * ```tsx
 * <UserDialog
 *   open={userDialogOpen}
 *   onOpenChange={setUserDialogOpen}
 *   user={selectedUser}
 *   mode={isEditMode ? 'edit' : 'create'}
 * />
 * ```
 */
export function UserDialog({ open, onOpenChange, user, mode }: UserDialogProps) {
  const isEditMode = mode === 'edit' && !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  // Use appropriate schema based on mode
  const schema = isEditMode ? updateUserSchema : createUserSchema;

  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'USER' as UserRole,
    },
  });

  // Watch form values to detect changes
  const watchedValues = form.watch();

  // Store initial values for comparison
  const initialValues = useMemo(() => {
    if (isEditMode && user) {
      return {
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }
    return null;
  }, [isEditMode, user]);

  // Check if form has changes (only in edit mode)
  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialValues) return true; // Always allow create mode

    return (
      watchedValues.name !== initialValues.name ||
      watchedValues.email !== initialValues.email ||
      watchedValues.role !== initialValues.role
    );
  }, [watchedValues, initialValues, isEditMode]);

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (isEditMode) {
        form.reset({
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } else {
        form.reset({
          name: '',
          email: '',
          password: '',
          role: 'USER' as UserRole,
        });
      }
    }
  }, [open, isEditMode, user, form]);

  const onSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: user.id,
          data: data as UpdateUserInput,
        });
      } else {
        await createMutation.mutateAsync(data as CreateUserInput);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Failed to save user:', error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update user information. Leave password empty to keep it unchanged.'
              : 'Add a new user to your system. Fill in all required fields.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      icon={<UserIcon className="h-4 w-4" />}
                      disabled={isPending}
                      autoComplete="name"
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      icon={<Mail className="h-4 w-4" />}
                      disabled={isPending}
                      autoComplete="email"
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditMode && (
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        icon={<Lock className="h-4 w-4" />}
                        disabled={isPending}
                        autoComplete="new-password"
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isPending}
                loadingText={isEditMode ? 'Updating...' : 'Creating...'}
                disabled={isEditMode && !hasChanges}
              >
                {isEditMode ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
