import Link from 'next/link';
import { ArrowRight, Shield, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <ThemeToggle />
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold">🚀 Built with Next.js 15 & shadcn/ui</div>

          {/* Heading */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Secure Authentication
              <span className="block text-primary mt-2">Made Simple</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Production-ready authentication system with JWT tokens, refresh tokens, and best security practices built-in.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-base">
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Type Safe</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">⚡</div>
              <div className="text-sm text-muted-foreground">Fast</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">🔒</div>
              <div className="text-sm text-muted-foreground">Secure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need for a modern authentication system</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure by Default</CardTitle>
              <CardDescription>HttpOnly cookies for refresh tokens, JWT access tokens, and automatic token refresh handling.</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Built with React Query for optimal caching, Next.js 15 for server-side rendering, and optimistic updates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Lock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Production Ready</CardTitle>
              <CardDescription>Complete with error handling, loading states, form validation with Zod, and TypeScript throughout.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Built With Modern Tech</h2>
          <p className="text-muted-foreground">Leveraging the best tools in the ecosystem</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {['Next.js 15', 'React 18', 'TypeScript', 'TanStack Query', 'Zustand', 'shadcn/ui', 'Tailwind CSS', 'Zod', 'React Hook Form', 'Axios'].map(
            (tech) => (
              <div key={tech} className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                {tech}
              </div>
            )
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl">Ready to get started?</CardTitle>
            <CardDescription className="text-base">Create your account in seconds and experience secure authentication.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/register">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">Built with ❤️ using Next.js & shadcn/ui</p>
        </div>
      </footer>
    </div>
  );
}
