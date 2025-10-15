import { Metadata } from 'next';

import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';
import { SuspenseFormLoader } from '@/components/SuspenseLoader';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/Error';

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
    <div className="w-full max-w-md">
      {token ? (
        <>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground mt-2">Enter your new password below</p>
          </div>

          <Card className="p-6">
            <SuspenseFormLoader loadingMessage="Loading form...">
              <ResetPasswordForm token={token} />
            </SuspenseFormLoader>
          </Card>
        </>
      ) : (
        <ErrorState
          title="Invalid or missing token"
          description="The password reset token is missing or invalid. Please request a new password reset."
        />
      )}
    </div>
  );
}
