import { Loader2Icon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const SPINNER_BASE_CLASSES = 'size-4 animate-spin';

/**
 * A loading spinner component with consistent styling.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner className="size-6 text-primary" />
 * ```
 */
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return <Loader2Icon role="status" aria-label="Loading" className={cn(SPINNER_BASE_CLASSES, className)} {...props} />;
}

export { Spinner };
