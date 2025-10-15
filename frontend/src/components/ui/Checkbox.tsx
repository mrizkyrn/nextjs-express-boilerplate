'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const CHECKBOX_BASE_CLASSES = {
  container:
    'peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-xs border outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  indicator: 'grid place-content-center text-current transition-none',
} as const;

/**
 * A customizable checkbox component with support for indeterminate state.
 *
 * @example
 * ```tsx
 * <Checkbox />
 * <Checkbox checked />
 * <Checkbox checked="indeterminate" />
 * ```
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root data-slot="checkbox" className={cn(CHECKBOX_BASE_CLASSES.container, className)} {...props}>
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className={cn(CHECKBOX_BASE_CLASSES.indicator)}>
        {props.checked === 'indeterminate' ? (
          <div className="h-2 w-2 rounded-xs bg-current" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
