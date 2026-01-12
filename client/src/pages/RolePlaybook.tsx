import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/authContext';
import { roleDefinitions, getRoleById, getRoleOptions } from '@/lib/roleStandardsData';
import { getSurveyByRoleId } from '@/lib/standardsSurveyData';
import { FileText, Building2, Calendar, Hash, ClipboardList, CheckCircle2, MessageCircle, Circle } from 'lucide-react';

type TrafficLightStatus = 'none' | 'red' | 'amber' | 'green';

const trafficLightConfig: Record<TrafficLightStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  none: { label: 'Not Set', color: 'text-muted-foreground', bgColor: 'bg-muted/30', borderColor: 'border-muted' },
  red: { label: 'No', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  amber: { label: 'Unsure', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  green: { label: 'Yes', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
};

function TrafficLightSelector({ 
  value, 
  onChange 
}: { 
  value: TrafficLightStatus; 
  onChange: (status: TrafficLightStatus) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange('red')}
        className={`w-6 h-6 rounded-full border-2 transition-all ${
          value === 'red' 
            ? 'bg-red-500 border-red-600 ring-2 ring-red-200' 
            : 'bg-red-200 border-red-300 hover:bg-red-300'
        }`}
        title="No"
        data-testid="traffic-light-red"
      />
      <button
        onClick={() => onChange('amber')}
        className={`w-6 h-6 rounded-full border-2 transition-all ${
          value === 'amber' 
            ? 'bg-amber-500 border-amber-600 ring-2 ring-amber-200' 
            : 'bg-amber-200 border-amber-300 hover:bg-amber-300'
        }`}
        title="Unsure"
        data-testid="traffic-light-amber"
      />
      <button
        onClick={() => onChange('green')}
        className={`w-6 h-6 rounded-full border-2 transition-all ${
          value === 'green' 
            ? 'bg-green-500 border-green-600 ring-2 ring-green-200' 
            : 'bg-green-200 border-green-300 hover:bg-green-300'
        }`}
        title="Yes"
        data-testid="traffic-light-green"
      />
    </div>
  );
}

export default function RolePlaybook() {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin';
  
  const defaultRoleId = currentUser?.jobRole 
    ? Object.keys(roleDefinitions).find(id => 
        roleDefinitions[id].title.toLowerCase() === currentUser.jobRole.toLowerCase()
      ) || 'field-service-engineer'
    : 'field-service-engineer';
  
  const [selectedRoleId, setSelectedRoleId] = useState(defaultRoleId);
  const [surveyStatuses, setSurveyStatuses] = useState<Record<string, TrafficLightStatus>>({});
  const [feedbackResponses, setFeedbackResponses] = useState<Record<string, string>>({});
  const currentRoleStandards = getRoleById(selectedRoleId);
  const currentSurvey = getSurveyByRoleId(selectedRoleId);
  const roleOptions = getRoleOptions();

  const handleStatusChange = (taskId: string, status: TrafficLightStatus) => {
    setSurveyStatuses(prev => ({
      ...prev,
      [taskId]: status
    }));
  };

  const getSurveyProgress = () => {
    if (!currentSurvey) return { red: 0, amber: 0, green: 0, total: 0, completed: 0 };
    const taskItems = currentSurvey.tasks.filter(t => !t.isFeedback);
    let red = 0, amber = 0, green = 0;
    taskItems.forEach(t => {
      const status = surveyStatuses[t.id];
      if (status === 'red') red++;
      else if (status === 'amber') amber++;
      else if (status === 'green') green++;
    });
    return { red, amber, green, total: taskItems.length, completed: red + amber + green };
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
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">{surveyProgress.red}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-4 h-4 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">{surveyProgress.amber}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">{surveyProgress.green}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {currentSurvey ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg text-sm">
                      <span className="font-medium">Legend:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <span className="text-muted-foreground">No</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-amber-500" />
                        <span className="text-muted-foreground">Unsure</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Yes</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Task Checklist
                      </h3>
                      <div className="space-y-2">
                        {currentSurvey.tasks.filter(t => !t.isFeedback).map((task) => {
                          const status = surveyStatuses[task.id] || 'none';
                          const config = trafficLightConfig[status];
                          return (
                            <div
                              key={task.id}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-colors border ${config.bgColor} ${config.borderColor}`}
                              data-testid={`survey-task-${task.id}`}
                            >
                              <TrafficLightSelector
                                value={status}
                                onChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                              />
                              <span className={`text-sm flex-1 ${status === 'green' ? 'text-muted-foreground' : ''}`}>
                                {task.text}
                              </span>
                              {status !== 'none' && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${config.color} ${config.borderColor}`}
                                >
                                  {config.label}
                                </Badge>
                              )}
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
                      <div className="space-y-4 bg-blue-50/50 rounded-lg p-4">
                        {currentSurvey.tasks.filter(t => t.isFeedback).map((task) => (
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
                              className="min-h-[60px] text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {surveyProgress.completed === surveyProgress.total && surveyProgress.total > 0 && (
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            All tasks rated - ready for submission
                          </span>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Submit Survey
                        </Button>
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
