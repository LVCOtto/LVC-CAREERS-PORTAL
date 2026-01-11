import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/authContext';
import { roleDefinitions, getRoleById, getRoleOptions } from '@/lib/roleStandardsData';
import { getSurveyByRoleId } from '@/lib/standardsSurveyData';
import { FileText, Building2, Calendar, Hash, ClipboardList, CheckCircle2, MessageCircle } from 'lucide-react';

export default function RolePlaybook() {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin';
  
  const defaultRoleId = currentUser?.jobRole 
    ? Object.keys(roleDefinitions).find(id => 
        roleDefinitions[id].title.toLowerCase() === currentUser.jobRole.toLowerCase()
      ) || 'field-service-engineer'
    : 'field-service-engineer';
  
  const [selectedRoleId, setSelectedRoleId] = useState(defaultRoleId);
  const [surveyChecks, setSurveyChecks] = useState<Record<string, boolean>>({});
  const currentRoleStandards = getRoleById(selectedRoleId);
  const currentSurvey = getSurveyByRoleId(selectedRoleId);
  const roleOptions = getRoleOptions();

  const handleSurveyCheck = (taskId: string) => {
    setSurveyChecks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getSurveyProgress = () => {
    if (!currentSurvey) return { completed: 0, total: 0 };
    const taskItems = currentSurvey.tasks.filter(t => !t.isFeedback);
    const completed = taskItems.filter(t => surveyChecks[t.id]).length;
    return { completed, total: taskItems.length };
  };

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
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <span className="flex items-center gap-2">
                        {role.label}
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
              {surveyProgress.total > 0 && (
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
                        {currentRoleStandards.version && (
                          <span className="flex items-center gap-1">
                            <Hash className="h-3.5 w-3.5" />
                            v{currentRoleStandards.version}
                          </span>
                        )}
                        {currentRoleStandards.lastReviewed && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Reviewed {currentRoleStandards.lastReviewed}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-background">
                    {currentRoleStandards.sections.reduce((acc, s) => acc + s.standards.length, 0)} Standards
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {currentRoleStandards.sections.map((section, sectionIdx) => (
                    <div key={section.id}>
                      <h3 className="font-semibold text-base mb-3 text-primary">{section.name}</h3>
                      
                      <ul className="space-y-2">
                        {section.standards.map((standard) => (
                          <li 
                            key={standard.id} 
                            className="flex items-start gap-2 text-sm"
                            data-testid={`standard-${standard.id}`}
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{standard.text}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {sectionIdx < currentRoleStandards.sections.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="survey">
            <Card className="overflow-hidden">
              <CardHeader className="bg-amber-50 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-100">
                      <ClipboardList className="h-6 w-6 text-amber-700" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Standards Survey Checklist</CardTitle>
                      <CardDescription>
                        Periodic self-assessment sent by your manager to reinforce role standards
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`${surveyProgress.completed === surveyProgress.total && surveyProgress.total > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-background'}`}
                    >
                      {surveyProgress.completed} of {surveyProgress.total} checked
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {currentSurvey ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Task Checklist
                      </h3>
                      <div className="space-y-2">
                        {currentSurvey.tasks.filter(t => !t.isFeedback).map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                              surveyChecks[task.id] ? 'bg-green-50' : 'bg-background border'
                            }`}
                            data-testid={`survey-task-${task.id}`}
                          >
                            <Checkbox
                              id={task.id}
                              checked={surveyChecks[task.id] || false}
                              onCheckedChange={() => handleSurveyCheck(task.id)}
                              className="mt-0.5"
                              data-testid={`survey-checkbox-${task.id}`}
                            />
                            <label
                              htmlFor={task.id}
                              className={`text-sm cursor-pointer flex-1 ${
                                surveyChecks[task.id] ? 'text-muted-foreground line-through' : ''
                              }`}
                            >
                              {task.text}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Feedback Questions
                      </h3>
                      <div className="space-y-3 bg-blue-50/50 rounded-lg p-4">
                        {currentSurvey.tasks.filter(t => t.isFeedback).map((task) => (
                          <div
                            key={task.id}
                            className="text-sm text-muted-foreground"
                            data-testid={`survey-feedback-${task.id}`}
                          >
                            <span className="text-blue-600 mr-2">Q:</span>
                            {task.text}
                          </div>
                        ))}
                      </div>
                    </div>

                    {surveyProgress.completed === surveyProgress.total && surveyProgress.total > 0 && (
                      <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          All tasks checked - ready for submission to manager
                        </span>
                      </div>
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
