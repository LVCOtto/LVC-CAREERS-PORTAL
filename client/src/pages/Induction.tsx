import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getInductionForUser,
  getInductionProgress,
  ChecklistItem,
  getUserById,
} from '@/lib/mockData';
import { getRoleForDepartment } from '@/lib/roleResponsibilities';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  Briefcase,
  ChevronRight,
  User,
  Building2,
  ListChecks,
  BookOpen,
  PenLine,
  UserCheck,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Induction() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('checklist');
  const [viewMode, setViewMode] = useState<'my-induction' | 'team-inductions'>('my-induction');
  const [roleAcknowledged, setRoleAcknowledged] = useState(false);
  const [showSignOffDialog, setShowSignOffDialog] = useState(false);
  const [colleagueSignedOff, setColleagueSignedOff] = useState(false);
  const [managerSignedOff, setManagerSignedOff] = useState(false);
  const [myInductionColleagueSignedOff, setMyInductionColleagueSignedOff] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);

  if (!currentUser) return null;

  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';
  const myLineManager = 'James Wilson (Operations Director)';

  const induction = getInductionForUser(currentUser.id);
  const [items, setItems] = useState<ChecklistItem[]>(induction.items);
  const progress = getInductionProgress(items);
  const roleDefinition = getRoleForDepartment(currentUser.department);

  const sections = Array.from(new Set(items.map(item => item.section)));

  const allItemsCompleted = items.every(item => item.completed);
  const inductionComplete = colleagueSignedOff && managerSignedOff;
  const myInductionComplete = myInductionColleagueSignedOff;

  const teamMembers = [
    { id: 'tm-1', name: 'David Thompson', role: 'Senior Service Engineer', progress: 85, status: 'in_progress' as const },
    { id: 'tm-2', name: 'Michael Brown', role: 'Service Engineer', progress: 100, status: 'completed' as const },
    { id: 'tm-3', name: 'Sarah Mitchell', role: 'Junior Service Engineer', progress: 45, status: 'in_progress' as const },
    { id: 'tm-4', name: 'James Parker', role: 'Trainee Engineer', progress: 20, status: 'in_progress' as const },
  ];

  const handleToggleItem = (itemId: string) => {
    if (currentUser.role === 'manager' || currentUser.role === 'admin') {
      setItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                completed: !item.completed,
                completedDate: !item.completed
                  ? new Date().toISOString().split('T')[0]
                  : undefined,
                signedOffBy: !item.completed ? currentUser.id : undefined,
                signedOffDate: !item.completed
                  ? new Date().toISOString().split('T')[0]
                  : undefined,
              }
            : item
        )
      );
      toast({
        title: 'Item updated',
        description: 'Induction item has been marked.',
      });
    }
  };

  const handleColleagueSignOff = () => {
    setColleagueSignedOff(true);
    toast({
      title: 'Colleague Sign-Off Complete',
      description: 'You have signed off on your induction.',
    });
  };

  const handleManagerSignOff = () => {
    setManagerSignedOff(true);
    setShowSignOffDialog(false);
    toast({
      title: 'Manager Sign-Off Complete',
      description: 'You have approved this colleague\'s induction.',
    });
  };

  const handleRoleAcknowledge = () => {
    setRoleAcknowledged(true);
    toast({
      title: 'Role Acknowledged',
      description: 'You have acknowledged your roles and responsibilities.',
    });
  };

  const getSectionItems = (section: string) => items.filter(item => item.section === section);
  const getSectionProgress = (section: string) => {
    const sectionItems = getSectionItems(section);
    const completed = sectionItems.filter(i => i.completed).length;
    return Math.round((completed / sectionItems.length) * 100);
  };

  const isColleagueView = currentUser.role === 'colleague';
  const isManagerView = currentUser.role === 'manager' || currentUser.role === 'admin';

  const handleMyInductionSignOff = () => {
    setMyInductionColleagueSignedOff(true);
    toast({
      title: 'Sign-Off Submitted',
      description: 'Your sign-off has been submitted. Awaiting your line manager\'s approval.',
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Induction & Role
          </h1>
          <p className="text-muted-foreground mt-1">
            {isColleagueView 
              ? 'Track your onboarding progress and understand your role responsibilities'
              : viewMode === 'my-induction'
                ? 'Your personal induction progress and role responsibilities'
                : 'Manage colleague induction and sign off completed items'}
          </p>
        </div>

        {isManager && (
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'my-induction' | 'team-inductions')} className="mb-2">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="my-induction" className="gap-2" data-testid="tab-my-induction">
                <User className="h-4 w-4" />
                My Induction
              </TabsTrigger>
              <TabsTrigger value="team-inductions" className="gap-2" data-testid="tab-team-inductions">
                <Users className="h-4 w-4" />
                Team Inductions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {isManager && viewMode === 'my-induction' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Your Personal Induction</p>
                  <p className="text-sm text-muted-foreground">
                    This is your own induction journey. For sign-off, please speak to your line manager: <span className="font-medium text-foreground">{myLineManager}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isManager && viewMode === 'team-inductions' && !selectedTeamMember && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Inductions
              </CardTitle>
              <CardDescription>
                Select a team member to view and manage their induction progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedTeamMember(member.id)}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
                    data-testid={`team-member-${member.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Progress value={member.progress} className="w-24 h-2 mb-1" />
                        <p className="text-xs text-muted-foreground">{member.progress}% complete</p>
                      </div>
                      <Badge 
                        variant={member.status === 'completed' ? 'default' : 'secondary'}
                        className={member.status === 'completed' ? 'bg-emerald-600' : ''}
                      >
                        {member.status === 'completed' ? 'Complete' : 'In Progress'}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {((isManager && viewMode === 'team-inductions' && selectedTeamMember) || 
          (isManager && viewMode === 'my-induction') || 
          isColleagueView) && (
          <>
            {isManager && viewMode === 'team-inductions' && selectedTeamMember && (
              <Button 
                variant="ghost" 
                onClick={() => setSelectedTeamMember(null)} 
                className="gap-2 -ml-2 mb-2"
                data-testid="button-back-to-team"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back to Team
              </Button>
            )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="checklist" className="gap-2" data-testid="tab-checklist">
              <ListChecks className="h-4 w-4" />
              Induction Checklist
            </TabsTrigger>
            <TabsTrigger value="role" className="gap-2" data-testid="tab-role">
              <Briefcase className="h-4 w-4" />
              Roles & Responsibilities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <Card className="border-border/50 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ClipboardCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{induction.templateName}</CardTitle>
                      <CardDescription>Started {induction.createdDate}</CardDescription>
                    </div>
                  </div>
                  {inductionComplete ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Induction Complete
                    </Badge>
                  ) : (
                    <StatusBadge status={induction.status} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
                    <div className="flex items-center gap-3">
                      <Progress value={progress.progressPercent} className="h-3 flex-1" />
                      <span className="text-lg font-semibold">{progress.progressPercent}%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-display font-bold text-primary">
                      {progress.completed}
                    </p>
                    <p className="text-sm text-muted-foreground">Items Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-display font-bold text-emerald-600">
                      {progress.signedOff}
                    </p>
                    <p className="text-sm text-muted-foreground">Items Signed Off</p>
                  </div>
                </div>

                {isColleagueView && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Colleague View</p>
                        <p className="text-sm text-blue-700">
                          Your line manager will tick off each item as you complete them together. 
                          Once all items are complete, you'll both sign off to finish the induction.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={sections} className="space-y-4">
              {sections.map(section => (
                <AccordionItem
                  key={section}
                  value={section}
                  className="border rounded-lg bg-card px-6"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <span className="font-display font-semibold text-lg">{section}</span>
                        <Badge variant="secondary">
                          {getSectionItems(section).filter(i => i.completed).length} /{' '}
                          {getSectionItems(section).length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={getSectionProgress(section)} className="w-24 h-2" />
                        <span className="text-sm text-muted-foreground w-10">
                          {getSectionProgress(section)}%
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3">
                      {getSectionItems(section).map(item => (
                        <div
                          key={item.id}
                          data-testid={`checklist-item-${item.id}`}
                          className={`p-4 rounded-lg border transition-colors ${
                            item.completed
                              ? 'bg-emerald-500/5 border-emerald-500/20'
                              : 'bg-background'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <Checkbox
                              id={item.id}
                              checked={item.completed}
                              onCheckedChange={() => handleToggleItem(item.id)}
                              disabled={isColleagueView}
                              className="mt-1"
                              data-testid={`checkbox-${item.id}`}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={item.id}
                                className={`font-medium ${isManagerView ? 'cursor-pointer' : ''} ${
                                  item.completed ? 'line-through text-muted-foreground' : ''
                                }`}
                              >
                                {item.title}
                              </label>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                {item.requiresEvidence && (
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Evidence Required
                                  </Badge>
                                )}
                                {item.dueDate && !item.completed && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Due: {new Date(item.dueDate).toLocaleDateString('en-GB')}
                                  </Badge>
                                )}
                                {item.completedDate && (
                                  <span className="text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                    Completed {new Date(item.completedDate).toLocaleDateString('en-GB')}
                                  </span>
                                )}
                                {item.signedOffBy && (
                                  <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Signed Off by Manager
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.requiresEvidence && isManagerView && (
                                <Button variant="outline" size="sm" data-testid={`button-upload-${item.id}`}>
                                  <Upload className="w-4 h-4 mr-1" />
                                  Upload
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {allItemsCompleted && (
              <Card className="mt-6 border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenLine className="h-5 w-5" />
                    Final Sign-Off
                  </CardTitle>
                  <CardDescription>
                    All checklist items are complete. Both colleague and manager must sign off to complete the induction.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border ${colleagueSignedOff ? 'bg-emerald-50 border-emerald-200' : 'bg-background'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colleagueSignedOff ? 'bg-emerald-100' : 'bg-muted'}`}>
                            <UserCheck className={`h-5 w-5 ${colleagueSignedOff ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className="font-medium">Colleague Sign-Off</p>
                            {colleagueSignedOff ? (
                              <p className="text-sm text-emerald-700">Signed on {new Date().toLocaleDateString('en-GB')}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground">Awaiting signature</p>
                            )}
                          </div>
                        </div>
                        {!colleagueSignedOff && isColleagueView && (
                          <Button onClick={handleColleagueSignOff} data-testid="button-colleague-signoff">
                            Sign Off
                          </Button>
                        )}
                        {colleagueSignedOff && (
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        )}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${managerSignedOff ? 'bg-emerald-50 border-emerald-200' : 'bg-background'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${managerSignedOff ? 'bg-emerald-100' : 'bg-muted'}`}>
                            <Users className={`h-5 w-5 ${managerSignedOff ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className="font-medium">Manager Sign-Off</p>
                            {managerSignedOff ? (
                              <p className="text-sm text-emerald-700">Signed on {new Date().toLocaleDateString('en-GB')}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground">Awaiting manager signature</p>
                            )}
                          </div>
                        </div>
                        {!managerSignedOff && isManagerView && (
                          <Button onClick={() => setShowSignOffDialog(true)} data-testid="button-manager-signoff">
                            Sign Off
                          </Button>
                        )}
                        {managerSignedOff && (
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {inductionComplete && (
                    <div className="mt-4 p-4 bg-emerald-100 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                        <div>
                          <p className="font-semibold text-emerald-800">Induction Complete!</p>
                          <p className="text-sm text-emerald-700">
                            Both signatures received. This induction has been successfully completed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!allItemsCompleted && isColleagueView && (
              <Card className="mt-6 bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">In Progress</p>
                      <p className="text-sm text-muted-foreground">
                        Work with your line manager to complete the remaining items. 
                        Once all items are ticked off, you'll both sign off to complete your induction.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="role">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{roleDefinition.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {roleDefinition.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Reports to: {roleDefinition.reportsTo}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  {roleAcknowledged ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Acknowledged
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-4 w-4" />
                      Pending Acknowledgment
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Role Overview
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {roleDefinition.overview}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {roleDefinition.sections.map(section => (
                <Card key={section.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ChevronRight className="h-5 w-5 text-primary" />
                      {section.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.responsibilities.map(resp => (
                        <div key={resp.id} className="p-4 bg-muted/30 rounded-lg border" data-testid={`responsibility-${resp.id}`}>
                          <h4 className="font-semibold text-sm">{resp.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{resp.description}</p>
                          {resp.procedures && resp.procedures.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Key Procedures:</p>
                              <ul className="space-y-1">
                                {resp.procedures.map((proc, idx) => (
                                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    {proc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!roleAcknowledged && (
              <Card className="mt-6 border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Acknowledge Your Role</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        By clicking acknowledge, you confirm that you have read, understood, and accept 
                        the responsibilities outlined above.
                      </p>
                    </div>
                    <Button onClick={handleRoleAcknowledge} className="gap-2" data-testid="button-acknowledge">
                      <CheckCircle2 className="h-4 w-4" />
                      I Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {roleAcknowledged && (
              <Card className="mt-6 border-emerald-500/30 bg-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-emerald-800">Role Acknowledged</p>
                      <p className="text-sm text-emerald-700">
                        Acknowledged by {currentUser.name} on {new Date().toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>

      <Dialog open={showSignOffDialog} onOpenChange={setShowSignOffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Manager Sign-Off</DialogTitle>
            <DialogDescription>
              By signing off, you confirm that this colleague has satisfactorily completed all induction requirements 
              and is ready to work independently in their role.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Checklist Summary</p>
              <p className="text-sm text-muted-foreground">
                {progress.completed} of {progress.total} items completed and signed off
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignOffDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleManagerSignOff} data-testid="button-confirm-manager-signoff">
              Confirm Sign-Off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
