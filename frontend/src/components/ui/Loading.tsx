import * as React from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/index';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'inline' | 'fullscreen' | 'overlay';
  className?: string;
  showBackdrop?: boolean;
}

/**
 * A loading component with multiple variants and sizes.
 *
 * @example
 * // Inline loading
 * <Loading message="Loading data..." />
 *
 * // Fullscreen loading
 * <Loading variant="fullscreen" message="Please wait..." />
 *
 * // Overlay loading with backdrop
 * <Loading variant="overlay" showBackdrop />
 *
 * // Different sizes
 * <Loading size="lg" message="Loading..." />
 */
function Loading({
  message = 'Loading...',
  size = 'md',
  variant = 'inline',
  className,
  showBackdrop = true,
  ...props
}: LoadingProps & React.ComponentProps<'div'>) {
  const spinnerSize = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-12',
  }[size];

  const isFullscreen = variant === 'fullscreen';
  const isOverlay = variant === 'overlay';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-4 text-center',
        {
          'min-w-0 flex-1 p-6 text-balance md:p-12': variant === 'inline',
          'fixed inset-0 z-50': isFullscreen || isOverlay,
          'bg-background': isFullscreen,
          'bg-background/80 backdrop-blur-sm': isOverlay && showBackdrop,
        },
        className
      )}
      {...props}
    >
      <Spinner className={spinnerSize} aria-hidden="true" />
      {message && <div className="text-muted-foreground text-sm">{message}</div>}
      <span className="sr-only">{message}</span>
    </div>
  );
}

export { Loading };
