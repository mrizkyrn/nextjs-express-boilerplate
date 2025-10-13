import { Metadata } from 'next';
import { Suspense } from 'react';

import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Create a new password for your account',
};

interface ResetPasswordPageProps {
  searchParams: { token?: string };
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams.token;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground mt-2">Enter your new password below</p>
        </div>

        <Card className="p-6">
          {token ? (
            <Suspense
              fallback={
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              }
            >
              <ResetPasswordForm token={'token'} />
            </Suspense>
          ) : (
            <div className="py-8 text-center">
              <p className="text-destructive">Invalid or missing reset token</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
