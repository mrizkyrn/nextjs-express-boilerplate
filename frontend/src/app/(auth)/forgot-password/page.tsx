import { Metadata } from 'next';
import Link from 'next/link';

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Forgot Password</h1>
        <p className="text-muted-foreground mt-2">Enter your email to receive a password reset link</p>
      </div>

      <Card className="p-6">
        <ForgotPasswordForm />
      </Card>

      <p className="text-muted-foreground mt-4 text-center text-sm">
        Remember your password?{' '}
        <Link href="/login" className="font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
