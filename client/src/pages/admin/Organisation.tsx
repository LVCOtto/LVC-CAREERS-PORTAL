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
} from 'lucide-react';
import { useUsers } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';

function OrgChartNode({ user, allUsers, level = 0 }: { user: any; allUsers: any[]; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2);
  const directReports = allUsers.filter((u: any) => u.managerId === user.id);
  const hasReports = directReports.length > 0;

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer ${level === 0 ? 'border-primary' : ''}`}
        onClick={() => hasReports && setExpanded(!expanded)}
        data-testid={`org-node-${user.id}`}
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
          <p className="font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.jobRole}</p>
        </div>

        <Badge variant="secondary" className="text-xs">
          {user.department}
        </Badge>

        {hasReports && (
          <Badge variant="outline" className="text-xs">
            {directReports.length} reports
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

export default function Organisation() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('chart');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading } = useUsers();

  if (!currentUser) return null;

  const rootUsers = users.filter((u: any) => !u.managerId);

  const filteredUsers = searchQuery
    ? users.filter((u: any) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.jobRole.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const departments = Array.from(new Set(users.map((u: any) => u.department).filter(Boolean)));

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Organisation</h1>
            <p className="text-muted-foreground mt-1">
              View the organisation structure and team members
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
                    {filteredUsers.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-sm text-muted-foreground">{u.jobRole}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{u.department}</Badge>
                      </div>
                    ))}
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
                      Click on any node with reports to expand/collapse
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rootUsers.map((user: any) => (
                        <OrgChartNode key={user.id} user={user} allUsers={users} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="departments">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept: any) => {
                    const deptMembers = users.filter((u: any) => u.department === dept);
                    const deptRoles = Array.from(new Set(deptMembers.map((u: any) => u.jobRole).filter(Boolean)));
                    return (
                      <Card key={dept} className="hover:shadow-md transition-shadow" data-testid={`dept-card-${dept}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{dept}</CardTitle>
                              <CardDescription>{deptMembers.length} members</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Job Roles ({deptRoles.length})</p>
                              <div className="flex flex-wrap gap-1">
                                {deptRoles.slice(0, 4).map((role: any) => (
                                  <Badge key={role} variant="outline" className="text-xs">
                                    {role}
                                  </Badge>
                                ))}
                                {deptRoles.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{deptRoles.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Team Members</p>
                              <div className="flex -space-x-2">
                                {deptMembers.slice(0, 5).map((member: any) => (
                                  <div
                                    key={member.id}
                                    className="h-8 w-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
                                    title={member.name}
                                  >
                                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                                  </div>
                                ))}
                                {deptMembers.length > 5 && (
                                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                                    +{deptMembers.length - 5}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
