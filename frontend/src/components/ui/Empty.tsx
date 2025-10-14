import { cva, type VariantProps } from 'class-variance-authority';
import { FileXIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils/index';

// Constants
const emptyBaseClasses =
  'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12';
const emptyHeaderBaseClasses = 'flex max-w-sm flex-col items-center gap-2 text-center';
const emptyTitleBaseClasses = 'text-lg font-medium tracking-tight';
const emptyDescriptionBaseClasses =
  'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4';
const emptyContentBaseClasses = 'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance';

const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Empty state component for displaying when no data is available.
 *
 * @example
 * <Empty>
 *   <EmptyHeader>
 *     <EmptyMedia><FileXIcon /></EmptyMedia>
 *     <EmptyTitle>No results found</EmptyTitle>
 *     <EmptyDescription>Try adjusting your search.</EmptyDescription>
 *   </EmptyHeader>
 *   <EmptyContent>
 *     <Button>Clear filters</Button>
 *   </EmptyContent>
 * </Empty>
 *
 * // Or use the convenience component
 * <EmptyState
 *   title="No data"
 *   description="Add your first item"
 *   action={<Button>Add Item</Button>}
 * />
 */
function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="empty" className={cn(emptyBaseClasses, className)} {...props} />;
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="empty-header" className={cn(emptyHeaderBaseClasses, className)} {...props} />;
}

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="empty-title" className={cn(emptyTitleBaseClasses, className)} {...props} />;
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <div data-slot="empty-description" className={cn(emptyDescriptionBaseClasses, className)} {...props} />;
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="empty-content" className={cn(emptyContentBaseClasses, className)} {...props} />;
}

// Convenience component for simple empty states
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({
  title = 'No data found',
  description = 'There is no data to display at the moment.',
  icon = <FileXIcon />,
  action,
  className,
  ...props
}: EmptyStateProps & React.ComponentProps<'div'>) {
  return (
    <Empty className={className} {...props}>
      <EmptyHeader>
        <EmptyMedia>{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyState, EmptyTitle };
