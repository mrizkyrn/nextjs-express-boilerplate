'use client';

import { AlertTriangle, Key, Shield } from 'lucide-react';

import { UpdatePasswordForm } from '@/components/forms/UpdatePasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const SecurityPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground mt-2 text-sm">Manage your account security and password settings</p>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Security Overview</CardTitle>
          <CardDescription>Keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Password Security */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Key className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground text-sm font-semibold">Password Protection</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Your password is encrypted and securely stored. Change it regularly to maintain account security.
                </p>
              </div>
            </div>

            {/* Email Verification */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground text-sm font-semibold">Account Verification</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Email verification helps protect your account from unauthorized access.
                </p>
              </div>
            </div>

            {/* Security Tips */}
            <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/10">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground text-sm font-semibold">Security Tips</h3>
                <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                  <li>• Use a strong password with at least 6 characters</li>
                  <li>• Never share your password with anyone</li>
                  <li>• Change your password if you suspect unauthorized access</li>
                  <li>• Log out from shared devices after use</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdatePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPage;
