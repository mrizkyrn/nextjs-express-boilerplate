'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { ButtonProps, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils/index';

// Types
type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

// Constants
const PAGINATION_BASE_CLASSES = {
  container: 'mx-auto flex w-full justify-center',
  content: 'flex flex-row items-center gap-1',
  item: '',
  link: '',
  ellipsis: 'flex h-9 w-9 items-center justify-center',
  previous: 'gap-1 pl-2.5',
  next: 'gap-1 pr-2.5',
} as const;

/**
 * Root pagination container component.
 * Provides semantic navigation structure for pagination controls.
 *
 * @example
 * <Pagination>
 *   <PaginationContent>
 *     <PaginationItem>
 *       <PaginationPrevious href="#" />
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationLink href="#" isActive>1</PaginationLink>
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationLink href="#">2</PaginationLink>
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationEllipsis />
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationLink href="#">10</PaginationLink>
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationNext href="#" />
 *     </PaginationItem>
 *   </PaginationContent>
 * </Pagination>
 */
const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn(PAGINATION_BASE_CLASSES.container, className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

/**
 * Container for pagination items.
 * Uses semantic list structure for screen readers.
 */
const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn(PAGINATION_BASE_CLASSES.content, className)} {...props} />
  )
);
PaginationContent.displayName = 'PaginationContent';

/**
 * Individual pagination item wrapper.
 * Provides list item semantics for pagination links.
 */
const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn(PAGINATION_BASE_CLASSES.item, className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

/**
 * Pagination link component with active state support.
 * Handles page navigation with proper accessibility attributes.
 */
const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      PAGINATION_BASE_CLASSES.link,
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

/**
 * Previous page navigation button.
 * Includes proper ARIA label and icon positioning.
 */
const PaginationPrevious = React.forwardRef<
  React.ComponentRef<typeof PaginationLink>,
  React.ComponentProps<typeof PaginationLink>
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    size="default"
    className={cn(PAGINATION_BASE_CLASSES.previous, className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="hidden lg:block">Previous</span>
  </PaginationLink>
));
PaginationPrevious.displayName = 'PaginationPrevious';

/**
 * Next page navigation button.
 * Includes proper ARIA label and icon positioning.
 */
const PaginationNext = React.forwardRef<
  React.ComponentRef<typeof PaginationLink>,
  React.ComponentProps<typeof PaginationLink>
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    size="default"
    className={cn(PAGINATION_BASE_CLASSES.next, className)}
    {...props}
  >
    <span className="hidden lg:block">Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
));
PaginationNext.displayName = 'PaginationNext';

/**
 * Ellipsis indicator for pagination gaps.
 * Provides visual indication of skipped page numbers.
 */
const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span aria-hidden className={cn(PAGINATION_BASE_CLASSES.ellipsis, className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

// Export all components
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
