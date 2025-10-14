'use client';

import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { PasswordInput } from '@/components/ui/Input';
import { useResetPassword } from '@/lib/hooks/mutations/useAuthMutations';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { mutate: resetPassword, isPending } = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword({
      token,
      password: data.password,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Enter new password" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Confirm new password" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isPending} loadingText="Resetting...">
          Reset Password
        </Button>
      </form>
    </Form>
  );
}
