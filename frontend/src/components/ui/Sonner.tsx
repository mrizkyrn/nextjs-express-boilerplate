'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';
import { Toaster as Sonner, ToasterProps } from 'sonner';

/**
 * Toast notification component powered by Sonner.
 * Automatically adapts to the current theme.
 *
 * @example
 * ```tsx
 * // Add to root layout
 * <Toaster />
 *
 * // Use in components
 * import { toast } from 'sonner';
 * toast.success('Operation successful!');
 * toast.error('Something went wrong');
 * toast('Here is a notification');
 * ```
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
