import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle2Icon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const SUCCESS_BASE_CLASSES = {
  container:
    'border-green-200/50 bg-green-50/50 dark:border-green-800/50 dark:bg-green-900/20 flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border p-6 text-center text-balance md:p-12',
  header: 'flex max-w-sm flex-col items-center gap-2 text-center',
  title: 'text-lg font-medium tracking-tight',
  description:
    'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4',
  content: 'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
} as const;

const successMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'icon',
    },
  }
);

/**
 * Success state component for displaying success messages and actions.
 *
 * @example
 * ```tsx
 * <Success>
 *   <SuccessHeader>
 *     <SuccessMedia><CheckCircle2Icon /></SuccessMedia>
 *     <SuccessTitle>Success!</SuccessTitle>
 *     <SuccessDescription>Operation completed successfully.</SuccessDescription>
 *   </SuccessHeader>
 *   <SuccessContent>
 *     <Button>Continue</Button>
 *   </SuccessContent>
 * </Success>
 *
 * // Or use the convenience component
 * <SuccessState
 *   title="Email Verified"
 *   description="Your email has been successfully verified"
 *   action={<Button onClick={handleContinue}>Go to Login</Button>}
 * />
 * ```
 */
function Success({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="success" className={cn(SUCCESS_BASE_CLASSES.container, className)} {...props} />;
}

function SuccessHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="success-header" className={cn(SUCCESS_BASE_CLASSES.header, className)} {...props} />;
}

function SuccessMedia({
  className,
  variant = 'icon',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof successMediaVariants>) {
  return (
    <div
      data-slot="success-media"
      data-variant={variant}
      className={cn(successMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function SuccessTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="success-title" className={cn(SUCCESS_BASE_CLASSES.title, className)} {...props} />;
}

function SuccessDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <div data-slot="success-description" className={cn(SUCCESS_BASE_CLASSES.description, className)} {...props} />;
}

function SuccessContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="success-content" className={cn(SUCCESS_BASE_CLASSES.content, className)} {...props} />;
}

interface SuccessStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'fullscreen';
  className?: string;
}

/**
 * Convenience component for simple success states
 *
 * @example
 * ```tsx
 * <SuccessState
 *  title="Email Verified"
 *  description="Your email has been successfully verified"
 *  action={<Button onClick={handleContinue}>Go to Login</Button>}
 * />
 */
function SuccessState({
  title = 'Success!',
  description = 'Operation completed successfully.',
  icon = <CheckCircle2Icon />,
  action,
  variant = 'default',
  className,
  ...props
}: SuccessStateProps & React.ComponentProps<'div'>) {
  const content = (
    <Success className={className} {...props}>
      <SuccessHeader>
        <SuccessMedia>{icon}</SuccessMedia>
        <SuccessTitle>{title}</SuccessTitle>
        <SuccessDescription>{description}</SuccessDescription>
      </SuccessHeader>
      {action && <SuccessContent>{action}</SuccessContent>}
    </Success>
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

export { Success, SuccessContent, SuccessDescription, SuccessHeader, SuccessMedia, SuccessState, SuccessTitle };
