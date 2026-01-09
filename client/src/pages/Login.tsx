import { useAuth } from '@/lib/authContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole, users } from '@/lib/mockData';
import { Users, Shield, User } from 'lucide-react';

export default function Login() {
  const { loginAs } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = (role: UserRole) => {
    loginAs(role);
    setLocation('/dashboard');
  };

  const roleCards = [
    {
      role: 'colleague' as UserRole,
      title: 'Colleague',
      description: 'View your induction progress, training records, and career milestones',
      icon: <User className="w-8 h-8" />,
      user: users.find(u => u.role === 'colleague'),
      color: 'bg-blue-500',
    },
    {
      role: 'manager' as UserRole,
      title: 'Line Manager',
      description: 'Manage your team, sign off training, and track team compliance',
      icon: <Users className="w-8 h-8" />,
      user: users.find(u => u.role === 'manager'),
      color: 'bg-amber-500',
    },
    {
      role: 'admin' as UserRole,
      title: 'Administrator',
      description: 'Full system access including templates, users, and all records',
      icon: <Shield className="w-8 h-8" />,
      user: users.find(u => u.role === 'admin'),
      color: 'bg-primary',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-sidebar to-primary/20 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-white mb-3">
            LVC Career Portal
          </h1>
          <p className="text-lg text-white/70">
            Training & Development Management System
          </p>
        </div>

        <Card className="bg-card/95 backdrop-blur border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl">Welcome</CardTitle>
            <CardDescription className="text-base">
              Select a role to explore the portal demo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              {roleCards.map((card, index) => (
                <button
                  key={card.role}
                  data-testid={`button-login-${card.role}`}
                  onClick={() => handleLogin(card.role)}
                  className="group text-left animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-full p-6 rounded-xl border-2 border-border bg-background hover:border-primary hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    <div
                      className={`w-14 h-14 rounded-xl ${card.color} text-white flex items-center justify-center mb-4`}
                    >
                      {card.icon}
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {card.description}
                    </p>
                    {card.user && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm font-medium">{card.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {card.user.jobRole}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                This is a demonstration prototype with mock data.
                <br />
                All changes are temporary and will reset on page refresh.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
