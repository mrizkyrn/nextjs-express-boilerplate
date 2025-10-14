import { Suspense, type ComponentProps } from 'react';

import { Loading } from '@/components/ui/Loading';

interface SuspenseLoaderProps extends ComponentProps<typeof Suspense> {
  loadingMessage?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'inline' | 'fullscreen' | 'overlay';
  className?: string;
}

/**
 * A wrapper around React Suspense with a consistent Loading fallback.
 * Provides better UX with accessible loading states.
 *
 * @example
 * // Basic usage
 * <SuspenseLoader>
 *   <AsyncComponent />
 * </SuspenseLoader>
 *
 * // Custom message and size
 * <SuspenseLoader loadingMessage="Loading your data..." size="lg">
 *   <DataTable />
 * </SuspenseLoader>
 *
 * // Fullscreen loading
 * <SuspenseLoader variant="fullscreen" loadingMessage="Initializing...">
 *   <Dashboard />
 * </SuspenseLoader>
 */
export function SuspenseLoader({
  children,
  loadingMessage = 'Loading...',
  size = 'md',
  variant = 'inline',
  className,
  fallback,
  ...props
}: SuspenseLoaderProps) {
  const loadingFallback = fallback || (
    <Loading message={loadingMessage} size={size} variant={variant} className={className} />
  );

  return (
    <Suspense fallback={loadingFallback} {...props}>
      {children}
    </Suspense>
  );
}

/**
 * A Suspense loader specifically for card content.
 * Provides a compact loading state within cards.
 *
 * @example
 * <Card>
 *   <CardContent>
 *     <SuspenseCardLoader>
 *       <UserProfile />
 *     </SuspenseCardLoader>
 *   </CardContent>
 * </Card>
 */
export function SuspenseCardLoader({
  children,
  loadingMessage = 'Loading...',
  className,
  ...props
}: Omit<SuspenseLoaderProps, 'variant' | 'size'>) {
  return (
    <SuspenseLoader loadingMessage={loadingMessage} size="md" variant="inline" className={className} {...props}>
      {children}
    </SuspenseLoader>
  );
}

/**
 * A Suspense loader for page-level loading.
 * Uses fullscreen variant for better UX on page transitions.
 *
 * @example
 * <SuspensePageLoader loadingMessage="Loading dashboard...">
 *   <DashboardContent />
 * </SuspensePageLoader>
 */
export function SuspensePageLoader({
  children,
  loadingMessage = 'Loading...',
  ...props
}: Omit<SuspenseLoaderProps, 'variant'>) {
  return (
    <SuspenseLoader loadingMessage={loadingMessage} variant="fullscreen" {...props}>
      {children}
    </SuspenseLoader>
  );
}

/**
 * A Suspense loader for form components.
 * Provides a compact loading state suitable for forms.
 *
 * @example
 * <Card>
 *   <SuspenseFormLoader loadingMessage="Loading form...">
 *     <ResetPasswordForm />
 *   </SuspenseFormLoader>
 * </Card>
 */
export function SuspenseFormLoader({
  children,
  loadingMessage = 'Loading...',
  className,
  ...props
}: Omit<SuspenseLoaderProps, 'variant'>) {
  return (
    <SuspenseLoader loadingMessage={loadingMessage} size="md" variant="inline" className={className} {...props}>
      {children}
    </SuspenseLoader>
  );
}
