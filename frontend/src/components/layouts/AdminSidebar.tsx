import { ChevronLeft, ChevronRight, Home, LogOut, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface MenuItem {
  icon: ReactNode;
  label: string;
  path: string;
  badgeCount?: number;
}

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  username?: string;
  onLogout: () => void;
}

interface NavItemProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  badgeCount?: number;
  onClick: () => void;
}

// Navigation Item Component
const NavItem = ({ icon, label, isActive, collapsed, badgeCount = 0, onClick }: NavItemProps) => {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          'group relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          collapsed ? 'justify-center' : 'justify-start',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted group-hover:text-secondary-foreground'
        )}
      >
        {/* Icon */}
        <span className="flex-shrink-0 transition-colors duration-200">{icon}</span>

        {/* Label (hidden when collapsed) */}
        {!collapsed && <span className="ml-3 truncate">{label}</span>}

        {/* Badge */}
        {badgeCount > 0 && (
          <span
            className={cn(
              'flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white',
              collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
            )}
          >
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </button>
    </li>
  );
};

// Logo Component
const SidebarLogo = ({ collapsed }: { collapsed: boolean }) => (
  <div
    className={cn('border-border flex h-16 items-center border-b px-4', collapsed ? 'justify-center' : 'justify-start')}
  >
    <div className="flex items-center gap-3">
      <div className="from-primary flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br to-blue-600">
        <span className="text-primary-foreground text-sm font-bold">A</span>
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-foreground text-sm font-semibold">Admin Panel</span>
          <span className="text-muted-foreground text-xs">Dashboard</span>
        </div>
      )}
    </div>
  </div>
);

// User Profile Section
const UserProfile = ({
  collapsed,
  username,
  onLogout,
}: {
  collapsed: boolean;
  username?: string;
  onLogout: () => void;
}) => (
  <div className={cn('border-border border-t p-4', collapsed && 'flex justify-center')}>
    {!collapsed && username && (
      <div className="mb-3">
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">Account</p>
        <p className="text-foreground truncate text-xs font-medium">{username}</p>
      </div>
    )}
    <button
      onClick={onLogout}
      className={cn(
        'group text-muted-foreground flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-red-50 hover:text-red-600',
        collapsed && 'h-10 w-10'
      )}
    >
      <LogOut size={16} className="transition-transform group-hover:scale-110" />
      {!collapsed && <span>Sign out</span>}
    </button>
  </div>
);

// Toggle Button
const SidebarToggle = ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className="border-border bg-background text-muted-foreground hover:border-ring hover:text-foreground focus:ring-ring absolute top-12 -right-3 flex h-7 w-7 items-center justify-center rounded-full border shadow-lg transition-all hover:shadow-xl focus:ring-2 focus:ring-offset-1 focus:outline-none"
    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  >
    {collapsed ? (
      <ChevronRight size={12} className="transition-transform hover:scale-110" />
    ) : (
      <ChevronLeft size={12} className="transition-transform hover:scale-110" />
    )}
  </button>
);

const AdminSidebar = ({ collapsed, setCollapsed, username, onLogout }: AdminSidebarProps) => {
  const router = useRouter();
  const currentPath = usePathname();

  // Define menu items
  const menuItems: MenuItem[] = [
    {
      icon: <Home size={16} />,
      label: 'Dashboard',
      path: '/admin',
    },
    {
      icon: <Users size={16} />,
      label: 'Users',
      path: '/admin/users',
    },
  ];

  // Handle navigation
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <aside
      className={cn(
        'border-border bg-background fixed top-0 left-0 z-40 flex h-screen flex-col border-r transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <SidebarToggle collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <SidebarLogo collapsed={collapsed} />

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              isActive={currentPath === item.path}
              collapsed={collapsed}
              badgeCount={item.badgeCount}
              onClick={() => handleNavigate(item.path)}
            />
          ))}
        </ul>
      </nav>

      <UserProfile collapsed={collapsed} username={username} onLogout={onLogout} />
    </aside>
  );
};

export default AdminSidebar;
