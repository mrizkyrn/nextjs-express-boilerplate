'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Empty';
import { Loading } from '@/components/ui/Loading';

/**
 * Column definition for the data table
 */
export interface Column<T> {
  /**
   * Unique identifier for the column
   */
  key: string;

  /**
   * Display header for the column
   */
  header: string;

  /**
   * Whether the column is sortable
   */
  sortable?: boolean;

  /**
   * Custom render function for cell content
   * If not provided, will display the value directly
   */
  render?: (item: T, index: number) => ReactNode;

  /**
   * Accessor function to get the value from the data object
   * If not provided, will use the key to access the value
   */
  accessor?: (item: T) => unknown;

  /**
   * Custom className for the column cells
   */
  cellClassName?: string;

  /**
   * Custom className for the header cell
   */
  headerClassName?: string;

  /**
   * Column width (optional)
   */
  width?: string;

  /**
   * Column alignment
   */
  align?: 'left' | 'center' | 'right';
}

/**
 * Sort configuration
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * DataTable Props
 */
export interface DataTableProps<T> {
  /**
   * Column definitions
   */
  columns: Column<T>[];

  /**
   * Data to display in the table
   */
  data: T[];

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Error state
   */
  error?: string | null;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Custom className for the table container
   */
  className?: string;

  /**
   * Custom className for the table
   */
  tableClassName?: string;

  /**
   * Enable striped rows
   */
  striped?: boolean;

  /**
   * Callback when sort changes (for server-side sorting)
   * If provided, sorting will be controlled by parent component
   */
  onSortChange?: (sort: SortConfig | null) => void;

  /**
   * Current sort configuration (for controlled sorting)
   */
  sortConfig?: SortConfig | null;

  /**
   * Enable client-side sorting (default: true if onSortChange is not provided)
   */
  clientSideSorting?: boolean;

  /**
   * Custom row key accessor
   */
  rowKey?: (item: T, index: number) => string | number;
}

/**
 * Modern, reusable DataTable component with sorting capabilities
 *
 * @example
 * ```tsx
 * const columns: Column<User>[] = [
 *   { key: 'name', header: 'Name', sortable: true },
 *   { key: 'email', header: 'Email', sortable: true },
 *   {
 *     key: 'role',
 *     header: 'Role',
 *     render: (user) => <Badge>{user.role}</Badge>
 *   },
 * ];
 *
 * <DataTable columns={columns} data={users} isLoading={isLoading} />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  error = null,
  emptyMessage = 'No data available',
  className = '',
  tableClassName = '',
  striped = false,
  onSortChange,
  sortConfig: controlledSortConfig,
  clientSideSorting = true,
  rowKey = (_, index) => index,
}: DataTableProps<T>) {
  // Internal sort state for client-side sorting
  const [internalSortConfig, setInternalSortConfig] = useState<SortConfig | null>(null);

  // Use controlled sort config if provided, otherwise use internal state
  const sortConfig = controlledSortConfig !== undefined ? controlledSortConfig : internalSortConfig;

  /**
   * Handle column header click for sorting
   */
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    let newSortConfig: SortConfig | null = null;

    if (sortConfig?.key === columnKey) {
      // Toggle sort direction, or clear if already descending
      if (sortConfig.direction === 'asc') {
        newSortConfig = { key: columnKey, direction: 'desc' };
      } else {
        newSortConfig = null; // Clear sorting
      }
    } else {
      // Start with ascending sort
      newSortConfig = { key: columnKey, direction: 'asc' };
    }

    // Update sort config
    if (onSortChange) {
      // Controlled mode - notify parent
      onSortChange(newSortConfig);
    } else {
      // Uncontrolled mode - update internal state
      setInternalSortConfig(newSortConfig);
    }
  };

  /**
   * Get the value for sorting from an item
   */
  const getSortValue = (item: T, columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (column?.accessor) {
      return column.accessor(item);
    }
    return (item as Record<string, unknown>)[columnKey];
  };

  /**
   * Sort the data if client-side sorting is enabled
   */
  const sortedData = (() => {
    if (!clientSideSorting || !sortConfig || onSortChange) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      if (aValue === bValue) return 0;

      // Handle null/undefined values
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Type assertion for comparison - values should be comparable
      const comparison = (aValue as string | number) > (bValue as string | number) ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  })();

  /**
   * Get cell value for display
   */
  const getCellValue = (item: T, column: Column<T>, index: number): ReactNode => {
    if (column.render) {
      return column.render(item, index);
    }
    if (column.accessor) {
      const value = column.accessor(item);
      return value as ReactNode;
    }
    return (item as Record<string, unknown>)[column.key] as ReactNode;
  };

  /**
   * Get alignment class
   */
  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  /**
   * Render sort icon
   */
  const renderSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />;
    }

    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="text-primary ml-2 h-3 w-3" />
    ) : (
      <ArrowDown className="text-primary ml-2 h-3 w-3" />
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`border-border bg-card rounded-lg border ${className}`}>
        <Loading />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`border-border bg-card rounded-lg border p-8 ${className}`}>
        <div className="text-center">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={`border-border bg-card rounded-lg border ${className}`}>
        <EmptyState title="No data" description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg ${className}`}>
      <div className="overflow-x-auto overflow-y-visible">
        <table className={`divide-border w-full divide-y ${tableClassName}`}>
          {/* Table Header */}
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${getAlignmentClass(
                    column.align
                  )} ${column.headerClassName || ''}`}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <div className="group flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(column.key)}
                        className="hover:text-foreground -mx-3 -my-1 h-auto text-xs font-medium uppercase hover:bg-transparent"
                      >
                        {column.header}
                      </Button>
                      {renderSortIcon(column.key)}
                    </div>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-border bg-background divide-y">
            {sortedData.map((item, index) => (
              <tr
                key={rowKey(item, index)}
                className={`hover:bg-muted/50 transition-colors ${striped && index % 2 === 1 ? 'bg-muted/25' : ''}`}
              >
                {columns.map((column) => (
                  <td
                    key={`${rowKey(item, index)}-${column.key}`}
                    className={`text-foreground px-6 py-4 text-sm ${getAlignmentClass(
                      column.align
                    )} ${column.cellClassName || ''}`}
                  >
                    {getCellValue(item, column, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
