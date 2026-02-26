import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
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
import { useResources, useCreateResource, useUpdateResource, useDeleteResource } from '@/lib/hooks';
import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  FileText,
  Globe,
  BookOpen,
  ShieldCheck,
  Lock,
  Gift,
  Calendar,
  Receipt,
  GraduationCap,
  Network,
  Headphones,
  Download,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CsvImportDialog } from '@/components/CsvImportDialog';
import { api } from '@/lib/api';

interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  url: string;
  icon: string;
}

const ICONS = [
  'book-open',
  'shield-check',
  'lock',
  'gift',
  'calendar',
  'receipt',
  'graduation-cap',
  'globe',
  'network',
  'headphones',
];

const iconMap: Record<string, React.ReactNode> = {
  'book-open': <BookOpen className="w-6 h-6" />,
  'shield-check': <ShieldCheck className="w-6 h-6" />,
  'lock': <Lock className="w-6 h-6" />,
  'gift': <Gift className="w-6 h-6" />,
  'calendar': <Calendar className="w-6 h-6" />,
  'receipt': <Receipt className="w-6 h-6" />,
  'graduation-cap': <GraduationCap className="w-6 h-6" />,
  'globe': <Globe className="w-6 h-6" />,
  'network': <Network className="w-6 h-6" />,
  'headphones': <Headphones className="w-6 h-6" />,
};

const CATEGORIES = [
  'Policies',
  'HR',
  'Learning',
  'Company',
  'Support',
  'Other'
];

export default function AdminResources() {
  const { data: resources = [], isLoading } = useResources();
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [type, setType] = useState<'link' | 'file'>('link');
  const [isImportOpen, setIsImportOpen] = useState(false);

  const filteredResources = resources.filter(
    r =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setUrl('');
    setIcon('');
    setType('link');
    setEditingResource(null);
  };

  const handleOpenDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setTitle(resource.title);
      setDescription(resource.description);
      setCategory(resource.category);
      setUrl(resource.url);
      setIcon(resource.icon);
      setType(resource.url.startsWith('http') || resource.url === '#' ? 'link' : 'file');
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !category || !url || !icon) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (editingResource) {
      await updateResource.mutateAsync({ id: editingResource.id, data: { title, description, category, url, icon } });
      toast({
        title: "Resource updated",
        description: `${title} has been updated successfully.`
      });
    } else {
      await createResource.mutateAsync({ title, description, category, url, icon });
      toast({
        title: "Resource created",
        description: `${title} has been added to resources.`
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: number, resourceTitle: string) => {
    if (confirm(`Are you sure you want to delete "${resourceTitle}"?`)) {
      await deleteResource.mutateAsync(id);
      toast({
        title: "Resource deleted",
        description: `${resourceTitle} has been removed.`
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Resource Manager</h1>
            <p className="text-muted-foreground mt-1">
              Manage company documents, links, and resources
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => api.exportCsv('resources')} data-testid="button-export-resources">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsImportOpen(true)} data-testid="button-import-resources">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button onClick={() => handleOpenDialog()} className="gap-2" data-testid="button-add-resource">
              <Plus className="w-4 h-4" />
              Add Resource
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-resources"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredResources.map(resource => (
            <Card key={resource.id} className="group hover:border-primary/50 transition-colors" data-testid={`card-resource-${resource.id}`}>
              <CardContent className="p-6 flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {iconMap[resource.icon] || <BookOpen className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg" data-testid={`text-resource-title-${resource.id}`}>{resource.title}</h3>
                    <div className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                      {resource.category}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{resource.description}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 truncate font-mono">{resource.url}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(resource)} data-testid={`button-edit-resource-${resource.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(resource.id, resource.title)} data-testid={`button-delete-resource-${resource.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredResources.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No resources found.
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingResource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
              <DialogDescription>
                Configure the resource details below.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Resource Type</Label>
                <div className="flex gap-4">
                  <div 
                    className={`flex-1 border rounded-lg p-3 cursor-pointer transition-colors flex items-center gap-2 ${type === 'link' ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50'}`}
                    onClick={() => setType('link')}
                    data-testid="button-type-link"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">External Link</span>
                  </div>
                  <div 
                    className={`flex-1 border rounded-lg p-3 cursor-pointer transition-colors flex items-center gap-2 ${type === 'file' ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50'}`}
                    onClick={() => setType('file')}
                    data-testid="button-type-file"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">File Upload</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Employee Handbook"
                  data-testid="input-resource-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-resource-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">{type === 'link' ? 'URL' : 'File Path (Server)'}</Label>
                <div className="flex gap-2">
                  <Input 
                    id="url" 
                    value={url} 
                    onChange={e => setUrl(e.target.value)} 
                    placeholder={type === 'link' ? "https://..." : "/uploads/..."}
                    data-testid="input-resource-url"
                  />
                  {type === 'file' && (
                    <Button type="button" variant="outline" onClick={() => {
                        const mockFile = `file-${Date.now()}.pdf`;
                        setUrl(`/uploads/resources/${mockFile}`);
                        toast({ title: "File uploaded", description: `${mockFile} ready.` });
                    }}>
                       Upload
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Brief description of the resource..."
                  data-testid="textarea-resource-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger data-testid="select-resource-icon">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map(i => (
                      <SelectItem key={i} value={i}>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{i.replace('-', ' ')}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel-resource">
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-resource">
                  {editingResource ? 'Save Changes' : 'Create Resource'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <CsvImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          title="Import Resources"
          description="Upload a CSV to bulk-create resources. Columns: title, description, category, url, icon"
          expectedColumns={['title', 'description', 'category', 'url', 'icon']}
          onImport={(rows) => api.importCsv('resources', rows)}
          onComplete={() => window.location.reload()}
        />
      </div>
    </Layout>
  );
}
