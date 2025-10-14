import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/index';

const inputBaseClasses =
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive';

export interface InputProps extends React.ComponentProps<'input'> {
  icon?: React.ReactNode;
}

/**
 * A customizable input component with optional icon support.
 *
 * @example
 * <Input placeholder="Enter text" />
 * <Input icon={<Search />} placeholder="Search..." />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, icon, ...props }, ref) => {
  return (
    <div className="relative">
      {icon && (
        <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(inputBaseClasses, icon ? 'pl-9' : 'px-3', className)}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean;
}

/**
 * A password input component with show/hide toggle functionality.
 *
 * @example
 * <PasswordInput placeholder="Enter password" />
 * <PasswordInput showToggle={false} placeholder="No toggle" />
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        {icon && (
          <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2">
            {icon}
          </div>
        )}
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn(showToggle ? 'pr-9' : '', icon ? 'pl-9' : '', className)}
          {...props}
        />
        {showToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={props.disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="text-muted-foreground h-4 w-4" />
            ) : (
              <Eye className="text-muted-foreground h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { Input, PasswordInput };
