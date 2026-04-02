import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Edit, Trash2, Download, Upload, GraduationCap, Check, ClipboardList, ChevronRight, ChevronDown, GripVertical, ArrowUp, ArrowDown, CornerDownRight, Building2, Users, User, X } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useJobRoles, useCreateJobRole, useUpdateJobRole, useDeleteJobRole, useReorderJobRole, useCompetencies, useJobRoleCategories, useSetJobRoleCategories, useInductionTemplates, useInductionSectionSettings, useUpsertInductionSectionSetting, useJobRoleInductionSections, useSetJobRoleInductionSections, useDepartments, useUpdateDepartment, useRenameDepartment } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';
import { CsvImportDialog } from '@/components/CsvImportDialog';
import { api, invalidate } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RoleFormData {
  title: string;
  department: string;
  summary: string;
  responsibilities: string;
  reportsTo: number | null;
}

const emptyForm: RoleFormData = { title: '', department: '', summary: '', responsibilities: '', reportsTo: null };

const tailwindColorMap: Record<string, string> = {
  'bg-slate-600': '#475569', 'bg-gray-600': '#4b5563', 'bg-zinc-600': '#52525b',
  'bg-red-600': '#dc2626', 'bg-orange-600': '#ea580c', 'bg-amber-600': '#d97706',
  'bg-yellow-600': '#ca8a04', 'bg-lime-600': '#65a30d', 'bg-green-600': '#16a34a',
  'bg-emerald-600': '#059669', 'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
  'bg-sky-600': '#0284c7', 'bg-blue-600': '#2563eb', 'bg-indigo-600': '#4f46e5',
  'bg-violet-600': '#7c3aed', 'bg-purple-600': '#9333ea', 'bg-fuchsia-600': '#c026d3',
  'bg-pink-600': '#db2777', 'bg-rose-600': '#e11d48',
};

function resolveColor(twClass: string | null): string | null {
  if (!twClass) return null;
  return tailwindColorMap[twClass] || null;
}

function buildTree(roles: any[]): any[] {
  const sorted = [...roles].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const map = new Map<number, any>();
  const roots: any[] = [];

  sorted.forEach(role => {
    map.set(role.id, { ...role, children: [] });
  });

  sorted.forEach(role => {
    const node = map.get(role.id)!;
    if (role.reportsTo && map.has(role.reportsTo)) {
      map.get(role.reportsTo)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default function AdminRoles() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { data: jobRoles = [], isLoading } = useJobRoles();
  const { data: allUsers = [], isLoading: usersLoading } = useUsers();
  const { data: departmentsList = [] } = useDepartments();
  const createJobRole = useCreateJobRole();
  const updateJobRole = useUpdateJobRole();
  const deleteJobRole = useDeleteJobRole();
  const reorderJobRole = useReorderJobRole();
  const updateDepartment = useUpdateDepartment();
  const renameDepartment = useRenameDepartment();
  const [draggingDeptId, setDraggingDeptId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState<RoleFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const [skillsDialogRole, setSkillsDialogRole] = useState<any>(null);
  const [inductionDialogRole, setInductionDialogRole] = useState<any>(null);
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());
  const [expandedPeople, setExpandedPeople] = useState<Set<number>>(new Set());

  const usersByRole = useMemo(() => {
    const m = new Map<string, any[]>();
    allUsers.forEach((u: any) => {
      if (u.jobRole) {
        const key = u.jobRole;
        if (!m.has(key)) m.set(key, []);
        m.get(key)!.push(u);
      }
    });
    return m;
  }, [allUsers]);

  const deptColorMap = useMemo(() => {
    const m = new Map<string, string>();
    departmentsList.forEach((d: any) => {
      const hex = resolveColor(d.color);
      if (hex) m.set(d.name, hex);
    });
    return m;
  }, [departmentsList]);

  const deptIdMap = useMemo(() => {
    const m = new Map<string, number>();
    departmentsList.forEach((d: any) => m.set(d.name, d.id));
    return m;
  }, [departmentsList]);

  const rolesByDepartment = useMemo(() => {
    const deptSortOrder = new Map<string, number>();
    departmentsList.forEach((d: any) => deptSortOrder.set(d.name, d.sortOrder ?? 0));

    const groups = new Map<string, any[]>();
    jobRoles.forEach((role: any) => {
      const dept = role.department || 'Uncategorised';
      if (!groups.has(dept)) groups.set(dept, []);
      groups.get(dept)!.push(role);
    });
    const sorted = Array.from(groups.entries()).sort(([a], [b]) => {
      const aOrder = deptSortOrder.get(a) ?? 999;
      const bOrder = deptSortOrder.get(b) ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.localeCompare(b);
    });
    return sorted.map(([dept, roles]) => ({
      department: dept,
      deptId: deptIdMap.get(dept) || null,
      tree: buildTree(roles),
      count: roles.length,
      color: deptColorMap.get(dept) || null,
    }));
  }, [jobRoles, departmentsList, deptColorMap, deptIdMap]);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleRenameDepartment = (deptId: number, newName: string) => {
    renameDepartment.mutate({ id: deptId, name: newName }, {
      onSuccess: () => {
        toast({ title: 'Department renamed', description: `Department renamed to "${newName}".` });
      },
      onError: (err: any) => {
        toast({ title: 'Rename failed', description: err?.message || 'Could not rename department.', variant: 'destructive' });
      },
    });
  };

  const toggleDept = (dept: string) => {
    setCollapsedDepts(prev => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  const openCreate = (parentId?: number, department?: string) => {
    setEditingRole(null);
    setFormData({ ...emptyForm, reportsTo: parentId ?? null, department: department || '' });
    setDialogOpen(true);
  };

  const openEdit = (role: any) => {
    setEditingRole(role);
    setFormData({
      title: role.title || '',
      department: role.department || '',
      summary: role.summary || '',
      responsibilities: (role.responsibilities || []).join('\n'),
      reportsTo: role.reportsTo ?? null,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.department.trim()) {
      toast({ title: 'Validation error', description: 'Title and department are required.', variant: 'destructive' });
      return;
    }
    const payload: any = {
      title: formData.title.trim(),
      department: formData.department.trim(),
      summary: formData.summary.trim(),
      responsibilities: formData.responsibilities.split('\n').map(r => r.trim()).filter(Boolean),
      reportsTo: formData.reportsTo,
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
      const siblings = jobRoles.filter((r: any) =>
        r.department === formData.department && (formData.reportsTo ? r.reportsTo === formData.reportsTo : !r.reportsTo)
      );
      payload.sortOrder = siblings.length;
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

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setIsDeleting(true);
    try {
      await deleteJobRole.mutateAsync(target.id);
      toast({ title: 'Role deleted', description: `${target.title} has been deleted.` });
      setDeleteTarget(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete role', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const moveRole = (roleId: number, direction: 'up' | 'down') => {
    const role = jobRoles.find((r: any) => r.id === roleId);
    if (!role) return;
    const siblings = jobRoles
      .filter((r: any) => r.department === role.department && (role.reportsTo ? r.reportsTo === role.reportsTo : !r.reportsTo) && r.id !== role.id)
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const allSorted = [...siblings];
    const currentIdx = allSorted.findIndex((r: any) => (r.sortOrder || 0) >= (role.sortOrder || 0));
    const insertIdx = currentIdx === -1 ? allSorted.length : currentIdx;
    allSorted.splice(insertIdx, 0, role);

    const roleIdx = allSorted.findIndex((r: any) => r.id === roleId);
    const swapIdx = direction === 'up' ? roleIdx - 1 : roleIdx + 1;
    if (swapIdx < 0 || swapIdx >= allSorted.length) return;

    reorderJobRole.mutate({ id: roleId, sortOrder: swapIdx });
    reorderJobRole.mutate({ id: allSorted[swapIdx].id, sortOrder: roleIdx });
  };

  const toggleCollapse = (id: number) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isSaving = createJobRole.isPending || updateJobRole.isPending;

  const togglePeople = (id: number) => {
    setExpandedPeople(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderTreeNode = (node: any, depth: number, siblingCount: number, siblingIndex: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsed.has(node.id);
    const paddingLeft = depth * 32;
    const assignedUsers = usersByRole.get(node.title) || [];
    const headcount = assignedUsers.length;
    const isPeopleExpanded = expandedPeople.has(node.id);

    return (
      <div key={node.id} data-testid={`tree-node-${node.id}`}>
        <div
          className={`flex items-center gap-2 py-2.5 px-3 border-b hover:bg-muted/30 transition-colors group ${depth === 0 ? 'bg-muted/10' : ''}`}
          style={{ paddingLeft: paddingLeft + 12 }}
        >
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              onClick={() => moveRole(node.id, 'up')}
              disabled={siblingIndex === 0}
              data-testid={`button-move-up-${node.id}`}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              onClick={() => moveRole(node.id, 'down')}
              disabled={siblingIndex === siblingCount - 1}
              data-testid={`button-move-down-${node.id}`}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>

          {hasChildren ? (
            <button
              onClick={() => toggleCollapse(node.id)}
              className="shrink-0 h-5 w-5 flex items-center justify-center rounded hover:bg-muted"
              data-testid={`button-toggle-${node.id}`}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          ) : (
            <span className="shrink-0 h-5 w-5 flex items-center justify-center">
              {depth > 0 && <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
            </span>
          )}

          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${depth === 0 ? 'bg-primary/10' : 'bg-muted/50'}`}>
            <Briefcase className={`w-4 h-4 ${depth === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium text-sm truncate ${depth === 0 ? 'text-foreground' : ''}`}>
                {node.title}
              </span>
              <button
                onClick={() => togglePeople(node.id)}
                className="shrink-0"
                data-testid={`button-headcount-${node.id}`}
              >
                <Badge
                  variant={headcount > 0 ? 'secondary' : 'outline'}
                  className={`text-xs cursor-pointer hover:bg-muted transition-colors ${headcount === 0 ? 'text-muted-foreground' : ''}`}
                >
                  <Users className="w-3 h-3 mr-1" />
                  {usersLoading ? '…' : headcount > 0 ? `${headcount} ${headcount === 1 ? 'person' : 'people'}` : 'Vacant'}
                </Badge>
              </button>
            </div>
            {node.summary && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{node.summary}</p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {hasChildren && (
              <Badge variant="outline" className="text-xs">
                {node.children.length} report{node.children.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => openCreate(node.id, node.department)}
              data-testid={`button-add-under-${node.id}`}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSkillsDialogRole(node)}
              data-testid={`button-manage-skills-${node.id}`}
            >
              <GraduationCap className="w-3 h-3 mr-1" />
              Skills
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setInductionDialogRole(node)}
              data-testid={`button-manage-induction-${node.id}`}
            >
              <ClipboardList className="w-3 h-3 mr-1" />
              Induction
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => openEdit(node)}
              data-testid={`button-edit-role-${node.id}`}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(node)}
              data-testid={`button-delete-role-${node.id}`}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {isPeopleExpanded && (
          <div
            className="border-b bg-muted/20"
            style={{ paddingLeft: paddingLeft + 52 }}
            data-testid={`people-list-${node.id}`}
          >
            {assignedUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 px-3 italic">No one is assigned to this role</p>
            ) : (
              <div className="py-1.5 px-3 space-y-0.5">
                {assignedUsers.map((u: any) => (
                  <Link
                    key={u.id}
                    href={`/team/${u.id}`}
                    className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors text-sm"
                    data-testid={`link-user-${u.id}`}
                  >
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{u.name || u.username}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {hasChildren && !isCollapsed && (
          <div>
            {node.children.map((child: any, idx: number) =>
              renderTreeNode(child, depth + 1, node.children.length, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Job Roles</h1>
            <p className="text-muted-foreground mt-1">
              Organisational hierarchy — define reporting lines, skills, and induction for each role
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
            <Button data-testid="button-add-role" onClick={() => openCreate()}>
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
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{rolesByDepartment.length} department{rolesByDepartment.length !== 1 ? 's' : ''} &middot; {jobRoles.length} role{jobRoles.length !== 1 ? 's' : ''} &middot; drag to reorder departments</span>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event: DragStartEvent) => setDraggingDeptId(event.active.id as string)}
              onDragEnd={(event: DragEndEvent) => {
                setDraggingDeptId(null);
                const { active, over } = event;
                if (!over || active.id === over.id) return;
                const oldIndex = rolesByDepartment.findIndex(d => d.department === active.id);
                const newIndex = rolesByDepartment.findIndex(d => d.department === over.id);
                if (oldIndex === -1 || newIndex === -1) return;
                const reordered = arrayMove(rolesByDepartment, oldIndex, newIndex);
                reordered.forEach((group, idx) => {
                  if (group.deptId) {
                    updateDepartment.mutate({ id: group.deptId, sortOrder: idx });
                  }
                });
              }}
            >
              <SortableContext items={rolesByDepartment.map(d => d.department)} strategy={verticalListSortingStrategy}>
                {rolesByDepartment.map(({ department, deptId, tree: deptTree, count, color }) => (
                  <SortableDepartmentCard
                    key={department}
                    id={department}
                    department={department}
                    deptId={deptId}
                    deptTree={deptTree}
                    count={count}
                    color={color}
                    isCollapsed={collapsedDepts.has(department)}
                    onToggle={() => toggleDept(department)}
                    onAddRole={() => openCreate(undefined, department)}
                    onRename={handleRenameDepartment}
                    renderTreeNode={renderTreeNode}
                    isDragging={draggingDeptId === department}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
              <Select
                value={formData.department || "__none__"}
                onValueChange={(v) => setFormData(f => ({ ...f, department: v === "__none__" ? "" : v }))}
              >
                <SelectTrigger data-testid="input-role-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select department</SelectItem>
                  {(departmentsList || []).map((d: any) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-reports-to">Reports To</Label>
              <Select
                value={formData.reportsTo?.toString() || "__none__"}
                onValueChange={(v) => setFormData(f => ({ ...f, reportsTo: v === "__none__" ? null : parseInt(v) }))}
              >
                <SelectTrigger data-testid="input-role-reports-to">
                  <SelectValue placeholder="None (top-level role)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (top-level role)</SelectItem>
                  {(() => {
                    const sameDept = jobRoles.filter((r: any) =>
                      (!editingRole || r.id !== editingRole.id) && r.department === formData.department
                    );
                    const otherDept = jobRoles.filter((r: any) =>
                      (!editingRole || r.id !== editingRole.id) && r.department !== formData.department
                    );
                    return (
                      <>
                        {sameDept.map((r: any) => (
                          <SelectItem key={r.id} value={r.id.toString()}>
                            {r.title}
                          </SelectItem>
                        ))}
                        {otherDept.length > 0 && sameDept.length > 0 && (
                          <SelectItem value="__divider__" disabled>
                            ── Other departments ──
                          </SelectItem>
                        )}
                        {otherDept.map((r: any) => (
                          <SelectItem key={r.id} value={r.id.toString()}>
                            {r.title} ({r.department})
                          </SelectItem>
                        ))}
                      </>
                    );
                  })()}
                </SelectContent>
              </Select>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open && !isDeleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"?
              {deleteTarget && jobRoles.filter((r: any) => r.reportsTo === deleteTarget.id).length > 0 && (
                <span className="block mt-2 text-amber-600">
                  Roles reporting to this position will be moved up to report to its parent.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-role" disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={isDeleting}
              data-testid="button-confirm-delete-role"
            >
              {isDeleting ? <Spinner className="w-4 h-4 mr-2" /> : null}
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
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
        description="Upload a CSV file to import job roles and assign colleagues. Roles are created if new; colleague assignments are updated when a matching email is found. If a colleague email has no existing account, one will be created automatically."
        expectedColumns={['Role Title', 'Department', 'Reports To', 'Colleague Name', 'Colleague Email']}
        onImport={(rows) => api.importCsv('job-roles', rows)}
        onComplete={() => { invalidate('job-roles'); invalidate('users'); }}
      />
    </Layout>
  );
}

interface SortableDeptProps {
  id: string;
  department: string;
  deptId: number | null;
  deptTree: any[];
  count: number;
  color: string | null;
  isCollapsed: boolean;
  onToggle: () => void;
  onAddRole: () => void;
  onRename: (deptId: number, newName: string) => void;
  renderTreeNode: (node: any, depth: number, siblingCount: number, siblingIndex: number) => React.ReactNode;
  isDragging: boolean;
}

function SortableDepartmentCard({ id, department, deptId, deptTree, count, color, isCollapsed, onToggle, onAddRole, onRename, renderTreeNode, isDragging }: SortableDeptProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(department);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(department);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== department && deptId) {
      onRename(deptId, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(department);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="border-border/50 overflow-hidden"
      data-testid={`dept-section-${department}`}
    >
      <div
        className="group/dept flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors select-none"
        onClick={onToggle}
        data-testid={`button-toggle-dept-${department}`}
      >
        <div
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground/60" />
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={color ? { backgroundColor: color + '20' } : undefined}
        >
          <Building2
            className="w-4.5 h-4.5"
            style={color ? { color } : undefined}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="h-7 text-sm font-semibold w-48"
                  data-testid={`input-rename-dept-${department}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={handleSaveEdit}
                  data-testid={`button-save-rename-dept-${department}`}
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={handleCancelEdit}
                  data-testid={`button-cancel-rename-dept-${department}`}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <span className="font-semibold text-sm">{department}</span>
                {deptId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover/dept:opacity-100 transition-opacity"
                    onClick={handleStartEdit}
                    data-testid={`button-rename-dept-${department}`}
                  >
                    <Edit className="w-3 h-3 text-muted-foreground" />
                  </Button>
                )}
              </>
            )}
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {count} role{count !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => { e.stopPropagation(); onAddRole(); }}
            data-testid={`button-add-role-dept-${department}`}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Role
          </Button>
          {isCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
      {!isCollapsed && (
        <div className="border-t">
          {deptTree.map((node: any, idx: number) =>
            renderTreeNode(node, 0, deptTree.length, idx)
          )}
        </div>
      )}
    </Card>
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
