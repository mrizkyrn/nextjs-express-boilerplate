import { Metadata } from 'next';

import { VerifyEmailForm } from '@/components/forms/VerifyEmailForm';
import { SuspenseCardLoader } from '@/components/SuspenseLoader';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email address',
};

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md">
      <SuspenseCardLoader loadingMessage="Verifying your email...">
        <VerifyEmailForm />
      </SuspenseCardLoader>
    </div>
  );
}
