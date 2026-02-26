import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Users,
  Briefcase,
  ChevronRight,
  ChevronDown,
  Network,
  Search,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Settings,
} from 'lucide-react';
import { useUsers, useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

const COLOR_PRESETS = [
  { value: 'bg-slate-600', label: 'Slate' },
  { value: 'bg-gray-600', label: 'Gray' },
  { value: 'bg-red-600', label: 'Red' },
  { value: 'bg-orange-600', label: 'Orange' },
  { value: 'bg-amber-600', label: 'Amber' },
  { value: 'bg-yellow-600', label: 'Yellow' },
  { value: 'bg-emerald-600', label: 'Emerald' },
  { value: 'bg-teal-600', label: 'Teal' },
  { value: 'bg-cyan-600', label: 'Cyan' },
  { value: 'bg-sky-600', label: 'Sky' },
  { value: 'bg-blue-600', label: 'Blue' },
  { value: 'bg-indigo-600', label: 'Indigo' },
  { value: 'bg-purple-600', label: 'Purple' },
  { value: 'bg-pink-600', label: 'Pink' },
  { value: 'bg-rose-600', label: 'Rose' },
];

function OrgChartNode({ user, allUsers, departments, level = 0 }: { user: any; allUsers: any[]; departments: any[]; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2);
  const directReports = allUsers.filter((u: any) => u.managerId === user.id);
  const hasReports = directReports.length > 0;

  const deptDef = departments.find((d: any) => d.name === user.department);
  const deptColor = deptDef?.color || 'bg-gray-500';

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer ${level === 0 ? 'border-primary/50 shadow-sm' : ''}`}
        onClick={() => hasReports && setExpanded(!expanded)}
        data-testid={`org-node-${user.id}`}
      >
        {hasReports && (
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
        {!hasReports && <div className="w-6" />}

        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-medium">
          {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.jobRole}</p>
        </div>

        <Badge className={`${deptColor} text-white text-xs`}>
          {user.department}
        </Badge>

        {hasReports && (
          <Badge variant="outline" className="text-xs">
            {directReports.length} {directReports.length === 1 ? 'report' : 'reports'}
          </Badge>
        )}
      </div>

      {expanded && hasReports && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-muted pl-4">
          {directReports.map((report: any) => (
            <OrgChartNode key={report.id} user={report} allUsers={allUsers} departments={departments} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface DeptTreeNode {
  id: number;
  name: string;
  color: string;
  parentId: number | null;
  sortOrder: number;
  children: DeptTreeNode[];
  members: any[];
}

function buildDeptTree(departments: any[], allUsers: any[]): DeptTreeNode[] {
  const nodes: DeptTreeNode[] = departments.map((d: any) => ({
    id: d.id,
    name: d.name,
    color: d.color || 'bg-gray-500',
    parentId: d.parentId,
    sortOrder: d.sortOrder || 0,
    children: [],
    members: allUsers.filter((u: any) => u.department === d.name),
  }));

  const unknownDeptNames = Array.from(new Set(allUsers.map((u: any) => u.department).filter(Boolean)))
    .filter(name => !departments.find((d: any) => d.name === name));
  unknownDeptNames.forEach((name, idx) => {
    nodes.push({
      id: -(idx + 1),
      name: name as string,
      color: 'bg-gray-500',
      parentId: null,
      sortOrder: 999,
      children: [],
      members: allUsers.filter((u: any) => u.department === name),
    });
  });

  const nodeMap = new Map<number, DeptTreeNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const roots: DeptTreeNode[] = [];
  nodes.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (list: DeptTreeNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    list.forEach(n => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

function getTotalMembers(node: DeptTreeNode): number {
  return node.members.length + node.children.reduce((sum, child) => sum + getTotalMembers(child), 0);
}

function DeptTreeItem({ node, level = 0, onSelect }: { node: DeptTreeNode; level?: number; onSelect: (node: DeptTreeNode) => void }) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = node.children.length > 0;
  const totalMembers = getTotalMembers(node);
  const directMembers = node.members.length;

  return (
    <div>
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer ${level === 0 ? 'border-primary/20 shadow-sm' : ''}`}
        onClick={() => onSelect(node)}
        data-testid={`dept-tree-${node.id}`}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        <div className={`h-10 w-10 rounded-lg ${node.color} flex items-center justify-center flex-shrink-0`}>
          <Building2 className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium">{node.name}</p>
          <p className="text-xs text-muted-foreground">
            {directMembers} direct member{directMembers !== 1 ? 's' : ''}
            {hasChildren && ` · ${totalMembers} total across sub-departments`}
          </p>
        </div>

        {hasChildren && (
          <Badge variant="outline" className="text-xs">
            {node.children.length} sub-dept{node.children.length !== 1 ? 's' : ''}
          </Badge>
        )}

        <Badge variant="secondary" className="text-xs">
          {totalMembers} people
        </Badge>
      </div>

      {expanded && hasChildren && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-muted pl-4">
          {node.children.map(child => (
            <DeptTreeItem key={child.id} node={child} level={level + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function DeptDetailView({ node, allUsers, onBack }: { node: DeptTreeNode; allUsers: any[]; onBack: () => void }) {
  const allDeptMembers = getAllDeptMembers(node);
  const roles = Array.from(new Set(allDeptMembers.map((u: any) => u.jobRole).filter(Boolean)));
  const managers = allDeptMembers.filter((u: any) => u.role === 'manager' || u.role === 'admin');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1" data-testid="button-back-departments">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className={`h-10 w-10 rounded-lg ${node.color} flex items-center justify-center`}>
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{node.name}</h3>
          <p className="text-sm text-muted-foreground">{allDeptMembers.length} members · {roles.length} roles</p>
        </div>
      </div>

      {node.children.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sub-departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {node.children.map(child => (
                <Badge key={child.id} className={`${child.color} text-white`}>
                  {child.name} ({getTotalMembers(child)})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Team Structure</CardTitle>
          <CardDescription>Members shown by reporting line</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(() => {
              const deptRoots = allDeptMembers.filter((u: any) => {
                if (!u.managerId) return true;
                return !allDeptMembers.find((m: any) => m.id === u.managerId);
              });

              if (deptRoots.length === 0 && allDeptMembers.length > 0) {
                return allDeptMembers.map((u: any) => (
                  <MemberRow key={u.id} user={u} allUsers={allUsers} />
                ));
              }

              return deptRoots.map((root: any) => (
                <MemberTree key={root.id} user={root} allDeptMembers={allDeptMembers} allUsers={allUsers} />
              ));
            })()}
          </div>
        </CardContent>
      </Card>

      {roles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Job Roles in this Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roles.map((role: string) => {
                const count = allDeptMembers.filter((u: any) => u.jobRole === role).length;
                return (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role} ({count})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getAllDeptMembers(node: DeptTreeNode): any[] {
  return [...node.members, ...node.children.flatMap(child => getAllDeptMembers(child))];
}

function MemberRow({ user, allUsers }: { user: any; allUsers: any[] }) {
  const manager = allUsers.find((u: any) => u.id === user.managerId);
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium flex-shrink-0">
        {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {user.jobRole}
          {manager && ` · Reports to ${manager.name}`}
        </p>
      </div>
      <Badge variant="secondary" className="text-xs capitalize">{user.role}</Badge>
    </div>
  );
}

function MemberTree({ user, allDeptMembers, allUsers, level = 0 }: { user: any; allDeptMembers: any[]; allUsers: any[]; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2);
  const reports = allDeptMembers.filter((u: any) => u.managerId === user.id);
  const hasReports = reports.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 ${hasReports ? 'cursor-pointer' : ''}`}
        onClick={() => hasReports && setExpanded(!expanded)}
      >
        {hasReports ? (
          <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        ) : (
          <div className="w-5" />
        )}
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium flex-shrink-0">
          {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.jobRole}</p>
        </div>
        {hasReports && (
          <Badge variant="outline" className="text-xs">
            {reports.length} report{reports.length !== 1 ? 's' : ''}
          </Badge>
        )}
        <Badge variant="secondary" className="text-xs capitalize">{user.role}</Badge>
      </div>
      {expanded && hasReports && (
        <div className="ml-7 mt-1 space-y-1 border-l-2 border-muted pl-3">
          {reports.map((report: any) => (
            <MemberTree key={report.id} user={report} allDeptMembers={allDeptMembers} allUsers={allUsers} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function DepartmentManagement({ departments, users }: { departments: any[]; users: any[] }) {
  const { toast } = useToast();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);

  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('bg-gray-600');
  const [formParentId, setFormParentId] = useState<string>('__none__');
  const [formSortOrder, setFormSortOrder] = useState('0');

  const resetForm = () => {
    setFormName('');
    setFormColor('bg-gray-600');
    setFormParentId('__none__');
    setFormSortOrder('0');
  };

  const openEdit = (dept: any) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormColor(dept.color || 'bg-gray-600');
    setFormParentId(dept.parentId ? String(dept.parentId) : '__none__');
    setFormSortOrder(String(dept.sortOrder || 0));
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;
    try {
      await createDept.mutateAsync({
        name: formName.trim(),
        color: formColor,
        parentId: formParentId === '__none__' ? null : parseInt(formParentId),
        sortOrder: parseInt(formSortOrder) || 0,
      });
      toast({ title: 'Department created' });
      setIsAddOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!editingDept || !formName.trim()) return;
    try {
      await updateDept.mutateAsync({
        id: editingDept.id,
        name: formName.trim(),
        color: formColor,
        parentId: formParentId === '__none__' ? null : parseInt(formParentId),
        sortOrder: parseInt(formSortOrder) || 0,
      });
      toast({ title: 'Department updated' });
      setIsEditOpen(false);
      setEditingDept(null);
      resetForm();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (dept: any) => {
    const assignedUsers = users.filter((u: any) => u.department === dept.name);
    const childDepts = departments.filter((d: any) => d.parentId === dept.id);
    if (assignedUsers.length > 0) {
      toast({ title: 'Cannot delete', description: `${assignedUsers.length} user(s) are assigned to this department. Reassign them first.`, variant: 'destructive' });
      return;
    }
    if (childDepts.length > 0) {
      toast({ title: 'Cannot delete', description: `This department has ${childDepts.length} sub-department(s). Remove or reassign them first.`, variant: 'destructive' });
      return;
    }
    if (!confirm(`Delete "${dept.name}"? This cannot be undone.`)) return;
    try {
      await deleteDept.mutateAsync(dept.id);
      toast({ title: 'Department deleted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return null;
    const parent = departments.find((d: any) => d.id === parentId);
    return parent?.name || null;
  };

  const getAvailableParents = (excludeId?: number) => {
    return departments.filter((d: any) => d.id !== excludeId);
  };

  const sortedDepts = [...departments].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name));

  const formFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Department Name</Label>
        <Input
          value={formName}
          onChange={e => setFormName(e.target.value)}
          placeholder="e.g. Engineering"
          data-testid="input-dept-name"
        />
      </div>
      <div className="space-y-2">
        <Label>Colour</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map(c => (
            <button
              key={c.value}
              type="button"
              className={`h-8 w-8 rounded-lg ${c.value} transition-all ${formColor === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'}`}
              onClick={() => setFormColor(c.value)}
              title={c.label}
              data-testid={`color-${c.value}`}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Parent Department</Label>
        <Select value={formParentId} onValueChange={setFormParentId}>
          <SelectTrigger data-testid="select-dept-parent">
            <SelectValue placeholder="None (top level)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None (top level)</SelectItem>
            {getAvailableParents(editingDept?.id).map((d: any) => (
              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input
          type="number"
          value={formSortOrder}
          onChange={e => setFormSortOrder(e.target.value)}
          placeholder="0"
          data-testid="input-dept-sort"
        />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Manage Departments
            </CardTitle>
            <CardDescription>
              Add, edit, rename, and delete departments. Changes apply across the system.
            </CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="gap-2" data-testid="button-add-department">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedDepts.map((dept: any) => {
            const assignedCount = users.filter((u: any) => u.department === dept.name).length;
            const parentName = getParentName(dept.parentId);
            return (
              <div key={dept.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50" data-testid={`dept-manage-${dept.id}`}>
                <div className={`h-10 w-10 rounded-lg ${dept.color || 'bg-gray-500'} flex items-center justify-center flex-shrink-0`}>
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {parentName ? `Under ${parentName}` : 'Top level'}
                    {' · '}{assignedCount} user{assignedCount !== 1 ? 's' : ''}
                    {dept.sortOrder > 0 && ` · Order: ${dept.sortOrder}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(dept)} data-testid={`button-edit-dept-${dept.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(dept)} data-testid={`button-delete-dept-${dept.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {sortedDepts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No departments yet. Add your first department to get started.</p>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>Create a new department in the organisation.</DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formName.trim() || createDept.isPending} data-testid="button-save-dept">
              {createDept.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department details.</DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!formName.trim() || updateDept.isPending} data-testid="button-update-dept">
              {updateDept.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function Organisation() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('chart');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<DeptTreeNode | null>(null);

  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();

  if (!currentUser) return null;

  const isLoading = usersLoading || deptsLoading;
  const rootUsers = users.filter((u: any) => !u.managerId);

  const filteredUsers = searchQuery
    ? users.filter((u: any) =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.jobRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const deptTree = buildDeptTree(departments, users);
  const uniqueDepts = Array.from(new Set(users.map((u: any) => u.department).filter(Boolean)));

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Organisation</h1>
            <p className="text-muted-foreground mt-1">
              View the organisation structure, reporting lines, and departments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search people or departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-72"
                data-testid="search-org"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            {searchQuery && filteredUsers.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredUsers.map((u: any) => {
                      const deptDef = departments.find((d: any) => d.name === u.department);
                      const deptColor = deptDef?.color || 'bg-gray-500';
                      const manager = users.find((m: any) => m.id === u.managerId);
                      return (
                        <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {u.jobRole}
                                {manager && ` · Reports to ${manager.name}`}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${deptColor} text-white`}>{u.department}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{users.length}</p>
                      <p className="text-sm text-muted-foreground">Total Employees</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{departments.length}</p>
                      <p className="text-sm text-muted-foreground">Departments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {Array.from(new Set(users.map((u: any) => u.jobRole).filter(Boolean))).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Job Roles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Network className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {users.filter((u: any) => u.role === 'manager').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Managers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedDept(null); }}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="chart" className="gap-2" data-testid="tab-chart">
                    <Network className="h-4 w-4" />
                    Org Chart
                  </TabsTrigger>
                  <TabsTrigger value="departments" className="gap-2" data-testid="tab-departments">
                    <Building2 className="h-4 w-4" />
                    Departments
                  </TabsTrigger>
                  {(currentUser.role === 'admin') && (
                    <TabsTrigger value="manage" className="gap-2" data-testid="tab-manage-departments">
                      <Settings className="h-4 w-4" />
                      Manage Departments
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <TabsContent value="chart">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5 text-primary" />
                      Organisation Chart
                    </CardTitle>
                    <CardDescription>
                      Reporting lines based on line manager assignments. Click to expand/collapse.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rootUsers.length > 0 ? (
                        rootUsers.map((user: any) => (
                          <OrgChartNode key={user.id} user={user} allUsers={users} departments={departments} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Network className="h-10 w-10 mx-auto mb-3 opacity-50" />
                          <p>No users found. Add users and assign line managers to build the org chart.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="departments">
                {selectedDept ? (
                  <Card>
                    <CardContent className="pt-6">
                      <DeptDetailView node={selectedDept} allUsers={users} onBack={() => setSelectedDept(null)} />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Department Hierarchy
                      </CardTitle>
                      <CardDescription>
                        Departments and sub-departments. Click any department to see its team structure.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {deptTree.length > 0 ? (
                          deptTree.map(node => (
                            <DeptTreeItem key={node.id} node={node} onSelect={setSelectedDept} />
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p>No departments found. Add departments in the Manage tab.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {(currentUser.role === 'admin') && (
                <TabsContent value="manage">
                  <DepartmentManagement departments={departments} users={users} />
                </TabsContent>
              )}
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
