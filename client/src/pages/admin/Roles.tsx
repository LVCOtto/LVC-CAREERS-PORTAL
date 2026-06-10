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
import { useUsers, useJobRoles, useCreateJobRole, useUpdateJobRole, useDeleteJobRole, useReorderJobRole, useCompetencies, useJobRoleCategories, useAllJobRoleCategories, useSetJobRoleCategories, useInductionTemplates, useInductionSectionSettings, useUpsertInductionSectionSetting, useJobRoleInductionSections, useSetJobRoleInductionSections, useDepartments, useUpdateDepartment, useRenameDepartment } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';
import { CsvImportDialog } from '@/components/CsvImportDialog';
import { api, invalidate } from '@/lib/api';
import type { JobRoleMatrixAssignment, JobRoleMatrixLayout, JobRoleMatrixSection } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DndContext, closestCenter, closestCorners, pointerWithin, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, useDroppable, type CollisionDetection } from '@dnd-kit/core';
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
  const { data: allRoleCategoryAssignments = [] } = useAllJobRoleCategories();
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

  const trainingMatrixCountsByRoleId = useMemo(() => {
    const counts = new Map<number, number>();
    allRoleCategoryAssignments.forEach((assignment: any) => {
      counts.set(assignment.jobRoleId, (counts.get(assignment.jobRoleId) || 0) + 1);
    });
    return counts;
  }, [allRoleCategoryAssignments]);

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
    const trainingMatrixCategoryCount = trainingMatrixCountsByRoleId.get(node.id) || 0;
    const hasCalibratedTrainingMatrix = trainingMatrixCategoryCount > 0;

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
              <Badge
                variant={hasCalibratedTrainingMatrix ? 'secondary' : 'outline'}
                className={`text-xs ${hasCalibratedTrainingMatrix ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' : 'text-muted-foreground'}`}
                data-testid={`badge-training-matrix-status-${node.id}`}
              >
                <GraduationCap className="w-3 h-3 mr-1" />
                {hasCalibratedTrainingMatrix
                  ? `${trainingMatrixCategoryCount} ${trainingMatrixCategoryCount === 1 ? 'category' : 'categories'} set`
                  : 'Not calibrated'}
              </Badge>
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
                    href={`/team?memberId=${encodeURIComponent(u.id)}`}
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

type SkillDragData = {
  type: 'available-category' | 'selected-category' | 'section' | 'section-drop' | 'available-pane';
  categoryId?: number;
  sectionKey?: string;
  label?: string;
};

const roleMatrixCollisionDetection: CollisionDetection = (args) => {
  const activeType = args.active.data.current?.type as SkillDragData['type'] | undefined;

  if (activeType === 'section') {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) => String(container.id).startsWith('section-order:')),
    });
  }

  const categoryContainers = args.droppableContainers.filter((container) => {
    const id = String(container.id);
    return id === 'available-pane' || id.startsWith('selected:') || id.startsWith('section-drop:');
  });

  const pointerHits = pointerWithin({
    ...args,
    droppableContainers: categoryContainers,
  });

  if (pointerHits.length > 0) {
    return pointerHits;
  }

  return closestCorners({
    ...args,
    droppableContainers: categoryContainers,
  });
};

function normalizeRoleMatrixLayout(layout: JobRoleMatrixLayout): JobRoleMatrixLayout {
  const sections = (layout.sections || []).map((section, index) => ({
    sectionKey: section.sectionKey,
    label: section.label,
    sortOrder: index,
  }));
  const fallbackSection = sections[0]?.sectionKey || 'core';
  const validSectionKeys = new Set(sections.map((section) => section.sectionKey));
  const assignmentsBySection = new Map<string, number[]>();

  sections.forEach((section) => {
    assignmentsBySection.set(section.sectionKey, []);
  });

  (layout.assignments || []).forEach((assignment) => {
    const sectionKey = validSectionKeys.has(assignment.sectionKey) ? assignment.sectionKey : fallbackSection;
    const sectionAssignments = assignmentsBySection.get(sectionKey) || [];
    if (!sectionAssignments.includes(assignment.categoryId)) {
      sectionAssignments.push(assignment.categoryId);
      assignmentsBySection.set(sectionKey, sectionAssignments);
    }
  });

  const assignments: JobRoleMatrixAssignment[] = [];
  sections.forEach((section) => {
    (assignmentsBySection.get(section.sectionKey) || []).forEach((categoryId, index) => {
      assignments.push({ categoryId, sectionKey: section.sectionKey, sortOrder: index });
    });
  });

  return { sections, assignments };
}

function DraggableAvailableCategory({
  category,
  onAdd,
}: {
  category: any;
  onAdd: (categoryId: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `available:${category.id}`,
    data: { type: 'available-category', categoryId: category.id, label: category.name } satisfies SkillDragData,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow ${isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'}`}
      data-testid={`role-category-card-${category.id}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-0.5 cursor-grab rounded-md border border-transparent p-1 text-slate-400 hover:border-slate-200 hover:bg-slate-50 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          data-testid={`drag-role-category-${category.id}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{category.name}</span>
            <Badge variant="secondary" className="border border-slate-200 bg-slate-50 text-[11px] text-slate-600">
              {(category.items || []).length} skills
            </Badge>
          </div>
          {(category.items || []).length > 0 && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {(category.items || []).slice(0, 3).map((item: any) => item.name).join(', ')}
              {(category.items || []).length > 3 && ` +${(category.items || []).length - 3} more`}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" className="border-slate-200 bg-white hover:bg-slate-50" onClick={() => onAdd(category.id)}>
          Add
        </Button>
      </div>
    </div>
  );
}

function SortableSelectedCategory({
  category,
  sectionKey,
  onRemove,
}: {
  category: any;
  sectionKey: string;
  onRemove: (categoryId: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `selected:${category.id}`,
    data: { type: 'selected-category', categoryId: category.id, sectionKey, label: category.name } satisfies SkillDragData,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow ${isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'}`}
      data-testid={`selected-role-category-${category.id}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-0.5 cursor-grab rounded-md border border-transparent p-1 text-slate-400 hover:border-slate-200 hover:bg-slate-50 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          data-testid={`drag-selected-role-category-${category.id}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{category.name}</span>
            <Badge variant="secondary" className="border border-slate-200 bg-slate-50 text-[11px] text-slate-600">
              {(category.items || []).length} skills
            </Badge>
          </div>
          {(category.items || []).length > 0 && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {(category.items || []).slice(0, 3).map((item: any) => item.name).join(', ')}
              {(category.items || []).length > 3 && ` +${(category.items || []).length - 3} more`}
            </p>
          )}
        </div>
        <Button size="icon" variant="ghost" className="text-slate-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => onRemove(category.id)} data-testid={`remove-role-category-${category.id}`}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SortableRoleMatrixSection({
  section,
  categories,
  onRemoveCategory,
}: {
  section: JobRoleMatrixSection;
  categories: any[];
  onRemoveCategory: (categoryId: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `section-order:${section.sectionKey}`,
    data: { type: 'section', sectionKey: section.sectionKey, label: section.label } satisfies SkillDragData,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `section-drop:${section.sectionKey}`,
    data: { type: 'section-drop', sectionKey: section.sectionKey, label: section.label } satisfies SkillDragData,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm transition-shadow ${isDragging ? 'opacity-60 shadow-lg' : 'hover:shadow-md'}`}
      data-testid={`role-matrix-section-${section.sectionKey}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab rounded-md border border-transparent p-1 text-slate-400 hover:border-slate-200 hover:bg-white active:cursor-grabbing"
            {...attributes}
            {...listeners}
            data-testid={`drag-role-matrix-section-${section.sectionKey}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-900">{section.label}</p>
            <p className="text-xs text-slate-500">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'}</p>
          </div>
        </div>
        <Badge variant="secondary" className="border border-slate-200 bg-white text-slate-600">Section</Badge>
      </div>

      <div ref={setDropRef} className={`min-h-28 rounded-xl border border-dashed p-2 transition-colors ${isOver ? 'border-sky-500 bg-sky-50 shadow-inner' : 'border-slate-300 bg-white/80'}`}>
        <SortableContext items={categories.map((category) => `selected:${category.id}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 text-sm text-slate-500">
                Drop categories into this section
              </div>
            ) : (
              categories.map((category) => (
                <SortableSelectedCategory
                  key={category.id}
                  category={category}
                  sectionKey={section.sectionKey}
                  onRemove={onRemoveCategory}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
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
  const { data: savedLayout, isLoading: assignedLoading } = useJobRoleCategories(role.id);
  const setCategories = useSetJobRoleCategories();
  const [layout, setLayout] = useState<JobRoleMatrixLayout>({ sections: [], assignments: [] });
  const [initializedRoleId, setInitializedRoleId] = useState<number | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(['Engineering', 'Accounts', 'Universal']));
  const [activeDrag, setActiveDrag] = useState<SkillDragData | null>(null);

  const dragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (!assignedLoading && savedLayout && initializedRoleId !== role.id) {
      setLayout(normalizeRoleMatrixLayout(savedLayout));
      setInitializedRoleId(role.id);
    }
  }, [assignedLoading, initializedRoleId, role.id, savedLayout]);

  const categoryMap = useMemo(() => {
    return new Map(allCategories.map((category: any) => [category.id, category]));
  }, [allCategories]);

  const selectedCategoryIds = useMemo(() => {
    return new Set(layout.assignments.map((assignment) => assignment.categoryId));
  }, [layout.assignments]);

  const availableCategories = useMemo(() => {
    return allCategories.filter((category: any) => !selectedCategoryIds.has(category.id));
  }, [allCategories, selectedCategoryIds]);

  const groupedAvailableCategories = useMemo(() => {
    const groups = new Map<string, any[]>();
    availableCategories.forEach((category: any) => {
      const key = category.departmentType || 'Universal';
      const group = groups.get(key) || [];
      group.push(category);
      groups.set(key, group);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => {
        if (a === 'Universal') return -1;
        if (b === 'Universal') return 1;
        return a.localeCompare(b);
      })
      .map(([label, categories]) => ({
        label,
        categories: [...categories].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name)),
      }));
  }, [availableCategories]);

  const assignmentsBySection = useMemo(() => {
    const grouped = new Map<string, JobRoleMatrixAssignment[]>();
    layout.sections.forEach((section) => grouped.set(section.sectionKey, []));
    layout.assignments.forEach((assignment) => {
      const group = grouped.get(assignment.sectionKey) || [];
      group.push(assignment);
      grouped.set(assignment.sectionKey, group);
    });
    grouped.forEach((assignments) => assignments.sort((a, b) => a.sortOrder - b.sortOrder || a.categoryId - b.categoryId));
    return grouped;
  }, [layout.assignments, layout.sections]);

  const normalizeLayout = useCallback((nextLayout: JobRoleMatrixLayout) => {
    return normalizeRoleMatrixLayout(nextLayout);
  }, []);

  const buildAssignments = useCallback((sectionIds: Record<string, number[]>) => {
    const nextAssignments: JobRoleMatrixAssignment[] = [];
    layout.sections.forEach((section) => {
      (sectionIds[section.sectionKey] || []).forEach((categoryId, index) => {
        nextAssignments.push({ categoryId, sectionKey: section.sectionKey, sortOrder: index });
      });
    });
    return nextAssignments;
  }, [layout.sections]);

  const moveCategory = useCallback((categoryId: number, targetSectionKey: string, targetIndex?: number) => {
    const sectionIds: Record<string, number[]> = {};
    layout.sections.forEach((section) => {
      sectionIds[section.sectionKey] = (assignmentsBySection.get(section.sectionKey) || [])
        .map((assignment) => assignment.categoryId)
        .filter((id) => id !== categoryId);
    });

    const targetList = sectionIds[targetSectionKey] || [];
    const insertIndex = Math.max(0, Math.min(targetIndex ?? targetList.length, targetList.length));
    targetList.splice(insertIndex, 0, categoryId);
    sectionIds[targetSectionKey] = targetList;

    setLayout((current) => normalizeLayout({
      sections: current.sections,
      assignments: buildAssignments(sectionIds),
    }));
  }, [assignmentsBySection, buildAssignments, layout.sections, normalizeLayout]);

  const removeCategory = useCallback((categoryId: number) => {
    const sectionIds: Record<string, number[]> = {};
    layout.sections.forEach((section) => {
      sectionIds[section.sectionKey] = (assignmentsBySection.get(section.sectionKey) || [])
        .map((assignment) => assignment.categoryId)
        .filter((id) => id !== categoryId);
    });

    setLayout((current) => normalizeLayout({
      sections: current.sections,
      assignments: buildAssignments(sectionIds),
    }));
  }, [assignmentsBySection, buildAssignments, layout.sections, normalizeLayout]);

  const addCategory = useCallback((categoryId: number) => {
    const fallbackSection = layout.sections[0]?.sectionKey;
    if (!fallbackSection) return;
    moveCategory(categoryId, fallbackSection);
  }, [layout.sections, moveCategory]);

  const reorderSections = useCallback((activeSectionKey: string, overSectionKey: string) => {
    const oldIndex = layout.sections.findIndex((section) => section.sectionKey === activeSectionKey);
    const newIndex = layout.sections.findIndex((section) => section.sectionKey === overSectionKey);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    setLayout((current) => normalizeLayout({
      sections: arrayMove(current.sections, oldIndex, newIndex),
      assignments: current.assignments,
    }));
  }, [layout.sections, normalizeLayout]);

  const handleSave = async () => {
    try {
      await setCategories.mutateAsync({ id: role.id, layout: normalizeLayout(layout) });
      toast({ title: 'Saved', description: `Training matrix skills updated for ${role.title}.` });
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' });
    }
  };

  const isLoading = catsLoading || assignedLoading;

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const activeData = event.active.data.current as SkillDragData | undefined;
    const overData = event.over?.data.current as SkillDragData | undefined;
    const overId = String(event.over?.id || '');
    if (!activeData || !event.over) return;

    if (activeData.type === 'section') {
      if (overData?.type === 'section' && activeData.sectionKey && overData.sectionKey) {
        reorderSections(activeData.sectionKey, overData.sectionKey);
      }
      return;
    }

    if ((activeData.type !== 'available-category' && activeData.type !== 'selected-category') || !activeData.categoryId) {
      return;
    }

    if (overId === 'available-pane' || overData?.type === 'available-pane') {
      removeCategory(activeData.categoryId);
      return;
    }

    let targetSectionKey = overData?.sectionKey;
    let targetIndex: number | undefined;

    if (overData?.type === 'selected-category' && overData.categoryId && overData.sectionKey) {
      targetSectionKey = overData.sectionKey;
      targetIndex = (assignmentsBySection.get(overData.sectionKey) || []).findIndex((assignment) => assignment.categoryId === overData.categoryId);
      if (targetIndex < 0) targetIndex = undefined;
    }

    if (!targetSectionKey && overId.startsWith('section-drop:')) {
      targetSectionKey = overId.replace('section-drop:', '');
    }

    if (!targetSectionKey && overId.startsWith('section-order:')) {
      targetSectionKey = overId.replace('section-order:', '');
    }

    if (!targetSectionKey) return;
    moveCategory(activeData.categoryId, targetSectionKey, targetIndex);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl" data-testid="dialog-role-skills">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Training Matrix Skills — {role.title}
          </DialogTitle>
          <DialogDescription className="max-w-4xl leading-6 text-slate-600">
            Drag categories into sections to build this role&apos;s training matrix. Drop them exactly where you want them to land, drag them back to the left to remove them, or use the remove button for quick cleanup.
            If none are selected, colleagues with this role will still use the department default matrix.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : allCategories.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No skill categories have been created yet. Create them in the Templates page first.</p>
          </div>
        ) : (
          <DndContext
            sensors={dragSensors}
            collisionDetection={roleMatrixCollisionDetection}
            onDragStart={(event: DragStartEvent) => setActiveDrag((event.active.data.current as SkillDragData | undefined) || null)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveDrag(null)}
          >
            <div className="grid gap-4 lg:grid-cols-[1.05fr_1.35fr]">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Available Categories</p>
                      <p className="text-xs text-slate-500">Drag into a section or click Add for a quick placement.</p>
                    </div>
                    <Badge variant="secondary" className="border border-slate-200 bg-white text-slate-600">{availableCategories.length} available</Badge>
                  </div>
                </div>
                <AvailableCategoriesPane
                  groupedCategories={groupedAvailableCategories}
                  collapsedGroups={collapsedGroups}
                  onToggleGroup={toggleGroup}
                  onAddCategory={addCategory}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Role Matrix Layout</p>
                      <p className="text-xs text-slate-500">Reorder sections, then place categories exactly where they should appear for this role.</p>
                    </div>
                    <Badge variant="secondary" className="border border-slate-200 bg-white text-slate-600">{layout.assignments.length} selected</Badge>
                  </div>
                </div>
                <ScrollArea className="h-[520px] px-4 py-4">
                  <SortableContext items={layout.sections.map((section) => `section-order:${section.sectionKey}`)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 pr-2">
                      {layout.sections.map((section) => (
                        <SortableRoleMatrixSection
                          key={section.sectionKey}
                          section={section}
                          categories={(assignmentsBySection.get(section.sectionKey) || []).map((assignment) => categoryMap.get(assignment.categoryId)).filter(Boolean)}
                          onRemoveCategory={removeCategory}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </ScrollArea>
              </div>
            </div>

            <DragOverlay>
              {activeDrag?.label ? (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xl ring-1 ring-slate-200/80">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <GripVertical className="h-4 w-4 text-slate-400" />
                    <span>{activeDrag.label}</span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {layout.assignments.length === 0 ? 'No custom categories selected. Department default matrix will be used.' : `${layout.assignments.length} categor${layout.assignments.length === 1 ? 'y' : 'ies'} arranged across ${layout.sections.length} sections`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => savedLayout && setLayout(normalizeLayout(savedLayout))}
                disabled={setCategories.isPending || !savedLayout}
              >
                Reset
              </Button>
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

function AvailableCategoriesPane({
  groupedCategories,
  collapsedGroups,
  onToggleGroup,
  onAddCategory,
}: {
  groupedCategories: Array<{ label: string; categories: any[] }>;
  collapsedGroups: Set<string>;
  onToggleGroup: (label: string) => void;
  onAddCategory: (categoryId: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'available-pane',
    data: { type: 'available-pane', label: 'Available Categories' } satisfies SkillDragData,
  });

  return (
    <ScrollArea className="h-[520px] px-4 py-4">
      <div ref={setNodeRef} className={`space-y-4 rounded-2xl border border-dashed p-3 transition-colors ${isOver ? 'border-sky-500 bg-sky-50' : 'border-transparent'}`}>
        {groupedCategories.length === 0 ? (
          <div className="flex min-h-28 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
            All categories are already assigned to this role.
          </div>
        ) : (
          groupedCategories.map(({ label, categories }) => {
            const isCollapsed = collapsedGroups.has(label);
            return (
              <div key={label} className="space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-colors hover:bg-slate-50"
                  onClick={() => onToggleGroup(label)}
                  data-testid={`button-toggle-role-category-group-${label}`}
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="text-sm font-semibold text-slate-900">{label}</span>
                    <Badge variant="secondary" className="border border-slate-200 bg-slate-50 text-[11px] text-slate-600">{categories.length}</Badge>
                  </div>
                  <span className="text-xs text-slate-500">Available</span>
                </button>
                {!isCollapsed && (
                  <SortableContext items={categories.map((category) => `available:${category.id}`)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <DraggableAvailableCategory
                          key={category.id}
                          category={category}
                          onAdd={onAddCategory}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
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
