'use client';

import { Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Error, ErrorContent, ErrorDescription, ErrorHeader, ErrorMedia, ErrorTitle } from '@/components/ui/Error';
import { Loading } from '@/components/ui/Loading';
import { SuccessState } from '@/components/ui/Success';
import { useResendVerification, useVerifyEmail } from '@/lib/hooks/mutations/useAuthMutations';
import { useCooldown } from '@/lib/hooks/useCooldown';

const RESEND_COOLDOWN_KEY = 'email_verification_resend_time';
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
    key: RESEND_COOLDOWN_KEY,
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
      resendVerification(
        { email },
        {
          onSuccess: () => {
            cooldown.start();
          },
        }
      );
    }
  };

  // Show loading state during verification
  if (isVerifying) {
    return (
      <Card className="p-8 text-center">
        <Loading message="Verifying your email address..." />
      </Card>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <SuccessState
        title="Email Verified!"
        description="Your email has been successfully verified."
        action={
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
        }
      />
    );
  }

  // Show error state with resend option
  if (isError && token) {
    return (
      <Error>
        <ErrorHeader>
          <ErrorMedia>
            <Mail />
          </ErrorMedia>
          <ErrorTitle>Verification Failed</ErrorTitle>
          <ErrorDescription>The verification link is invalid or has expired.</ErrorDescription>
        </ErrorHeader>
        {email && (
          <ErrorContent>
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
          </ErrorContent>
        )}
      </Error>
    );
  }

  // Show waiting for verification (no token in URL)
  return (
    <Card className="p-8">
      <div className="space-y-6 text-center">
        {/* Header */}
        <div className="space-y-4">
          <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <Mail className="text-primary h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Check your email</h1>
            <p className="text-muted-foreground text-sm">
              We sent a verification link to <span className="font-medium">{email}</span>
            </p>
          </div>
        </div>

        {/* Resend Section */}
        <div className="space-y-4">
          {cooldown.isActive ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-2 text-sm">Resend available in</p>
              <p className="text-primary font-mono text-lg font-semibold">{cooldown.formatTime(cooldown.timeLeft)}</p>
            </div>
          ) : (
            <Button onClick={handleResend} disabled={isResending || !email} className="w-full" variant="outline">
              {isResending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </div>
              ) : (
                'Resend email'
              )}
            </Button>
          )}

          <p className="text-muted-foreground text-center text-xs">Didn&apos;t receive it? Check your spam folder</p>
        </div>
      </div>
    </Card>
  );
}
