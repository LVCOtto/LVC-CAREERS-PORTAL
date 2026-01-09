import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/authContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  ClipboardCheck,
  GraduationCap,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Award,
  Briefcase,
} from 'lucide-react';
import lvcLogo from '@assets/image-1_1767968047751.png';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles: ('colleague' | 'manager' | 'admin')[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['colleague', 'manager', 'admin'],
  },
  {
    href: '/induction',
    label: 'Induction & Role',
    icon: <ClipboardCheck className="w-5 h-5" />,
    roles: ['colleague', 'manager', 'admin'],
  },
  {
    href: '/training',
    label: 'Training Matrix',
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['colleague', 'manager', 'admin'],
  },
  {
    href: '/milestones',
    label: 'Career Milestones',
    icon: <Award className="w-5 h-5" />,
    roles: ['colleague', 'manager', 'admin'],
  },
  {
    href: '/resources',
    label: 'Resources',
    icon: <FolderOpen className="w-5 h-5" />,
    roles: ['colleague', 'manager', 'admin'],
  },
  {
    href: '/team',
    label: 'My Team',
    icon: <Users className="w-5 h-5" />,
    roles: ['manager', 'admin'],
  },
  {
    href: '/admin/users',
    label: 'User Management',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    href: '/admin/templates',
    label: 'Templates',
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    href: '/admin/roles',
    label: 'Job Roles',
    icon: <Briefcase className="w-5 h-5" />,
    roles: ['admin'],
  },
];

export function Layout({ children }: LayoutProps) {
  const { currentUser, logout } = useAuth();
  const [location] = useLocation();

  if (!currentUser) {
    return <>{children}</>;
  }

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(currentUser.role)
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'admin':
        return 'bg-primary/20 text-primary';
      case 'manager':
        return 'bg-accent/20 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-2">
            <img src={lvcLogo} alt="LVC UK" className="h-12 w-auto" />
          </div>
          <p className="text-sm text-sidebar-foreground/60">
            Career Portal
          </p>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {filteredNavItems.map(item => (
              <Link key={item.href} href={item.href}>
                <a
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    location === item.href
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid="user-menu-trigger"
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <Avatar className="h-9 w-9 bg-sidebar-primary">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {currentUser.jobRole}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                <span
                  className={cn(
                    'inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium capitalize',
                    getRoleBadge()
                  )}
                >
                  {currentUser.role}
                </span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-testid="button-logout"
                onClick={logout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
