import { useState } from 'react';
import { useAuth, User } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Search, UserPlus, Edit, Trash2, Shield, Users as UsersIcon, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';

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

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('colleague');
  const [editJobRole, setEditJobRole] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editManagerId, setEditManagerId] = useState('');

  const { data: users = [], isLoading } = useUsers();
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
    setIsEditDialogOpen(true);
  };

  const handleEditUser = async () => {
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;
    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        data: {
          name: editName,
          email: editEmail,
          role: editRole,
          jobRole: editJobRole,
          department: editDepartment,
          managerId: editManagerId || null,
        },
      });
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
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    if (!newName.trim() || !newEmail.trim() || !newUsername.trim()) return;
    try {
      await createUser.mutateAsync({
        name: newName,
        email: newEmail,
        username: newUsername,
        password: newPassword || 'password',
        role: newRole,
        jobRole: newJobRole,
        department: newDepartment,
        managerId: newManagerId || null,
        startDate: new Date().toISOString().split('T')[0],
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
                  <Input id="jobRole" placeholder="Enter job role" value={newJobRole} onChange={e => setNewJobRole(e.target.value)} data-testid="input-job-role" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" placeholder="Enter department" value={newDepartment} onChange={e => setNewDepartment(e.target.value)} data-testid="input-department" />
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

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-display font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-display font-bold">
                    {users.filter((u: any) => u.role === 'admin').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Administrators</p>
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
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
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
                Update user account details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" placeholder="Enter full name" value={editName} onChange={e => setEditName(e.target.value)} data-testid="input-edit-user-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" placeholder="Enter email address" value={editEmail} onChange={e => setEditEmail(e.target.value)} data-testid="input-edit-user-email" />
              </div>
              {editingUser && (
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={editingUser.username || ''} disabled className="bg-muted" data-testid="input-edit-user-username" />
                </div>
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
                <Input id="edit-jobRole" placeholder="Enter job role" value={editJobRole} onChange={e => setEditJobRole(e.target.value)} data-testid="input-edit-job-role" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input id="edit-department" placeholder="Enter department" value={editDepartment} onChange={e => setEditDepartment(e.target.value)} data-testid="input-edit-department" />
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
      </div>
    </Layout>
  );
}
