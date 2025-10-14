'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Loading } from '@/components/ui/Loading';
import { useAuthStore } from '@/lib/stores/authStore';
import { UserRole } from '@/lib/types';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      if (user?.role === UserRole.ADMIN) {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    }
  }, [_hasHydrated, isAuthenticated, router, user?.role]);

  // Show loading while checking auth state
  if (!_hasHydrated) {
    return <Loading variant="fullscreen" message="Checking authentication..." />;
  }

  // Don't render children if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      {children}
    </div>
  );
}
