'use client';

import { Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    className="pl-9"
                    disabled={registerMutation.isPending}
                    autoComplete="name"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                </div>
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
                <div className="relative">
                  <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    disabled={registerMutation.isPending}
                    autoComplete="email"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                </div>
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
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    disabled={registerMutation.isPending}
                    autoComplete="new-password"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                </div>
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
                <div className="relative">
                  <ShieldCheck className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    disabled={registerMutation.isPending}
                    autoComplete="new-password"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? (
            <>
              <Spinner aria-hidden="true" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </Form>
  );
}
