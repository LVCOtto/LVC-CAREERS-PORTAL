import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/lib/authContext';
import { roleDefinitions, getRoleById, getRoleOptions, getRoleTaskById } from '@/lib/roleStandardsData';
import { FileText, Building2, Calendar, Hash, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const currentRoleTasks = getRoleTaskById(selectedRoleId);
  const roleOptions = getRoleOptions();

  const handleSurveyCheck = (taskId: string) => {
    setSurveyChecks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getSectionSurveyProgress = (sectionId: string) => {
    if (!currentRoleTasks) return { completed: 0, total: 0 };
    const section = currentRoleTasks.sections.find(s => s.id === sectionId);
    if (!section) return { completed: 0, total: 0 };
    const completed = section.tasks.filter(t => surveyChecks[t.id]).length;
    return { completed, total: section.tasks.length };
  };

  const getTotalSurveyProgress = () => {
    if (!currentRoleTasks) return { completed: 0, total: 0 };
    let completed = 0;
    let total = 0;
    currentRoleTasks.sections.forEach(section => {
      section.tasks.forEach(task => {
        total++;
        if (surveyChecks[task.id]) completed++;
      });
    });
    return { completed, total };
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

  const surveyProgress = getTotalSurveyProgress();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Role Standards Playbook</h1>
            <p className="text-muted-foreground mt-1">
              Role specifications and standards survey checklist
            </p>
          </div>
        </div>

        {isManager && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">View Role</CardTitle>
              <CardDescription>Select a role to view its standards and survey</CardDescription>
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

        <Tabs defaultValue="standards" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standards" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Role Standards
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

          <TabsContent value="standards">
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
                        Detailed task checklist for ongoing role compliance - self-assessment tool
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
                {currentRoleTasks ? (
                  <Accordion type="multiple" defaultValue={currentRoleTasks.sections.map(s => s.id)} className="space-y-2">
                    {currentRoleTasks.sections.map((section) => {
                      const sectionProgress = getSectionSurveyProgress(section.id);
                      const isComplete = sectionProgress.completed === sectionProgress.total;

                      return (
                        <AccordionItem
                          key={section.id}
                          value={section.id}
                          className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
                        >
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-100' : 'bg-amber-100'}`}>
                                {isComplete ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-amber-600" />
                                )}
                              </div>
                              <div className="text-left">
                                <p className="font-medium">{section.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {sectionProgress.completed} of {sectionProgress.total} tasks
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="space-y-2 pt-2">
                              {section.tasks.map((task) => (
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
                                  <div className="flex-1">
                                    <label
                                      htmlFor={task.id}
                                      className={`text-sm cursor-pointer ${
                                        surveyChecks[task.id] ? 'text-muted-foreground line-through' : ''
                                      }`}
                                    >
                                      {task.text}
                                    </label>
                                    <div className="flex gap-2 mt-1">
                                      {task.isCritical && (
                                        <Badge variant="destructive" className="text-xs h-5">
                                          Critical
                                        </Badge>
                                      )}
                                      {task.isNew && (
                                        <Badge variant="secondary" className="text-xs h-5 bg-blue-100 text-blue-700">
                                          New
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
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
