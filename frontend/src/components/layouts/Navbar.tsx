'use client';

import { ChevronDown, Home, Info, LogOut, Mail, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useLogout } from '@/lib/hooks/mutations/useAuthMutations';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { user } = useAuth();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  // Main navigation items (Home, About, Contact)
  const mainNavItems = [
    { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
    { label: 'About', href: '/about', icon: <Info className="h-4 w-4" /> },
    { label: 'Contact', href: '/contact', icon: <Mail className="h-4 w-4" /> },
  ];

  // Profile dropdown items
  const profileItems = [
    { label: 'Profile', href: '/profile', icon: <User className="h-4 w-4" /> },
    { label: 'Security', href: '/profile/security', icon: <Shield className="h-4 w-4" /> },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="border-border bg-background supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="from-primary flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br to-blue-600">
            <span className="text-primary-foreground text-base font-bold">L</span>
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-foreground text-sm leading-tight font-semibold">App Name</span>
            <span className="text-muted-foreground text-xs leading-tight">Your Dashboard</span>
          </div>
        </Link>

        {/* Main Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Authenticated User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden flex-col items-start text-left md:flex">
                  <span className="text-foreground text-sm leading-tight font-medium">{user?.name || 'User'}</span>
                  {user?.email && (
                    <span className="text-muted-foreground max-w-[150px] truncate text-xs leading-tight">
                      {user.email}
                    </span>
                  )}
                </div>
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">{user?.name || 'User'}</p>
                    {user?.email && <p className="text-muted-foreground text-xs leading-none">{user.email}</p>}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Profile Items */}
                {profileItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                {/* Mobile Navigation Items */}
                <div className="md:hidden">
                  {mainNavItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>

                {/* Logout */}
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Unauthenticated - Show Sign Up and Login buttons */
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
