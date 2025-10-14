'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useForgotPassword } from '@/lib/hooks/mutations/useAuthMutations';
import { useCooldown } from '@/lib/hooks/useCooldown';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/schemas/authSchema';
import { Mail } from 'lucide-react';

const FORGOT_PASSWORD_KEY = 'forgot_password_resend_time';
const FORGOT_PASSWORD_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

export function ForgotPasswordForm() {
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const cooldown = useCooldown({
    key: FORGOT_PASSWORD_KEY,
    duration: FORGOT_PASSWORD_COOLDOWN_MS,
  });

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    if (!cooldown.isActive) {
      cooldown.start();
      forgotPassword(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    icon={<Mail className="h-4 w-4" />}
                    disabled={isPending}
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          {cooldown.isActive && (
            <p className="text-muted-foreground text-center text-sm">
              You can request another reset in{' '}
              <span className="text-foreground font-mono font-medium">{cooldown.formatTime(cooldown.timeLeft)}</span>
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={cooldown.isActive}
            isLoading={isPending}
            loadingText="Sending..."
          >
            Send Reset Link
          </Button>

          <div className="text-center text-sm">
            <Link href="/login">Back to sign in</Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
