import { useAuth } from '@/lib/authContext';
import { useRoute, Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getUserById,
  getTeamMembers,
  getInductionForUser,
  getTrainingRecordsForUser,
  getComplianceStats,
  getInductionProgress,
} from '@/lib/mockData';
import { IndividualView } from '@/pages/Training';
import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  ClipboardCheck,
  GraduationCap,
} from 'lucide-react';
import {
  engineeringCategories,
  adminCategories,
  engineerMatrices,
  adminMatrices,
  type EngineerMatrix,
} from '@/lib/trainingMatrixData';
import { submittedMatrices } from '@/lib/trainingMatrixData';

function TeamMemberProfile({ memberId }: { memberId: string }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const member = getUserById(memberId);

  if (!member) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Team member not found</h2>
          <Link href="/team">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to team
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const induction = getInductionForUser(member.id);
  const trainingRecords = getTrainingRecordsForUser(member.id);
  const inductionProgress = getInductionProgress(induction.items);
  const compliance = getComplianceStats(trainingRecords);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'due_soon':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'missing':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const categories = member.department?.toLowerCase().includes('engineering') ? engineeringCategories : adminCategories;
  const matrices = member.department?.toLowerCase().includes('engineering') ? engineerMatrices : adminMatrices;
  const fallbackRatings = matrices[0]?.ratings || {};

  const submitted = submittedMatrices[member.id];

  const memberMatrix: EngineerMatrix = {
    id: member.id,
    name: member.name,
    role: member.jobRole,
    department: member.department,
    ratings: submitted?.ratings || fallbackRatings,
    lastAssessment: submitted?.lastAssessment || '2026-01-15',
    status: submitted?.status,
  };

  const standardsSurvey = {
    lastCompleted: '2026-01-20',
    responses: [
      { area: 'Tools & Equipment', score: 4, note: 'All good — just need more van stock checks.' },
      { area: 'Site Safety', score: 5, note: 'Clear and consistent.' },
      { area: 'Customer Communication', score: 3, note: 'Working on pre-visit expectations.' },
      { area: 'Paperwork & Reporting', score: 4, note: 'Improving Protean notes.' },
    ],
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link href="/team">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground" data-testid="text-team-member-name">
              {member.name}
            </h1>
            <p className="text-muted-foreground" data-testid="text-team-member-role">
              {member.jobRole}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary" data-testid="img-avatar">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <p className="font-semibold" data-testid="text-name">{member.name}</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-email">{member.email}</p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm" data-testid="text-job-role">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{member.jobRole}</span>
                </div>
                <div className="flex items-center gap-3 text-sm" data-testid="text-department">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{member.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm" data-testid="text-start-date">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Started {new Date(member.startDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Induction Progress</CardTitle>
                <StatusBadge status={induction.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {inductionProgress.completed} / {inductionProgress.total} items
                    </span>
                    <span className="font-medium">{inductionProgress.progressPercent}%</span>
                  </div>
                  <Progress value={inductionProgress.progressPercent} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{inductionProgress.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                    <p className="text-2xl font-bold text-emerald-700">{inductionProgress.signedOff}</p>
                    <p className="text-xs text-muted-foreground">Signed Off</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Training Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-4xl font-display font-bold text-primary">{compliance.complianceRate}%</p>
                <p className="text-sm text-muted-foreground">Overall Compliance</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">{compliance.compliant} Compliant</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium">{compliance.dueSoon} Due Soon</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">{compliance.overdue} Overdue</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-500/10">
                  <XCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">{compliance.missing} Missing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="induction">
          <TabsList>
            <TabsTrigger value="induction" className="gap-2" data-testid="tab-profile-induction">
              <ClipboardCheck className="w-4 h-4" />
              Induction
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2" data-testid="tab-profile-training">
              <GraduationCap className="w-4 h-4" />
              Training Matrix
            </TabsTrigger>
            <TabsTrigger value="standards" className="gap-2" data-testid="tab-profile-standards">
              <FileText className="w-4 h-4" />
              Standards Survey
            </TabsTrigger>
          </TabsList>

          <TabsContent value="induction" className="mt-6">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Signed Off</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {induction.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant="outline">{item.section}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          {item.signedOffBy ? (
                            <StatusBadge status="complete" />
                          ) : item.completed ? (
                            <StatusBadge status="awaiting_signoff" />
                          ) : (
                            <StatusBadge status="not_started" />
                          )}
                        </TableCell>
                        <TableCell>
                          {item.completedDate ? new Date(item.completedDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {item.signedOffDate ? new Date(item.signedOffDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.completed && !item.signedOffBy && (
                            <Button size="sm" data-testid={`button-signoff-${item.id}`} disabled>
                              Sign Off
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Training Matrix</CardTitle>
                    <CardDescription>
                      Review the colleague\u2019s submitted matrix and approve when you\u2019re happy.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    {memberMatrix.status === 'pending_review' && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800" data-testid="status-team-matrix-pending">
                        Pending sign-off
                      </Badge>
                    )}
                    {memberMatrix.status === 'approved' && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800" data-testid="status-team-matrix-approved">
                        Approved
                      </Badge>
                    )}
                    {(!memberMatrix.status || memberMatrix.status === 'draft') && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-800" data-testid="status-team-matrix-none">
                        Not submitted
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={memberMatrix.status !== 'pending_review'}
                      onClick={() => {
                        submittedMatrices[member.id] = {
                          ...(submittedMatrices[member.id] || memberMatrix),
                          status: 'approved',
                          lastAssessment: new Date().toISOString().slice(0, 10),
                        };
                        toast({
                          title: 'Matrix approved',
                          description: 'The colleague can now see this matrix as approved.',
                        });
                        window.location.reload();
                      }}
                      data-testid="button-approve-matrix"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <IndividualView engineer={memberMatrix} categories={categories} showBackButton={false} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standards" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Latest Survey</CardTitle>
                  <CardDescription>Quick pulse check against expected standards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/40 border" data-testid="card-standards-last-completed">
                    <p className="text-xs text-muted-foreground">Last completed</p>
                    <p className="text-sm font-semibold">{new Date(standardsSurvey.lastCompleted).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <p className="text-xs text-muted-foreground">Overall</p>
                    <p className="text-2xl font-bold text-emerald-700">4.0</p>
                    <p className="text-xs text-emerald-700/80">On track</p>
                  </div>
                  <Button className="w-full" variant="outline" disabled data-testid="button-request-standards-review">
                    Request review
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Responses</CardTitle>
                  <CardDescription>Areas scored from 1 (needs support) to 5 (excellent)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {standardsSurvey.responses.map((r) => (
                      <div key={r.area} className="p-4 rounded-lg border bg-background" data-testid={`row-standards-${r.area}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-medium">{r.area}</p>
                            <p className="text-sm text-muted-foreground mt-1">{r.note}</p>
                          </div>
                          <div className="shrink-0">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold">
                              {r.score}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function TeamList() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const teamMembers = getTeamMembers(currentUser.id);

  const teamStats = teamMembers.map((member) => {
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

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Team</h1>
          <p className="text-muted-foreground mt-1">View and manage your team members' training and induction</p>
        </div>

        <div className="grid gap-4">
          {teamStats.map((member) => (
            <Link key={member.id} href={`/team/${member.id}`}>
              <Card
                className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                data-testid={`team-card-${member.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{member.name}</p>
                        <p className="text-muted-foreground">{member.jobRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Induction</p>
                        <div className="flex items-center gap-2">
                          <Progress value={member.inductionProgress} className="w-32 h-2" />
                          <span className="text-sm font-medium">{member.inductionProgress}%</span>
                        </div>
                      </div>

                      <div className="text-center min-w-[100px]">
                        <p className="text-sm text-muted-foreground mb-1">Compliance</p>
                        <p
                          className={`text-xl font-bold ${
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

                      <div className="flex items-center gap-2">
                        {member.overdue > 0 && <Badge variant="destructive">{member.overdue} overdue</Badge>}
                        {member.dueSoon > 0 && (
                          <Badge className="bg-amber-500 hover:bg-amber-600">{member.dueSoon} due soon</Badge>
                        )}
                        {member.overdue === 0 && member.dueSoon === 0 && (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600">All clear</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {teamStats.length === 0 && (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">No team members</h3>
                <p className="text-muted-foreground">You don't have any direct reports assigned yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function Team() {
  const [match, params] = useRoute('/team/:id');

  if (match && params?.id) {
    return <TeamMemberProfile memberId={params.id} />;
  }

  return <TeamList />;
}
