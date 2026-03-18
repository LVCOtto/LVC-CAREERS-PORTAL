import { useState } from 'react';
import { useAuth, User } from '@/lib/authContext';
import { usePortalSettings } from '@/lib/portalSettingsContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRoute, Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  useTrainingMatrixHistory,
  useCompetencies,
  useCompetenciesForRole,
  useStandardsSurvey,
  useUpdateTrainingMatrix,
  useGenerateShareToken,
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
  Undo2,
  Share2,
  Copy,
  ExternalLink,
  PlayCircle,
  Pencil,
  Download,
  Check,
  ChevronDown,
  ChevronRight,
  History,
} from 'lucide-react';

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

function AssignToInput({ item, completeItem, toast }: { item: any; completeItem: any; toast: any }) {
  const [value, setValue] = useState(item.assignedTo || '');
  const [editing, setEditing] = useState(false);

  const save = () => {
    const trimmed = value.trim();
    const assignedTo = trimmed || null;
    if (assignedTo !== (item.assignedTo || null)) {
      completeItem.mutate({
        templateItemId: item.id,
        completed: item.completed,
        inProgress: item.inProgress,
        completedDate: item.completedDate,
        targetDate: item.targetDate,
        signedOffBy: item.signedOffBy,
        signedOffDate: item.signedOffDate,
        assignedTo,
      });
      toast({
        title: assignedTo ? 'Person assigned' : 'Assignment removed',
        description: assignedTo
          ? `"${item.title}" assigned to ${assignedTo}`
          : `Assignment removed from "${item.title}"`,
      });
    }
    setEditing(false);
  };

  if (!editing && !item.assignedTo) {
    return (
      <button
        className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
        data-testid={`button-assign-${item.id}`}
        onClick={() => setEditing(true)}
      >
        + Assign
      </button>
    );
  }

  if (!editing && item.assignedTo) {
    return (
      <button
        className="text-xs font-medium hover:underline transition-colors"
        data-testid={`button-edit-assign-${item.id}`}
        onClick={() => { setValue(item.assignedTo); setEditing(true); }}
      >
        {item.assignedTo}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      className="h-7 w-[140px] text-xs"
      placeholder="Type a name..."
      data-testid={`input-assign-${item.id}`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') { setValue(item.assignedTo || ''); setEditing(false); }
      }}
    />
  );
}

function CompletedDateCell({ item, completeItem }: { item: any; completeItem: any }) {
  const [editing, setEditing] = useState(false);
  const [dateValue, setDateValue] = useState(item.completedDate || '');

  if (!item.completedDate) return <span className="text-muted-foreground">-</span>;

  if (editing) {
    return (
      <Input
        type="date"
        autoFocus
        className="h-7 w-[130px] text-xs"
        data-testid={`input-completed-date-${item.id}`}
        value={dateValue}
        onChange={(e) => setDateValue(e.target.value)}
        onBlur={() => {
          if (dateValue && dateValue !== item.completedDate) {
            completeItem.mutate({
              templateItemId: item.id,
              completed: item.completed,
              inProgress: item.inProgress,
              completedDate: dateValue,
              targetDate: item.targetDate,
              signedOffBy: item.signedOffBy,
              signedOffDate: item.signedOffDate,
              assignedTo: item.assignedTo,
            });
          }
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setDateValue(item.completedDate); setEditing(false); }
        }}
      />
    );
  }

  return (
    <button
      className="text-sm hover:underline transition-colors flex items-center gap-1"
      data-testid={`button-edit-date-${item.id}`}
      onClick={() => { setDateValue(item.completedDate); setEditing(true); }}
    >
      {new Date(item.completedDate).toLocaleDateString('en-GB')}
      <Pencil className="w-3 h-3 text-muted-foreground" />
    </button>
  );
}

function TargetDateCell({ item, completeItem }: { item: any; completeItem: any }) {
  const [editing, setEditing] = useState(false);
  const [dateValue, setDateValue] = useState(item.targetDate || '');

  const save = (val: string) => {
    const newDate = val || null;
    if (newDate !== (item.targetDate || null)) {
      completeItem.mutate({
        templateItemId: item.id,
        completed: item.completed,
        inProgress: item.inProgress,
        completedDate: item.completedDate,
        targetDate: newDate,
        signedOffBy: item.signedOffBy,
        signedOffDate: item.signedOffDate,
        assignedTo: item.assignedTo,
      });
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        type="date"
        autoFocus
        className="h-7 w-[130px] text-xs"
        data-testid={`input-target-date-${item.id}`}
        value={dateValue}
        onChange={(e) => setDateValue(e.target.value)}
        onBlur={() => save(dateValue)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save(dateValue);
          if (e.key === 'Escape') { setDateValue(item.targetDate || ''); setEditing(false); }
        }}
      />
    );
  }

  if (!item.targetDate) {
    return (
      <button
        className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
        data-testid={`button-set-target-${item.id}`}
        onClick={() => { setDateValue(''); setEditing(true); }}
      >
        + Set date
      </button>
    );
  }

  const isOverdue = !item.completed && new Date(item.targetDate) < new Date(new Date().toISOString().slice(0, 10));

  return (
    <button
      className={`text-sm hover:underline transition-colors flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}
      data-testid={`button-edit-target-${item.id}`}
      onClick={() => { setDateValue(item.targetDate); setEditing(true); }}
    >
      {new Date(item.targetDate).toLocaleDateString('en-GB')}
      <Pencil className="w-3 h-3 text-muted-foreground" />
    </button>
  );
}

function exportInductionPdf(memberName: string, memberRole: string, memberDepartment: string, items: any[]) {
  const doc = new jsPDF();
  const sections = Array.from(new Set(items.map((i: any) => i.section)));

  doc.setFontSize(18);
  doc.text('Induction Progress Report', 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Name: ${memberName}`, 14, 30);
  doc.text(`Role: ${memberRole}`, 14, 36);
  doc.text(`Department: ${memberDepartment}`, 14, 42);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 14, 48);

  const completedCount = items.filter((i: any) => i.completed).length;
  const signedOffCount = items.filter((i: any) => i.signedOffBy).length;
  const inProgressCount = items.filter((i: any) => i.inProgress && !i.completed).length;
  doc.text(`Progress: ${completedCount}/${items.length} completed, ${signedOffCount} signed off, ${inProgressCount} in progress`, 14, 54);

  doc.setTextColor(0);

  let startY = 62;

  sections.forEach((section) => {
    const sectionItems = items.filter((i: any) => i.section === section);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(section, 14, startY);
    doc.setFont('helvetica', 'normal');
    startY += 2;

    const tableData = sectionItems.map((item: any) => {
      let status = 'Not Started';
      if (item.signedOffBy) status = 'Signed Off';
      else if (item.completed) status = 'Completed';
      else if (item.inProgress) status = 'In Progress';

      const titleCell = item.description
        ? `${item.title}\n${item.description}`
        : item.title;

      return [
        titleCell,
        item.assignedTo || '-',
        status,
        item.targetDate ? new Date(item.targetDate).toLocaleDateString('en-GB') : '-',
        item.completedDate ? new Date(item.completedDate).toLocaleDateString('en-GB') : '-',
        item.signedOffBy ? `${new Date(item.signedOffDate).toLocaleDateString('en-GB')} (${item.signedOffBy})` : '-',
      ];
    });

    autoTable(doc, {
      startY,
      head: [['Item', 'Assigned To', 'Status', 'Target', 'Completed', 'Signed Off']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 65, 122], fontSize: 8, cellPadding: 2 },
      bodyStyles: { fontSize: 8, cellPadding: 2, minCellHeight: 12 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
        5: { cellWidth: 35 },
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 0) {
          const raw = data.cell.raw as string;
          const newlineIdx = raw.indexOf('\n');
          if (newlineIdx !== -1) {
            data.cell.text = [raw.substring(0, newlineIdx)];
          }
        }
        if (data.section === 'body' && data.column.index === 2) {
          const val = data.cell.raw;
          if (val === 'Signed Off') data.cell.styles.textColor = [5, 122, 85];
          else if (val === 'Completed') data.cell.styles.textColor = [180, 130, 0];
          else if (val === 'In Progress') data.cell.styles.textColor = [37, 99, 235];
          else data.cell.styles.textColor = [120, 120, 120];
        }
      },
      didDrawCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 0) {
          const raw = data.cell.raw as string;
          const newlineIdx = raw.indexOf('\n');
          if (newlineIdx !== -1) {
            const description = raw.substring(newlineIdx + 1);
            doc.setFontSize(6.5);
            doc.setTextColor(120, 120, 120);
            const titleHeight = data.cell.styles.fontSize * 0.5;
            doc.text(description, data.cell.x + 2, data.cell.y + titleHeight + 5, {
              maxWidth: data.cell.width - 4,
            });
            doc.setTextColor(0);
            doc.setFontSize(8);
          }
        }
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 10;
  });

  const safeName = memberName.replace(/\s+/g, '_');
  doc.save(`Induction_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function exportTrainingMatrixPdf(
  memberName: string,
  memberRole: string,
  memberDepartment: string,
  ratings: Record<string, number>,
  categories: any[],
  submission: any,
  approverName?: string
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Training Matrix Report', 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Name: ${memberName}`, 14, 30);
  doc.text(`Role: ${memberRole}`, 14, 36);
  doc.text(`Department: ${memberDepartment}`, 14, 42);

  let infoY = 48;
  if (submission?.submittedDate) {
    doc.text(`Submitted: ${new Date(submission.submittedDate + 'T00:00:00').toLocaleDateString('en-GB')}`, 14, infoY);
    infoY += 6;
  }
  if (submission?.approvedDate) {
    const approverStr = approverName ? ` by ${approverName}` : (submission.approvedBy ? ` by ${submission.approvedBy}` : '');
    doc.text(`Approved: ${new Date(submission.approvedDate + 'T00:00:00').toLocaleDateString('en-GB')}${approverStr}`, 14, infoY);
    infoY += 6;
  }
  if (submission?.nextReviewDate) {
    doc.text(`Next Review: ${new Date(submission.nextReviewDate + 'T00:00:00').toLocaleDateString('en-GB')}`, 14, infoY);
    infoY += 6;
  }

  let total = 0;
  let count = 0;
  categories.forEach((cat: any) => {
    cat.items.forEach((item: any) => { total += ratings[item.slug] ?? 0; count++; });
  });
  const overall = count > 0 ? total / count : 0;
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(`Overall Score: ${overall.toFixed(1)} / 4`, 14, infoY + 2);
  infoY += 10;

  const ratingLabels = [
    'No experience',
    'Some experience',
    'Reasonably confident',
    'Highly confident',
    'Expert / can train others',
  ];

  let startY = infoY;

  categories.forEach((category: any) => {
    const catRatings = category.items.map((item: any) => ratings[item.slug] ?? 0);
    const catAvg = catRatings.reduce((a: number, b: number) => a + b, 0) / (catRatings.length || 1);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${category.name}  (avg: ${catAvg.toFixed(1)}/4)`, 14, startY);
    doc.setFont('helvetica', 'normal');
    startY += 2;

    const tableData = category.items.map((item: any) => {
      const r = ratings[item.slug] ?? 0;
      return [item.name, `${r}`, ratingLabels[r] || '-'];
    });

    autoTable(doc, {
      startY,
      head: [['Competency', 'Rating', 'Level']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 65, 122], fontSize: 8, cellPadding: 2 },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20, halign: 'center' as const },
        2: { cellWidth: 70 },
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 1) {
          const val = parseInt(data.cell.raw);
          if (val >= 4) data.cell.styles.textColor = [5, 122, 85];
          else if (val >= 3) data.cell.styles.textColor = [37, 99, 235];
          else if (val >= 2) data.cell.styles.textColor = [180, 130, 0];
          else if (val >= 1) data.cell.styles.textColor = [200, 100, 0];
          else data.cell.styles.textColor = [120, 120, 120];
        }
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 8;
  });

  const safeName = memberName.replace(/\s+/g, '_');
  doc.save(`Training_Matrix_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function InductionShareBar({ memberId, toast }: { memberId: string; toast: any }) {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/induction/${memberId}/share`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate share link');
      const { token } = await res.json();
      const link = `${window.location.origin}/induction/shared/${token}`;
      setShareLink(link);
    } catch {
      toast({ title: 'Error', description: 'Could not generate share link', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast({ title: 'Link copied', description: 'The share link has been copied to your clipboard.' });
    }
  };

  return (
    <div className="flex items-center gap-3">
      {!shareLink ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={generateLink}
          disabled={loading}
          data-testid="button-share-induction"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
          Share Induction Progress
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 flex-1 max-w-xl">
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
          <code className="text-xs text-muted-foreground truncate flex-1">{shareLink}</code>
          <Button variant="ghost" size="sm" className="gap-1 shrink-0" onClick={copyLink} data-testid="button-copy-share-link">
            <Copy className="w-3.5 h-3.5" />
            Copy
          </Button>
        </div>
      )}
    </div>
  );
}

function InductionSectionView({ items, completeItem, currentUser, memberId, toast }: {
  items: any[];
  completeItem: any;
  currentUser: any;
  memberId: string;
  toast: any;
}) {
  const sections = Array.from(new Set(items.map((i: any) => i.section)));

  return (
    <div className="space-y-6">
      {sections.map((section, sectionIndex) => {
        const sectionItems = items.filter((i: any) => i.section === section);
        const completedCount = sectionItems.filter((i: any) => i.completed).length;
        const signedOffCount = sectionItems.filter((i: any) => i.signedOffBy).length;
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
                  <span className="text-sm text-muted-foreground">
                    {sectionItems.length} {sectionItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    {completedCount}/{sectionItems.length} completed
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    {signedOffCount}/{sectionItems.length} signed off
                  </span>
                </div>
              </div>
              <Progress
                value={sectionItems.length > 0 ? (signedOffCount / sectionItems.length) * 100 : 0}
                className="h-1.5 mt-2"
              />
            </CardHeader>
            <CardContent className="p-0">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: '24%' }}>Item</TableHead>
                    <TableHead style={{ width: '12%' }}>Assigned To</TableHead>
                    <TableHead style={{ width: '10%' }}>Status</TableHead>
                    <TableHead style={{ width: '11%' }}>Target</TableHead>
                    <TableHead style={{ width: '11%' }}>Completed</TableHead>
                    <TableHead style={{ width: '12%' }}>Signed Off</TableHead>
                    <TableHead style={{ width: '20%' }} className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectionItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <AssignToInput item={item} completeItem={completeItem} toast={toast} />
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
                        <TargetDateCell item={item} completeItem={completeItem} />
                      </TableCell>
                      <TableCell>
                        <CompletedDateCell item={item} completeItem={completeItem} />
                      </TableCell>
                      <TableCell>
                        {item.signedOffBy ? (
                          <div>
                            <p className="text-sm">{new Date(item.signedOffDate).toLocaleDateString('en-GB')}</p>
                            <p className="text-xs text-muted-foreground">by {item.signedOffBy}</p>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!item.inProgress && !item.completed && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              data-testid={`button-start-${item.id}`}
                              onClick={() => {
                                completeItem.mutate({
                                  templateItemId: item.id,
                                  completed: false,
                                  inProgress: true,
                                  completedDate: null,
                                  targetDate: item.targetDate,
                                  signedOffBy: null,
                                  signedOffDate: null,
                                  assignedTo: item.assignedTo,
                                });
                                toast({ title: 'Item started', description: `"${item.title}" is now in progress.` });
                              }}
                            >
                              <PlayCircle className="w-3 h-3" />
                              Start
                            </Button>
                          )}
                          {item.inProgress && !item.completed && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                data-testid={`button-complete-${item.id}`}
                                onClick={() => {
                                  completeItem.mutate({
                                    templateItemId: item.id,
                                    completed: true,
                                    inProgress: false,
                                    completedDate: new Date().toISOString().slice(0, 10),
                                    targetDate: item.targetDate,
                                    signedOffBy: null,
                                    signedOffDate: null,
                                    assignedTo: item.assignedTo,
                                  });
                                  toast({ title: 'Item marked complete', description: `"${item.title}" has been marked as complete.` });
                                }}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1 text-muted-foreground"
                                data-testid={`button-undo-start-${item.id}`}
                                onClick={() => {
                                  completeItem.mutate({
                                    templateItemId: item.id,
                                    completed: false,
                                    inProgress: false,
                                    completedDate: null,
                                    targetDate: item.targetDate,
                                    signedOffBy: null,
                                    signedOffDate: null,
                                    assignedTo: item.assignedTo,
                                  });
                                  toast({ title: 'Progress undone', description: `"${item.title}" has been reset to not started.` });
                                }}
                              >
                                <Undo2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          {item.completed && !item.signedOffBy && (
                            <>
                              <Button
                                size="sm"
                                className="gap-1"
                                data-testid={`button-signoff-${item.id}`}
                                onClick={() => {
                                  completeItem.mutate({
                                    templateItemId: item.id,
                                    completed: true,
                                    inProgress: false,
                                    completedDate: item.completedDate,
                                    targetDate: item.targetDate,
                                    signedOffBy: currentUser?.name || 'Manager',
                                    signedOffDate: new Date().toISOString().slice(0, 10),
                                    assignedTo: item.assignedTo,
                                  });
                                  toast({ title: 'Item signed off', description: `"${item.title}" has been signed off.` });
                                }}
                              >
                                Sign Off
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1 text-muted-foreground"
                                data-testid={`button-undo-complete-${item.id}`}
                                onClick={() => {
                                  completeItem.mutate({
                                    templateItemId: item.id,
                                    completed: false,
                                    inProgress: true,
                                    completedDate: null,
                                    targetDate: item.targetDate,
                                    signedOffBy: null,
                                    signedOffDate: null,
                                    assignedTo: item.assignedTo,
                                  });
                                  toast({ title: 'Completion undone', description: `"${item.title}" has been moved back to in progress.` });
                                }}
                              >
                                <Undo2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          {item.signedOffBy && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-muted-foreground"
                              data-testid={`button-undo-signoff-${item.id}`}
                              onClick={() => {
                                completeItem.mutate({
                                  templateItemId: item.id,
                                  completed: true,
                                  inProgress: false,
                                  completedDate: item.completedDate,
                                  targetDate: item.targetDate,
                                  signedOffBy: null,
                                  signedOffDate: null,
                                  assignedTo: item.assignedTo,
                                });
                                toast({ title: 'Sign-off undone', description: `"${item.title}" sign-off has been removed.` });
                              }}
                            >
                              <Undo2 className="w-3 h-3" />
                              Undo
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TeamMemberProfile({ memberId }: { memberId: string }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const { data: member, isLoading: memberLoading } = useUser(memberId);
  const { data: inductionData, isLoading: inductionLoading } = useInduction(memberId);
  const { data: matrixSubmission, isLoading: matrixLoading } = useTrainingMatrixForUser(memberId);
  const { data: matrixHistory } = useTrainingMatrixHistory(memberId);
  const { data: approverUser } = useUser(matrixSubmission?.approvedBy || '');
  const { data: roleCompetencies, isLoading: roleCompLoading } = useCompetenciesForRole(member?.jobRole);
  const { data: deptCompetencies, isLoading: deptCompLoading } = useCompetencies(
    member?.department?.toLowerCase().includes('engineering') ? 'engineering' : 'admin'
  );
  const competencies = roleCompetencies || deptCompetencies;
  const competenciesLoading = roleCompLoading || deptCompLoading;

  const roleSlug = member?.jobRole
    ? member.jobRole.toLowerCase().replace(/\s+/g, '-')
    : '';
  const { data: standardsSurveyData } = useStandardsSurvey(roleSlug);

  const completeItem = useCompleteInductionItem(memberId);
  const updateMatrix = useUpdateTrainingMatrix();
  const generateShareToken = useGenerateShareToken();
  const [matrixShareUrl, setMatrixShareUrl] = useState('');
  const [matrixShareCopied, setMatrixShareCopied] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [nextReviewDate, setNextReviewDate] = useState('');
  const [editingNextReview, setEditingNextReview] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

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
                  <span>Started {new Date(member.startDate).toLocaleDateString('en-GB')}</span>
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
                      Last updated: {new Date(memberMatrix.lastAssessment).toLocaleDateString('en-GB')}
                    </p>
                    {matrixSubmission?.submittedDate && (
                      <p className="text-sm text-muted-foreground mt-1" data-testid="text-submitted-date-summary">
                        Submitted: {new Date(matrixSubmission.submittedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                      </p>
                    )}
                    {matrixSubmission?.approvedDate && (
                      <p className="text-sm text-muted-foreground mt-1" data-testid="text-approved-date-summary">
                        Approved: {new Date(matrixSubmission.approvedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                        {approverUser ? ` by ${approverUser.name}` : ''}
                      </p>
                    )}
                    {memberMatrix.status === 'approved' && matrixSubmission?.nextReviewDate && (
                      <p className={`text-sm font-medium mt-1 ${(() => {
                        const due = new Date(matrixSubmission.nextReviewDate + 'T00:00:00');
                        const daysUntil = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        return daysUntil < 0 ? 'text-red-600' : daysUntil <= 14 ? 'text-amber-600' : 'text-muted-foreground';
                      })()}`} data-testid="text-next-review-summary">
                        Next review: {new Date(matrixSubmission.nextReviewDate + 'T00:00:00').toLocaleDateString('en-GB')}
                        {(() => {
                          const due = new Date(matrixSubmission.nextReviewDate + 'T00:00:00');
                          const daysUntil = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return daysUntil < 0 ? ' (overdue)' : daysUntil <= 14 ? ' (due soon)' : '';
                        })()}
                      </p>
                    )}
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
            <div className="flex items-center justify-between gap-2 mb-4">
              <InductionShareBar memberId={memberId} toast={toast} />
              <Button
                variant="outline"
                size="sm"
                className="gap-2 shrink-0"
                data-testid="button-export-induction-pdf"
                onClick={() => {
                  if (member && items.length > 0) {
                    exportInductionPdf(member.name, member.jobRole || '', member.department || '', items);
                    toast({ title: 'PDF exported', description: `Induction report for ${member.name} has been downloaded.` });
                  }
                }}
                disabled={!items.length}
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
            <InductionSectionView
              items={items}
              completeItem={completeItem}
              currentUser={currentUser}
              memberId={memberId}
              toast={toast}
            />
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <CardTitle className="text-lg">Training Matrix</CardTitle>
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
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {matrixSubmission?.submittedDate && (
                      <span data-testid="text-submitted-date-header">
                        Submitted: {new Date(matrixSubmission.submittedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                      </span>
                    )}
                    {matrixSubmission?.submittedDate && matrixSubmission?.approvedDate && (
                      <span className="text-border">|</span>
                    )}
                    {matrixSubmission?.approvedDate && (
                      <span data-testid="text-approved-date-header">
                        Approved: {new Date(matrixSubmission.approvedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                        {approverUser ? ` by ${approverUser.name}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Review the colleague's submitted matrix and approve when you're happy.
                </CardDescription>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    data-testid="button-share-team-matrix"
                    disabled={generateShareToken.isPending}
                    onClick={async () => {
                      try {
                        let submissionId = matrixSubmission?.id;
                        if (!submissionId) {
                          toast({ title: 'No matrix to share', description: 'This colleague hasn\'t submitted a training matrix yet.', variant: 'destructive' });
                          return;
                        }
                        const result = await generateShareToken.mutateAsync(submissionId);
                        const url = `${window.location.origin}/training-matrix/shared/${result.token}`;
                        setMatrixShareUrl(url);
                        await navigator.clipboard.writeText(url);
                        setMatrixShareCopied(true);
                        setTimeout(() => setMatrixShareCopied(false), 2000);
                        toast({ title: 'Link copied', description: 'Shareable training matrix link copied to clipboard.' });
                      } catch {
                        toast({ title: 'Error', description: 'Could not generate share link.', variant: 'destructive' });
                      }
                    }}
                  >
                    {generateShareToken.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : matrixShareCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                    {matrixShareCopied ? 'Copied!' : 'Share Link'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    data-testid="button-download-matrix-pdf"
                    disabled={!matrixSubmission || !memberMatrix}
                    onClick={() => {
                      if (member && memberMatrix && matrixSubmission) {
                        exportTrainingMatrixPdf(
                          member.name,
                          member.jobRole || '',
                          member.department || '',
                          memberMatrix.ratings,
                          categories,
                          matrixSubmission,
                          approverUser?.name
                        );
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>

                  <div className="flex-1" />

                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={!matrixSubmission || matrixSubmission.status !== 'pending_review'}
                    onClick={() => {
                      if (matrixSubmission) {
                        const today = new Date().toISOString().slice(0, 10);
                        const sixMonths = new Date();
                        sixMonths.setMonth(sixMonths.getMonth() + 6);
                        const defaultNext = sixMonths.toISOString().slice(0, 10);
                        setNextReviewDate(defaultNext);
                        setShowApproveConfirm(true);
                      }
                    }}
                    data-testid="button-approve-matrix"
                  >
                    Approve
                  </Button>
                </div>

                {showApproveConfirm && matrixSubmission && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3 p-4 rounded-lg bg-muted/50 border" data-testid="approve-confirm-panel">
                    <div>
                      <label className="text-sm font-medium text-foreground">Next review due</label>
                      <Input
                        type="date"
                        value={nextReviewDate}
                        onChange={(e) => setNextReviewDate(e.target.value)}
                        className="mt-1 w-48"
                        data-testid="input-next-review-date"
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:pt-5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowApproveConfirm(false)}
                        data-testid="button-cancel-approve"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          const today = new Date().toISOString().slice(0, 10);
                          updateMatrix.mutate(
                            {
                              id: matrixSubmission.id,
                              data: {
                                status: 'approved',
                                approvedBy: currentUser?.id || '',
                                approvedDate: today,
                                nextReviewDate: nextReviewDate || undefined,
                              },
                            },
                            {
                              onSuccess: () => {
                                setShowApproveConfirm(false);
                                toast({
                                  title: 'Matrix approved',
                                  description: nextReviewDate
                                    ? `Approved. Next review due ${new Date(nextReviewDate + 'T00:00:00').toLocaleDateString('en-GB')}.`
                                    : 'The colleague can now see this matrix as approved.',
                                });
                              },
                            }
                          );
                        }}
                        data-testid="button-confirm-approve"
                      >
                        <Check className="h-4 w-4" />
                        Confirm Approval
                      </Button>
                    </div>
                  </div>
                )}

                {matrixSubmission?.status === 'approved' && matrixSubmission.nextReviewDate && !showApproveConfirm && !editingNextReview && (
                  <div className="flex items-center gap-2 pt-1" data-testid="next-review-display">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {(() => {
                      const due = new Date(matrixSubmission.nextReviewDate + 'T00:00:00');
                      const now = new Date();
                      const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      const isOverdue = daysUntil < 0;
                      const isDueSoon = daysUntil >= 0 && daysUntil <= 14;
                      return (
                        <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          Next review due: {due.toLocaleDateString('en-GB')}
                          {isOverdue && ' (overdue)'}
                          {isDueSoon && !isOverdue && ' (due soon)'}
                        </span>
                      );
                    })()}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setNextReviewDate(matrixSubmission.nextReviewDate || '');
                        setEditingNextReview(true);
                      }}
                      data-testid="button-edit-next-review"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {matrixSubmission?.status === 'approved' && !matrixSubmission.nextReviewDate && !showApproveConfirm && !editingNextReview && (
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const sixMonths = new Date();
                        sixMonths.setMonth(sixMonths.getMonth() + 6);
                        setNextReviewDate(sixMonths.toISOString().slice(0, 10));
                        setEditingNextReview(true);
                      }}
                      data-testid="button-add-next-review"
                    >
                      <Calendar className="w-4 h-4" />
                      Add next review date
                    </Button>
                  </div>
                )}

                {editingNextReview && matrixSubmission && (
                  <div className="flex items-center gap-2 pt-1" data-testid="edit-next-review-panel">
                    <Input
                      type="date"
                      value={nextReviewDate}
                      onChange={(e) => setNextReviewDate(e.target.value)}
                      className="w-48"
                      data-testid="input-edit-next-review"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingNextReview(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateMatrix.mutate(
                          { id: matrixSubmission.id, data: { nextReviewDate: nextReviewDate } },
                          {
                            onSuccess: () => {
                              setEditingNextReview(false);
                              toast({ title: 'Updated', description: 'Next review date has been updated.' });
                            },
                          }
                        );
                      }}
                      data-testid="button-save-next-review"
                    >
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0 px-6 pb-6">
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
                    compact
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p>No training matrix submitted yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {(() => {
              const pastApproved = matrixHistory
                ? matrixHistory.slice(1).filter((e: any) => e.status === 'approved')
                : [];
              return pastApproved.length > 0 ? (
              <Card className="mt-6 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Assessment History
                  </CardTitle>
                  <CardDescription>
                    Previous approved training matrix submissions for this colleague
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {pastApproved.map((entry: any) => {
                      const entryRatings = (entry.ratings || {}) as Record<string, number>;
                      let entryTotal = 0;
                      let entryCount = 0;
                      categories.forEach((cat: any) => {
                        cat.items.forEach((item: any) => {
                          entryTotal += entryRatings[item.slug] ?? 0;
                          entryCount++;
                        });
                      });
                      const entryAvg = entryCount > 0 ? entryTotal / entryCount : 0;
                      const isExpanded = expandedHistoryId === entry.id;

                      return (
                        <div key={entry.id} className="border rounded-lg overflow-hidden" data-testid={`history-entry-${entry.id}`}>
                          <button
                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                            onClick={() => setExpandedHistoryId(isExpanded ? null : entry.id)}
                            data-testid={`button-toggle-history-${entry.id}`}
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                              <Badge variant="secondary" className={
                                entry.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                entry.status === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-800'
                              }>
                                {entry.status === 'approved' ? 'Approved' : entry.status === 'pending_review' ? 'Pending' : 'Draft'}
                              </Badge>
                              {entry.submittedDate && (
                                <span className="text-xs text-muted-foreground">
                                  Submitted: {new Date(entry.submittedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                                </span>
                              )}
                              {entry.approvedDate && (
                                <span className="text-xs text-muted-foreground">
                                  Approved: {new Date(entry.approvedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Score: {entryAvg.toFixed(1)}/4
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="border-t px-4 py-4">
                              <IndividualView
                                name={member?.name || ''}
                                jobRole={member?.jobRole || ''}
                                department={member?.department || ''}
                                ratings={entryRatings}
                                lastAssessment={entry.lastAssessment}
                                categories={categories}
                                showBackButton={false}
                                compact
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null;
            })()}
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
                        <span>Started {new Date(member.startDate).toLocaleDateString('en-GB')}</span>
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
