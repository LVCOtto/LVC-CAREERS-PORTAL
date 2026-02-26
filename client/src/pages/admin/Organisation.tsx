import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  Briefcase,
  ChevronRight,
  ChevronDown,
  User,
  Network,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { useUsers } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';
import { departments as deptConfig } from '@/lib/departmentData';

function OrgChartNode({ user, allUsers, level = 0 }: { user: any; allUsers: any[]; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2);
  const directReports = allUsers.filter((u: any) => u.managerId === user.id);
  const hasReports = directReports.length > 0;

  const deptDef = deptConfig.find(d => d.name === user.department);
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
            <OrgChartNode key={report.id} user={report} allUsers={allUsers} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface DeptTreeNode {
  id: string;
  name: string;
  color: string;
  parentId?: string;
  children: DeptTreeNode[];
  members: any[];
}

function buildDeptTree(allUsers: any[]): DeptTreeNode[] {
  const uniqueDeptNames = Array.from(new Set(allUsers.map((u: any) => u.department).filter(Boolean)));

  const nodes: DeptTreeNode[] = deptConfig.map(dc => ({
    id: dc.id,
    name: dc.name,
    color: dc.color,
    parentId: dc.parentId,
    children: [],
    members: allUsers.filter((u: any) => u.department === dc.name),
  }));

  const unknownDepts = uniqueDeptNames.filter(name => !deptConfig.find(dc => dc.name === name));
  unknownDepts.forEach(name => {
    nodes.push({
      id: `dept-custom-${name}`,
      name,
      color: 'bg-gray-500',
      children: [],
      members: allUsers.filter((u: any) => u.department === name),
    });
  });

  const nodeMap = new Map<string, DeptTreeNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const roots: DeptTreeNode[] = [];
  nodes.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

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

  if (totalMembers === 0 && !hasChildren) return null;

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

export default function Organisation() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('chart');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<DeptTreeNode | null>(null);

  const { data: users = [], isLoading } = useUsers();

  if (!currentUser) return null;

  const rootUsers = users.filter((u: any) => !u.managerId);

  const filteredUsers = searchQuery
    ? users.filter((u: any) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const deptTree = buildDeptTree(users);
  const departments = Array.from(new Set(users.map((u: any) => u.department).filter(Boolean)));

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
                      const deptDef = deptConfig.find(d => d.name === u.department);
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
                          <OrgChartNode key={user.id} user={user} allUsers={users} />
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
                            <p>No departments found. Add users with department assignments.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
