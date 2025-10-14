/**
 * Admin Layout
 * Protected layout for admin dashboard with sidebar navigation
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AdminSidebar from '@/components/layouts/AdminSidebar';
import { ErrorState } from '@/components/ui/Error';
import { Loading } from '@/components/ui/Loading';
import { Container } from '@/components/layouts/Container';
import { useLogout } from '@/lib/hooks/mutations/useAuthMutations';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { UserRole } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { user, isLoading, isError } = useAuth();
  const logout = useLogout();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (_hasHydrated && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isLoading, isAuthenticated, router]);

  // Redirect non-admin users to profile
  useEffect(() => {
    if (_hasHydrated && !isLoading && user && user.role !== UserRole.ADMIN) {
      router.push('/profile');
    }
  }, [_hasHydrated, isLoading, user, router]);

  // Handle logout
  const handleLogout = () => {
    logout.mutate();
  };

  // Show loading while checking authentication
  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading message="Loading admin panel..." />
      </div>
    );
  }

  // Show error if authentication failed
  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <ErrorState
          title="Authentication Error"
          description="Failed to verify your authentication. Please try logging in again."
        />
      </div>
    );
  }

  // Don't render if not authenticated or not admin
  if (!isAuthenticated || !user || user.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <div className="flex h-screen bg-secondary">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        username={user.name}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Container as="main" className="py-8">
          {children}
        </Container>
      </div>
    </div>
  );
}
