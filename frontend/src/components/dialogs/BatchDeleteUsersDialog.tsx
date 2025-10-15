'use client';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { useBatchDeleteUsers } from '@/lib/hooks/mutations/useUserMutations';
import { User, UserRole } from '@/lib/types/user';
import { AlertTriangle } from 'lucide-react';

interface BatchDeleteUsersDialogProps {
  /**
   * Control dialog open state
   */
  open: boolean;

  /**
   * Callback when dialog open state changes
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Users to delete
   */
  users: User[];

  /**
   * Callback after successful deletion
   */
  onSuccess?: () => void;
}

/**
 * Dialog for confirming batch deletion of multiple users
 *
 * @example
 * ```tsx
 * <BatchDeleteUsersDialog
 *   open={batchDeleteOpen}
 *   onOpenChange={setBatchDeleteOpen}
 *   users={selectedUsers}
 *   onSuccess={() => setSelectedUserIds([])}
 * />
 * ```
 */
export function BatchDeleteUsersDialog({ open, onOpenChange, users, onSuccess }: BatchDeleteUsersDialogProps) {
  const { mutate: batchDeleteUsers, isPending } = useBatchDeleteUsers();

  const handleDelete = () => {
    const userIds = users.map((user) => user.id);

    batchDeleteUsers(userIds, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  // Group users by role
  const adminCount = users.filter((user) => user.role === UserRole.ADMIN).length;
  const userCount = users.filter((user) => user.role === UserRole.USER).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Delete Multiple Users</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {users.length} {users.length === 1 ? 'user' : 'users'}?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total users:</span>
                <span className="font-semibold">{users.length}</span>
              </div>
              {adminCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Admins:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{adminCount}</span>
                </div>
              )}
              {userCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Regular users:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{userCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-3">
            <p className="text-destructive text-sm">
              <strong>Warning:</strong> This action cannot be undone. All user data will be permanently deleted from the
              system.
            </p>
          </div>

          {/* User list preview (max 5) */}
          {users.length <= 5 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Users to be deleted:</p>
              <div className="bg-background space-y-1 rounded-lg border p-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-muted-foreground text-xs">{user.email}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === UserRole.ADMIN
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {users.length > 5 && (
            <p className="text-muted-foreground text-sm">
              {users.length} users selected for deletion. The operation will permanently remove all of them.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? 'Deleting...' : `Delete ${users.length} ${users.length === 1 ? 'User' : 'Users'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
