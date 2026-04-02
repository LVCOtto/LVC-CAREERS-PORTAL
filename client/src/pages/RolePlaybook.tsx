import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/authContext';
import { useJobRoles, useStandardsSurvey } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';
import { FileText, Building2, Calendar, Hash, ClipboardList, CheckCircle2, MessageCircle, Circle, HelpCircle, XCircle, AlertCircle } from 'lucide-react';

type AssessmentStatus = 'none' | 'no' | 'unsure' | 'yes';

const statusConfig: Record<AssessmentStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }> = {
  none: { label: 'Not Set', color: 'text-muted-foreground', bgColor: 'bg-muted/30', borderColor: 'border-muted', icon: Circle },
  no: { label: 'No', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: XCircle },
  unsure: { label: 'Unsure', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: HelpCircle },
  yes: { label: 'Yes', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: CheckCircle2 },
};

function StatusSelector({ 
  value, 
  onChange 
}: { 
  value: AssessmentStatus; 
  onChange: (status: AssessmentStatus) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg border border-border/50">
      <button
        onClick={() => onChange('no')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          value === 'no' 
            ? 'bg-white shadow-sm text-red-700 ring-1 ring-red-200' 
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        }`}
        title="No"
        data-testid="status-no"
      >
        <XCircle className={`w-3.5 h-3.5 ${value === 'no' ? 'text-red-600' : ''}`} />
        No
      </button>
      <button
        onClick={() => onChange('unsure')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          value === 'unsure' 
            ? 'bg-white shadow-sm text-amber-700 ring-1 ring-amber-200' 
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        }`}
        title="Unsure"
        data-testid="status-unsure"
      >
        <HelpCircle className={`w-3.5 h-3.5 ${value === 'unsure' ? 'text-amber-600' : ''}`} />
        Unsure
      </button>
      <button
        onClick={() => onChange('yes')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          value === 'yes' 
            ? 'bg-white shadow-sm text-emerald-700 ring-1 ring-emerald-200' 
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        }`}
        title="Yes"
        data-testid="status-yes"
      >
        <CheckCircle2 className={`w-3.5 h-3.5 ${value === 'yes' ? 'text-emerald-600' : ''}`} />
        Yes
      </button>
    </div>
  );
}

export default function RolePlaybook() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin';
  
  const { data: jobRoles, isLoading: rolesLoading } = useJobRoles();

  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [surveyStatuses, setSurveyStatuses] = useState<Record<string, AssessmentStatus>>({});
  const [feedbackResponses, setFeedbackResponses] = useState<Record<string, string>>({});
  const [surveySubmittedAt, setSurveySubmittedAt] = useState<string | null>(null);
  
  const { data: surveyData } = useStandardsSurvey(selectedRoleId);

  useEffect(() => {
    if (!jobRoles || jobRoles.length === 0) return;

    if (selectedRoleId && jobRoles.some(role => role.slug === selectedRoleId)) {
      return;
    }

    const preferredRole = currentUser?.jobRole
      ? jobRoles.find(role => role.title.toLowerCase() === currentUser.jobRole.toLowerCase())?.slug
      : undefined;

    setSelectedRoleId(preferredRole || jobRoles[0].slug);
  }, [jobRoles, currentUser?.jobRole, selectedRoleId]);

  const surveyStorageKey = useMemo(() => {
    if (!currentUser?.id || !selectedRoleId) return '';
    return `role-playbook-survey:${currentUser.id}:${selectedRoleId}`;
  }, [currentUser?.id, selectedRoleId]);

  useEffect(() => {
    if (!surveyStorageKey) return;
    try {
      const raw = localStorage.getItem(surveyStorageKey);
      if (!raw) {
        setSurveyStatuses({});
        setFeedbackResponses({});
        setSurveySubmittedAt(null);
        return;
      }
      const parsed = JSON.parse(raw) as {
        statuses?: Record<string, AssessmentStatus>;
        feedback?: Record<string, string>;
        submittedAt?: string | null;
      };
      setSurveyStatuses(parsed.statuses || {});
      setFeedbackResponses(parsed.feedback || {});
      setSurveySubmittedAt(parsed.submittedAt || null);
    } catch {
      setSurveyStatuses({});
      setFeedbackResponses({});
      setSurveySubmittedAt(null);
    }
  }, [surveyStorageKey]);

  useEffect(() => {
    if (!surveyStorageKey) return;
    const payload = JSON.stringify({
      statuses: surveyStatuses,
      feedback: feedbackResponses,
      submittedAt: surveySubmittedAt,
    });
    localStorage.setItem(surveyStorageKey, payload);
  }, [surveyStorageKey, surveyStatuses, feedbackResponses, surveySubmittedAt]);
  
  const currentRoleStandards = jobRoles?.find(role => role.slug === selectedRoleId);
  const currentSurvey = surveyData;

  const handleStatusChange = (taskId: string, status: AssessmentStatus) => {
    setSurveyStatuses(prev => ({
      ...prev,
      [taskId]: status
    }));
  };

  const getSurveyProgress = () => {
    if (!currentSurvey || !currentSurvey.items) return { no: 0, unsure: 0, yes: 0, total: 0, completed: 0 };
    const taskItems = currentSurvey.items.filter((t: any) => !t.isFeedback);
    let no = 0, unsure = 0, yes = 0;
    taskItems.forEach((t: any) => {
      const status = surveyStatuses[t.id];
      if (status === 'no') no++;
      else if (status === 'unsure') unsure++;
      else if (status === 'yes') yes++;
    });
    return { no, unsure, yes, total: taskItems.length, completed: no + unsure + yes };
  };

  const handleSubmitSurvey = () => {
    const surveyProgress = getSurveyProgress();

    if (surveyProgress.total === 0 || surveyProgress.completed !== surveyProgress.total) {
      toast({
        title: 'Survey incomplete',
        description: 'Please rate every checklist item before submitting.',
        variant: 'destructive',
      });
      return;
    }

    const timestamp = new Date().toISOString();
    setSurveySubmittedAt(timestamp);
    toast({
      title: 'Survey submitted',
      description: 'Your survey responses have been saved for this role.',
    });
  };

  if (rolesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </Layout>
    );
  }

  if (!jobRoles || jobRoles.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No roles found.</p>
        </div>
      </Layout>
    );
  }

  if (!currentRoleStandards) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Role standards not found.</p>
        </div>
      </Layout>
    );
  }

  const surveyProgress = getSurveyProgress();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Roles & Responsibilities</h1>
            <p className="text-muted-foreground mt-1">
              Role specifications and standards survey checklist
            </p>
          </div>
        </div>

        {isManager && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">View Role</CardTitle>
              <CardDescription>Select a role to view its responsibilities and survey</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="w-full max-w-md" data-testid="select-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {jobRoles.map((role) => (
                    <SelectItem key={role.slug} value={role.slug}>
                      <span className="flex items-center gap-2">
                        {role.title}
                        <span className="text-xs text-muted-foreground">({role.department})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="responsibilities" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="responsibilities" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Roles & Responsibilities
            </TabsTrigger>
            <TabsTrigger value="survey" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Standards Survey
              {surveyProgress.completed > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {surveyProgress.completed}/{surveyProgress.total}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="responsibilities">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{currentRoleStandards.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {currentRoleStandards.department}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-background">
                    {currentRoleStandards.standards?.length || 0} Standards
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {currentRoleStandards.standards && currentRoleStandards.standards.length > 0 ? (
                    <div>
                      <ul className="space-y-2">
                        {currentRoleStandards.standards.map((standard: any) => (
                          <li 
                            key={standard.id} 
                            className="flex items-start gap-2 text-sm"
                            data-testid={`standard-${standard.id}`}
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{standard.description || standard.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No standards defined for this role.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="survey">
            <Card className="overflow-hidden">
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-200">
                      <ClipboardList className="h-6 w-6 text-slate-700" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Standards Survey Checklist</CardTitle>
                      <CardDescription>
                        Periodic self-assessment sent by your manager to reinforce role standards
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-muted-foreground">{surveyProgress.no}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-muted-foreground">{surveyProgress.unsure}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-muted-foreground">{surveyProgress.yes}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {currentSurvey ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg text-sm border border-border/50">
                      <span className="font-medium">Legend:</span>
                      <div className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-muted-foreground">No</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-muted-foreground">Unsure</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-muted-foreground">Yes</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Task Checklist
                      </h3>
                      <div className="space-y-2">
                        {currentSurvey.items && currentSurvey.items.filter((t: any) => !t.isFeedback).map((task: any) => {
                          const status = surveyStatuses[task.id] || 'none';
                          const config = statusConfig[status];
                          return (
                            <div
                              key={task.id}
                              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg transition-colors border ${config.bgColor} ${config.borderColor}`}
                              data-testid={`survey-task-${task.id}`}
                            >
                              <div className="flex-1">
                                <span className={`text-sm ${status === 'yes' ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                                  {task.text}
                                </span>
                              </div>
                              <div className="shrink-0">
                                <StatusSelector
                                  value={status}
                                  onChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Feedback Questions
                      </h3>
                      <div className="space-y-4 bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                        {currentSurvey.items && currentSurvey.items.filter((t: any) => t.isFeedback).map((task: any) => (
                          <div
                            key={task.id}
                            className="space-y-2"
                            data-testid={`survey-feedback-${task.id}`}
                          >
                            <label className="text-sm font-medium">
                              <span className="text-blue-600 mr-2">Q:</span>
                              {task.text}
                            </label>
                            <Textarea
                              placeholder="Type your response..."
                              value={feedbackResponses[task.id] || ''}
                              onChange={(e) => setFeedbackResponses(prev => ({
                                ...prev,
                                [task.id]: e.target.value
                              }))}
                              className="min-h-[60px] text-sm bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-center gap-2">
                        {surveyProgress.completed === surveyProgress.total && surveyProgress.total > 0 ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">
                              All tasks rated - ready for submission
                            </span>
                          </>
                        ) : (
                          <>
                            <ClipboardList className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {surveyProgress.completed} of {surveyProgress.total} tasks rated
                            </span>
                          </>
                        )}
                      </div>
                      <Button
                        onClick={handleSubmitSurvey}
                        className="bg-primary hover:bg-primary/90"
                        disabled={surveyProgress.total === 0 || surveyProgress.completed !== surveyProgress.total}
                      >
                        Submit Survey
                      </Button>
                    </div>
                    {surveySubmittedAt && (
                      <p className="text-xs text-muted-foreground text-right">
                        Last submitted: {new Date(surveySubmittedAt).toLocaleString('en-GB')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No survey checklist available for this role.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
