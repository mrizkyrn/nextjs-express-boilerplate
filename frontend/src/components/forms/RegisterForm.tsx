'use client';

import { Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input, PasswordInput } from '@/components/ui/Input';
import { useRegister } from '@/lib/hooks/useAuthMutations';
import { registerSchema, type RegisterFormData } from '@/lib/schemas/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';

export function RegisterForm() {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const registerMutation = useRegister();

  const onSubmit = useCallback((data: RegisterFormData) => registerMutation.mutate(data), [registerMutation]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
                    icon={<User className="h-4 w-4" />}
                    disabled={registerMutation.isPending}
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
                    placeholder="you@example.com"
                    icon={<Mail className="h-4 w-4" />}
                    disabled={registerMutation.isPending}
                    autoComplete="email"
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
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    disabled={registerMutation.isPending}
                    autoComplete="new-password"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Must be at least 6 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    icon={<ShieldCheck className="h-4 w-4" />}
                    disabled={registerMutation.isPending}
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

        <Button
          type="submit"
          className="w-full"
          isLoading={registerMutation.isPending}
          loadingText="Creating account..."
        >
          Create account
        </Button>
      </form>
    </Form>
  );
}
