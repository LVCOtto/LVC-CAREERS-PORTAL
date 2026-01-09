import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import {
  getInductionForUser,
  getTrainingRecordsForUser,
  getComplianceStats,
  getInductionProgress,
  getTeamMembers,
  users,
  User,
  certificates,
} from '@/lib/mockData';
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
  const induction = getInductionForUser(user.id);
  const trainingRecords = getTrainingRecordsForUser(user.id);
  const inductionProgress = getInductionProgress(induction.items);
  const compliance = getComplianceStats(trainingRecords);
  const userCertificates = certificates.filter(c => c.userId === user.id);

  const upcomingExpiries = trainingRecords
    .filter(r => r.status === 'due_soon' || r.status === 'overdue')
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
                  <p className="text-2xl font-bold">{compliance.complianceRate}%</p>
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
                  <p className="text-2xl font-bold">{inductionProgress.progressPercent}%</p>
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
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${inductionProgress.progressPercent === 100 ? 'bg-emerald-100' : 'bg-primary/10'}`}>
                      <ClipboardCheck className={`h-6 w-6 ${inductionProgress.progressPercent === 100 ? 'text-emerald-600' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Induction & Onboarding</h3>
                      <p className="text-sm text-muted-foreground">
                        {inductionProgress.progressPercent === 100 
                          ? 'Completed - Great job!' 
                          : `${inductionProgress.completed} of ${inductionProgress.total} items completed`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Progress value={inductionProgress.progressPercent} className="w-32 h-2" />
                      <p className="text-sm text-muted-foreground mt-1">{inductionProgress.progressPercent}%</p>
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
                  {upcomingExpiries.map(record => (
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
                  <span className="font-semibold text-emerald-600">{compliance.compliant}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due Soon</span>
                  <span className="font-semibold text-amber-600">{compliance.dueSoon}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overdue</span>
                  <span className="font-semibold text-red-600">{compliance.overdue}</span>
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
  const teamMembers = getTeamMembers(user.id);

  const teamStats = teamMembers.map(member => {
    const induction = getInductionForUser(member.id);
    const training = getTrainingRecordsForUser(member.id);
    const inductionProgress = getInductionProgress(induction.items);
    const compliance = getComplianceStats(training);

    return {
      ...member,
      inductionProgress: inductionProgress.progressPercent,
      inductionStatus: induction.status,
      complianceRate: compliance.complianceRate,
      overdue: compliance.overdue,
      dueSoon: compliance.dueSoon,
    };
  });

  const totalOverdue = teamStats.reduce((sum, m) => sum + m.overdue, 0);
  const totalDueSoon = teamStats.reduce((sum, m) => sum + m.dueSoon, 0);
  const avgCompliance = Math.round(
    teamStats.reduce((sum, m) => sum + m.complianceRate, 0) / teamStats.length || 0
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Team Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your team's training and induction progress
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
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
                <p className="text-2xl font-display font-bold">{avgCompliance}%</p>
                <p className="text-sm text-muted-foreground">Avg Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalDueSoon}</p>
                <p className="text-sm text-muted-foreground">Due Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalOverdue}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
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
            {teamStats.map(member => (
              <Link key={member.id} href={`/team/${member.id}`}>
                <div
                  className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                  data-testid={`team-member-${member.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary">
                      {member.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.jobRole}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-medium">Induction</p>
                      <div className="flex items-center gap-2">
                        <Progress value={member.inductionProgress} className="w-24 h-1.5" />
                        <span className="text-sm text-muted-foreground w-10">
                          {member.inductionProgress}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p className="text-sm font-medium">Compliance</p>
                      <p
                        className={`text-lg font-semibold ${
                          member.complianceRate >= 80
                            ? 'text-emerald-600'
                            : member.complianceRate >= 60
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {member.complianceRate}%
                      </p>
                    </div>

                    {(member.overdue > 0 || member.dueSoon > 0) && (
                      <div className="flex items-center gap-2">
                        {member.overdue > 0 && (
                          <span className="px-2 py-1 rounded bg-red-500/10 text-red-700 text-xs font-medium">
                            {member.overdue} overdue
                          </span>
                        )}
                        {member.dueSoon > 0 && (
                          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-700 text-xs font-medium">
                            {member.dueSoon} due soon
                          </span>
                        )}
                      </div>
                    )}

                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard({ user }: { user: User }) {
  const allColleagues = users.filter(u => u.role === 'colleague');
  const allManagers = users.filter(u => u.role === 'manager');

  const overallStats = allColleagues.map(colleague => {
    const training = getTrainingRecordsForUser(colleague.id);
    return getComplianceStats(training);
  });

  const totalOverdue = overallStats.reduce((sum, s) => sum + s.overdue, 0);
  const totalDueSoon = overallStats.reduce((sum, s) => sum + s.dueSoon, 0);
  const avgCompliance = Math.round(
    overallStats.reduce((sum, s) => sum + s.complianceRate, 0) / overallStats.length || 0
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          System-wide overview of training and compliance
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-3xl font-display font-bold text-primary">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-3xl font-display font-bold">{allColleagues.length}</p>
            <p className="text-sm text-muted-foreground">Colleagues</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-3xl font-display font-bold">{allManagers.length}</p>
            <p className="text-sm text-muted-foreground">Managers</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-3xl font-display font-bold text-emerald-600">{avgCompliance}%</p>
            <p className="text-sm text-muted-foreground">Avg Compliance</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-3xl font-display font-bold text-red-600">{totalOverdue}</p>
            <p className="text-sm text-muted-foreground">Total Overdue</p>
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

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <CardTitle>Compliance Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <span className="font-medium">Overdue Training Items</span>
                <span className="text-lg font-bold text-red-600">{totalOverdue}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <span className="font-medium">Expiring Within 30 Days</span>
                <span className="text-lg font-bold text-amber-600">{totalDueSoon}</span>
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
