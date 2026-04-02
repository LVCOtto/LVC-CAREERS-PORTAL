import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/authContext';
import { usePortalSettings } from '@/lib/portalSettingsContext';
import { cn } from '@/lib/utils';
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
  Paintbrush,
  Menu,
  X,
} from 'lucide-react';
import lvcLogo from '@assets/image-1_1767968047751.png';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  labelKey: string;
  defaultLabel: string;
  icon: ReactNode;
  roles: ('colleague' | 'manager' | 'admin' | 'architect')[];
  visibilityKey?: string;
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
        labelKey: 'nav.dashboard',
        defaultLabel: 'Dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
      },
      {
        href: '/induction',
        labelKey: 'nav.induction',
        defaultLabel: 'Induction',
        icon: <ClipboardCheck className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
        visibilityKey: 'pages.induction.visible',
      },
      {
        href: '/training',
        labelKey: 'nav.training',
        defaultLabel: 'Training Matrix',
        icon: <GraduationCap className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
      },
      {
        href: '/career-map',
        labelKey: 'nav.career',
        defaultLabel: 'Career Roadmap',
        icon: <Map className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
        visibilityKey: 'pages.career.visible',
      },
      {
        href: '/role-playbook',
        labelKey: 'nav.playbook',
        defaultLabel: 'Role Playbook',
        icon: <FileText className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
        visibilityKey: 'pages.playbook.visible',
      },
      {
        href: '/milestones',
        labelKey: 'nav.milestones',
        defaultLabel: 'Achievements',
        icon: <Award className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
        visibilityKey: 'pages.milestones.visible',
      },
    ]
  },
  {
    title: "Company",
    items: [
      {
        href: '/resources',
        labelKey: 'nav.resources',
        defaultLabel: 'Resources',
        icon: <FolderOpen className="w-5 h-5" />,
        roles: ['colleague', 'manager', 'admin'],
        visibilityKey: 'pages.resources.visible',
      },
      {
        href: '/organisation',
        labelKey: 'nav.organisation',
        defaultLabel: 'Organisation',
        icon: <Network className="w-5 h-5" />,
        roles: ['manager', 'admin'],
        visibilityKey: 'pages.organisation.visible',
      },
    ]
  },
  {
    title: "Team Management",
    items: [
      {
        href: '/team',
        labelKey: 'nav.team',
        defaultLabel: 'My Team',
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
        labelKey: '',
        defaultLabel: 'User Management',
        icon: <Users className="w-5 h-5" />,
        roles: ['admin'],
      },
      {
        href: '/admin/templates',
        labelKey: '',
        defaultLabel: 'Templates',
        icon: <Settings className="w-5 h-5" />,
        roles: ['admin'],
      },
      {
        href: '/admin/roles',
        labelKey: '',
        defaultLabel: 'Job Roles',
        icon: <Briefcase className="w-5 h-5" />,
        roles: ['admin'],
      },
      {
        href: '/admin/resources',
        labelKey: '',
        defaultLabel: 'Resource Manager',
        icon: <FolderOpen className="w-5 h-5" />,
        roles: ['admin'],
      },
      {
        href: '/admin/certificates',
        labelKey: '',
        defaultLabel: 'Certificates',
        icon: <BadgeCheck className="w-5 h-5" />,
        roles: ['admin'],
      },
    ]
  },
  {
    title: "Architect",
    items: [
      {
        href: '/architect-studio',
        labelKey: '',
        defaultLabel: 'Portal Studio',
        icon: <Paintbrush className="w-5 h-5" />,
        roles: ['architect'],
      },
    ]
  }
];

export function Layout({ children }: LayoutProps) {
  const { currentUser, logout } = useAuth();
  const { getSetting } = usePortalSettings();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      case 'architect':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const sidebarTitle = getSetting('portal.sidebarTitle', 'Career Portal');

  const filteredNavGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (!item.roles.includes(currentUser.role)) return false;
        if (item.href === '/induction' && currentUser.requiresInduction === false) return false;
        if (item.visibilityKey && getSetting(item.visibilityKey) === 'false') return false;
        return true;
      }),
    }))
    .filter(group => group.items.length > 0);

  const renderNav = (onNavigate?: () => void) => (
    <nav className="px-3 space-y-6">
      {filteredNavGroups.map((group) => (
        <div key={group.title}>
          <h3 className="mb-2 px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.items.map(item => {
              const label = item.labelKey ? getSetting(item.labelKey, item.defaultLabel) : item.defaultLabel;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    data-testid={`nav-${item.defaultLabel.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
                      location === item.href || (item.href === '/team' && location.startsWith('/team'))
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    {item.icon}
                    {label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex md:w-64 bg-sidebar text-sidebar-foreground flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-2">
            <img src={lvcLogo} alt="LVC UK" className="h-12 w-auto" />
          </div>
          <p className="text-sm text-sidebar-foreground/60">
            {sidebarTitle}
          </p>
        </div>

        <ScrollArea className="flex-1 py-4">
          {renderNav()}
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
                <p className="text-xs text-muted-foreground">{currentUser.email || ''}</p>
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

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            className="flex-1 bg-black/50"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="w-[18rem] max-w-[85vw] bg-sidebar text-sidebar-foreground flex flex-col border-l border-sidebar-border">
            <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
              <div>
                <img src={lvcLogo} alt="LVC UK" className="h-10 w-auto" />
                <p className="text-xs text-sidebar-foreground/60 mt-1">{sidebarTitle}</p>
              </div>
              <button
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-sidebar-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ScrollArea className="flex-1 py-4">
              {renderNav(() => setMobileMenuOpen(false))}
            </ScrollArea>
            <div className="p-4 border-t border-sidebar-border">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground hover:opacity-90"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        <div className="md:hidden sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-md border border-border"
                aria-label="Open navigation menu"
                data-testid="button-open-mobile-nav"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm font-semibold">{sidebarTitle}</p>
                <p className="text-xs text-muted-foreground">{currentUser.name}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg border border-border px-2 py-1">
                  <Avatar className="h-7 w-7 bg-primary/15">
                    <AvatarFallback className="text-xs font-medium">{getInitials(currentUser.name)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email || ''}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
