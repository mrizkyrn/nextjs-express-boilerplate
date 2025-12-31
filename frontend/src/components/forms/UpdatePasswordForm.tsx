'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { PasswordInput } from '@/components/ui/Input';
import { useUpdatePassword } from '@/lib/hooks/mutations/useUserMutations';
import { updatePasswordSchema, type UpdatePasswordInput } from '@/lib/schemas/userSchema';

export function UpdatePasswordForm() {
  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = (data: UpdatePasswordInput) => {
    updatePassword(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter current password"
                    icon={<Lock className="h-4 w-4" />}
                    disabled={isPending}
                    autoComplete="current-password"
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
            name="newPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter new password"
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
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} isLoading={isPending} loadingText="Updating...">
            Update Password
          </Button>
        </div>
      </form>
    </Form>
  );
}
