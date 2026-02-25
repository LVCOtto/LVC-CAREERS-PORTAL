import { useAuth, User } from '@/lib/authContext';
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
  useUser,
  useTeamMembers,
  useInduction,
  useCompleteInductionItem,
  useTrainingMatrixForUser,
  useCompetencies,
  useStandardsSurvey,
  useUpdateTrainingMatrix,
} from '@/lib/hooks';
import { IndividualView } from '@/pages/Training';
import {
  ArrowLeft,
  User as UserIcon,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  ClipboardCheck,
  GraduationCap,
  Loader2,
} from 'lucide-react';

const competencyLevels = [
  { value: 0, label: 'No Experience', description: 'Has no experience, or does not understand', color: 'bg-gray-200 text-gray-600' },
  { value: 1, label: 'Needs Training', description: 'Has some experience but not confident, more training required', color: 'bg-red-100 text-red-700' },
  { value: 2, label: 'Developing', description: 'Has experience and is reasonably confident but occasional support required', color: 'bg-amber-100 text-amber-700' },
  { value: 3, label: 'Competent', description: 'Is highly confident and does not require support', color: 'bg-emerald-100 text-emerald-700' },
  { value: 4, label: 'Expert/Trainer', description: 'Thorough knowledge, willing and able to train others', color: 'bg-blue-100 text-blue-700' },
];

function TeamMemberProfile({ memberId }: { memberId: string }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const { data: member, isLoading: memberLoading } = useUser(memberId);
  const { data: inductionData, isLoading: inductionLoading } = useInduction(memberId);
  const { data: matrixSubmission, isLoading: matrixLoading } = useTrainingMatrixForUser(memberId);
  const { data: competencies, isLoading: competenciesLoading } = useCompetencies(
    member?.department?.toLowerCase().includes('engineering') ? 'engineering' : 'admin'
  );

  const roleSlug = member?.jobRole
    ? member.jobRole.toLowerCase().replace(/\s+/g, '-')
    : '';
  const { data: standardsSurveyData } = useStandardsSurvey(roleSlug);

  const completeItem = useCompleteInductionItem(memberId);
  const updateMatrix = useUpdateTrainingMatrix();

  if (memberLoading || inductionLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

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

  const items = inductionData?.items ?? [];
  const instance = inductionData?.instance;

  const completedItems = items.filter((item: any) => item.completed);
  const signedOffItems = items.filter((item: any) => item.signedOffBy);
  const inductionProgress = {
    completed: completedItems.length,
    total: items.length,
    signedOff: signedOffItems.length,
    progressPercent: items.length > 0 ? Math.round((completedItems.length / items.length) * 100) : 0,
  };

  const memberMatrix = matrixSubmission
    ? {
        id: member.id,
        name: member.name,
        role: member.jobRole,
        department: member.department,
        ratings: matrixSubmission.ratings as Record<string, number>,
        lastAssessment: matrixSubmission.submittedDate || matrixSubmission.createdDate || new Date().toISOString().slice(0, 10),
        status: matrixSubmission.status as 'draft' | 'pending_review' | 'approved' | undefined,
      }
    : null;

  const categories = competencies ?? [];

  const groupedBySection = items.reduce((acc: Record<string, any[]>, item: any) => {
    const section = item.section || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

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
                    .map((n: string) => n[0])
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
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
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
                {instance && <StatusBadge status={instance.status} />}
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
              <CardTitle className="text-lg">Training Matrix Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                {matrixLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                ) : memberMatrix ? (
                  <>
                    {memberMatrix.status === 'approved' && (
                      <Badge className="bg-emerald-100 text-emerald-800 text-base px-4 py-2">Approved</Badge>
                    )}
                    {memberMatrix.status === 'pending_review' && (
                      <Badge className="bg-amber-100 text-amber-800 text-base px-4 py-2">Pending Review</Badge>
                    )}
                    {(!memberMatrix.status || memberMatrix.status === 'draft') && (
                      <Badge className="bg-slate-100 text-slate-800 text-base px-4 py-2">Draft</Badge>
                    )}
                    <p className="text-sm text-muted-foreground mt-3">
                      Last updated: {new Date(memberMatrix.lastAssessment).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No matrix submitted</p>
                )}
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
                    {items.map((item: any) => (
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
                            <Button
                              size="sm"
                              data-testid={`button-signoff-${item.id}`}
                              onClick={() => {
                                completeItem.mutate({
                                  templateItemId: item.id,
                                  completed: true,
                                  completedDate: item.completedDate,
                                  signedOffBy: currentUser?.name || 'Manager',
                                  signedOffDate: new Date().toISOString().slice(0, 10),
                                });
                                toast({ title: 'Item signed off', description: `"${item.title}" has been signed off.` });
                              }}
                            >
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
                      Review the colleague's submitted matrix and approve when you're happy.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    {memberMatrix?.status === 'pending_review' && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800" data-testid="status-team-matrix-pending">
                        Pending sign-off
                      </Badge>
                    )}
                    {memberMatrix?.status === 'approved' && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800" data-testid="status-team-matrix-approved">
                        Approved
                      </Badge>
                    )}
                    {(!memberMatrix || !memberMatrix.status || memberMatrix.status === 'draft') && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-800" data-testid="status-team-matrix-none">
                        {memberMatrix ? 'Draft' : 'Not submitted'}
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={!matrixSubmission || matrixSubmission.status !== 'pending_review'}
                      onClick={() => {
                        if (matrixSubmission) {
                          updateMatrix.mutate(
                            { id: matrixSubmission.id, data: { status: 'approved' } },
                            {
                              onSuccess: () => {
                                toast({
                                  title: 'Matrix approved',
                                  description: 'The colleague can now see this matrix as approved.',
                                });
                              },
                            }
                          );
                        }
                      }}
                      data-testid="button-approve-matrix"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {matrixLoading || competenciesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : memberMatrix && categories.length > 0 ? (
                  <IndividualView
                    name={memberMatrix.name}
                    jobRole={memberMatrix.role}
                    department={memberMatrix.department}
                    ratings={memberMatrix.ratings}
                    lastAssessment={memberMatrix.lastAssessment}
                    categories={categories}
                    showBackButton={false}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p>No training matrix submitted yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standards" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Standards Survey</CardTitle>
                  <CardDescription>Role-based standards for {member.jobRole}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {standardsSurveyData ? (
                    <>
                      <div className="p-3 rounded-lg bg-muted/40 border" data-testid="card-standards-role">
                        <p className="text-xs text-muted-foreground">Role</p>
                        <p className="text-sm font-semibold">{standardsSurveyData.roleTitle}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 border">
                        <p className="text-xs text-muted-foreground">Total tasks</p>
                        <p className="text-sm font-semibold">{standardsSurveyData.items?.length ?? 0}</p>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <p className="text-sm text-muted-foreground">No standards survey found for this role.</p>
                    </div>
                  )}
                  <Button className="w-full" variant="outline" disabled data-testid="button-request-standards-review">
                    Request review
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Tasks</CardTitle>
                  <CardDescription>Role-specific responsibilities and standards</CardDescription>
                </CardHeader>
                <CardContent>
                  {standardsSurveyData?.items && standardsSurveyData.items.length > 0 ? (
                    <div className="space-y-2">
                      {standardsSurveyData.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border bg-background"
                          data-testid={`row-standards-${item.id}`}
                        >
                          <p className="text-sm">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No standards survey tasks found for this role</p>
                    </div>
                  )}
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

  const { data: teamMembers, isLoading } = useTeamMembers(currentUser.id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const members = teamMembers ?? [];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Team</h1>
          <p className="text-muted-foreground mt-1">View and manage your team members' training and induction</p>
        </div>

        <div className="grid gap-4">
          {members.map((member: User) => (
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
                        <p className="font-semibold text-lg" data-testid={`text-member-name-${member.id}`}>{member.name}</p>
                        <p className="text-muted-foreground" data-testid={`text-member-role-${member.id}`}>{member.jobRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Started {new Date(member.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {members.length === 0 && (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
