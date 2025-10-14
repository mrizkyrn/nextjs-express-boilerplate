import Link from 'next/link';

import { RegisterForm } from '@/components/forms/RegisterForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>Enter your details below to create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="font-medium">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
