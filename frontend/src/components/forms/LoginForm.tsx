'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input, PasswordInput } from '@/components/ui/Input';
import { useLogin } from '@/lib/hooks/mutations/useAuthMutations';
import { loginSchema, type LoginFormData } from '@/lib/schemas/authSchema';

export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const login = useLogin();

  const onSubmit = useCallback((data: LoginFormData) => login.mutate(data), [login]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
                    disabled={login.isPending}
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
                    disabled={login.isPending}
                    autoComplete="current-password"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-sm no-underline hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={login.isPending} loadingText="Logging in...">
          Login
        </Button>
      </form>
    </Form>
  );
}
