import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from '@/lib/mockData';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  FileText,
  User,
  UserCheck,
  Users,
  Shield,
  Award,
  PartyPopper,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Induction() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [showSignOffDialog, setShowSignOffDialog] = useState(false);
  const [colleagueSignedOff, setColleagueSignedOff] = useState(false);
  const [managerSignedOff, setManagerSignedOff] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);

  if (!currentUser) return null;

  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';
  const myLineManager = 'James Wilson (Operations Director)';

  const induction = getInductionForUser(currentUser.id);
  const [items, setItems] = useState<ChecklistItem[]>(induction.items);
  const progress = getInductionProgress(items);

  const sections = Array.from(new Set(items.map(item => item.section)));

  const allItemsCompleted = items.every(item => item.completed);
  const inductionComplete = colleagueSignedOff && managerSignedOff;

  const teamMembers = [
    { id: 'tm-1', name: 'David Thompson', role: 'Senior Service Engineer', progress: 85, status: 'in_progress' as const, colleagueSigned: true, managerSigned: false },
    { id: 'tm-2', name: 'Michael Brown', role: 'Service Engineer', progress: 100, status: 'completed' as const, colleagueSigned: true, managerSigned: true },
    { id: 'tm-3', name: 'Sarah Mitchell', role: 'Junior Service Engineer', progress: 45, status: 'in_progress' as const, colleagueSigned: false, managerSigned: false },
    { id: 'tm-4', name: 'James Parker', role: 'Trainee Engineer', progress: 20, status: 'in_progress' as const, colleagueSigned: false, managerSigned: false },
  ];

  const handleToggleItem = (itemId: string) => {
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
  };

  const handleColleagueSignOff = () => {
    setColleagueSignedOff(true);
    toast({
      title: 'Colleague Sign-Off Complete',
      description: 'You have signed off on your induction. Awaiting manager approval.',
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

  const getSectionItems = (section: string) => items.filter(item => item.section === section);
  const getSectionProgress = (section: string) => {
    const sectionItems = getSectionItems(section);
    const completed = sectionItems.filter(i => i.completed).length;
    return Math.round((completed / sectionItems.length) * 100);
  };

  if (inductionComplete) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <PartyPopper className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-800 mb-2">
                Induction Complete!
              </h1>
              <p className="text-green-700 mb-6">
                Congratulations! Your induction has been fully completed and signed off.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-700">Colleague Sign-Off</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-700">Manager Sign-Off</span>
                </div>
              </div>
              <Separator className="my-6" />
              <p className="text-sm text-muted-foreground">
                Completed on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Induction
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete your onboarding checklist and obtain sign-off
            </p>
          </div>
          {isManager && (
            <div className="flex gap-2">
              <Button
                variant={selectedTeamMember === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTeamMember(null)}
                data-testid="button-my-induction"
              >
                <User className="h-4 w-4 mr-2" />
                My Induction
              </Button>
              <Button
                variant={selectedTeamMember !== null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTeamMember(teamMembers[0].id)}
                data-testid="button-team-inductions"
              >
                <Users className="h-4 w-4 mr-2" />
                Team Inductions
              </Button>
            </div>
          )}
        </div>

        {isManager && selectedTeamMember !== null ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Member Inductions</CardTitle>
                <CardDescription>Review and sign off on team member induction progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedTeamMember === member.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTeamMember(member.id)}
                      data-testid={`team-member-${member.id}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.colleagueSigned && member.managerSigned ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          ) : member.colleagueSigned ? (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                              <Clock className="h-3 w-3 mr-1" />
                              Awaiting Manager
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{member.progress}%</span>
                        </div>
                        <Progress value={member.progress} className="h-2" />
                      </div>
                      {member.colleagueSigned && !member.managerSigned && (
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSignOffDialog(true);
                            }}
                            data-testid={`sign-off-${member.id}`}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Manager Sign-Off
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <ClipboardCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Progress</p>
                      <p className="text-2xl font-bold">{progress.progressPercent}%</p>
                    </div>
                  </div>
                  <Progress value={progress.progressPercent} className="mt-4 h-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${colleagueSignedOff ? 'bg-green-100' : 'bg-muted'}`}>
                      <User className={`h-6 w-6 ${colleagueSignedOff ? 'text-green-600' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Colleague Sign-Off</p>
                      <p className="text-lg font-semibold">
                        {colleagueSignedOff ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${managerSignedOff ? 'bg-green-100' : 'bg-muted'}`}>
                      <UserCheck className={`h-6 w-6 ${managerSignedOff ? 'text-green-600' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Manager Sign-Off</p>
                      <p className="text-lg font-semibold">
                        {managerSignedOff ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Induction Checklist
                    </CardTitle>
                    <CardDescription>
                      {isManager 
                        ? 'Tick off each item as the colleague completes it'
                        : 'Your manager will tick off items as you complete each stage'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {progress.completed} of {progress.total} complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={sections} className="space-y-2">
                  {sections.map((section) => {
                    const sectionItems = getSectionItems(section);
                    const sectionCompleted = sectionItems.filter(i => i.completed).length;
                    const sectionTotal = sectionItems.length;
                    const isComplete = sectionCompleted === sectionTotal;

                    return (
                      <AccordionItem
                        key={section}
                        value={section}
                        className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-100' : 'bg-primary/10'}`}>
                              {isComplete ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-medium">{section}</p>
                              <p className="text-sm text-muted-foreground">
                                {sectionCompleted} of {sectionTotal} items
                              </p>
                            </div>
                          </div>
                          <Progress value={getSectionProgress(section)} className="w-24 h-2 mr-4" />
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-2 pt-2">
                            {sectionItems.map((item) => (
                              <div
                                key={item.id}
                                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                  item.completed ? 'bg-green-50' : 'bg-background border'
                                }`}
                                data-testid={`checklist-item-${item.id}`}
                              >
                                <Checkbox
                                  id={item.id}
                                  checked={item.completed}
                                  onCheckedChange={() => isManager && handleToggleItem(item.id)}
                                  disabled={!isManager}
                                  className={`mt-0.5 ${!isManager ? 'opacity-60' : ''}`}
                                  data-testid={`checkbox-${item.id}`}
                                />
                                <div className="flex-1">
                                  <label
                                    htmlFor={item.id}
                                    className={`text-sm font-medium cursor-pointer ${
                                      item.completed ? 'text-muted-foreground line-through' : ''
                                    }`}
                                  >
                                    {item.title}
                                  </label>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                  {item.completed && item.completedDate && (
                                    <p className="text-xs text-green-600 mt-1">
                                      Completed {item.completedDate} {item.signedOffBy && '• Signed off by manager'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${colleagueSignedOff ? 'bg-green-100' : 'bg-background'}`}>
                        {colleagueSignedOff ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Colleague Sign-Off</p>
                        <p className="text-sm text-muted-foreground">
                          {colleagueSignedOff
                            ? 'Colleague has confirmed completion of their induction'
                            : allItemsCompleted 
                              ? 'All items complete - colleague can now sign off'
                              : 'Manager must tick off all items before colleague can sign off'}
                        </p>
                      </div>
                    </div>
                    {!colleagueSignedOff && allItemsCompleted && (
                      <Button
                        onClick={handleColleagueSignOff}
                        data-testid="button-colleague-signoff"
                      >
                        Colleague Sign Off
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${managerSignedOff ? 'bg-green-100' : 'bg-background'}`}>
                        {managerSignedOff ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Shield className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Manager Sign-Off</p>
                        <p className="text-sm text-muted-foreground">
                          {managerSignedOff
                            ? `Approved by ${myLineManager}`
                            : colleagueSignedOff
                            ? `Awaiting approval from ${myLineManager}`
                            : 'Complete colleague sign-off first'}
                        </p>
                      </div>
                    </div>
                    {isManager && colleagueSignedOff && !managerSignedOff && (
                      <Button
                        onClick={() => setShowSignOffDialog(true)}
                        data-testid="button-manager-signoff"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Manager Sign-Off
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
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
