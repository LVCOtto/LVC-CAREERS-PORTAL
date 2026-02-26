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
  Network,
  FileText,
  BadgeCheck,
  Map,
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

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "My Career",
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
      },
      {
        href: '/induction',
        label: 'Induction',
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
        href: '/career-map',
        label: 'Career Roadmap',
        icon: <Map className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
      },
      {
        href: '/role-playbook',
        label: 'Role Playbook',
        icon: <FileText className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
      },
      {
        href: '/milestones',
        label: 'Career Milestones',
        icon: <Award className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
      },
    ]
  },
  {
    title: "Company",
    items: [
      {
        href: '/resources',
        label: 'Resources',
        icon: <FolderOpen className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
      },
      {
        href: '/organisation',
        label: 'Organisation',
        icon: <Network className="w-5 h-5" />,
        roles: ['manager', 'admin'],
      },
    ]
  },
  {
    title: "Team Management",
    items: [
      {
        href: '/team',
        label: 'My Team',
        icon: <Users className="w-5 h-5" />,
        roles: ['manager', 'admin'],
      },
    ]
  },
  {
    title: "Administration",
    items: [
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
      {
        href: '/admin/resources',
        label: 'Resource Manager',
        icon: <FolderOpen className="w-5 h-5" />,
        roles: ['admin'],
      },
      {
        href: '/admin/certificates',
        label: 'Certificates',
        icon: <BadgeCheck className="w-5 h-5" />,
        roles: ['admin'],
      },
    ]
  }
];

export function Layout({ children }: LayoutProps) {
  const { currentUser, logout } = useAuth();
  const [location] = useLocation();

  if (!currentUser) {
    return <>{children}</>;
  }

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
          <nav className="px-3 space-y-6">
            {navGroups.map((group, groupIndex) => {
              const filteredItems = group.items.filter(item => {
                if (!item.roles.includes(currentUser.role)) return false;
                if (item.href === '/induction' && currentUser.requiresInduction === false) return false;
                return true;
              });

              if (filteredItems.length === 0) return null;

              return (
                <div key={group.title}>
                  <h3 className="mb-2 px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {filteredItems.map(item => (
                      <Link key={item.href} href={item.href}>
                        <div
                          data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
                            location === item.href
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                          )}
                        >
                          {item.icon}
                          {item.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
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
