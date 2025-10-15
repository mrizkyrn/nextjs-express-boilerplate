import { cva, type VariantProps } from 'class-variance-authority';
import { FileXIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const EMPTY_BASE_CLASSES = {
  container:
    'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12',
  header: 'flex max-w-sm flex-col items-center gap-2 text-center',
  title: 'text-lg font-medium tracking-tight',
  description:
    'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4',
  content: 'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
} as const;

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
 * ```tsx
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
 *   title="No data found"
 *   description="There is no data to display at the moment."
 *   icon={<FileXIcon />}
 *   action={<Button>Add Item</Button>}
 * />
 * ```
 */
function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="empty" className={cn(EMPTY_BASE_CLASSES.container, className)} {...props} />;
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="empty-header" className={cn(EMPTY_BASE_CLASSES.header, className)} {...props} />;
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
  return <div data-slot="empty-title" className={cn(EMPTY_BASE_CLASSES.title, className)} {...props} />;
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <div data-slot="empty-description" className={cn(EMPTY_BASE_CLASSES.description, className)} {...props} />;
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="empty-content" className={cn(EMPTY_BASE_CLASSES.content, className)} {...props} />;
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty state component for displaying when no data is available.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No data found"
 *   description="There is no data to display at the moment."
 *   icon={<FileXIcon />}
 *   action={<Button>Add Item</Button>}
 * />
 * ```
 */
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
