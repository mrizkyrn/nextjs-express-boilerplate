import { Loader2Icon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils/index';

const spinnerBaseClasses = 'size-4 animate-spin';

/**
 * A loading spinner component with consistent styling.
 *
 * @example
 * <Spinner />
 * <Spinner className="size-6 text-primary" />
 */
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return <Loader2Icon role="status" aria-label="Loading" className={cn(spinnerBaseClasses, className)} {...props} />;
}

export { Spinner };
