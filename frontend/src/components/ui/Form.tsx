'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

const FORM_BASE_CLASSES = {
  item: 'grid gap-2',
  label: 'data-[error=true]:text-destructive',
  description: 'text-muted-foreground text-sm',
  message: 'text-destructive text-xs',
} as const;

// Types
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

type FormItemContextValue = {
  id: string;
};

// Contexts
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

/**
 * Form component that provides context for form controls.
 * Wrap your form elements with this component to enable form state management.
 *
 * @example
 * ```tsx
 * <Form {...formMethods}>
 *   <form onSubmit={formMethods.handleSubmit(onSubmit)}>
 *     <FormField
 *       control={formMethods.control}
 *       name="email"
 *       render={({ field }) => (
 *         <FormItem>
 *           <FormLabel>Email</FormLabel>
 *           <FormControl>
 *             <Input placeholder="Enter email" {...field} />
 *           </FormControl>
 *           <FormMessage />
 *         </FormItem>
 *       )}
 *     />
 *     <Button type="submit">Submit</Button>
 *   </form>
 * </Form>
 * ```
 */
const Form = FormProvider;

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { name } = fieldContext;
  const { id } = itemContext;

  // Memoize form state to prevent unnecessary recalculations
  const formState = useFormState({ name });
  const fieldState = React.useMemo(() => getFieldState(name, formState), [getFieldState, name, formState]);

  // Memoize generated IDs
  const ids = React.useMemo(
    () => ({
      id,
      name,
      formItemId: `${id}-form-item`,
      formDescriptionId: `${id}-form-item-description`,
      formMessageId: `${id}-form-item-message`,
    }),
    [id, name]
  );

  return {
    ...ids,
    ...fieldState,
  };
};

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn(FORM_BASE_CLASSES.item, className)} {...props} />
    </FormItemContext.Provider>
  );
}
FormItem.displayName = 'FormItem';

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn(FORM_BASE_CLASSES.label, className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}
FormLabel.displayName = 'FormLabel';

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  const ariaDescribedBy = React.useMemo(
    () => (!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`),
    [error, formDescriptionId, formMessageId]
  );

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={ariaDescribedBy}
      aria-invalid={!!error}
      {...props}
    />
  );
}
FormControl.displayName = 'FormControl';

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn(FORM_BASE_CLASSES.description, className)}
      {...props}
    />
  );
}
FormDescription.displayName = 'FormDescription';

function FormMessage({ className, children, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();

  const body = React.useMemo(() => (error ? String(error?.message ?? '') : children), [error, children]);

  if (!body) {
    return null;
  }

  return (
    <p data-slot="form-message" id={formMessageId} className={cn(FORM_BASE_CLASSES.message, className)} {...props}>
      {body}
    </p>
  );
}
FormMessage.displayName = 'FormMessage';

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField };
