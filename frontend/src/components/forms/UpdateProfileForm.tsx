'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useUpdateCurrentUser } from '@/lib/hooks/mutations/useUserMutations';
import { updateUserSchema, type UpdateUserInput } from '@/lib/schemas/userSchema';
import type { User as UserType } from '@/lib/types/user';

interface UpdateProfileFormProps {
  user: UserType;
}

export function UpdateProfileForm({ user }: UpdateProfileFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateCurrentUser();

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    mode: 'onBlur',
  });

  const onSubmit = (data: UpdateUserInput) => {
    // Only send changed values
    const changedData: UpdateUserInput = {};
    if (data.name !== user.name) changedData.name = data.name;
    if (data.email !== user.email) changedData.email = data.email;

    // Only submit if there are changes
    if (Object.keys(changedData).length > 0) {
      updateProfile(changedData, {
        onSuccess: () => {
          form.reset(data);
        },
      });
    }
  };

  const isDirty = form.formState.isDirty;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    icon={<User className="h-4 w-4" />}
                    disabled={isPending}
                    autoComplete="name"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail className="h-4 w-4" />}
                    disabled={isPending}
                    autoComplete="email"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => form.reset()} disabled={!isDirty || isPending}>
            Reset
          </Button>
          <Button type="submit" disabled={!isDirty || isPending} isLoading={isPending} loadingText="Saving...">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
