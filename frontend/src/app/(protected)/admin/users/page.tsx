'use client';

import { useCallback, useMemo, useState } from 'react';

import { BatchDeleteUsersDialog, BatchUpdateRoleDialog, DeleteUserDialog, UserDialog } from '@/components/dialogs';
import { Column, DataTable, SortConfig, TableFilters, TablePagination, UserActionsDropdown } from '@/components/tables';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useUsers } from '@/lib/hooks/queries/useUserQueries';
import { GetUsersParams, User, UserRole } from '@/lib/types/user';
import { Plus, Trash2, UserCog, X } from 'lucide-react';

const UsersPage = () => {
  // State management
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Record<string, string[]>>({
    role: [],
    emailVerified: [],
  });

  // Dialog state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // Batch actions state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [batchUpdateRoleOpen, setBatchUpdateRoleOpen] = useState(false);

  // Fetch users with React Query
  const { data, isLoading, error } = useUsers({
    page: currentPage,
    limit,
    search: search || undefined,
    role: filters.role[0] as UserRole | undefined,
    emailVerified:
      filters.emailVerified[0] === 'true' ? true : filters.emailVerified[0] === 'false' ? false : undefined,
    sortBy: sortConfig?.key as GetUsersParams['sortBy'],
    sortOrder: sortConfig?.direction,
  });

  // Handle sort change and reset to first page
  const handleSortChange = (newSortConfig: SortConfig | null) => {
    setSortConfig(newSortConfig);
    setCurrentPage(1);
  };

  // Handle filter change and reset to first page
  const handleFilterChange = (filterId: string, values: string[]) => {
    setFilters((prev) => ({ ...prev, [filterId]: values }));
    setCurrentPage(1);
  };

  // Handle limit change and reset to first page
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  // Handle search change (debouncing handled by TableFilters component)
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Handle create user
  const handleCreateUser = () => {
    setDialogMode('create');
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Handle select all users
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && data?.data) {
        setSelectedUserIds(new Set(data.data.map((user) => user.id)));
      } else {
        setSelectedUserIds(new Set());
      }
    },
    [data?.data]
  );

  // Handle select single user
  const handleSelectUser = useCallback(
    (userId: string, checked: boolean) => {
      const newSelected = new Set(selectedUserIds);
      if (checked) {
        newSelected.add(userId);
      } else {
        newSelected.delete(userId);
      }
      setSelectedUserIds(newSelected);
    },
    [selectedUserIds]
  );

  // Handle batch delete
  const handleBatchDelete = () => {
    if (selectedUserIds.size === 0) return;
    setBatchDeleteOpen(true);
  };

  // Handle batch update role
  const handleBatchUpdateRole = () => {
    if (selectedUserIds.size === 0) return;
    setBatchUpdateRoleOpen(true);
  };

  // Clear selection after batch operations
  const handleBatchSuccess = () => {
    setSelectedUserIds(new Set());
  };

  // Get selected users
  const selectedUsers = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((user) => selectedUserIds.has(user.id));
  }, [data?.data, selectedUserIds]);

  // Check if all users on current page are selected
  const isAllSelected = useMemo(() => {
    if (!data?.data || data.data.length === 0) return false;
    return data.data.every((user) => selectedUserIds.has(user.id));
  }, [data?.data, selectedUserIds]);

  // Check if some users are selected (for indeterminate state)
  const isSomeSelected = useMemo(() => {
    if (!data?.data || selectedUserIds.size === 0) return false;
    return data.data.some((user) => selectedUserIds.has(user.id)) && !isAllSelected;
  }, [data?.data, selectedUserIds, isAllSelected]);

  // Define table columns
  const columns: Column<User>[] = useMemo(
    () => [
      {
        key: 'select',
        header: () => (
          <Checkbox
            checked={isSomeSelected ? 'indeterminate' : isAllSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Select all users"
          />
        ),
        render: (user) => (
          <Checkbox
            checked={selectedUserIds.has(user.id)}
            onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
            aria-label={`Select ${user.name}`}
          />
        ),
        width: '50px',
      },
      {
        key: 'name',
        header: 'Name',
        sortable: true,
      },
      {
        key: 'email',
        header: 'Email',
        sortable: true,
        cellClassName: 'text-muted-foreground',
      },
      {
        key: 'role',
        header: 'Role',
        render: (user) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user.role === UserRole.ADMIN
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}
          >
            {user.role}
          </span>
        ),
      },
      {
        key: 'emailVerified',
        header: 'Status',
        render: (user) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user.emailVerified
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            }`}
          >
            {user.emailVerified ? 'Verified' : 'Unverified'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Joined',
        sortable: true,
        render: (user) => new Date(user.createdAt).toLocaleDateString(),
        cellClassName: 'text-muted-foreground',
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (user) => (
          <div className="flex items-center justify-end">
            <UserActionsDropdown user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
          </div>
        ),
      },
    ],
    [selectedUserIds, isAllSelected, isSomeSelected, handleSelectAll, handleSelectUser]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm">Manage all users in your system</p>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <TableFilters
        searchValue={search}
        searchPlaceholder="Search users by name or email..."
        onSearchChange={handleSearchChange}
        filterGroups={[
          {
            id: 'role',
            label: 'Role',
            options: [
              { label: 'Admin', value: UserRole.ADMIN },
              { label: 'User', value: UserRole.USER },
            ],
          },
          {
            id: 'emailVerified',
            label: 'Verification Status',
            options: [
              { label: 'Verified', value: 'true' },
              { label: 'Unverified', value: 'false' },
            ],
          },
        ]}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        limitOptions={[10, 25, 50, 100]}
        limit={limit}
        onLimitChange={handleLimitChange}
      />

      {/* Batch Actions Bar */}
      {selectedUserIds.size > 0 && (
        <div className="bg-background flex items-center justify-between gap-5 rounded-lg px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">{selectedUserIds.size}</span>{' '}
              {selectedUserIds.size === 1 ? 'user' : 'users'} selected
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBatchUpdateRole} className="h-8 text-xs">
                <UserCog className="mr-2 h-3.5 w-3.5" />
                Update Role
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchDelete}
                className="text-destructive hover:bg-destructive hover:text-muted h-8 text-xs"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedUserIds(new Set())}
            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div>
        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          error={error?.message}
          emptyMessage="No users found"
          onSortChange={handleSortChange}
          sortConfig={sortConfig}
          clientSideSorting={false}
          rowKey={(user) => user.id}
        />

        {/* Pagination */}
        {data?.pagination && (
          <TablePagination
            pagination={data.pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            showInfo={true}
          />
        )}
      </div>

      {/* Dialogs */}
      <UserDialog open={userDialogOpen} onOpenChange={setUserDialogOpen} user={selectedUser} mode={dialogMode} />
      <DeleteUserDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} user={selectedUser} />
      <BatchDeleteUsersDialog
        open={batchDeleteOpen}
        onOpenChange={setBatchDeleteOpen}
        users={selectedUsers}
        onSuccess={handleBatchSuccess}
      />
      <BatchUpdateRoleDialog
        open={batchUpdateRoleOpen}
        onOpenChange={setBatchUpdateRoleOpen}
        users={selectedUsers}
        onSuccess={handleBatchSuccess}
      />
    </div>
  );
};

export default UsersPage;
