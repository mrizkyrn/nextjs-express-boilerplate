'use client';

import { CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useResendVerification, useVerifyEmail } from '@/lib/hooks/useAuthMutations';
import { useCooldown } from '@/lib/hooks/useCooldown';

const RESEND_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [verificationAttempted, setVerificationAttempted] = useState(false);

  const { mutate: verifyEmail, isPending: isVerifying, isSuccess, isError } = useVerifyEmail();
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();

  const cooldown = useCooldown({
    key: 'email_verification_resend_time',
    duration: RESEND_COOLDOWN_MS,
  });

  useEffect(() => {
    // Automatically verify if token is present and not already attempted
    if (token && !verificationAttempted) {
      setVerificationAttempted(true);
      verifyEmail({ token });
    }
  }, [token, verificationAttempted, verifyEmail]);

  const handleResend = () => {
    if (email && !cooldown.isActive) {
      cooldown.start();
      resendVerification({ email });
    }
  };

  // Show loading state during verification
  if (isVerifying) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
        <h2 className="mb-2 text-2xl font-bold">Verifying Email</h2>
        <p className="text-muted-foreground">Please wait while we verify your email address...</p>
      </Card>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <h2 className="mb-2 text-2xl font-bold">Email Verified!</h2>
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
        <XCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
        <h2 className="mb-2 text-2xl font-bold">Verification Failed</h2>
        <p className="text-muted-foreground mb-6">The verification link is invalid or has expired.</p>
        {email && (
          <div className="space-y-4">
            {cooldown.isActive && (
              <p className="text-muted-foreground text-sm">
                You can resend in{' '}
                <span className="text-foreground font-mono font-medium">{cooldown.formatTime(cooldown.timeLeft)}</span>
              </p>
            )}
            <Button
              onClick={handleResend}
              disabled={isResending || cooldown.isActive}
              className="w-full"
              variant="outline"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </div>
        )}
      </Card>
    );
  }

  // Show waiting for verification (no token in URL)
  return (
    <Card className="p-8 text-center">
      <Mail className="text-primary mx-auto mb-4 h-12 w-12" />
      <h2 className="mb-2 text-2xl font-bold">Check Your Email</h2>
      <p className="text-muted-foreground mb-6">
        We&apos;ve sent a verification link to <strong>{email}</strong>. Please click the link in the email to verify
        your account.
      </p>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Didn&apos;t receive the email?</p>

        {cooldown.isActive && (
          <p className="text-muted-foreground text-sm">
            You can resend in{' '}
            <span className="text-foreground font-mono font-medium">{cooldown.formatTime(cooldown.timeLeft)}</span>
          </p>
        )}

        <Button
          onClick={handleResend}
          disabled={isResending || cooldown.isActive || !email}
          className="w-full"
          variant="outline"
        >
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </div>
    </Card>
  );
}
