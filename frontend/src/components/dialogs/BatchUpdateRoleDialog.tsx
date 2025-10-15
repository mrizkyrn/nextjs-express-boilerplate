'use client';

import { Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useBatchUpdateRole } from '@/lib/hooks/mutations/useUserMutations';
import { User, UserRole } from '@/lib/types/user';

interface BatchUpdateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onSuccess?: () => void;
}

/**
 * Dialog for batch updating user roles
 *
 * @example
 * ```tsx
 * <BatchUpdateRoleDialog
 *   open={batchUpdateRoleOpen}
 *   onOpenChange={setBatchUpdateRoleOpen}
 *   users={selectedUsers}
 *   onSuccess={() => setSelectedUserIds([])}
 * />
 * ```
 */
export function BatchUpdateRoleDialog({ open, onOpenChange, users, onSuccess }: BatchUpdateRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const { mutate: batchUpdateRole, isPending } = useBatchUpdateRole();

  const handleUpdate = () => {
    const userIds = users.map((user) => user.id);

    batchUpdateRole(
      { userIds, role: selectedRole },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
          setSelectedRole(UserRole.USER); // Reset
        },
      }
    );
  };

  // Group users by current role
  const currentAdminCount = users.filter((user) => user.role === UserRole.ADMIN).length;
  const currentUserCount = users.filter((user) => user.role === UserRole.USER).length;

  // Calculate changes
  const willBecomeAdmin = selectedRole === UserRole.ADMIN;
  const changeCount = users.filter((user) => user.role !== selectedRole).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
              <Users className="text-primary h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="mb-1 text-left">Update User Roles</DialogTitle>
              <DialogDescription className="text-left">
                Change the role for {users.length} selected {users.length === 1 ? 'user' : 'users'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Summary */}
          <div className="bg-muted/30 rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">Current roles:</p>
            <div className="space-y-2 text-sm">
              {currentAdminCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Admins:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{currentAdminCount}</span>
                </div>
              )}
              {currentUserCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Regular users:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{currentUserCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <Label htmlFor="role">New Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.USER}>User</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              All selected users will be assigned the <strong>{selectedRole}</strong> role
            </p>
          </div>

          {/* Changes Preview */}
          {changeCount > 0 ? (
            <div
              className={`rounded-lg border p-3 ${
                willBecomeAdmin
                  ? 'border-purple-200 bg-purple-50 dark:border-purple-900/30 dark:bg-purple-900/10'
                  : 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10'
              }`}
            >
              <p className="text-sm">
                <strong>{changeCount}</strong> {changeCount === 1 ? 'user' : 'users'} will be updated to{' '}
                <strong
                  className={
                    willBecomeAdmin ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
                  }
                >
                  {selectedRole}
                </strong>
                .
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900/30 dark:bg-yellow-900/10">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                All selected users already have the <strong>{selectedRole}</strong> role.
              </p>
            </div>
          )}

          {/* Warning for admin promotion */}
          {willBecomeAdmin && changeCount > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Note:</strong> Admins will have full access to all system features and user data.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isPending || changeCount === 0}>
            {isPending ? 'Updating...' : `Update ${users.length} ${users.length === 1 ? 'User' : 'Users'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
