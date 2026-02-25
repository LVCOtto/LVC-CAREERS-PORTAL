import { useState } from 'react';
import { useAuth, User } from '@/lib/authContext';
import { useInduction, useCompleteInductionItem } from '@/lib/hooks';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  FileText,
  User as UserIcon,
  Shield,
  PartyPopper,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';

const availableAssignees = [
  { id: 'assignee-1', name: 'James Wilson', role: 'Operations Director' },
  { id: 'assignee-2', name: 'Sarah Chen', role: 'HR Manager' },
  { id: 'assignee-3', name: 'Mike Roberts', role: 'IT Manager' },
  { id: 'assignee-4', name: 'Lisa Anderson', role: 'H&S Coordinator' },
  { id: 'assignee-5', name: 'Tom Hughes', role: 'Workshop Manager' },
  { id: 'assignee-6', name: 'Emma Davis', role: 'Service Coordinator' },
  { id: 'assignee-7', name: 'Chris Taylor', role: 'Senior Engineer' },
  { id: 'assignee-8', name: 'Rachel Green', role: 'Accounts Manager' },
];

export default function Induction() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [itemAssignees, setItemAssignees] = useState<Record<string, string>>({});
  const [sectionSignOffs, setSectionSignOffs] = useState<Record<string, { colleague: boolean; manager: boolean }>>({});

  if (!currentUser) return null;

  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';

  const { data: inductionData, isLoading } = useInduction(currentUser.id);
  const completeItemMutation = useCompleteInductionItem(currentUser.id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </Layout>
    );
  }

  const items = inductionData?.items ?? [];

  const completedCount = items.filter((i: any) => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const sections: string[] = Array.from(new Set(items.map((item: any) => item.section as string)));

  const inductionComplete = sections.length > 0 && sections.every((section) => sectionSignOffs[section]?.colleague && sectionSignOffs[section]?.manager);

  const handleAssigneeChange = (itemId: string, assigneeId: string) => {
    setItemAssignees((prev) => ({
      ...prev,
      [itemId]: assigneeId,
    }));

    const assignee = availableAssignees.find((a) => a.id === assigneeId);
    toast({
      title: 'Assignee Tag Added',
      description: `${assignee?.name} tagged to this item. (Visual reminder only)`,
    });
  };

  const getAssigneeName = (itemId: string) => {
    const assigneeId = itemAssignees[itemId];
    if (!assigneeId) return null;
    return availableAssignees.find((a) => a.id === assigneeId);
  };

  const handleToggleItem = (item: any) => {
    const newCompleted = !item.completed;
    completeItemMutation.mutate({
      templateItemId: item.templateItemId,
      completed: newCompleted,
      completedDate: newCompleted ? new Date().toISOString().split('T')[0] : null,
      signedOffBy: newCompleted ? currentUser.id : null,
      signedOffDate: newCompleted ? new Date().toISOString().split('T')[0] : null,
    });
  };

  const handleSectionColleagueSignOff = (section: string) => {
    setSectionSignOffs((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || { manager: false }), colleague: true },
    }));

    toast({
      title: 'Section Signed Off',
      description: 'You have acknowledged this section is sorted.',
    });
  };

  const handleSectionManagerSignOff = (section: string) => {
    setSectionSignOffs((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || { colleague: false }), manager: true },
    }));

    toast({
      title: 'Section Approved',
      description: 'Manager sign-off complete for this section.',
    });
  };

  const getSectionItems = (section: string) => items.filter((item: any) => item.section === section);
  const getSectionProgress = (section: string) => {
    const sectionItems = getSectionItems(section);
    if (sectionItems.length === 0) return 0;
    const completed = sectionItems.filter((i: any) => i.completed).length;
    return Math.round((completed / sectionItems.length) * 100);
  };

  const sectionsFullySignedOff = sections.filter((s) => sectionSignOffs[s]?.manager && sectionSignOffs[s]?.colleague).length;

  if (inductionComplete) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <PartyPopper className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-800 mb-2">Induction Complete!</h1>
              <p className="text-green-700 mb-6">
                Congratulations! Every section of your induction has been fully completed and signed off by both you and your manager.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-700">All Sections Signed Off</span>
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
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Induction</h1>
            <p className="text-muted-foreground mt-1">Complete your onboarding checklist and obtain section sign-offs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Item Progress</p>
                  <p className="text-2xl font-bold">{progressPercent}%</p>
                </div>
              </div>
              <Progress value={progressPercent} className="mt-4 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-100">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Section Sign-Offs</p>
                  <p className="text-2xl font-bold">
                    {sectionsFullySignedOff} / {sections.length}
                  </p>
                </div>
              </div>
              <Progress
                value={sections.length > 0 ? (sectionsFullySignedOff / sections.length) * 100 : 0}
                className="mt-4 h-2 bg-emerald-100 [&>div]:bg-emerald-500"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Induction Checklist
                </CardTitle>
                <CardDescription>
                  {isManager
                    ? 'Mark items complete as you are aware of them. Tag colleagues as a reminder if they are helping. Sign off each section when ready.'
                    : 'Your line manager is responsible for marking items complete. You must sign off each section to acknowledge it is sorted.'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="w-fit">
                {completedCount} of {totalCount} tasks checked
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <Accordion type="multiple" defaultValue={sections[0] ? [sections[0]] : []} className="space-y-4">
              {sections.map((section) => {
                const sectionItems = getSectionItems(section);
                const sectionCompleted = sectionItems.filter((i: any) => i.completed).length;
                const sectionTotal = sectionItems.length;
                const isAllItemsChecked = sectionCompleted === sectionTotal && sectionTotal > 0;
                const isColleagueSigned = sectionSignOffs[section]?.colleague;
                const isManagerSigned = sectionSignOffs[section]?.manager;
                const isFullySignedOff = isColleagueSigned && isManagerSigned;

                return (
                  <AccordionItem
                    key={section}
                    value={section}
                    className={`border rounded-lg px-4 overflow-hidden transition-colors ${
                      isFullySignedOff ? 'border-green-200 bg-green-50/30' : 'data-[state=open]:bg-slate-50/50'
                    }`}
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`p-2 rounded-lg ${
                            isFullySignedOff ? 'bg-green-100' : isAllItemsChecked ? 'bg-amber-100' : 'bg-primary/10'
                          }`}
                        >
                          {isFullySignedOff ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : isAllItemsChecked ? (
                            <Shield className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{section}</p>
                            {isFullySignedOff && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] h-5">
                                Signed Off
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {sectionCompleted} of {sectionTotal} items checked
                          </p>
                        </div>
                      </div>
                      {!isFullySignedOff && (
                        <Progress value={getSectionProgress(section)} className="w-24 h-2 mr-4 hidden sm:block" />
                      )}
                    </AccordionTrigger>

                    <AccordionContent className="pb-6">
                      <div className="space-y-3 pt-2">
                        {sectionItems.map((item: any) => {
                          const assignee = getAssigneeName(item.id?.toString() ?? item.templateItemId?.toString());
                          const itemKey = item.id?.toString() ?? item.templateItemId?.toString();
                          return (
                            <div
                              key={itemKey}
                              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                item.completed ? 'bg-white shadow-sm border border-slate-200' : 'bg-background border border-slate-100'
                              }`}
                              data-testid={`checklist-item-${itemKey}`}
                            >
                              <Checkbox
                                id={itemKey}
                                checked={item.completed}
                                onCheckedChange={() => isManager && handleToggleItem(item)}
                                disabled={!isManager || isFullySignedOff}
                                className={`mt-1 ${!isManager || isFullySignedOff ? 'opacity-60 cursor-not-allowed' : ''}`}
                                data-testid={`checkbox-${itemKey}`}
                              />
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                  <label
                                    htmlFor={itemKey}
                                    className={`text-sm font-medium ${isManager && !isFullySignedOff ? 'cursor-pointer' : ''} ${
                                      item.completed ? 'text-slate-700' : 'text-slate-900'
                                    }`}
                                  >
                                    {item.title}
                                  </label>

                                  {isManager && !isFullySignedOff ? (
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs text-muted-foreground hidden sm:inline-block">Tag Colleague:</span>
                                      <Select
                                        value={itemAssignees[itemKey] || 'none'}
                                        onValueChange={(value) => handleAssigneeChange(itemKey, value === 'none' ? '' : value)}
                                      >
                                        <SelectTrigger className="h-7 w-[160px] text-xs bg-slate-50" data-testid={`assignee-select-${itemKey}`}>
                                          <SelectValue placeholder="No tag" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="none" className="text-muted-foreground italic">
                                            No tag
                                          </SelectItem>
                                          {availableAssignees.map((person) => (
                                            <SelectItem key={person.id} value={person.id}>
                                              <div className="flex items-center gap-2">
                                                <UserIcon className="h-3 w-3" />
                                                <span>{person.name}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  ) : assignee ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs shrink-0 gap-1 bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100"
                                    >
                                      <UserIcon className="h-3 w-3" />
                                      {assignee.name} assisting
                                    </Badge>
                                  ) : null}
                                </div>

                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-1.5 max-w-[90%]">{item.description}</p>
                                )}

                                {item.completed && item.completedDate && (
                                  <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-600 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Marked complete
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <h4 className="text-sm font-semibold mb-4 text-slate-800 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-500" />
                          Section Sign-Off
                        </h4>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div
                            className={`p-4 rounded-lg border ${
                              isColleagueSigned ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700">Colleague</span>
                              {isColleagueSigned && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              {isColleagueSigned ? 'You acknowledged this section is sorted.' : 'Acknowledge this section is sorted.'}
                            </p>

                            {!isManager && !isColleagueSigned && (
                              <Button
                                size="sm"
                                className="w-full text-xs"
                                disabled={!isAllItemsChecked}
                                onClick={() => handleSectionColleagueSignOff(section)}
                                data-testid={`button-colleague-signoff-${section}`}
                              >
                                {isAllItemsChecked ? 'Sign Off Section' : 'Waiting for manager to check items'}
                              </Button>
                            )}

                            {isManager && !isColleagueSigned && (
                              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                                Awaiting colleague signature
                              </div>
                            )}

                            {isColleagueSigned && (
                              <Badge
                                variant="outline"
                                className="bg-white text-green-700 border-green-200 w-full justify-center py-1"
                              >
                                Signed
                              </Badge>
                            )}
                          </div>

                          <div
                            className={`p-4 rounded-lg border ${
                              isManagerSigned ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700">Line Manager</span>
                              {isManagerSigned && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              {isManagerSigned ? 'Manager approved this section.' : 'Manager approval required.'}
                            </p>

                            {isManager && !isManagerSigned && (
                              <Button
                                size="sm"
                                className="w-full text-xs bg-slate-900 hover:bg-slate-800"
                                disabled={!isAllItemsChecked}
                                onClick={() => handleSectionManagerSignOff(section)}
                                data-testid={`button-manager-signoff-${section}`}
                              >
                                {isAllItemsChecked ? 'Approve Section' : 'Check all items first'}
                              </Button>
                            )}

                            {!isManager && !isManagerSigned && (
                              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                                Awaiting manager signature
                              </div>
                            )}

                            {isManagerSigned && (
                              <Badge
                                variant="outline"
                                className="bg-white text-green-700 border-green-200 w-full justify-center py-1"
                              >
                                Approved
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
