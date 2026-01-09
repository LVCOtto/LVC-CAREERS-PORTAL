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
  getInductionForUser,
  getInductionProgress,
  ChecklistItem,
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Induction() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('checklist');
  const [acknowledged, setAcknowledged] = useState(false);

  if (!currentUser) return null;

  const induction = getInductionForUser(currentUser.id);
  const [items, setItems] = useState<ChecklistItem[]>(induction.items);
  const progress = getInductionProgress(items);
  const roleDefinition = getRoleForDepartment(currentUser.department);

  const sections = Array.from(new Set(items.map(item => item.section)));

  const handleToggleItem = (itemId: string) => {
    if (currentUser.role === 'colleague') {
      setItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                completed: !item.completed,
                completedDate: !item.completed
                  ? new Date().toISOString().split('T')[0]
                  : undefined,
              }
            : item
        )
      );
      toast({
        title: 'Progress updated',
        description: 'Your induction progress has been saved.',
      });
    }
  };

  const handleSignOff = (itemId: string) => {
    if (currentUser.role === 'manager' || currentUser.role === 'admin') {
      setItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                signedOffBy: currentUser.id,
                signedOffDate: new Date().toISOString().split('T')[0],
              }
            : item
        )
      );
      toast({
        title: 'Item signed off',
        description: 'You have signed off this induction item.',
      });
    }
  };

  const handleAcknowledge = () => {
    setAcknowledged(true);
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

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Induction & Role
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete your onboarding and understand your role responsibilities
          </p>
        </div>

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
                  <StatusBadge status={induction.status} />
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
                              disabled={currentUser.role !== 'colleague'}
                              className="mt-1"
                              data-testid={`checkbox-${item.id}`}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={item.id}
                                className={`font-medium cursor-pointer ${
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
                                    Due: {new Date(item.dueDate).toLocaleDateString()}
                                  </Badge>
                                )}
                                {item.completedDate && (
                                  <span className="text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                    Completed {new Date(item.completedDate).toLocaleDateString()}
                                  </span>
                                )}
                                {item.signedOffBy && (
                                  <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Signed Off
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.requiresEvidence && currentUser.role === 'colleague' && (
                                <Button variant="outline" size="sm" data-testid={`button-upload-${item.id}`}>
                                  <Upload className="w-4 h-4 mr-1" />
                                  Upload
                                </Button>
                              )}
                              {item.completed &&
                                !item.signedOffBy &&
                                (currentUser.role === 'manager' || currentUser.role === 'admin') && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleSignOff(item.id)}
                                    data-testid={`button-signoff-${item.id}`}
                                  >
                                    Sign Off
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
                  {acknowledged ? (
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

            {!acknowledged && (
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
                    <Button onClick={handleAcknowledge} className="gap-2" data-testid="button-acknowledge">
                      <CheckCircle2 className="h-4 w-4" />
                      I Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {acknowledged && (
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
      </div>
    </Layout>
  );
}
