import type { Column } from '@/components/tables/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface TableSkeletonProps<T> {
  columns: Column<T>[];
  className?: string;
  tableClassName?: string;
  striped?: boolean;
}

export function TableSkeleton<T>({ columns, className, tableClassName, striped }: TableSkeletonProps<T>) {
  return (
    <div className={cn('border-border overflow-hidden rounded-t-lg border', className)}>
      <div className="overflow-x-auto overflow-y-visible">
        <table className={cn('divide-border w-full divide-y', tableClassName)}>
          {/* Table Header Skeleton */}
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase',
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                >
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body Skeleton */}
          <tbody className="divide-border bg-background divide-y">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr
                key={`skeleton-${rowIndex}`}
                className={cn('hover:bg-muted/50 transition-colors', striped && rowIndex % 2 === 1 && 'bg-muted/25')}
              >
                {columns.map((column) => (
                  <td
                    key={`skeleton-${rowIndex}-${column.key}`}
                    className={cn('text-foreground p-6 text-sm', column.cellClassName)}
                  >
                    <Skeleton className="h-4 w-full max-w-32" />
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
