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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  departments as initialDepartments,
  jobRoles as initialJobRoles,
  orgMembers,
  getDepartmentById,
  getJobRoleById,
  getMembersByDepartment,
  getRolesForDepartment,
  getDirectReports,
  Department,
  JobRole,
  OrgMember,
} from '@/lib/departmentData';
import {
  Building2,
  Users,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  User,
  Network,
  Settings,
  Search,
  LayoutGrid,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function OrgChartNode({ member, level = 0 }: { member: OrgMember; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2);
  const role = getJobRoleById(member.jobRoleId);
  const dept = getDepartmentById(member.departmentId);
  const directReports = getDirectReports(member.id);
  const hasReports = directReports.length > 0;

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer ${level === 0 ? 'border-primary' : ''}`}
        onClick={() => hasReports && setExpanded(!expanded)}
        data-testid={`org-node-${member.id}`}
      >
        {hasReports && (
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
        {!hasReports && <div className="w-6" />}
        
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{member.name}</p>
          <p className="text-xs text-muted-foreground truncate">{role?.title}</p>
        </div>
        
        <Badge variant="secondary" className={`${dept?.color} text-white text-xs`}>
          {dept?.name}
        </Badge>
        
        {hasReports && (
          <Badge variant="outline" className="text-xs">
            {directReports.length} reports
          </Badge>
        )}
      </div>
      
      {expanded && hasReports && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-muted pl-4">
          {directReports.map(report => (
            <OrgChartNode key={report.id} member={report} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function DepartmentCard({
  department,
  members,
  roles,
  onEdit,
}: {
  department: Department;
  members: OrgMember[];
  roles: JobRole[];
  onEdit: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`dept-card-${department.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${department.color} flex items-center justify-center`}>
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{department.name}</CardTitle>
              <CardDescription>{members.length} members</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onEdit} data-testid={`edit-dept-${department.id}`}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Job Roles ({roles.length})</p>
            <div className="flex flex-wrap gap-1">
              {roles.slice(0, 4).map(role => (
                <Badge key={role.id} variant="outline" className="text-xs">
                  {role.title}
                </Badge>
              ))}
              {roles.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{roles.length - 4} more
                </Badge>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Team Members</p>
            <div className="flex -space-x-2">
              {members.slice(0, 5).map(member => (
                <div
                  key={member.id}
                  className="h-8 w-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
                  title={member.name}
                >
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
              ))}
              {members.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{members.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Organisation() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chart');
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [jobRoles, setJobRoles] = useState<JobRole[]>(initialJobRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDeptDialog, setShowAddDeptDialog] = useState(false);
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('bg-gray-600');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleDept, setNewRoleDept] = useState('');
  const [newRoleLevel, setNewRoleLevel] = useState<JobRole['level']>('mid');

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const rootMembers = orgMembers.filter(m => !m.managerId);

  const filteredMembers = searchQuery
    ? orgMembers.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getJobRoleById(m.jobRoleId)?.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return;
    
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      color: newDeptColor,
    };
    setDepartments([...departments, newDept]);
    setNewDeptName('');
    setShowAddDeptDialog(false);
    toast({
      title: 'Department Created',
      description: `${newDeptName} has been added to the organisation.`,
    });
  };

  const handleAddRole = () => {
    if (!newRoleTitle.trim() || !newRoleDept) return;
    
    const newRole: JobRole = {
      id: `role-${Date.now()}`,
      title: newRoleTitle,
      departmentId: newRoleDept,
      level: newRoleLevel,
    };
    setJobRoles([...jobRoles, newRole]);
    setNewRoleTitle('');
    setNewRoleDept('');
    setShowAddRoleDialog(false);
    toast({
      title: 'Job Role Created',
      description: `${newRoleTitle} has been added.`,
    });
  };

  const colorOptions = [
    { value: 'bg-blue-600', label: 'Blue' },
    { value: 'bg-emerald-600', label: 'Green' },
    { value: 'bg-purple-600', label: 'Purple' },
    { value: 'bg-amber-600', label: 'Amber' },
    { value: 'bg-pink-600', label: 'Pink' },
    { value: 'bg-cyan-600', label: 'Cyan' },
    { value: 'bg-orange-600', label: 'Orange' },
    { value: 'bg-red-600', label: 'Red' },
    { value: 'bg-indigo-600', label: 'Indigo' },
    { value: 'bg-slate-600', label: 'Slate' },
  ];

  const levelOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'manager', label: 'Manager' },
    { value: 'director', label: 'Director' },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Organisation</h1>
            <p className="text-muted-foreground mt-1">
              Manage departments, roles, and view the organisation structure
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
                data-testid="search-org"
              />
            </div>
          </div>
        </div>

        {searchQuery && filteredMembers.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredMembers.map(member => {
                  const role = getJobRoleById(member.jobRoleId);
                  const dept = getDepartmentById(member.departmentId);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{role?.title}</p>
                        </div>
                      </div>
                      <Badge className={`${dept?.color} text-white`}>{dept?.name}</Badge>
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
                  <p className="text-2xl font-bold">{orgMembers.length}</p>
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
                  <p className="text-2xl font-bold">{jobRoles.length}</p>
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
                  <p className="text-2xl font-bold">{departments.filter(d => d.parentId).length}</p>
                  <p className="text-sm text-muted-foreground">Sub-departments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
              <TabsTrigger value="roles" className="gap-2" data-testid="tab-roles">
                <Briefcase className="h-4 w-4" />
                Job Roles
              </TabsTrigger>
            </TabsList>

            {isAdmin && activeTab === 'departments' && (
              <Dialog open={showAddDeptDialog} onOpenChange={setShowAddDeptDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="button-add-dept">
                    <Plus className="h-4 w-4" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Department</DialogTitle>
                    <DialogDescription>
                      Create a new department in the organisation structure.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dept-name">Department Name</Label>
                      <Input
                        id="dept-name"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        placeholder="e.g. Marketing"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Department Colour</Label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map(color => (
                          <button
                            key={color.value}
                            onClick={() => setNewDeptColor(color.value)}
                            className={`h-8 w-8 rounded-lg ${color.value} ${newDeptColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Parent Department (Optional)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No parent</SelectItem>
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDeptDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddDepartment} data-testid="button-confirm-add-dept">
                      Create Department
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {isAdmin && activeTab === 'roles' && (
              <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="button-add-role">
                    <Plus className="h-4 w-4" />
                    Add Job Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Job Role</DialogTitle>
                    <DialogDescription>
                      Create a new job role and assign it to a department.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="role-title">Job Title</Label>
                      <Input
                        id="role-title"
                        value={newRoleTitle}
                        onChange={(e) => setNewRoleTitle(e.target.value)}
                        placeholder="e.g. Marketing Executive"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Department</Label>
                      <Select value={newRoleDept} onValueChange={setNewRoleDept}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Level</Label>
                      <Select value={newRoleLevel} onValueChange={(v) => setNewRoleLevel(v as JobRole['level'])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {levelOptions.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddRoleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddRole} data-testid="button-confirm-add-role">
                      Create Role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  Organisation Chart
                </CardTitle>
                <CardDescription>
                  Click on any node with reports to expand/collapse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rootMembers.map(member => (
                    <OrgChartNode key={member.id} member={member} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map(dept => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  members={getMembersByDepartment(dept.id)}
                  roles={getRolesForDepartment(dept.id)}
                  onEdit={() => {}}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Job Roles by Department</CardTitle>
                <CardDescription>
                  All job roles organised by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {departments.map(dept => {
                    const deptRoles = getRolesForDepartment(dept.id);
                    if (deptRoles.length === 0) return null;
                    
                    return (
                      <div key={dept.id}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`h-3 w-3 rounded-full ${dept.color}`} />
                          <h3 className="font-semibold">{dept.name}</h3>
                          <Badge variant="secondary">{deptRoles.length} roles</Badge>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {deptRoles.map(role => {
                            const roleMembers = orgMembers.filter(m => m.jobRoleId === role.id);
                            return (
                              <div
                                key={role.id}
                                className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                data-testid={`role-card-${role.id}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{role.title}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{role.level} level</p>
                                  </div>
                                  <Badge variant="outline">{roleMembers.length} in role</Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
