import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  getInductionForUser,
  getTrainingRecordsForUser,
  getComplianceStats,
  getInductionProgress,
  getTeamMembers,
  users,
  User,
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
} from 'lucide-react';

function ColleagueDashboard({ user }: { user: User }) {
  const induction = getInductionForUser(user.id);
  const trainingRecords = getTrainingRecordsForUser(user.id);
  const inductionProgress = getInductionProgress(induction.items);
  const compliance = getComplianceStats(trainingRecords);

  const upcomingExpiries = trainingRecords
    .filter(r => r.status === 'due_soon' || r.status === 'overdue')
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your training and development progress
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Induction Progress</CardTitle>
                  <CardDescription>Your onboarding checklist</CardDescription>
                </div>
              </div>
              <StatusBadge status={induction.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {inductionProgress.completed} of {inductionProgress.total} items completed
                  </span>
                  <span className="font-medium">{inductionProgress.progressPercent}%</span>
                </div>
                <Progress value={inductionProgress.progressPercent} className="h-2" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  {inductionProgress.signedOff} items signed off by manager
                </p>
                <Link href="/induction">
                  <Button variant="ghost" size="sm" data-testid="link-view-induction">
                    View details
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Training Compliance</CardTitle>
                  <CardDescription>Your certification status</CardDescription>
                </div>
              </div>
              <span className="text-2xl font-display font-bold text-primary">
                {compliance.complianceRate}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-semibold">{compliance.compliant}</p>
                <p className="text-xs text-muted-foreground">Compliant</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-lg font-semibold">{compliance.dueSoon}</p>
                <p className="text-xs text-muted-foreground">Due Soon</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="text-lg font-semibold">{compliance.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-500/10">
                <XCircle className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="text-lg font-semibold">{compliance.missing}</p>
                <p className="text-xs text-muted-foreground">Missing</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/training">
                <Button variant="ghost" size="sm" data-testid="link-view-training">
                  View training matrix
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <p className="font-medium">{record.requirementName}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.expiresDate
                        ? `Expires: ${new Date(record.expiresDate).toLocaleDateString()}`
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
