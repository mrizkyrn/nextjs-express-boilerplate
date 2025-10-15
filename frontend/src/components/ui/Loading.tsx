import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const loadingVariants = cva('flex flex-col items-center justify-center gap-4 text-center', {
  variants: {
    variant: {
      inline: 'min-w-0 flex-1 p-6 text-balance md:p-12',
      fullscreen: 'fixed inset-0 z-50 bg-background',
      overlay: 'fixed inset-0 z-50',
    },
    backdrop: {
      true: 'bg-background/80 backdrop-blur-sm',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'inline',
    backdrop: true,
  },
});

interface LoadingProps extends VariantProps<typeof loadingVariants> {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * A loading component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * // Inline loading
 * <Loading message="Loading data..." />
 *
 * // Fullscreen loading
 * <Loading variant="fullscreen" message="Please wait..." />
 *
 * // Overlay loading (always with backdrop)
 * <Loading variant="overlay" />
 *
 * // Overlay without backdrop
 * <Loading variant="overlay" backdrop={false} />
 *
 * // Different sizes
 * <Loading size="lg" message="Loading..." />
 * ```
 */
function Loading({
  message = 'Loading...',
  size = 'md',
  variant = 'inline',
  backdrop = true,
  className,
  ...props
}: LoadingProps & React.ComponentProps<'div'>) {
  const spinnerSize = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-12',
  }[size];

  // For overlay variant, always show backdrop; for others, use the backdrop prop
  const shouldShowBackdrop = variant === 'overlay' ? true : backdrop;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(loadingVariants({ variant, backdrop: shouldShowBackdrop }), className)}
      {...props}
    >
      <Spinner className={spinnerSize} aria-hidden="true" />
      {message && <div className="text-muted-foreground text-sm">{message}</div>}
      <span className="sr-only">{message}</span>
    </div>
  );
}

export { Loading };
