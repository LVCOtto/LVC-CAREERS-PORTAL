import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { usePortalSettings } from '@/lib/portalSettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle2,
  FileText,
  User as UserIcon,
  Briefcase,
  Loader2,
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

export default function SharedInduction() {
  const [, params] = useRoute('/induction/shared/:token');
  const token = params?.token || '';
  const { getSetting } = usePortalSettings();
  const portalName = getSetting('portal.title') || 'Training Portal';

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/induction/shared', token],
    queryFn: async () => {
      const res = await fetch(`/api/induction/shared/${token}`);
      if (!res.ok) throw new Error('Induction not found');
      return res.json();
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-medium text-destructive">Induction not found</p>
            <p className="text-sm text-muted-foreground mt-2">This link may have expired or is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { items, user } = data;
  const sections = Array.from(new Set(items.map((i: any) => i.section)));

  const totalItems = items.length;
  const completedItems = items.filter((i: any) => i.completed).length;
  const signedOffItems = items.filter((i: any) => i.signedOffBy).length;
  const overallProgress = totalItems > 0 ? (signedOffItems / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{portalName}</p>
          <p className="text-xs text-muted-foreground mt-1">Read-only induction progress view</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold" data-testid="text-shared-induction-name">
                  {user?.name || 'Team Member'}
                </h1>
                {user?.jobRole && (
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span data-testid="text-shared-induction-role">{user.jobRole}</span>
                    {user.department && (
                      <Badge variant="outline" className="ml-2">{user.department}</Badge>
                    )}
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall progress</span>
                    <span className="font-medium">{signedOffItems}/{totalItems} signed off</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                  <div className="flex gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      {completedItems} completed
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      {signedOffItems} signed off
                    </span>
                    <span>{totalItems - completedItems} remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {sections.map((section: string, sectionIndex: number) => {
          const sectionItems = items.filter((i: any) => i.section === section);
          const sCompleted = sectionItems.filter((i: any) => i.completed).length;
          const sSignedOff = sectionItems.filter((i: any) => i.signedOffBy).length;
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
                      {sCompleted}/{sectionItems.length} completed
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      {sSignedOff}/{sectionItems.length} signed off
                    </span>
                  </div>
                </div>
                <Progress
                  value={sectionItems.length > 0 ? (sSignedOff / sectionItems.length) * 100 : 0}
                  className="h-1.5 mt-2"
                />
              </CardHeader>
              <CardContent className="p-0">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: '5%' }}></TableHead>
                      <TableHead style={{ width: '33%' }}>Item</TableHead>
                      <TableHead style={{ width: '15%' }}>Assigned To</TableHead>
                      <TableHead style={{ width: '15%' }}>Status</TableHead>
                      <TableHead style={{ width: '15%' }}>Completed</TableHead>
                      <TableHead style={{ width: '17%' }}>Signed Off</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectionItems.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="w-8 text-center">
                          {item.signedOffBy ? (
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
                          ) : (
                            <StatusBadge status="not_started" />
                          )}
                        </TableCell>
                        <TableCell>
                          {item.completedDate ? new Date(item.completedDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {item.signedOffBy ? (
                            <div>
                              <p className="text-sm">{new Date(item.signedOffDate).toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground">by {item.signedOffBy}</p>
                            </div>
                          ) : '-'}
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
    </div>
  );
}