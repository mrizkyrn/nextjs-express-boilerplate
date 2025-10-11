'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useVerifyEmail, useResendVerification } from '@/lib/hooks/useAuthMutations';

/**
 * Verify Email Component
 * Handles email verification with token from URL
 */
export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [verificationAttempted, setVerificationAttempted] = useState(false);

  const { mutate: verifyEmail, isPending: isVerifying, isSuccess, isError } = useVerifyEmail();
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();

  useEffect(() => {
    // Automatically verify if token is present and not already attempted
    if (token && !verificationAttempted) {
      setVerificationAttempted(true);
      verifyEmail({ token });
    }
  }, [token, verificationAttempted, verifyEmail]);

  const handleResend = () => {
    if (email) {
      resendVerification({ email });
    }
  };

  // Show loading state during verification
  if (isVerifying) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
        <h2 className="text-2xl font-bold mb-2">Verifying Email</h2>
        <p className="text-muted-foreground">Please wait while we verify your email address...</p>
      </Card>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
        <p className="text-muted-foreground mb-6">Your email has been successfully verified.</p>
        <Button onClick={() => router.push('/login')} className="w-full">
          Go to Login
        </Button>
      </Card>
    );
  }

  // Show error state with resend option
  if (isError && token) {
    return (
      <Card className="p-8 text-center">
        <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
        <p className="text-muted-foreground mb-6">The verification link is invalid or has expired.</p>
        {email && (
          <Button onClick={handleResend} disabled={isResending} className="w-full" variant="outline">
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        )}
      </Card>
    );
  }

  // Show waiting for verification (no token in URL)
  return (
    <Card className="p-8 text-center">
      <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
      <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
      <p className="text-muted-foreground mb-6">
        We&apos;ve sent a verification link to <strong>{email}</strong>. Please click the link in the email to verify your account.
      </p>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Didn&apos;t receive the email?</p>
        <Button onClick={handleResend} disabled={isResending || !email} className="w-full" variant="outline">
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </div>
    </Card>
  );
}
