import { cn } from '@/lib/utils';

/**
 * A simple skeleton loader component to indicate loading states.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-6 w-32" />
 * ```
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="skeleton" className={cn('bg-accent animate-pulse rounded-md', className)} {...props} />;
}

export { Skeleton };
