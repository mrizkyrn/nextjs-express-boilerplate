import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/index';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'fullscreen' | 'overlay';
  className?: string;
  showBackdrop?: boolean;
}

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
  }[size];

  const isFullscreen = variant === 'fullscreen';
  const isOverlay = variant === 'overlay';

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-4 text-center',
    {
      'min-w-0 flex-1 p-6 text-balance md:p-12': variant === 'inline',
      'fixed inset-0 z-50': isFullscreen || isOverlay,
      'bg-background': isFullscreen,
      'bg-background/80 backdrop-blur-sm': isOverlay && showBackdrop,
    },
    className
  );

  return (
    <div role="status" aria-live="polite" className={containerClasses} {...props}>
      <Spinner className={spinnerSize} aria-hidden="true" />
      {message && <div className="text-muted-foreground text-sm">{message}</div>}
      <span className="sr-only">{message}</span>
    </div>
  );
}

export { Loading };
