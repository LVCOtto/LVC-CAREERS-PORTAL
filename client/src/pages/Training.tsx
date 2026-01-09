import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  getTrainingRecordsForUser,
  getComplianceStats,
  TrainingRecord,
} from '@/lib/mockData';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Upload,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Training() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  if (!currentUser) return null;

  const [records, setRecords] = useState<TrainingRecord[]>(
    getTrainingRecordsForUser(currentUser.id)
  );
  const stats = getComplianceStats(records);

  const categories = Array.from(new Set(records.map(r => r.category)));

  const handleMarkComplete = (recordId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    setRecords(prev =>
      prev.map(r =>
        r.id === recordId
          ? {
              ...r,
              completedDate: today,
              expiresDate: expiryDate.toISOString().split('T')[0],
              status: 'compliant' as const,
            }
          : r
      )
    );
    toast({
      title: 'Training marked complete',
      description: 'The training record has been updated.',
    });
  };

  const handleScheduleTraining = (recordId: string) => {
    toast({
      title: 'Training scheduled',
      description: 'Training has been scheduled for review.',
    });
  };

  const getStatusIcon = (status: TrainingRecord['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'due_soon':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const filterByStatus = (status: TrainingRecord['status'] | 'all') => {
    if (status === 'all') return records;
    return records.filter(r => r.status === status);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Training Matrix</h1>
          <p className="text-muted-foreground mt-1">
            View your training requirements and certification status
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-display font-bold text-emerald-700">
                    {stats.compliant}
                  </p>
                  <p className="text-sm text-muted-foreground">Compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-display font-bold text-amber-700">
                    {stats.dueSoon}
                  </p>
                  <p className="text-sm text-muted-foreground">Due Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-display font-bold text-red-700">
                    {stats.overdue}
                  </p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-500/30 bg-gray-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-gray-500" />
                <div>
                  <p className="text-2xl font-display font-bold text-gray-600">
                    {stats.missing}
                  </p>
                  <p className="text-sm text-muted-foreground">Missing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Training Requirements</CardTitle>
                <CardDescription>
                  Your role-specific training and certification requirements
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-display font-bold text-primary">
                  {stats.complianceRate}%
                </p>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all" data-testid="tab-all">
                  All ({records.length})
                </TabsTrigger>
                <TabsTrigger value="compliant" data-testid="tab-compliant">
                  Compliant ({stats.compliant})
                </TabsTrigger>
                <TabsTrigger value="due_soon" data-testid="tab-due-soon">
                  Due Soon ({stats.dueSoon})
                </TabsTrigger>
                <TabsTrigger value="overdue" data-testid="tab-overdue">
                  Overdue ({stats.overdue})
                </TabsTrigger>
                <TabsTrigger value="missing" data-testid="tab-missing">
                  Missing ({stats.missing})
                </TabsTrigger>
              </TabsList>

              {['all', 'compliant', 'due_soon', 'overdue', 'missing'].map(tab => (
                <TabsContent key={tab} value={tab}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Training Requirement</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterByStatus(tab as any).map(record => (
                        <TableRow key={record.id} data-testid={`training-row-${record.id}`}>
                          <TableCell>{getStatusIcon(record.status)}</TableCell>
                          <TableCell className="font-medium">
                            {record.requirementName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{record.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {record.completedDate
                              ? new Date(record.completedDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {record.expiresDate ? (
                              <span
                                className={
                                  record.status === 'overdue'
                                    ? 'text-red-600 font-medium'
                                    : record.status === 'due_soon'
                                    ? 'text-amber-600 font-medium'
                                    : ''
                                }
                              >
                                {new Date(record.expiresDate).toLocaleDateString()}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={record.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {record.status === 'compliant' && record.certificateFile && (
                                <Button variant="ghost" size="sm" data-testid={`button-view-cert-${record.id}`}>
                                  <FileCheck className="w-4 h-4" />
                                </Button>
                              )}
                              {(record.status === 'missing' || record.status === 'overdue') && (
                                <>
                                  {(currentUser.role === 'manager' ||
                                    currentUser.role === 'admin') && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleScheduleTraining(record.id)}
                                      data-testid={`button-schedule-${record.id}`}
                                    >
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Schedule
                                    </Button>
                                  )}
                                  {(currentUser.role === 'manager' ||
                                    currentUser.role === 'admin') && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleMarkComplete(record.id)}
                                      data-testid={`button-complete-${record.id}`}
                                    >
                                      Mark Complete
                                    </Button>
                                  )}
                                </>
                              )}
                              {record.status === 'due_soon' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleScheduleTraining(record.id)}
                                  data-testid={`button-renew-${record.id}`}
                                >
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Schedule Renewal
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {categories.map(category => (
            <Card key={category} className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
                <CardDescription>
                  {records.filter(r => r.category === category && r.status === 'compliant').length}{' '}
                  of {records.filter(r => r.category === category).length} compliant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {records
                    .filter(r => r.category === category)
                    .map(record => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(record.status)}
                          <span className="text-sm">{record.requirementName}</span>
                        </div>
                        <StatusBadge status={record.status} />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
