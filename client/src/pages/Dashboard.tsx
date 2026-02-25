import { useAuth, User } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Spinner } from '@/components/ui/spinner';
import {
  useInduction,
  useTrainingRecords,
  useUserCertificates,
  useTeamMembers,
  useUsers,
} from '@/lib/hooks';
import {
  ClipboardCheck,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Users,
  TrendingUp,
  Trophy,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Compass,
  ChevronRight,
  Lightbulb,
  Calendar,
  FileCheck,
} from 'lucide-react';

function ColleagueDashboard({ user }: { user: User }) {
  const { data: inductionData, isLoading: inductionLoading } = useInduction(user.id);
  const { data: trainingRecords = [], isLoading: trainingLoading } = useTrainingRecords(user.id);
  const { data: userCertificates = [], isLoading: certsLoading } = useUserCertificates(user.id);

  const isLoading = inductionLoading || trainingLoading || certsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const inductionItems = inductionData?.items ?? [];
  const totalItems = inductionItems.length;
  const completedItems = inductionItems.filter((item: any) => item.completed).length;
  const inductionProgressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const compliantTraining = trainingRecords.filter((r: any) => r.status === 'compliant').length;
  const dueSoonTraining = trainingRecords.filter((r: any) => r.status === 'due_soon').length;
  const overdueTraining = trainingRecords.filter((r: any) => r.status === 'overdue').length;
  const totalTraining = trainingRecords.length;
  const complianceRate = totalTraining > 0 ? Math.round((compliantTraining / totalTraining) * 100) : 0;

  const upcomingExpiries = trainingRecords
    .filter((r: any) => r.status === 'due_soon' || r.status === 'overdue')
    .slice(0, 3);

  const startDate = new Date(user.startDate);
  const now = new Date();
  const monthsAtLVC = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2a4a] via-[#243656] to-[#1a2a4a] p-8 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 mb-1">Welcome back</p>
              <h1 className="font-display text-4xl font-bold mb-2">
                {user.name.split(' ')[0]}
              </h1>
              <p className="text-white/80 text-lg">
                {user.jobRole} • {monthsAtLVC} months at LVC
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span className="font-medium">Career Hub</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userCertificates.length}</p>
                  <p className="text-sm text-white/70">Certificates Earned</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{complianceRate}%</p>
                  <p className="text-sm text-white/70">Training Complete</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inductionProgressPercent}%</p>
                  <p className="text-sm text-white/70">Induction Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Your Career Journey</CardTitle>
                  <CardDescription>Track your progress and plan your next steps</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/induction">
              <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group" data-testid="link-induction-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${inductionProgressPercent === 100 ? 'bg-emerald-100' : 'bg-primary/10'}`}>
                      <ClipboardCheck className={`h-6 w-6 ${inductionProgressPercent === 100 ? 'text-emerald-600' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Induction & Onboarding</h3>
                      <p className="text-sm text-muted-foreground">
                        {inductionProgressPercent === 100
                          ? 'Completed - Great job!'
                          : `${completedItems} of ${totalItems} items completed`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Progress value={inductionProgressPercent} className="w-32 h-2" />
                      <p className="text-sm text-muted-foreground mt-1">{inductionProgressPercent}%</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/training">
              <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group" data-testid="link-training-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Competency & Skills</h3>
                      <p className="text-sm text-muted-foreground">View your training matrix and skill levels</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="gap-1">
                      <GraduationCap className="h-3 w-3" />
                      View Matrix
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/milestones">
              <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group" data-testid="link-milestones-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Milestones & Certificates</h3>
                      <p className="text-sm text-muted-foreground">
                        {userCertificates.length} certificate{userCertificates.length !== 1 ? 's' : ''} earned
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      View All
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/resources">
              <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group" data-testid="link-resources-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Learning Resources</h3>
                      <p className="text-sm text-muted-foreground">Policies, guides, and reference materials</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Development Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-sm font-medium">Complete your training matrix</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Self-assess your skills using the Smartsheet form to help identify development areas.
                  </p>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-sm font-medium">Schedule a 1:1 with your manager</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Discuss your career goals and training opportunities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {upcomingExpiries.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <CardTitle className="text-lg">Attention Required</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingExpiries.map((record: any) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border"
                      data-testid={`alert-training-${record.id}`}
                    >
                      <div>
                        <p className="font-medium text-sm">{record.requirementName}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.expiresDate
                            ? `Expires: ${new Date(record.expiresDate).toLocaleDateString('en-GB')}`
                            : 'Not completed'}
                        </p>
                      </div>
                      <StatusBadge status={record.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Compliant Training</span>
                  <span className="font-semibold text-emerald-600">{compliantTraining}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due Soon</span>
                  <span className="font-semibold text-amber-600">{dueSoonTraining}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overdue</span>
                  <span className="font-semibold text-red-600">{overdueTraining}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ManagerDashboard({ user }: { user: User }) {
  const { data: teamMembers = [], isLoading } = useTeamMembers(user.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Team Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your team's training and induction progress
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{teamMembers.length}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {teamMembers.length > 0 ? teamMembers.length : 0} Active
                </p>
                <p className="text-sm text-muted-foreground">Team Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Click on a team member to view their full profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member: any) => (
              <Link key={member.id} href={`/team/${member.id}`}>
                <div
                  className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                  data-testid={`team-member-${member.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary">
                      {member.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.jobRole}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {member.startDate && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Started</p>
                        <p className="text-sm">{new Date(member.startDate).toLocaleDateString('en-GB')}</p>
                      </div>
                    )}
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
            {teamMembers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No team members found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard({ user }: { user: User }) {
  const { data: allUsers = [], isLoading } = useUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const colleagues = allUsers.filter((u: any) => u.role === 'colleague');
  const managers = allUsers.filter((u: any) => u.role === 'manager');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          System-wide overview of training and compliance
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-3xl font-display font-bold text-primary">{allUsers.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-3xl font-display font-bold">{colleagues.length}</p>
            <p className="text-sm text-muted-foreground">Colleagues</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-3xl font-display font-bold">{managers.length}</p>
            <p className="text-sm text-muted-foreground">Managers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start" data-testid="link-manage-users">
                <Users className="w-4 h-4 mr-3" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/templates">
              <Button variant="outline" className="w-full justify-start" data-testid="link-manage-templates">
                <ClipboardCheck className="w-4 h-4 mr-3" />
                Edit Templates
              </Button>
            </Link>
            <Link href="/admin/roles">
              <Button variant="outline" className="w-full justify-start" data-testid="link-manage-roles">
                <GraduationCap className="w-4 h-4 mr-3" />
                Job Roles & Training
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <span className="font-medium">Total Users</span>
                <span className="text-lg font-bold text-primary">{allUsers.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <span className="font-medium">Colleagues</span>
                <span className="text-lg font-bold">{colleagues.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <span className="font-medium">Managers</span>
                <span className="text-lg font-bold">{managers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <Layout>
      {currentUser.role === 'colleague' && <ColleagueDashboard user={currentUser} />}
      {currentUser.role === 'manager' && <ManagerDashboard user={currentUser} />}
      {currentUser.role === 'admin' && <AdminDashboard user={currentUser} />}
    </Layout>
  );
}
