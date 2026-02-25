import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useUserCertificates, useCertificateDefinitions, useCareerMilestones, useCreateCareerMilestone, useUpdateCareerMilestone, useDeleteCareerMilestone, useUsers } from '@/lib/hooks';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Trophy,
  ShieldCheck,
  Wrench,
  HeartHandshake,
  Layers,
  Stethoscope,
  Droplets,
  Users,
  Zap,
  BadgeCheck,
  Medal,
  Lock,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  'shield-check': ShieldCheck,
  'wrench': Wrench,
  'heart-handshake': HeartHandshake,
  'layers': Layers,
  'stethoscope': Stethoscope,
  'droplets': Droplets,
  'users': Users,
  'award': Award,
  'zap': Zap,
  'badge-check': BadgeCheck,
  'medal': Medal,
  'star': Star
};

function CertificateBadge({ 
  definition, 
  userCert, 
  locked = false 
}: { 
  definition: any; 
  userCert?: any; 
  locked?: boolean 
}) {
  const IconComp = iconMap[definition.icon] || Award;
  const levelColors: Record<string, string> = {
    'bronze': 'from-amber-700 to-amber-500',
    'silver': 'from-gray-400 to-gray-300',
    'gold': 'from-yellow-500 to-amber-300',
    'platinum': 'from-cyan-500 to-blue-300',
  };
  const bgGradient = levelColors[definition.level] || 'from-primary to-primary/80';

  return (
    <div
      className={cn(
        "relative group flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-300",
        locked
          ? "bg-muted/30 border-muted opacity-60 grayscale"
          : "bg-card border-border shadow-sm hover:shadow-md hover:scale-[1.02]"
      )}
      data-testid={`cert-badge-${definition.id}`}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-3",
          locked
            ? "bg-muted text-muted-foreground"
            : `bg-gradient-to-br ${bgGradient} text-white shadow-lg`
        )}
      >
        {locked ? <Lock className="w-6 h-6" /> : <IconComp className="w-7 h-7" />}
      </div>

      <h4 className={cn("font-semibold text-sm leading-tight", locked && "text-muted-foreground")}>
        {definition.name}
      </h4>

      <Badge
        variant="secondary"
        className={cn(
          "mt-2 text-[10px] uppercase tracking-wider",
          !locked && definition.level === 'gold' && "bg-yellow-100 text-yellow-700",
          !locked && definition.level === 'silver' && "bg-gray-100 text-gray-600",
          !locked && definition.level === 'platinum' && "bg-cyan-100 text-cyan-700",
          !locked && definition.level === 'bronze' && "bg-amber-100 text-amber-700"
        )}
      >
        {locked ? 'Locked' : definition.level}
      </Badge>

      {userCert && (
        <p className="text-[10px] text-muted-foreground mt-2">
          Earned {new Date(userCert.issueDate).toLocaleDateString('en-GB')}
        </p>
      )}
    </div>
  );
}

export default function Milestones() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('certificates');

  const isAdmin = currentUser?.role === 'admin';

  const { data: definitions = [], isLoading: defsLoading } = useCertificateDefinitions();
  const { data: userCertsData = [], isLoading: certsLoading } = useUserCertificates(currentUser?.id);
  const { data: milestones = [], isLoading: milestonesLoading } = useCareerMilestones(currentUser?.id ?? '');
  const { data: allUsers = [] } = useUsers();

  const createMilestone = useCreateCareerMilestone();
  const updateMilestone = useUpdateCareerMilestone();
  const deleteMilestone = useDeleteCareerMilestone();

  const [selectedUserId, setSelectedUserId] = useState('');
  const { data: selectedUserMilestones = [] } = useCareerMilestones(isAdmin && selectedUserId ? selectedUserId : '');

  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isEditMilestoneOpen, setIsEditMilestoneOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');

  if (!currentUser) return null;

  const isLoading = defsLoading || certsLoading || milestonesLoading;

  const categories = Array.from(new Set(definitions.map((d: any) => d.category)));
  
  const getMilestoneIcon = (title: string) => {
    if (title.toLowerCase().includes('joined')) return <Briefcase className="w-5 h-5" />;
    if (title.toLowerCase().includes('promotion')) return <Trophy className="w-5 h-5" />;
    if (title.toLowerCase().includes('induction')) return <GraduationCap className="w-5 h-5" />;
    if (title.toLowerCase().includes('award')) return <Award className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
  };

  const openAddMilestone = () => {
    setMilestoneTitle('');
    setMilestoneDate(new Date().toISOString().split('T')[0]);
    setMilestoneDescription('');
    setIsAddMilestoneOpen(true);
  };

  const openEditMilestone = (milestone: any) => {
    setEditingMilestone(milestone);
    setMilestoneTitle(milestone.title);
    setMilestoneDate(milestone.date);
    setMilestoneDescription(milestone.description);
    setIsEditMilestoneOpen(true);
  };

  const handleAddMilestone = async () => {
    if (!milestoneTitle.trim() || !milestoneDate || !milestoneDescription.trim()) return;
    const targetUserId = isAdmin && selectedUserId ? selectedUserId : currentUser.id;
    try {
      await createMilestone.mutateAsync({
        userId: targetUserId,
        title: milestoneTitle,
        date: milestoneDate,
        description: milestoneDescription,
      });
      toast({ title: 'Milestone added', description: 'Career milestone has been saved.' });
      setIsAddMilestoneOpen(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleEditMilestone = async () => {
    if (!editingMilestone || !milestoneTitle.trim() || !milestoneDate || !milestoneDescription.trim()) return;
    try {
      await updateMilestone.mutateAsync({
        id: editingMilestone.id,
        data: {
          title: milestoneTitle,
          date: milestoneDate,
          description: milestoneDescription,
        },
      });
      toast({ title: 'Milestone updated', description: 'Career milestone has been saved.' });
      setIsEditMilestoneOpen(false);
      setEditingMilestone(null);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteMilestone = async (id: number) => {
    try {
      await deleteMilestone.mutateAsync(id);
      toast({ title: 'Milestone deleted', description: 'Career milestone has been removed.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const displayMilestones = isAdmin && selectedUserId ? selectedUserMilestones : milestones;
  const displayUser = isAdmin && selectedUserId ? allUsers.find((u: any) => u.id === selectedUserId) : currentUser;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Achievements & Milestones</h1>
          <p className="text-muted-foreground mt-1">
            Track your professional growth, collected badges, and career highlights
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="certificates" className="gap-2" data-testid="tab-certificates">
              <BadgeCheck className="h-4 w-4" />
              Certificates & Badges
            </TabsTrigger>
            <TabsTrigger value="milestones" className="gap-2" data-testid="tab-milestones">
              <Trophy className="h-4 w-4" />
              Career Milestones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="certificates">
            <div className="grid gap-8">
              {categories.map(category => {
                const categoryDefs = definitions.filter((d: any) => d.category === category);
                if (categoryDefs.length === 0) return null;

                return (
                  <div key={category as string} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-display font-bold text-foreground">{category as string}</h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {categoryDefs.map((def: any) => {
                        const userCert = userCertsData.find((uc: any) => uc.definitionId === def.id);
                        return (
                          <CertificateBadge 
                            key={def.id} 
                            definition={def} 
                            userCert={userCert} 
                            locked={!userCert} 
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-12 p-6 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-4">
               <div className="p-3 bg-primary/10 rounded-full">
                 <Zap className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h3 className="font-bold text-lg">Level Up Your Career</h3>
                 <p className="text-muted-foreground mt-1">
                   Collect more badges by completing training modules and external certifications. 
                   Talk to your manager about your development plan to unlock new tiers.
                 </p>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="milestones">
            {isAdmin && (
              <div className="mb-4 flex items-center gap-3">
                <Label className="shrink-0">View milestones for:</Label>
                <Select value={selectedUserId || "__self__"} onValueChange={v => setSelectedUserId(v === "__self__" ? "" : v)}>
                  <SelectTrigger className="w-64" data-testid="select-milestone-user">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__self__">Myself</SelectItem>
                    {allUsers
                      .filter((u: any) => u.id !== currentUser.id)
                      .map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{isAdmin && selectedUserId ? `${displayUser?.name}'s Journey` : 'Your Journey'}</CardTitle>
                      <CardDescription>
                        Started at LVC on {displayUser?.startDate ? new Date(displayUser.startDate).toLocaleDateString('en-GB') : 'Unknown'}
                      </CardDescription>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button size="sm" className="gap-2" onClick={openAddMilestone} data-testid="button-add-milestone">
                      <Plus className="h-4 w-4" />
                      Add Milestone
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {displayMilestones.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-6">
                      {displayMilestones.map((milestone: any, index: number) => (
                        <div
                          key={milestone.id}
                          className="relative pl-14 animate-slide-in-right"
                          style={{ animationDelay: `${index * 100}ms` }}
                          data-testid={`milestone-${milestone.id}`}
                        >
                          <div className="absolute left-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            {getMilestoneIcon(milestone.title)}
                          </div>
                          <Card className="border-border/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{milestone.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {milestone.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4 shrink-0">
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {new Date(milestone.date).toLocaleDateString('en-GB')}
                                  </span>
                                  {isAdmin && (
                                    <>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditMilestone(milestone)} data-testid={`button-edit-milestone-${milestone.id}`}>
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteMilestone(milestone.id)} data-testid={`button-delete-milestone-${milestone.id}`}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">No milestones yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {isAdmin
                        ? 'Add career milestones to track this colleague\'s journey at LVC.'
                        : 'Your career milestones will appear here as you progress through your journey at LVC. Complete your induction and training to earn your first milestones!'}
                    </p>
                    {isAdmin && (
                      <Button className="mt-4 gap-2" onClick={openAddMilestone} data-testid="button-add-milestone-empty">
                        <Plus className="h-4 w-4" />
                        Add First Milestone
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Career Milestone</DialogTitle>
              <DialogDescription>
                Add a new milestone to {isAdmin && selectedUserId ? `${displayUser?.name}'s` : 'your'} career journey.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="milestone-title">Title</Label>
                <Input id="milestone-title" placeholder="e.g. Joined LVC, Completed Induction, Promotion" value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)} data-testid="input-milestone-title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestone-date">Date</Label>
                <Input id="milestone-date" type="date" value={milestoneDate} onChange={e => setMilestoneDate(e.target.value)} data-testid="input-milestone-date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestone-description">Description</Label>
                <Input id="milestone-description" placeholder="Brief description of this milestone" value={milestoneDescription} onChange={e => setMilestoneDescription(e.target.value)} data-testid="input-milestone-description" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMilestoneOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMilestone} disabled={createMilestone.isPending} data-testid="button-save-milestone">Add Milestone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditMilestoneOpen} onOpenChange={setIsEditMilestoneOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Career Milestone</DialogTitle>
              <DialogDescription>
                Update the milestone details and date.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-milestone-title">Title</Label>
                <Input id="edit-milestone-title" value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)} data-testid="input-edit-milestone-title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-milestone-date">Date</Label>
                <Input id="edit-milestone-date" type="date" value={milestoneDate} onChange={e => setMilestoneDate(e.target.value)} data-testid="input-edit-milestone-date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-milestone-description">Description</Label>
                <Input id="edit-milestone-description" value={milestoneDescription} onChange={e => setMilestoneDescription(e.target.value)} data-testid="input-edit-milestone-description" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditMilestoneOpen(false)}>Cancel</Button>
              <Button onClick={handleEditMilestone} disabled={updateMilestone.isPending} data-testid="button-save-edit-milestone">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
