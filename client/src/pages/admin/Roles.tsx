import { useState, useEffect } from 'react';
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
import { Briefcase, Plus, Edit, Users, Trash2, Download, Upload, GraduationCap, Check, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useJobRoles, useCreateJobRole, useUpdateJobRole, useDeleteJobRole, useCompetencies, useJobRoleCategories, useSetJobRoleCategories, useInductionTemplates, useInductionSectionSettings, useUpsertInductionSectionSetting, useJobRoleInductionSections, useSetJobRoleInductionSections } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';
import { CsvImportDialog } from '@/components/CsvImportDialog';
import { api, invalidate } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [skillsDialogRole, setSkillsDialogRole] = useState<any>(null);
  const [inductionDialogRole, setInductionDialogRole] = useState<any>(null);

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
              Define job roles, their responsibilities, and which training matrix skills apply to each
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => api.exportCsv('job-roles')} data-testid="button-export-roles">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsImportOpen(true)} data-testid="button-import-roles">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button data-testid="button-add-role" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Job Role
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : jobRoles.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No job roles yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Job Role" to create your first role.</p>
            </CardContent>
          </Card>
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
                        onClick={() => setSkillsDialogRole(role)}
                        data-testid={`button-manage-skills-${role.id}`}
                      >
                        <GraduationCap className="w-4 h-4 mr-1" />
                        Skills
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInductionDialogRole(role)}
                        data-testid={`button-manage-induction-${role.id}`}
                      >
                        <ClipboardList className="w-4 h-4 mr-1" />
                        Induction
                      </Button>
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

      {skillsDialogRole && (
        <SkillCategoryAssigner
          role={skillsDialogRole}
          onClose={() => setSkillsDialogRole(null)}
        />
      )}

      {inductionDialogRole && (
        <InductionSectionAssigner
          role={inductionDialogRole}
          onClose={() => setInductionDialogRole(null)}
        />
      )}

      <CsvImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        title="Import Job Roles"
        description="Upload a CSV file to bulk-create job roles."
        expectedColumns={['title', 'department', 'summary']}
        onImport={(rows) => api.importCsv('job-roles', rows)}
        onComplete={() => invalidate('job-roles')}
      />
    </Layout>
  );
}

function SkillCategoryAssigner({ role, onClose }: { role: any; onClose: () => void }) {
  const { toast } = useToast();
  const { data: allCategories = [], isLoading: catsLoading } = useCompetencies();
  const { data: assignedIds = [], isLoading: assignedLoading } = useJobRoleCategories(role.id);
  const setCategories = useSetJobRoleCategories();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!assignedLoading && assignedIds && !initialized) {
      setSelected(new Set(assignedIds));
      setInitialized(true);
    }
  }, [assignedIds, assignedLoading, initialized]);

  const toggle = (catId: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await setCategories.mutateAsync({ id: role.id, categoryIds: Array.from(selected) });
      toast({ title: 'Saved', description: `Training matrix skills updated for ${role.title}.` });
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' });
    }
  };

  const isLoading = catsLoading || assignedLoading;

  const engineeringCats = allCategories.filter((c: any) => c.departmentType === 'engineering');
  const adminCats = allCategories.filter((c: any) => c.departmentType === 'admin');
  const otherCats = allCategories.filter((c: any) => c.departmentType !== 'engineering' && c.departmentType !== 'admin');

  const renderGroup = (label: string, cats: any[]) => {
    if (cats.length === 0) return null;
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
        {cats.map((cat: any) => (
          <label
            key={cat.id}
            className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
            data-testid={`checkbox-role-category-${cat.id}`}
          >
            <Checkbox
              checked={selected.has(cat.id)}
              onCheckedChange={() => toggle(cat.id)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{cat.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {(cat.items || []).length} skills
                </Badge>
              </div>
              {(cat.items || []).length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {(cat.items || []).slice(0, 3).map((i: any) => i.name).join(', ')}
                  {(cat.items || []).length > 3 && ` +${(cat.items || []).length - 3} more`}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg" data-testid="dialog-role-skills">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Training Matrix Skills — {role.title}
          </DialogTitle>
          <DialogDescription>
            Select which skill categories apply to this role. Users with this job role will only see the selected categories in their training matrix.
            If none are selected, they'll see all categories for their department type.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : allCategories.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No skill categories have been created yet. Create them in the Templates page first.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-auto pr-1">
            {renderGroup('Engineering', engineeringCats)}
            {renderGroup('Admin / Office', adminCats)}
            {renderGroup('All Departments', otherCats)}
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selected.size === 0 ? 'None selected (will use department default)' : `${selected.size} categor${selected.size === 1 ? 'y' : 'ies'} selected`}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} data-testid="button-cancel-role-skills">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={setCategories.isPending} data-testid="button-save-role-skills">
                {setCategories.isPending ? <Spinner className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InductionSectionAssigner({ role, onClose }: { role: any; onClose: () => void }) {
  const { toast } = useToast();
  const { data: templateItems = [], isLoading: templatesLoading } = useInductionTemplates();
  const { data: sectionSettings = [], isLoading: settingsLoading } = useInductionSectionSettings();
  const { data: assignedSections = [], isLoading: assignedLoading } = useJobRoleInductionSections(role.id);
  const setSections = useSetJobRoleInductionSections();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!assignedLoading && assignedSections && !initialized) {
      setSelected(new Set(assignedSections));
      setInitialized(true);
    }
  }, [assignedSections, assignedLoading, initialized]);

  const sectionNames = Array.from(new Set(templateItems.map((t: any) => t.section)));
  const universalSections = new Set(sectionSettings.filter((s: any) => s.isUniversal).map((s: any) => s.sectionName));

  const toggle = (section: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await setSections.mutateAsync({ id: role.id, sections: Array.from(selected) });
      toast({ title: 'Saved', description: `Induction sections updated for ${role.title}.` });
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' });
    }
  };

  const isLoading = templatesLoading || settingsLoading || assignedLoading;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg" data-testid="dialog-role-induction">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Induction Sections — {role.title}
          </DialogTitle>
          <DialogDescription>
            Select which induction sections apply to this role. Sections marked as "Universal" are automatically included for all roles.
            If no sections are selected (and none are universal), the user will see all sections.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : sectionNames.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No induction sections found. Create induction template items in the Templates page first.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
            {sectionNames.map((section: string) => {
              const items = templateItems.filter((t: any) => t.section === section);
              const isUniversal = universalSections.has(section);
              return (
                <label
                  key={section}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${isUniversal ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900' : ''}`}
                  data-testid={`checkbox-role-induction-${section}`}
                >
                  <Checkbox
                    checked={isUniversal || selected.has(section)}
                    onCheckedChange={() => !isUniversal && toggle(section)}
                    disabled={isUniversal}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{section}</span>
                      <Badge variant="secondary" className="text-xs">
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </Badge>
                      {isUniversal && (
                        <Badge className="text-xs bg-emerald-600 text-white">Universal</Badge>
                      )}
                    </div>
                    {items.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {items.slice(0, 3).map((i: any) => i.title).join(', ')}
                        {items.length > 3 && ` +${items.length - 3} more`}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selected.size === 0 && universalSections.size === 0
                ? 'None selected (will show all sections)'
                : `${selected.size + universalSections.size} section${(selected.size + universalSections.size) === 1 ? '' : 's'} active (${universalSections.size} universal)`}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} data-testid="button-cancel-role-induction">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={setSections.isPending} data-testid="button-save-role-induction">
                {setSections.isPending ? <Spinner className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
