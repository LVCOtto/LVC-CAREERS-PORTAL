import { useState } from 'react';
import { useAuth, User } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus, Edit, Trash2, Shield, Users as UsersIcon, User as UserIcon, Download, Upload, CircleDot, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useDepartments, useJobRoles } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';
import { CsvImportDialog } from '@/components/CsvImportDialog';
import { api, invalidate } from '@/lib/api';

export default function AdminUsers() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('colleague');
  const [newJobRole, setNewJobRole] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newManagerId, setNewManagerId] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRequiresInduction, setNewRequiresInduction] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('colleague');
  const [editJobRole, setEditJobRole] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editManagerId, setEditManagerId] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editRequiresInduction, setEditRequiresInduction] = useState(true);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);

  const { data: users = [], isLoading } = useUsers();
  const { data: departmentsList } = useDepartments();
  const { data: jobRolesList = [] } = useJobRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditRole(user.role || 'colleague');
    setEditJobRole(user.jobRole || '');
    setEditDepartment(user.department || '');
    setEditManagerId(user.managerId || '');
    setEditStartDate(user.startDate || '');
    setEditRequiresInduction(user.requiresInduction !== false);
    setEditUsername(user.username || '');
    setEditPassword('');
    setIsEditDialogOpen(true);
  };

  const handleEditUser = async () => {
    if (!editingUser || !editName.trim()) return;
    try {
      const data: Record<string, string | boolean | null> = {
        name: editName,
        email: editEmail || null,
        role: editRole,
        jobRole: editJobRole,
        department: editDepartment,
        managerId: editManagerId || null,
        startDate: editStartDate,
        requiresInduction: editRequiresInduction,
      };
      if (!editingUser.activated) {
        if (editUsername.trim()) data.username = editUsername;
        if (editPassword.trim()) data.password = editPassword;
      }
      await updateUser.mutateAsync({ id: editingUser.id, data });
      toast({ title: 'User updated', description: 'User details have been saved.' });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const filteredUsers = users.filter(
    (user: any) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.jobRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-primary/15 text-primary border-primary/30">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case 'manager':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30">
            <UsersIcon className="w-3 h-3 mr-1" />
            Manager
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <UserIcon className="w-3 h-3 mr-1" />
            Colleague
          </Badge>
        );
    }
  };

  const handleAddUser = async () => {
    if (!newName.trim()) return;
    try {
      await createUser.mutateAsync({
        name: newName,
        email: newEmail || null,
        username: newUsername || null,
        password: newPassword || null,
        role: newRole,
        jobRole: newJobRole,
        department: newDepartment,
        managerId: newManagerId || null,
        startDate: newStartDate,
        requiresInduction: newRequiresInduction,
      });
      toast({ title: 'User created', description: 'New user has been added to the system.' });
      setIsAddDialogOpen(false);
      setNewName('');
      setNewEmail('');
      setNewUsername('');
      setNewPassword('');
      setNewRole('colleague');
      setNewJobRole('');
      setNewDepartment('');
      setNewManagerId('');
      setNewStartDate(new Date().toISOString().split('T')[0]);
      setNewRequiresInduction(true);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      toast({ title: 'User deleted', description: 'User has been removed.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const getUserName = (id: string) => {
    const u = users.find((u: any) => u.id === id);
    return u?.name ?? '-';
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => api.exportCsv('users')} data-testid="button-export-users">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsImportOpen(true)} data-testid="button-import-users">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-user">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account in the system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter full name" value={newName} onChange={e => setNewName(e.target.value)} data-testid="input-user-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email address" value={newEmail} onChange={e => setNewEmail(e.target.value)} data-testid="input-user-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="Enter username" value={newUsername} onChange={e => setNewUsername(e.target.value)} data-testid="input-user-username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter password" value={newPassword} onChange={e => setNewPassword(e.target.value)} data-testid="input-user-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger data-testid="select-user-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="manager">Line Manager</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobRole">Job Role</Label>
                  <Select value={newJobRole || "__none__"} onValueChange={v => {
                    const role = v === "__none__" ? "" : v;
                    setNewJobRole(role);
                    const match = jobRolesList.find((r: any) => r.title === role);
                    if (match) setNewDepartment(match.department);
                  }}>
                    <SelectTrigger data-testid="input-job-role">
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Select job role</SelectItem>
                      {jobRolesList.map((r: any) => (
                        <SelectItem key={r.id} value={r.title}>{r.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={newDepartment || "__none__"} onValueChange={v => setNewDepartment(v === "__none__" ? "" : v)}>
                    <SelectTrigger data-testid="input-department">
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
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} data-testid="input-start-date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Line Manager</Label>
                  <Select value={newManagerId || "__none__"} onValueChange={v => setNewManagerId(v === "__none__" ? "" : v)}>
                    <SelectTrigger data-testid="select-manager">
                      <SelectValue placeholder="Select manager (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {users
                        .filter((u: any) => u.role === 'manager' || u.role === 'admin')
                        .map((manager: any) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresInduction"
                    checked={newRequiresInduction}
                    onCheckedChange={(checked) => setNewRequiresInduction(checked === true)}
                    data-testid="checkbox-requires-induction"
                  />
                  <Label htmlFor="requiresInduction" className="text-sm">
                    Requires induction (uncheck for existing staff)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser} data-testid="button-save-user" disabled={createUser.isPending}>
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <div className="grid md:grid-cols-5 gap-4">
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-display font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-display font-bold text-emerald-600">
                    {users.filter((u: any) => u.activated).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-display font-bold text-muted-foreground">
                    {users.filter((u: any) => !u.activated).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-display font-bold">
                    {users.filter((u: any) => u.role === 'manager').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Managers</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-display font-bold">
                    {users.filter((u: any) => u.role === 'colleague').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Colleagues</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>View and manage all user accounts</CardDescription>
                  </div>
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-users"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => (
                      <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email || <span className="text-xs italic">Not set</span>}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell data-testid={`status-${user.id}`}>
                          {user.activated ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground gap-1">
                              <CircleDot className="w-3 h-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.jobRole}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          {user.managerId ? getUserName(user.managerId) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" data-testid={`button-edit-${user.id}`} onClick={() => openEditDialog(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              data-testid={`button-delete-${user.id}`}
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                {editingUser && !editingUser.activated
                  ? 'Fill in email, username and password to activate this account.'
                  : 'Update user account details.'}
              </DialogDescription>
            </DialogHeader>
            {editingUser && !editingUser.activated && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800" data-testid="text-activation-notice">
                <CircleDot className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-amber-800 dark:text-amber-200">Account Inactive</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Provide email, username and password below to activate this account for login.</p>
                </div>
              </div>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" placeholder="Enter full name" value={editName} onChange={e => setEditName(e.target.value)} data-testid="input-edit-user-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" placeholder="Enter email address" value={editEmail} onChange={e => setEditEmail(e.target.value)} data-testid="input-edit-user-email" />
              </div>
              {editingUser && editingUser.activated ? (
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={editingUser.username || ''} disabled className="bg-muted" data-testid="input-edit-user-username" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-username">Username</Label>
                    <Input id="edit-username" placeholder="Enter username" value={editUsername} onChange={e => setEditUsername(e.target.value)} data-testid="input-edit-user-username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-password">Password</Label>
                    <Input id="edit-password" type="password" placeholder="Enter password" value={editPassword} onChange={e => setEditPassword(e.target.value)} data-testid="input-edit-user-password" />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger data-testid="select-edit-user-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colleague">Colleague</SelectItem>
                    <SelectItem value="manager">Line Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jobRole">Job Role</Label>
                <Select value={editJobRole || "__none__"} onValueChange={v => {
                  const role = v === "__none__" ? "" : v;
                  setEditJobRole(role);
                  const match = jobRolesList.find((r: any) => r.title === role);
                  if (match) setEditDepartment(match.department);
                }}>
                  <SelectTrigger data-testid="input-edit-job-role">
                    <SelectValue placeholder="Select job role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select job role</SelectItem>
                    {jobRolesList.map((r: any) => (
                      <SelectItem key={r.id} value={r.title}>{r.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select value={editDepartment || "__none__"} onValueChange={v => setEditDepartment(v === "__none__" ? "" : v)}>
                  <SelectTrigger data-testid="input-edit-department">
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
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input id="edit-startDate" type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} data-testid="input-edit-start-date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-manager">Line Manager</Label>
                <Select value={editManagerId || "__none__"} onValueChange={v => setEditManagerId(v === "__none__" ? "" : v)}>
                  <SelectTrigger data-testid="select-edit-manager">
                    <SelectValue placeholder="Select manager (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {users
                      .filter((u: any) => (u.role === 'manager' || u.role === 'admin') && u.id !== editingUser?.id)
                      .map((manager: any) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-requiresInduction"
                  checked={editRequiresInduction}
                  onCheckedChange={(checked) => setEditRequiresInduction(checked === true)}
                  data-testid="checkbox-edit-requires-induction"
                />
                <Label htmlFor="edit-requiresInduction" className="text-sm">
                  Requires induction
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser} data-testid="button-save-edit-user" disabled={updateUser.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CsvImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          title="Import Users"
          description="Upload a CSV to bulk-create user accounts. Only 'name' is required — accounts without email/username/password will be created as inactive and can be activated later."
          expectedColumns={['name', 'role', 'jobRole', 'department', 'email', 'username', 'password', 'startDate', 'requiresInduction']}
          onImport={(rows) => api.importCsv('users', rows)}
          onComplete={() => invalidate('users')}
        />
      </div>
    </Layout>
  );
}
