import { useEffect, useMemo, useState } from 'react';
import { useAuth, User } from '@/lib/authContext';
import { useInduction, useCompleteInductionItem } from '@/lib/hooks';
import { Layout } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const sectionColors = [
  'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
  'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
  'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
  'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
  'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800',
  'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800',
  'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
  'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800',
];

const sectionBadgeColors = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
];

export default function Induction() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const signOffStorageKey = useMemo(() => {
    if (!currentUser?.id) return '';
    return `induction-section-signoffs:${currentUser.id}`;
  }, [currentUser?.id]);

  const [sectionSignOffs, setSectionSignOffs] = useState<Record<string, { colleague: boolean; manager: boolean }>>(() => {
    if (typeof window === 'undefined' || !currentUser?.id) return {};
    try {
      const raw = localStorage.getItem(`induction-section-signoffs:${currentUser.id}`);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, { colleague: boolean; manager: boolean }>;
      return parsed || {};
    } catch {
      return {};
    }
  });

  if (!currentUser) return null;

  if (currentUser.requiresInduction === false) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <ClipboardCheck className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Induction Not Required</h2>
          <p className="text-muted-foreground">Your induction has already been completed or is not required for your role.</p>
        </div>
      </Layout>
    );
  }

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
  const signedOffCount = items.filter((i: any) => i.signedOffBy).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const sections: string[] = Array.from(new Set(items.map((item: any) => item.section as string)));

  const inductionComplete = sections.length > 0 && sections.every((section) => sectionSignOffs[section]?.colleague && sectionSignOffs[section]?.manager);

  const handleToggleItem = (item: any) => {
    const newCompleted = !item.completed;
    completeItemMutation.mutate({
      templateItemId: item.id,
      completed: newCompleted,
      completedDate: newCompleted ? new Date().toISOString().split('T')[0] : null,
      signedOffBy: null,
      signedOffDate: null,
      assignedTo: item.assignedTo,
    });
  };

  const handleSectionColleagueSignOff = (section: string) => {
    setSectionSignOffs((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || { manager: false }), colleague: true },
    }));
    toast({ title: 'Section Signed Off', description: 'You have confirmed this section is fully complete and understood.' });
  };

  const handleSectionManagerSignOff = (section: string) => {
    setSectionSignOffs((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || { colleague: false }), manager: true },
    }));
    toast({ title: 'Section Approved', description: 'Manager sign-off complete for this section.' });
  };

  const getSectionItems = (section: string) => items.filter((item: any) => item.section === section);

  const sectionsFullySignedOff = sections.filter((s) => sectionSignOffs[s]?.manager && sectionSignOffs[s]?.colleague).length;

  useEffect(() => {
    if (!signOffStorageKey) return;
    localStorage.setItem(signOffStorageKey, JSON.stringify(sectionSignOffs));
  }, [signOffStorageKey, sectionSignOffs]);

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
            <p className="text-muted-foreground mt-1">
              {isManager
                ? 'Mark items complete and sign off each section when ready.'
                : 'Your line manager marks items complete. Sign off each section to confirm all items are complete and understood.'}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0">
            {completedCount} of {totalCount} tasks completed
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
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

        <div className="space-y-6">
          {sections.map((section, sectionIndex) => {
            const sectionItems = getSectionItems(section);
            const sectionCompleted = sectionItems.filter((i: any) => i.completed).length;
            const sectionSignedOff = sectionItems.filter((i: any) => i.signedOffBy).length;
            const sectionTotal = sectionItems.length;
            const isAllItemsChecked = sectionCompleted === sectionTotal && sectionTotal > 0;
            const isColleagueSigned = sectionSignOffs[section]?.colleague;
            const isManagerSigned = sectionSignOffs[section]?.manager;
            const isFullySignedOff = isColleagueSigned && isManagerSigned;
            const colorClass = sectionColors[sectionIndex % sectionColors.length];
            const badgeClass = sectionBadgeColors[sectionIndex % sectionBadgeColors.length];

            return (
              <Card key={section} className={`border ${colorClass}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${badgeClass}`}>
                        {section}
                      </span>
                      {isFullySignedOff && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] h-5">
                          Signed Off
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {sectionTotal} {sectionTotal === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        {sectionCompleted}/{sectionTotal} completed
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        {sectionSignedOff}/{sectionTotal} signed off
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={sectionTotal > 0 ? (sectionSignedOff / sectionTotal) * 100 : 0}
                    className="h-1.5 mt-2"
                  />
                </CardHeader>
                <CardContent className="p-0">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{ width: '5%' }}></TableHead>
                        <TableHead style={{ width: '35%' }}>Item</TableHead>
                        <TableHead style={{ width: '14%' }}>Assigned To</TableHead>
                        <TableHead style={{ width: '14%' }}>Status</TableHead>
                        <TableHead style={{ width: '14%' }}>Completed</TableHead>
                        <TableHead style={{ width: '18%' }}>Signed Off</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sectionItems.map((item: any) => (
                        <TableRow key={item.id} data-testid={`checklist-item-${item.id}`}>
                          <TableCell className="text-center">
                            {isManager ? (
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() => !isFullySignedOff && handleToggleItem(item)}
                                disabled={isFullySignedOff}
                                className={isFullySignedOff ? 'opacity-60 cursor-not-allowed' : ''}
                                data-testid={`checkbox-${item.id}`}
                              />
                            ) : item.signedOffBy ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                            ) : item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-amber-500 mx-auto" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{item.title}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.assignedTo ? (
                              <span className="text-xs font-medium">{item.assignedTo}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.signedOffBy ? (
                              <StatusBadge status="complete" />
                            ) : item.completed ? (
                              <StatusBadge status="awaiting_signoff" />
                            ) : item.inProgress ? (
                              <StatusBadge status="in_progress" />
                            ) : (
                              <StatusBadge status="not_started" />
                            )}
                          </TableCell>
                          <TableCell>
                            {item.completedDate ? new Date(item.completedDate).toLocaleDateString('en-GB') : '-'}
                          </TableCell>
                          <TableCell>
                            {item.signedOffBy ? (
                              <div>
                                <p className="text-sm">{new Date(item.signedOffDate).toLocaleDateString('en-GB')}</p>
                                <p className="text-xs text-muted-foreground">by {item.signedOffBy}</p>
                              </div>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="p-4 border-t">
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
                          {isColleagueSigned ? 'You confirmed this section is complete and understood.' : 'Confirm this section is complete and understood.'}
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
                          <Badge variant="outline" className="bg-white text-green-700 border-green-200 w-full justify-center py-1">
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
                          <Badge variant="outline" className="bg-white text-green-700 border-green-200 w-full justify-center py-1">
                            Approved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
