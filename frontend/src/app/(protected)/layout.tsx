'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ThemeToggle } from '@/components/ThemeToggle';
import { ErrorState } from '@/components/ui/Error';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { isLoading, isError } = useAuth();

  // Redirect to login if not authenticated (after hydration)
  useEffect(() => {
    if (_hasHydrated && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, isLoading, router]);

  // Wait for Zustand store to rehydrate from localStorage
  if (!_hasHydrated) {
    return <Loading variant="fullscreen" message="Initializing app..." />;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <Loading variant="fullscreen" message="Verifying authentication..." />;
  }

  // Show error state if authentication check failed
  if (isError) {
    return (
      <ErrorState
        title="Something went wrong"
        description="An error occurred while verifying your authentication. Please try again."
        onRetry={() => router.push('/login')}
        variant="fullscreen"
      />
    );
  }

  // Don't render children if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {children}
    </div>
  );
}
