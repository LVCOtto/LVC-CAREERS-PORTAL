import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ClipboardCheck,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  FileCheck,
  ClipboardList,
  Search,
  Check,
  X,
  Download,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useInductionTemplates,
  useCompetencies,
  useStandardsSurveys,
  useCreateInductionTemplate,
  useUpdateInductionTemplate,
  useDeleteInductionTemplate,
  useCreateStandardsSurveyItem,
  useUpdateStandardsSurveyItem,
  useDeleteStandardsSurveyItem,
  useCreateCompetencyCategory,
  useUpdateCompetencyCategory,
  useDeleteCompetencyCategory,
  useCreateCompetencyItem,
  useUpdateCompetencyItem,
  useDeleteCompetencyItem,
  useCreateStandardsSurveyRole,
  useDeleteStandardsSurveyRole,
} from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';
import { CsvImportDialog } from '@/components/CsvImportDialog';
import { api } from '@/lib/api';

export default function AdminTemplates() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const { data: inductionItems = [], isLoading: loadingInduction } = useInductionTemplates();
  const { data: competencies = [], isLoading: loadingCompetencies } = useCompetencies();
  const { data: standardsSurveys = [], isLoading: loadingStandards } = useStandardsSurveys();

  const createInductionItem = useCreateInductionTemplate();
  const updateInductionItem = useUpdateInductionTemplate();
  const deleteInductionItem = useDeleteInductionTemplate();
  const createSurveyItem = useCreateStandardsSurveyItem();
  const updateSurveyItem = useUpdateStandardsSurveyItem();
  const deleteSurveyItem = useDeleteStandardsSurveyItem();

  const createCategory = useCreateCompetencyCategory();
  const updateCategory = useUpdateCompetencyCategory();
  const deleteCategory = useDeleteCompetencyCategory();
  const createSkillItem = useCreateCompetencyItem();
  const updateSkillItem = useUpdateCompetencyItem();
  const deleteSkillItem = useDeleteCompetencyItem();

  const createSurveyRole = useCreateStandardsSurveyRole();
  const deleteSurveyRole = useDeleteStandardsSurveyRole();

  const [surveySearch, setSurveySearch] = useState('');
  const [editingSurvey, setEditingSurvey] = useState<any | null>(null);

  const [inductionDialog, setInductionDialog] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    item?: any;
    section?: string;
  }>({ open: false, mode: 'add' });
  const [inductionForm, setInductionForm] = useState({
    section: '',
    title: '',
    description: '',
    requiresEvidence: false,
    slug: '',
    sortOrder: 0,
  });

  const [editingSurveyItem, setEditingSurveyItem] = useState<any | null>(null);
  const [surveyItemText, setSurveyItemText] = useState('');
  const [addingSurveyItem, setAddingSurveyItem] = useState(false);
  const [newSurveyItemText, setNewSurveyItemText] = useState('');

  const [importInductionOpen, setImportInductionOpen] = useState(false);
  const [importCompetenciesOpen, setImportCompetenciesOpen] = useState(false);
  const [importStandardsOpen, setImportStandardsOpen] = useState(false);

  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    category?: any;
  }>({ open: false, mode: 'add' });
  const [categoryForm, setCategoryForm] = useState({ name: '', departmentType: 'all', sortOrder: 0 });

  const [skillItemDialog, setSkillItemDialog] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    item?: any;
    categoryId?: number;
  }>({ open: false, mode: 'add' });
  const [skillItemForm, setSkillItemForm] = useState({ name: '', description: '', sortOrder: 0 });

  const [surveyRoleDialog, setSurveyRoleDialog] = useState(false);
  const [surveyRoleForm, setSurveyRoleForm] = useState({ roleTitle: '', roleSlug: '' });

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const inductionSections: string[] = Array.from(
    new Set(inductionItems.map((item: any) => item.section))
  );

  const openAddInductionItem = (section: string) => {
    const sectionItems = inductionItems.filter((i: any) => i.section === section);
    const maxSort = sectionItems.length > 0 ? Math.max(...sectionItems.map((i: any) => i.sortOrder || 0)) : 0;
    setInductionForm({
      section,
      title: '',
      description: '',
      requiresEvidence: false,
      slug: '',
      sortOrder: maxSort + 1,
    });
    setInductionDialog({ open: true, mode: 'add', section });
  };

  const openEditInductionItem = (item: any) => {
    setInductionForm({
      section: item.section || '',
      title: item.title || '',
      description: item.description || '',
      requiresEvidence: item.requiresEvidence || false,
      slug: item.slug || '',
      sortOrder: item.sortOrder || 0,
    });
    setInductionDialog({ open: true, mode: 'edit', item });
  };

  const handleSaveInductionItem = async () => {
    if (!inductionForm.title.trim()) {
      toast({ title: 'Missing title', description: 'Please enter a title for the item.', variant: 'destructive' });
      return;
    }
    try {
      if (inductionDialog.mode === 'edit' && inductionDialog.item) {
        await updateInductionItem.mutateAsync({
          id: inductionDialog.item.id,
          data: {
            section: inductionForm.section,
            title: inductionForm.title,
            description: inductionForm.description,
            requiresEvidence: inductionForm.requiresEvidence,
          },
        });
        toast({ title: 'Updated', description: 'Induction item updated successfully.' });
      } else {
        await createInductionItem.mutateAsync({
          section: inductionForm.section,
          title: inductionForm.title,
          description: inductionForm.description,
          requiresEvidence: inductionForm.requiresEvidence,
          slug: inductionForm.slug || `ind-${Date.now()}`,
          sortOrder: inductionForm.sortOrder,
        });
        toast({ title: 'Created', description: 'Induction item created successfully.' });
      }
      setInductionDialog({ open: false, mode: 'add' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save item.', variant: 'destructive' });
    }
  };

  const handleDeleteInductionItem = async (item: any) => {
    if (!confirm(`Delete "${item.title}"? This action cannot be undone.`)) return;
    try {
      await deleteInductionItem.mutateAsync(item.id);
      toast({ title: 'Deleted', description: `"${item.title}" has been deleted.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete item.', variant: 'destructive' });
    }
  };

  const handleEditSurveyItem = (item: any) => {
    setEditingSurveyItem(item);
    setSurveyItemText(item.text);
  };

  const handleSaveSurveyItem = async () => {
    if (!editingSurveyItem) return;
    try {
      await updateSurveyItem.mutateAsync({
        id: editingSurveyItem.id,
        data: { text: surveyItemText },
      });
      toast({ title: 'Updated', description: 'Survey item updated.' });
      setEditingSurveyItem(null);
      if (editingSurvey) {
        setEditingSurvey({
          ...editingSurvey,
          items: (editingSurvey.items || []).map((i: any) =>
            i.id === editingSurveyItem.id ? { ...i, text: surveyItemText } : i
          ),
        });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update item.', variant: 'destructive' });
    }
  };

  const handleDeleteSurveyItem = async (item: any) => {
    if (!confirm(`Delete this survey item? This action cannot be undone.`)) return;
    try {
      await deleteSurveyItem.mutateAsync(item.id);
      toast({ title: 'Deleted', description: 'Survey item deleted.' });
      if (editingSurvey) {
        setEditingSurvey({
          ...editingSurvey,
          items: (editingSurvey.items || []).filter((i: any) => i.id !== item.id),
        });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete item.', variant: 'destructive' });
    }
  };

  const handleAddSurveyItem = async () => {
    if (!editingSurvey || !newSurveyItemText.trim()) return;
    try {
      await createSurveyItem.mutateAsync({
        surveyRoleId: editingSurvey.id,
        text: newSurveyItemText.trim(),
        isFeedback: false,
        sortOrder: (editingSurvey.items || []).length + 1,
      });
      toast({ title: 'Added', description: 'Survey item added.' });
      setNewSurveyItemText('');
      setAddingSurveyItem(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to add item.', variant: 'destructive' });
    }
  };

  const openAddCategory = () => {
    setCategoryForm({ name: '', departmentType: 'all', sortOrder: competencies.length });
    setCategoryDialog({ open: true, mode: 'add' });
  };

  const openEditCategory = (cat: any) => {
    setCategoryForm({ name: cat.name, departmentType: cat.departmentType || 'all', sortOrder: cat.sortOrder || 0 });
    setCategoryDialog({ open: true, mode: 'edit', category: cat });
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast({ title: 'Missing name', description: 'Please enter a category name.', variant: 'destructive' });
      return;
    }
    try {
      if (categoryDialog.mode === 'edit' && categoryDialog.category) {
        await updateCategory.mutateAsync({
          id: categoryDialog.category.id,
          data: { name: categoryForm.name, departmentType: categoryForm.departmentType, sortOrder: categoryForm.sortOrder },
        });
        toast({ title: 'Updated', description: 'Skill category updated.' });
      } else {
        const slug = categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        await createCategory.mutateAsync({
          slug: `${slug}-${Date.now().toString(36)}`,
          name: categoryForm.name,
          departmentType: categoryForm.departmentType,
          sortOrder: categoryForm.sortOrder,
        });
        toast({ title: 'Created', description: 'Skill category created.' });
      }
      setCategoryDialog({ open: false, mode: 'add' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save category.', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (!confirm(`Delete "${cat.name}" and all its items? This cannot be undone.`)) return;
    try {
      await deleteCategory.mutateAsync(cat.id);
      toast({ title: 'Deleted', description: `"${cat.name}" has been deleted.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete category.', variant: 'destructive' });
    }
  };

  const openAddSkillItem = (categoryId: number) => {
    const cat = competencies.find((c: any) => c.id === categoryId);
    const maxSort = cat?.items?.length || 0;
    setSkillItemForm({ name: '', description: '', sortOrder: maxSort + 1 });
    setSkillItemDialog({ open: true, mode: 'add', categoryId });
  };

  const openEditSkillItem = (item: any) => {
    setSkillItemForm({ name: item.name, description: item.description || '', sortOrder: item.sortOrder || 0 });
    setSkillItemDialog({ open: true, mode: 'edit', item });
  };

  const handleSaveSkillItem = async () => {
    if (!skillItemForm.name.trim()) {
      toast({ title: 'Missing name', description: 'Please enter a skill name.', variant: 'destructive' });
      return;
    }
    try {
      if (skillItemDialog.mode === 'edit' && skillItemDialog.item) {
        await updateSkillItem.mutateAsync({
          id: skillItemDialog.item.id,
          data: { name: skillItemForm.name, description: skillItemForm.description, sortOrder: skillItemForm.sortOrder },
        });
        toast({ title: 'Updated', description: 'Skill item updated.' });
      } else {
        const slug = skillItemForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        await createSkillItem.mutateAsync({
          categoryId: skillItemDialog.categoryId,
          slug: `${slug}-${Date.now().toString(36)}`,
          name: skillItemForm.name,
          description: skillItemForm.description,
          sortOrder: skillItemForm.sortOrder,
        });
        toast({ title: 'Created', description: 'Skill item added.' });
      }
      setSkillItemDialog({ open: false, mode: 'add' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save item.', variant: 'destructive' });
    }
  };

  const handleDeleteSkillItem = async (item: any) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteSkillItem.mutateAsync(item.id);
      toast({ title: 'Deleted', description: `"${item.name}" has been deleted.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete item.', variant: 'destructive' });
    }
  };

  const handleCreateSurveyRole = async () => {
    if (!surveyRoleForm.roleTitle.trim()) {
      toast({ title: 'Missing title', description: 'Please enter a role title.', variant: 'destructive' });
      return;
    }
    const slug = surveyRoleForm.roleSlug.trim() || surveyRoleForm.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      await createSurveyRole.mutateAsync({ roleTitle: surveyRoleForm.roleTitle.trim(), roleSlug: slug });
      toast({ title: 'Created', description: 'Survey template created. You can now add items to it.' });
      setSurveyRoleDialog(false);
      setSurveyRoleForm({ roleTitle: '', roleSlug: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create survey.', variant: 'destructive' });
    }
  };

  const handleDeleteSurveyRole = async (survey: any) => {
    if (!confirm(`Delete the "${survey.roleTitle}" survey and all its items? This cannot be undone.`)) return;
    try {
      await deleteSurveyRole.mutateAsync(survey.id);
      toast({ title: 'Deleted', description: `"${survey.roleTitle}" survey deleted.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete survey.', variant: 'destructive' });
    }
  };

  const filteredSurveys = standardsSurveys.filter((s: any) =>
    s.roleTitle.toLowerCase().includes(surveySearch.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage induction checklists, training matrix, and standards survey templates
          </p>
        </div>

        <Tabs defaultValue="induction">
          <TabsList className="mb-6">
            <TabsTrigger value="induction" className="gap-2" data-testid="tab-induction-templates">
              <ClipboardCheck className="w-4 h-4" />
              Induction Checklists
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2" data-testid="tab-training-templates">
              <GraduationCap className="w-4 h-4" />
              Training Matrix
            </TabsTrigger>
            <TabsTrigger value="standards" className="gap-2" data-testid="tab-standards-templates">
              <ClipboardList className="w-4 h-4" />
              Standards Survey
            </TabsTrigger>
          </TabsList>

          <TabsContent value="induction">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Induction Checklist Items</h2>
                  <p className="text-sm text-muted-foreground">
                    Define induction checklist items grouped by section
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => api.exportCsv('induction-templates')} data-testid="button-export-induction">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setImportInductionOpen(true)} data-testid="button-import-induction">
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                  <Button
                    onClick={() => openAddInductionItem('')}
                    data-testid="button-add-induction-template"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Item
                  </Button>
                </div>
              </div>

              {loadingInduction ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : inductionSections.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium">No induction items yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Click "New Item" to create your first checklist item.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ClipboardCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Standard Induction Checklist</CardTitle>
                        <CardDescription>
                          {inductionItems.length} items across {inductionSections.length} sections
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {inductionSections.map((section) => (
                        <AccordionItem key={section} value={section}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{section}</span>
                              <Badge variant="secondary">
                                {inductionItems.filter((i: any) => i.section === section).length} items
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              {inductionItems
                                .filter((i: any) => i.section === section)
                                .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
                                .map((item: any) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                  >
                                    <div>
                                      <p className="font-medium text-sm">{item.title}</p>
                                      {item.description && (
                                        <p className="text-xs text-muted-foreground">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {item.requiresEvidence && (
                                        <Badge variant="outline" className="text-xs">
                                          <FileCheck className="w-3 h-3 mr-1" />
                                          Evidence
                                        </Badge>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openEditInductionItem(item)}
                                        data-testid={`button-edit-induction-item-${item.id}`}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteInductionItem(item)}
                                        data-testid={`button-delete-induction-item-${item.id}`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => openAddInductionItem(section)}
                                data-testid={`button-add-item-section-${section}`}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Item
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="training">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Training Matrix Skills</h2>
                  <p className="text-sm text-muted-foreground">
                    Define skill categories and items for the training matrix
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => api.exportCsv('competencies')} data-testid="button-export-competencies">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setImportCompetenciesOpen(true)} data-testid="button-import-competencies">
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                  <Button onClick={openAddCategory} data-testid="button-add-skill-category">
                    <Plus className="w-4 h-4 mr-2" />
                    New Category
                  </Button>
                </div>
              </div>

              {loadingCompetencies ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : competencies.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium">No skill categories yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Click "New Category" to create your first skill category, or import from CSV.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {competencies.map((category: any) => (
                    <Card key={category.id} className="border-border/50" data-testid={`skill-category-${category.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                              <CardDescription>
                                {category.departmentType === 'all' ? 'All departments' : category.departmentType} · {(category.items || []).length} skills
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCategory(category)} data-testid={`button-edit-category-${category.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(category)} data-testid={`button-delete-category-${category.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {(category.items || []).map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                              <div>
                                <span className="text-sm font-medium">{item.name}</span>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSkillItem(item)} data-testid={`button-edit-skill-${item.id}`}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteSkillItem(item)} data-testid={`button-delete-skill-${item.id}`}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => openAddSkillItem(category.id)}
                            data-testid={`button-add-skill-item-${category.id}`}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Skill
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="standards">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Standards Survey Templates</h2>
                  <p className="text-sm text-muted-foreground">
                    Create and manage standards surveys for each job role
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => api.exportCsv('standards-surveys')} data-testid="button-export-standards">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setImportStandardsOpen(true)} data-testid="button-import-standards">
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                  <Button onClick={() => setSurveyRoleDialog(true)} data-testid="button-add-survey-role">
                    <Plus className="w-4 h-4 mr-2" />
                    New Survey
                  </Button>
                  <div className="relative">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={surveySearch}
                      onChange={(e) => setSurveySearch(e.target.value)}
                      placeholder="Search job roles..."
                      className="pl-9 w-[260px]"
                      data-testid="input-search-standards-templates"
                    />
                  </div>
                </div>
              </div>

              {loadingStandards ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : (
                <div className="grid gap-4">
                  {filteredSurveys.map((survey: any) => {
                    const taskCount = (survey.items || []).length;
                    return (
                      <Card key={survey.id} className="border-border/50">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{survey.roleTitle}</CardTitle>
                                <CardDescription>Standards Survey</CardDescription>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30" data-testid={`badge-standards-configured-${survey.id}`}>
                                Configured
                              </Badge>
                              <Badge variant="secondary" data-testid={`badge-standards-count-${survey.id}`}>
                                {taskCount} items
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingSurvey(survey)}
                                data-testid={`button-edit-standards-${survey.id}`}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteSurveyRole(survey)}
                                data-testid={`button-delete-standards-${survey.id}`}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="rounded-lg border bg-muted/20 p-4">
                            {taskCount === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-2">No items yet. Click Edit to add items.</p>
                            ) : (
                              <div className="space-y-2">
                                {(survey.items || []).slice(0, 4).map((item: any) => (
                                  <div key={item.id} className="p-2 rounded-md bg-background border text-sm" data-testid={`row-standards-item-${survey.id}-${item.id}`}>
                                    {item.text}
                                  </div>
                                ))}
                                {taskCount > 4 && (
                                  <div className="p-2 rounded-md text-sm text-muted-foreground">
                                    +{taskCount - 4} more items...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {filteredSurveys.length === 0 && (
                    <Card className="border-border/50">
                      <CardContent className="py-12 text-center">
                        <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium">{surveySearch ? 'No job roles match that search' : 'No survey templates yet'}</p>
                        <p className="text-sm text-muted-foreground mt-1">{surveySearch ? 'Try a different keyword.' : 'Click "New Survey" to create your first survey template.'}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <Dialog open={!!editingSurvey} onOpenChange={(open) => {
                if (!open) {
                  setEditingSurvey(null);
                  setEditingSurveyItem(null);
                  setAddingSurveyItem(false);
                }
              }}>
                <DialogContent className="max-w-2xl" data-testid="dialog-edit-standards-template">
                  <DialogHeader>
                    <DialogTitle className="font-display">Edit Standards Survey - {editingSurvey?.roleTitle}</DialogTitle>
                    <DialogDescription>
                      Edit, add, or remove items for this survey template.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="rounded-lg border bg-background">
                      <div className="p-4 border-b flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Items ({(editingSurvey?.items || []).length})</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddingSurveyItem(true)}
                          data-testid="button-add-survey-item"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      <div className="p-4 space-y-2 max-h-[400px] overflow-auto">
                        {addingSurveyItem && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <Input
                              value={newSurveyItemText}
                              onChange={(e) => setNewSurveyItemText(e.target.value)}
                              placeholder="Enter new survey item text..."
                              className="flex-1"
                              data-testid="input-new-survey-item"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddSurveyItem()}
                            />
                            <Button size="icon" className="h-8 w-8" onClick={handleAddSurveyItem} disabled={createSurveyItem.isPending} data-testid="button-save-new-survey-item">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setAddingSurveyItem(false); setNewSurveyItemText(''); }}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {(editingSurvey?.items || []).map((item: any) => (
                          <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/20" data-testid={`row-edit-standards-item-${item.id}`}>
                            {editingSurveyItem?.id === item.id ? (
                              <div className="flex-1 flex items-center gap-2">
                                <Input
                                  value={surveyItemText}
                                  onChange={(e) => setSurveyItemText(e.target.value)}
                                  className="flex-1"
                                  data-testid={`input-edit-survey-item-${item.id}`}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSurveyItem()}
                                />
                                <Button size="icon" className="h-8 w-8" onClick={handleSaveSurveyItem} disabled={updateSurveyItem.isPending}>
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingSurveyItem(null)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="text-sm flex-1">{item.text}</div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditSurveyItem(item)} data-testid={`button-edit-standards-item-${item.id}`}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteSurveyItem(item)} data-testid={`button-delete-standards-item-${item.id}`}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingSurvey(null)} data-testid="button-close-standards-editor">
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={inductionDialog.open} onOpenChange={(open) => !open && setInductionDialog({ open: false, mode: 'add' })}>
          <DialogContent data-testid="dialog-induction-item">
            <DialogHeader>
              <DialogTitle>
                {inductionDialog.mode === 'edit' ? 'Edit Induction Item' : 'Add Induction Item'}
              </DialogTitle>
              <DialogDescription>
                {inductionDialog.mode === 'edit'
                  ? 'Update the details for this checklist item.'
                  : 'Create a new checklist item for the induction template.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="ind-section">Section</Label>
                <Input
                  id="ind-section"
                  value={inductionForm.section}
                  onChange={(e) => setInductionForm({ ...inductionForm, section: e.target.value })}
                  placeholder="e.g. 1. Pre-Start Setup"
                  data-testid="input-induction-section"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ind-title">Title</Label>
                <Input
                  id="ind-title"
                  value={inductionForm.title}
                  onChange={(e) => setInductionForm({ ...inductionForm, title: e.target.value })}
                  placeholder="e.g. Health & Safety orientation"
                  data-testid="input-induction-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ind-desc">Description</Label>
                <Input
                  id="ind-desc"
                  value={inductionForm.description}
                  onChange={(e) => setInductionForm({ ...inductionForm, description: e.target.value })}
                  placeholder="Brief description of this checklist item"
                  data-testid="input-induction-description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ind-evidence"
                  checked={inductionForm.requiresEvidence}
                  onCheckedChange={(checked) =>
                    setInductionForm({ ...inductionForm, requiresEvidence: checked === true })
                  }
                  data-testid="checkbox-induction-evidence"
                />
                <Label htmlFor="ind-evidence" className="text-sm">
                  Requires evidence upload
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInductionDialog({ open: false, mode: 'add' })} data-testid="button-cancel-induction">
                Cancel
              </Button>
              <Button
                onClick={handleSaveInductionItem}
                disabled={createInductionItem.isPending || updateInductionItem.isPending}
                data-testid="button-save-induction"
              >
                {inductionDialog.mode === 'edit' ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={categoryDialog.open} onOpenChange={(open) => !open && setCategoryDialog({ open: false, mode: 'add' })}>
          <DialogContent data-testid="dialog-skill-category">
            <DialogHeader>
              <DialogTitle>
                {categoryDialog.mode === 'edit' ? 'Edit Skill Category' : 'New Skill Category'}
              </DialogTitle>
              <DialogDescription>
                {categoryDialog.mode === 'edit' ? 'Update this skill category.' : 'Create a new category to group related skills.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Category Name</Label>
                <Input
                  id="cat-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Equipment Knowledge"
                  data-testid="input-category-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-dept">Department Type</Label>
                <Select value={categoryForm.departmentType} onValueChange={(v) => setCategoryForm({ ...categoryForm, departmentType: v })}>
                  <SelectTrigger data-testid="select-category-dept">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="admin">Admin / Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCategoryDialog({ open: false, mode: 'add' })} data-testid="button-cancel-category">
                Cancel
              </Button>
              <Button
                onClick={handleSaveCategory}
                disabled={createCategory.isPending || updateCategory.isPending}
                data-testid="button-save-category"
              >
                {categoryDialog.mode === 'edit' ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={skillItemDialog.open} onOpenChange={(open) => !open && setSkillItemDialog({ open: false, mode: 'add' })}>
          <DialogContent data-testid="dialog-skill-item">
            <DialogHeader>
              <DialogTitle>
                {skillItemDialog.mode === 'edit' ? 'Edit Skill' : 'Add Skill'}
              </DialogTitle>
              <DialogDescription>
                {skillItemDialog.mode === 'edit' ? 'Update this skill item.' : 'Add a new skill to this category.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="skill-name">Skill Name</Label>
                <Input
                  id="skill-name"
                  value={skillItemForm.name}
                  onChange={(e) => setSkillItemForm({ ...skillItemForm, name: e.target.value })}
                  placeholder="e.g. Scrubber Dryer Operation"
                  data-testid="input-skill-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-desc">Description (optional)</Label>
                <Input
                  id="skill-desc"
                  value={skillItemForm.description}
                  onChange={(e) => setSkillItemForm({ ...skillItemForm, description: e.target.value })}
                  placeholder="Brief description of what this skill covers"
                  data-testid="input-skill-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSkillItemDialog({ open: false, mode: 'add' })} data-testid="button-cancel-skill-item">
                Cancel
              </Button>
              <Button
                onClick={handleSaveSkillItem}
                disabled={createSkillItem.isPending || updateSkillItem.isPending}
                data-testid="button-save-skill-item"
              >
                {skillItemDialog.mode === 'edit' ? 'Save Changes' : 'Add Skill'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={surveyRoleDialog} onOpenChange={setSurveyRoleDialog}>
          <DialogContent data-testid="dialog-survey-role">
            <DialogHeader>
              <DialogTitle>New Standards Survey</DialogTitle>
              <DialogDescription>
                Create a new standards survey template for a job role. You can add items after creating it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="survey-role-title">Role Title</Label>
                <Input
                  id="survey-role-title"
                  value={surveyRoleForm.roleTitle}
                  onChange={(e) => setSurveyRoleForm({ ...surveyRoleForm, roleTitle: e.target.value })}
                  placeholder="e.g. Service Engineer"
                  data-testid="input-survey-role-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="survey-role-slug">Slug (optional, auto-generated if empty)</Label>
                <Input
                  id="survey-role-slug"
                  value={surveyRoleForm.roleSlug}
                  onChange={(e) => setSurveyRoleForm({ ...surveyRoleForm, roleSlug: e.target.value })}
                  placeholder="e.g. service-engineer"
                  data-testid="input-survey-role-slug"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSurveyRoleDialog(false)} data-testid="button-cancel-survey-role">
                Cancel
              </Button>
              <Button onClick={handleCreateSurveyRole} disabled={createSurveyRole.isPending} data-testid="button-save-survey-role">
                Create Survey
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CsvImportDialog
          open={importInductionOpen}
          onOpenChange={setImportInductionOpen}
          title="Import Induction Items"
          description="Upload a CSV to bulk-create induction checklist items. Columns: section, title, description, requiresEvidence, sortOrder"
          expectedColumns={['section', 'title', 'description', 'requiresEvidence', 'sortOrder']}
          onImport={(rows) => api.importCsv('induction-templates', rows)}
          onComplete={() => window.location.reload()}
        />

        <CsvImportDialog
          open={importCompetenciesOpen}
          onOpenChange={setImportCompetenciesOpen}
          title="Import Training Matrix Skills"
          description="Upload a CSV to bulk-create skill categories and items. Categories are auto-created if they don't exist."
          expectedColumns={['category_name', 'category_department_type', 'category_sort_order', 'item_name', 'item_description', 'item_sort_order']}
          onImport={(rows) => api.importCsv('competencies', rows)}
          onComplete={() => window.location.reload()}
        />

        <CsvImportDialog
          open={importStandardsOpen}
          onOpenChange={setImportStandardsOpen}
          title="Import Standards Survey Items"
          description="Upload a CSV to bulk-create survey items. Survey roles are auto-created if they don't exist."
          expectedColumns={['roleTitle', 'roleSlug', 'itemText', 'isFeedback', 'sortOrder']}
          onImport={(rows) => api.importCsv('standards-surveys', rows)}
          onComplete={() => window.location.reload()}
        />
      </div>
    </Layout>
  );
}
