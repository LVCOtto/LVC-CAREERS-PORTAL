import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Briefcase, Plus, Edit, Users, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJobRoles, useCreateJobRole, useUpdateJobRole, useDeleteJobRole } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';

interface RoleFormData {
  title: string;
  department: string;
  summary: string;
  responsibilities: string;
}

const emptyForm: RoleFormData = { title: '', department: '', summary: '', responsibilities: '' };

export default function AdminRoles() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { data: jobRoles = [], isLoading } = useJobRoles();
  const createJobRole = useCreateJobRole();
  const updateJobRole = useUpdateJobRole();
  const deleteJobRole = useDeleteJobRole();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState<RoleFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const openCreate = () => {
    setEditingRole(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (role: any) => {
    setEditingRole(role);
    setFormData({
      title: role.title || '',
      department: role.department || '',
      summary: role.summary || '',
      responsibilities: (role.responsibilities || []).join('\n'),
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.department.trim()) {
      toast({ title: 'Validation error', description: 'Title and department are required.', variant: 'destructive' });
      return;
    }
    const payload = {
      title: formData.title.trim(),
      department: formData.department.trim(),
      summary: formData.summary.trim(),
      responsibilities: formData.responsibilities.split('\n').map(r => r.trim()).filter(Boolean),
    };

    if (editingRole) {
      updateJobRole.mutate({ id: editingRole.id, data: payload }, {
        onSuccess: () => {
          toast({ title: 'Role updated', description: `${payload.title} has been updated.` });
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast({ title: 'Error', description: err.message, variant: 'destructive' });
        },
      });
    } else {
      createJobRole.mutate(payload, {
        onSuccess: () => {
          toast({ title: 'Role created', description: `${payload.title} has been created.` });
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast({ title: 'Error', description: err.message, variant: 'destructive' });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteJobRole.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast({ title: 'Role deleted', description: `${deleteTarget.title} has been deleted.` });
        setDeleteTarget(null);
      },
      onError: (err: any) => {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
        setDeleteTarget(null);
      },
    });
  };

  const isSaving = createJobRole.isPending || updateJobRole.isPending;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Job Roles</h1>
            <p className="text-muted-foreground mt-1">
              Define job roles and their responsibilities
            </p>
          </div>
          <Button data-testid="button-add-role" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Job Role
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {jobRoles.map((role: any) => (
              <Card key={role.id} className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.title}</CardTitle>
                        <CardDescription>{role.department}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(role)}
                        data-testid={`button-edit-role-${role.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(role)}
                        data-testid={`button-delete-role-${role.id}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {role.summary && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Summary</h4>
                        <p className="text-sm">{role.summary}</p>
                      </div>
                    )}
                    {role.responsibilities && role.responsibilities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Key Responsibilities
                        </h4>
                        <ul className="space-y-1">
                          {role.responsibilities.map((resp: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        Linked Templates
                      </Badge>
                      <Badge variant="secondary">Induction</Badge>
                      <Badge variant="secondary">Training Matrix</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-role-dialog-title">
              {editingRole ? 'Edit Job Role' : 'Add Job Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? 'Update the job role details below.' : 'Fill in the details for the new job role.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-title">Title</Label>
              <Input
                id="role-title"
                data-testid="input-role-title"
                value={formData.title}
                onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Operations Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-department">Department</Label>
              <Input
                id="role-department"
                data-testid="input-role-department"
                value={formData.department}
                onChange={(e) => setFormData(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Operations"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-summary">Summary</Label>
              <Textarea
                id="role-summary"
                data-testid="input-role-summary"
                value={formData.summary}
                onChange={(e) => setFormData(f => ({ ...f, summary: e.target.value }))}
                placeholder="Brief description of this role"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-responsibilities">Responsibilities (one per line)</Label>
              <Textarea
                id="role-responsibilities"
                data-testid="input-role-responsibilities"
                value={formData.responsibilities}
                onChange={(e) => setFormData(f => ({ ...f, responsibilities: e.target.value }))}
                placeholder={"Manage daily operations\nSupervise team members\nEnsure compliance"}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-role">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving} data-testid="button-save-role">
              {isSaving ? <Spinner className="w-4 h-4 mr-2" /> : null}
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-role">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-role"
            >
              {deleteJobRole.isPending ? <Spinner className="w-4 h-4 mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
