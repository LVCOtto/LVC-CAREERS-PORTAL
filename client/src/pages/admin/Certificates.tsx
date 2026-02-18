import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCertificates, CertificateCategory, CertificateLevel, CertificateDefinition } from '@/lib/certificatesContext';
import { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  ShieldCheck, 
  Wrench, 
  HeartHandshake, 
  Layers, 
  Stethoscope, 
  Droplets, 
  Users, 
  Award,
  Zap,
  BadgeCheck,
  Medal,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ICONS = [
  'shield-check',
  'wrench',
  'heart-handshake',
  'layers',
  'stethoscope',
  'droplets',
  'users',
  'award',
  'zap',
  'badge-check',
  'medal',
  'star'
];

const CATEGORIES: CertificateCategory[] = ['Safety', 'Technical', 'Professional', 'Compliance', 'Leadership'];
const LEVELS: CertificateLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Standard'];

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

export default function AdminCertificates() {
  const { definitions, addDefinition, updateDefinition, deleteDefinition } = useCertificates();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDef, setEditingDef] = useState<CertificateDefinition | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CertificateCategory>('Technical');
  const [level, setLevel] = useState<CertificateLevel>('Standard');
  const [icon, setIcon] = useState('award');
  const [provider, setProvider] = useState('');
  const [validityMonths, setValidityMonths] = useState<string>('');

  const filteredDefinitions = definitions.filter(
    d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('Technical');
    setLevel('Standard');
    setIcon('award');
    setProvider('');
    setValidityMonths('');
    setEditingDef(null);
  };

  const handleOpenDialog = (def?: CertificateDefinition) => {
    if (def) {
      setEditingDef(def);
      setName(def.name);
      setDescription(def.description);
      setCategory(def.category);
      setLevel(def.level);
      setIcon(def.icon);
      setProvider(def.provider);
      setValidityMonths(def.validityMonths ? def.validityMonths.toString() : '');
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !provider) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const defData = {
      name,
      description,
      category,
      level,
      icon,
      provider,
      validityMonths: validityMonths ? parseInt(validityMonths) : undefined
    };

    if (editingDef) {
      updateDefinition(editingDef.id, defData);
      toast({ title: "Certificate updated", description: `${name} has been updated.` });
    } else {
      addDefinition(defData);
      toast({ title: "Certificate created", description: `${name} has been added.` });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteDefinition(id);
      toast({ title: "Certificate deleted", description: `${name} has been removed.` });
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Certificate Manager</h1>
            <p className="text-muted-foreground mt-1">
              Configure certificate types, levels, and badges
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Certificate Type
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDefinitions.map(def => {
            const Icon = iconMap[def.icon] || Award;
            
            let levelColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (def.level === 'Bronze') levelColor = 'bg-orange-100 text-orange-800 border-orange-200';
            if (def.level === 'Silver') levelColor = 'bg-slate-200 text-slate-800 border-slate-300';
            if (def.level === 'Gold') levelColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
            if (def.level === 'Platinum') levelColor = 'bg-cyan-100 text-cyan-800 border-cyan-200';

            return (
              <Card key={def.id} className="group relative overflow-hidden transition-all hover:shadow-md">
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-bold border-b border-l ${levelColor}`}>
                  {def.level}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-bold text-lg leading-tight mb-1">{def.name}</h3>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{def.category}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{def.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-dashed">
                    <span className="text-xs text-muted-foreground">{def.provider}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(def)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(def.id, def.name)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingDef ? 'Edit Certificate Type' : 'Create Certificate Type'}</DialogTitle>
              <DialogDescription>
                Define the properties and visual style of the certificate.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Certificate Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Advanced Leadership" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(v: CertificateCategory) => setCategory(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={level} onValueChange={(v: CertificateLevel) => setLevel(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this certificate represent?" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider/Issuer</Label>
                  <Input id="provider" value={provider} onChange={e => setProvider(e.target.value)} placeholder="e.g. LVC Training Academy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validity">Validity (Months)</Label>
                  <Input id="validity" type="number" value={validityMonths} onChange={e => setValidityMonths(e.target.value)} placeholder="Optional" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Badge Icon</Label>
                <div className="grid grid-cols-6 gap-2 p-2 border rounded-lg bg-muted/20">
                  {ICONS.map(i => {
                    const I = iconMap[i];
                    return (
                      <div 
                        key={i}
                        onClick={() => setIcon(i)}
                        className={`aspect-square flex items-center justify-center rounded-md cursor-pointer transition-all ${icon === i ? 'bg-primary text-primary-foreground shadow-sm scale-110' : 'hover:bg-muted text-muted-foreground'}`}
                      >
                        <I className="w-5 h-5" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Certificate</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
