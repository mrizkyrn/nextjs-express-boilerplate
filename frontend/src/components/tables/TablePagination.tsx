'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/Pagination';
import { PaginationMeta } from '@/lib/types/api';
import { cn } from '@/lib/utils';

/**
 * Props for the TablePagination component
 */
export interface TablePaginationProps {
  /**
   * Pagination metadata from API
   */
  pagination: PaginationMeta;

  /**
   * Current page number
   */
  currentPage: number;

  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;

  /**
   * Show pagination info text
   */
  showInfo?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Reusable table pagination component
 *
 * @example
 * ```tsx
 * <TablePagination
 *   pagination={data.pagination}
 *   currentPage={currentPage}
 *   onPageChange={setCurrentPage}
 *   showInfo={true}
 * />
 * ```
 */
export function TablePagination({
  pagination,
  currentPage,
  onPageChange,
  showInfo = true,
  className,
}: TablePaginationProps) {
  // Don't render if only one page
  if (pagination.totalPages <= 1) {
    return null;
  }

  // Calculate visible page range
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const total = pagination.totalPages;
    const current = currentPage;

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const showPages = 2;
    const start = Math.max(2, current - showPages);
    const end = Math.min(total - 1, current + showPages);

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < total - 1) {
      pages.push('ellipsis');
    }

    // Always show last page if there is more than one page
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Calculate item range for info text
  const startItem = (currentPage - 1) * pagination.limit + 1;
  const endItem = Math.min(currentPage * pagination.limit, pagination.total);

  return (
    <div
      className={cn(
        'bg-background border-border flex flex-col justify-between gap-5 rounded-b-lg border px-4 py-2 md:flex-row',
        className
      )}
    >
      {/* Pagination Info */}
      {showInfo && (
        <div className="text-muted-foreground flex items-center justify-between gap-5 text-sm">
          <div>
            Showing <span className="text-foreground">{startItem}</span> to{' '}
            <span className="text-foreground">{endItem}</span> of{' '}
            <span className="text-foreground">{pagination.total}</span> results
          </div>
          <div>
            Page <span className="text-foreground">{currentPage}</span> of{' '}
            <span className="text-foreground">{pagination.totalPages}</span>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => pagination.hasPrevPage && onPageChange(currentPage - 1)}
                className={cn(
                  'no-underline',
                  !pagination.hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                )}
              />
            </PaginationItem>

            {/* Page Numbers */}
            {visiblePages.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={page === currentPage}
                    className="cursor-pointer no-underline"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Next Button */}
            <PaginationItem>
              <PaginationNext
                onClick={() => pagination.hasNextPage && onPageChange(currentPage + 1)}
                className={cn(
                  'no-underline',
                  !pagination.hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
