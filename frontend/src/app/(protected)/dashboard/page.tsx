'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLogout } from '@/lib/hooks/useAuthMutations';

export default function DashboardPage() {
  const { user } = useAuth();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your account overview.</p>
        </div>
        <Button onClick={handleLogout} variant="outline" isLoading={logout.isPending} loadingText="Logging out...">
          Logout
        </Button>
      </div>

      {/* User Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your current account details and settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground text-sm font-medium">Name</label>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">Email</label>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">Role</label>
                <p className="text-lg font-semibold capitalize">{user.role}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">Account Status</label>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and navigation options.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Button variant="outline" className="flex h-20 flex-col items-center justify-center space-y-2">
              <span className="text-2xl">📊</span>
              <span>Analytics</span>
            </Button>
            <Button variant="outline" className="flex h-20 flex-col items-center justify-center space-y-2">
              <span className="text-2xl">⚙️</span>
              <span>Settings</span>
            </Button>
            <Button variant="outline" className="flex h-20 flex-col items-center justify-center space-y-2">
              <span className="text-2xl">📝</span>
              <span>Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
