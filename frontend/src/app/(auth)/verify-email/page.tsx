import { Metadata } from 'next';
import { Suspense } from 'react';

import { VerifyEmailForm } from '@/components/forms/VerifyEmailForm';
import { Card } from '@/components/ui/Card';

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
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-200" />
                <div className="mx-auto h-4 w-3/4 rounded bg-gray-200" />
                <div className="mx-auto h-4 w-1/2 rounded bg-gray-200" />
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
