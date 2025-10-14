import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangleIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/index';

// Constants
const errorBaseClasses =
  'border-destructive/20 bg-destructive/5 flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border p-6 text-center text-balance md:p-12';
const errorHeaderBaseClasses = 'flex max-w-sm flex-col items-center gap-2 text-center';
const errorTitleBaseClasses = 'text-lg font-medium tracking-tight';
const errorDescriptionBaseClasses =
  'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4';
const errorContentBaseClasses = 'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance';

const errorMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'icon',
    },
  }
);

/**
 * Error state component for displaying error messages.
 *
 * @example
 * <Error>
 *   <ErrorHeader>
 *     <ErrorMedia><AlertTriangleIcon /></ErrorMedia>
 *     <ErrorTitle>Failed to load</ErrorTitle>
 *     <ErrorDescription>Please try again later.</ErrorDescription>
 *   </ErrorHeader>
 *   <ErrorContent>
 *     <Button onClick={retry}>Retry</Button>
 *   </ErrorContent>
 * </Error>
 *
 * // Or use the convenience component
 * <ErrorState
 *   title="Error occurred"
 *   description="Something went wrong"
 *   onRetry={handleRetry}
 * />
 */
function Error({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="error" className={cn(errorBaseClasses, className)} {...props} />;
}

function ErrorHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="error-header" className={cn(errorHeaderBaseClasses, className)} {...props} />;
}

function ErrorMedia({
  className,
  variant = 'icon',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof errorMediaVariants>) {
  return (
    <div
      data-slot="error-media"
      data-variant={variant}
      className={cn(errorMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function ErrorTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="error-title" className={cn(errorTitleBaseClasses, className)} {...props} />;
}

function ErrorDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <div data-slot="error-description" className={cn(errorDescriptionBaseClasses, className)} {...props} />;
}

function ErrorContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="error-content" className={cn(errorContentBaseClasses, className)} {...props} />;
}

// Convenience component for simple error states
interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  media?: React.ReactNode;
  variant?: 'default' | 'fullscreen';
  className?: string;
}

function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  media = <AlertTriangleIcon />,
  variant = 'default',
  className,
  ...props
}: ErrorStateProps & React.ComponentProps<'div'>) {
  const content = (
    <Error className={className} {...props}>
      <ErrorHeader>
        <ErrorMedia>{media}</ErrorMedia>
        <ErrorTitle>{title}</ErrorTitle>
        <ErrorDescription>{description}</ErrorDescription>
      </ErrorHeader>
      {onRetry && (
        <ErrorContent>
          <Button onClick={onRetry} variant="outline" size="sm">
            {retryLabel}
          </Button>
        </ErrorContent>
      )}
    </Error>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="w-full max-w-lg">{content}</div>
      </div>
    );
  }

  return content;
}

export { Error, ErrorContent, ErrorDescription, ErrorHeader, ErrorMedia, ErrorState, ErrorTitle };
