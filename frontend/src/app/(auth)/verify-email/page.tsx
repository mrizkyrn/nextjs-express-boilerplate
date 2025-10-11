import { Suspense } from 'react';
import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { VerifyEmailForm } from '@/components/forms/VerifyEmailForm';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email address',
};

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <Card className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-12 w-12 mx-auto bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            </Card>
          }
        >
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
