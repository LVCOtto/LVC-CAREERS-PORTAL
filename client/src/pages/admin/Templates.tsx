import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  Database,
  AlertTriangle,
  Loader2,
  Archive,
  ChevronUp,
  ChevronDown,
  GripVertical,
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
  useInductionSectionSettings,
  useUpsertInductionSectionSetting,
  useDepartments,
} from '@/lib/hooks';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { CsvImportDialog } from '@/components/CsvImportDialog';
import { api } from '@/lib/api';

export default function AdminTemplates() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inductionItems = [], isLoading: loadingInduction } = useInductionTemplates();
  const { data: sectionSettings = [] } = useInductionSectionSettings();
  const upsertSectionSetting = useUpsertInductionSectionSetting();
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
  const { data: departments = [] } = useDepartments();

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

  const [editingSectionName, setEditingSectionName] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');

  const [backupExporting, setBackupExporting] = useState(false);
  const [backupRestoring, setBackupRestoring] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreResult, setRestoreResult] = useState<{ success: boolean; summary: Record<string, number>; errors: string[] } | null>(null);

  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    category?: any;
  }>({ open: false, mode: 'add' });
  const [categoryForm, setCategoryForm] = useState({ name: '', departmentType: 'Universal', sortOrder: 0 });

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

  const getSectionMinSort = (section: string) => {
    const items = inductionItems.filter((i: any) => i.section === section);
    if (items.length === 0) return 0;
    return Math.min(...items.map((i: any) => i.sortOrder || 0));
  };

  const sortedInductionSections = [...inductionSections].sort(
    (a, b) => getSectionMinSort(a) - getSectionMinSort(b)
  );

  const moveSection = async (sectionIndex: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    if (swapIndex < 0 || swapIndex >= sortedInductionSections.length) return;

    const sectionA = sortedInductionSections[sectionIndex];
    const sectionB = sortedInductionSections[swapIndex];

    const itemsA = inductionItems.filter((i: any) => i.section === sectionA).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const itemsB = inductionItems.filter((i: any) => i.section === sectionB).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const minA = getSectionMinSort(sectionA);
    const minB = getSectionMinSort(sectionB);

    const updates: { id: number; sortOrder: number }[] = [];

    if (direction === 'up') {
      itemsA.forEach((item: any, idx: number) => updates.push({ id: item.id, sortOrder: minB + idx }));
      itemsB.forEach((item: any, idx: number) => updates.push({ id: item.id, sortOrder: minB + itemsA.length + idx }));
    } else {
      itemsB.forEach((item: any, idx: number) => updates.push({ id: item.id, sortOrder: minA + idx }));
      itemsA.forEach((item: any, idx: number) => updates.push({ id: item.id, sortOrder: minA + itemsB.length + idx }));
    }

    try {
      await fetch('/api/induction-templates/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      queryClient.invalidateQueries({ queryKey: ["induction-templates"] });
    } catch {
      toast({ title: 'Failed to reorder sections', variant: 'destructive' });
    }
  };

  const moveItem = async (section: string, itemIndex: number, direction: 'up' | 'down') => {
    const sectionItems = inductionItems
      .filter((i: any) => i.section === section)
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const swapIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (swapIndex < 0 || swapIndex >= sectionItems.length) return;

    const normalized = sectionItems.map((item: any, idx: number) => ({ id: item.id, sortOrder: idx }));
    const temp = normalized[itemIndex].sortOrder;
    normalized[itemIndex].sortOrder = normalized[swapIndex].sortOrder;
    normalized[swapIndex].sortOrder = temp;

    try {
      await fetch('/api/induction-templates/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: normalized }),
      });
      queryClient.invalidateQueries({ queryKey: ["induction-templates"] });
    } catch {
      toast({ title: 'Failed to reorder items', variant: 'destructive' });
    }
  };

  const moveSkillItem = async (categoryId: number, itemIndex: number, direction: 'up' | 'down') => {
    const category = competencies?.find((c: any) => c.id === categoryId);
    if (!category) return;
    const items = (category.items || []).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const swapIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;

    const normalized = items.map((item: any, idx: number) => ({ id: item.id, sortOrder: idx }));
    const temp = normalized[itemIndex].sortOrder;
    normalized[itemIndex].sortOrder = normalized[swapIndex].sortOrder;
    normalized[swapIndex].sortOrder = temp;

    try {
      await fetch('/api/competency-items/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: normalized }),
      });
      queryClient.invalidateQueries({ queryKey: ["competencies"] });
    } catch {
      toast({ title: 'Failed to reorder skills', variant: 'destructive' });
    }
  };

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

  const openAddCategory = (prefillDepartmentType?: string) => {
    setCategoryForm({ name: '', departmentType: prefillDepartmentType || 'Universal', sortOrder: competencies.length });
    setCategoryDialog({ open: true, mode: 'add' });
  };

  const openEditCategory = (cat: any) => {
    setCategoryForm({ name: cat.name, departmentType: cat.departmentType || 'Universal', sortOrder: cat.sortOrder || 0 });
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
            <TabsTrigger value="backup" className="gap-2" data-testid="tab-data-backup">
              <Database className="w-4 h-4" />
              Data Backup
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
              ) : sortedInductionSections.length === 0 ? (
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
                          {inductionItems.length} items across {sortedInductionSections.length} sections
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {sortedInductionSections.map((section, sectionIdx) => {
                        const isUniversal = sectionSettings.find((s: any) => s.sectionName === section)?.isUniversal ?? false;
                        const sectionItems = inductionItems
                          .filter((i: any) => i.section === section)
                          .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
                        return (
                        <AccordionItem key={section} value={section}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex flex-col gap-0" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  disabled={sectionIdx === 0}
                                  onClick={(e) => { e.stopPropagation(); moveSection(sectionIdx, 'up'); }}
                                  data-testid={`button-section-up-${section}`}
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  disabled={sectionIdx === sortedInductionSections.length - 1}
                                  onClick={(e) => { e.stopPropagation(); moveSection(sectionIdx, 'down'); }}
                                  data-testid={`button-section-down-${section}`}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>
                              {editingSectionName === section ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    className="h-7 text-sm w-56"
                                    autoFocus
                                    data-testid={`input-rename-section-${section}`}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newSectionName.trim() && newSectionName.trim() !== section) {
                                          fetch('/api/induction-sections/rename', {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ oldName: section, newName: newSectionName.trim() }),
                                          }).then(() => {
                                            toast({ title: 'Section renamed' });
                                            queryClient.invalidateQueries({ queryKey: ["induction-templates"] });
                                            queryClient.invalidateQueries({ queryKey: ["induction-section-settings"] });
                                          });
                                        }
                                        setEditingSectionName(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingSectionName(null);
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    data-testid={`button-save-section-name-${section}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (newSectionName.trim() && newSectionName.trim() !== section) {
                                        fetch('/api/induction-sections/rename', {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ oldName: section, newName: newSectionName.trim() }),
                                        }).then(() => {
                                          toast({ title: 'Section renamed' });
                                          queryClient.invalidateQueries({ queryKey: ["induction-templates"] });
                                          queryClient.invalidateQueries({ queryKey: ["induction-section-settings"] });
                                        });
                                      }
                                      setEditingSectionName(null);
                                    }}
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => { e.stopPropagation(); setEditingSectionName(null); }}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="font-medium">{section}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    data-testid={`button-rename-section-${section}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSectionName(section);
                                      setNewSectionName(section);
                                    }}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              <Badge variant="secondary">
                                {sectionItems.length} items
                              </Badge>
                              {isUniversal && (
                                <Badge className="bg-emerald-600 text-white text-xs">Universal</Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              {sectionItems.map((item: any, itemIdx: number) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex flex-col gap-0">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5"
                                          disabled={itemIdx === 0}
                                          onClick={() => moveItem(section, itemIdx, 'up')}
                                          data-testid={`button-item-up-${item.id}`}
                                        >
                                          <ChevronUp className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5"
                                          disabled={itemIdx === sectionItems.length - 1}
                                          onClick={() => moveItem(section, itemIdx, 'down')}
                                          data-testid={`button-item-down-${item.id}`}
                                        >
                                          <ChevronDown className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{item.title}</p>
                                        {item.description && (
                                          <p className="text-xs text-muted-foreground">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
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
                              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                <div>
                                  <p className="text-sm font-medium">Universal Section</p>
                                  <p className="text-xs text-muted-foreground">Include this section for all job roles automatically</p>
                                </div>
                                <Switch
                                  checked={isUniversal}
                                  onCheckedChange={(checked) => {
                                    upsertSectionSetting.mutate({ sectionName: section, isUniversal: !!checked });
                                  }}
                                  data-testid={`switch-universal-${section}`}
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                      })}
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
              ) : (() => {
                const grouped: Record<string, any[]> = {};
                competencies.forEach((cat: any) => {
                  const key = cat.departmentType || 'Universal';
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(cat);
                });
                const deptSortMap: Record<string, number> = {};
                departments.forEach((d: any) => {
                  deptSortMap[d.name] = d.sortOrder ?? 999;
                  deptSortMap[d.name.toLowerCase()] = d.sortOrder ?? 999;
                });
                const sortedKeys = Object.keys(grouped).sort((a, b) => {
                  if (a === 'Universal') return -1;
                  if (b === 'Universal') return 1;
                  const aSort = deptSortMap[a] ?? deptSortMap[a.toLowerCase()] ?? 999;
                  const bSort = deptSortMap[b] ?? deptSortMap[b.toLowerCase()] ?? 999;
                  if (aSort !== bSort) return aSort - bSort;
                  return a.localeCompare(b);
                });
                const getDeptLabel = (key: string) => key;
                const getDeptSkillCount = (cats: any[]) => cats.reduce((sum: number, c: any) => sum + (c.items || []).length, 0);

                return (
                  <Accordion type="multiple" defaultValue={sortedKeys} className="space-y-4">
                    {sortedKeys.map((deptKey) => {
                      const deptCategories = grouped[deptKey];
                      const totalSkills = getDeptSkillCount(deptCategories);
                      return (
                        <AccordionItem key={deptKey} value={deptKey} className="border rounded-lg px-2" data-testid={`dept-section-${deptKey}`}>
                          <div className="flex items-center gap-2">
                            <AccordionTrigger className="hover:no-underline py-4 px-2 flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-base font-semibold">{getDeptLabel(deptKey)}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {deptCategories.length} {deptCategories.length === 1 ? 'category' : 'categories'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {totalSkills} {totalSkills === 1 ? 'skill' : 'skills'}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="shrink-0"
                              onClick={(e) => { e.stopPropagation(); openAddCategory(deptKey); }}
                              data-testid={`button-add-category-header-${deptKey}`}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Category
                            </Button>
                          </div>
                          <AccordionContent className="pb-4 px-2">
                            <div className="space-y-4">
                              {deptCategories.map((category: any) => (
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
                                            {(category.items || []).length} skills
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
                                      {(category.items || []).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((item: any, itemIdx: number, sortedItems: any[]) => (
                                        <div
                                          key={item.id}
                                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className="flex flex-col">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                                disabled={itemIdx === 0}
                                                onClick={() => moveSkillItem(category.id, itemIdx, 'up')}
                                                data-testid={`button-skill-up-${item.id}`}
                                              >
                                                <ChevronUp className="w-3 h-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                                disabled={itemIdx === sortedItems.length - 1}
                                                onClick={() => moveSkillItem(category.id, itemIdx, 'down')}
                                                data-testid={`button-skill-down-${item.id}`}
                                              >
                                                <ChevronDown className="w-3 h-3" />
                                              </Button>
                                            </div>
                                            <div>
                                              <span className="text-sm font-medium">{item.name}</span>
                                              {item.description && (
                                                <p className="text-xs text-muted-foreground">{item.description}</p>
                                              )}
                                            </div>
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
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                );
              })()}
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

          <TabsContent value="backup">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Data Backup & Restore</h2>
                <p className="text-sm text-muted-foreground">
                  Export a complete system backup or restore from a previous backup file
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Export Full Backup
                    </CardTitle>
                    <CardDescription>
                      Download a ZIP file containing all system data including users,
                      training records, induction progress, skills, certificates,
                      career data, surveys, resources, departments, and portal settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
                        <p className="font-medium">Includes all data tables:</p>
                        <div className="grid grid-cols-2 gap-1 text-muted-foreground text-xs">
                          <span>Users & roles</span>
                          <span>Induction templates & progress</span>
                          <span>Skill categories & items</span>
                          <span>Training matrix submissions</span>
                          <span>Certificate definitions & records</span>
                          <span>Training records</span>
                          <span>Job roles & assignments</span>
                          <span>Career nodes & milestones</span>
                          <span>Standards surveys</span>
                          <span>Resources</span>
                          <span>Departments</span>
                          <span>Portal settings</span>
                        </div>
                      </div>
                      <Button
                        className="w-full gap-2"
                        data-testid="button-export-full-backup"
                        disabled={backupExporting}
                        onClick={async () => {
                          setBackupExporting(true);
                          try {
                            window.open('/api/export/full-backup', '_blank');
                            toast({ title: 'Backup export started', description: 'Your download should begin shortly.' });
                          } catch {
                            toast({ title: 'Export failed', variant: 'destructive' });
                          } finally {
                            setTimeout(() => setBackupExporting(false), 2000);
                          }
                        }}
                      >
                        {backupExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                        {backupExporting ? 'Preparing backup...' : 'Download Full Backup'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Restore from Backup
                    </CardTitle>
                    <CardDescription>
                      Upload a previously exported backup ZIP file to restore all system data.
                      This will replace all existing data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950/20 p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-orange-700 dark:text-orange-400">Warning: Destructive Action</p>
                            <p className="text-orange-600 dark:text-orange-500 mt-1">
                              Restoring from a backup will delete all current data and replace it with the backup contents.
                              Make sure to export a backup first if you need to preserve current data.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="backup-file" className="text-sm font-medium">Select backup file (.zip)</Label>
                        <Input
                          id="backup-file"
                          type="file"
                          accept=".zip"
                          className="mt-1"
                          data-testid="input-backup-file"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setRestoreFile(file);
                            setRestoreResult(null);
                          }}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full gap-2"
                        data-testid="button-restore-backup"
                        disabled={!restoreFile || backupRestoring}
                        onClick={() => setRestoreConfirmOpen(true)}
                      >
                        <Upload className="w-4 h-4" />
                        Restore from Backup
                      </Button>

                      {restoreResult && (
                        <div className={`rounded-lg p-4 text-sm ${restoreResult.success ? 'bg-green-50 dark:bg-green-950/20 border border-green-200' : 'bg-red-50 dark:bg-red-950/20 border border-red-200'}`}>
                          <p className="font-medium mb-2">{restoreResult.success ? 'Restore completed successfully' : 'Restore completed with errors'}</p>
                          {Object.keys(restoreResult.summary).length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Records imported:</p>
                              {Object.entries(restoreResult.summary).map(([file, count]) => (
                                <div key={file} className="flex justify-between text-xs">
                                  <span>{file.replace('.csv', '')}</span>
                                  <Badge variant="secondary" className="text-xs">{count}</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                          {restoreResult.errors.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-medium text-red-600">Errors:</p>
                              {restoreResult.errors.map((err, i) => (
                                <p key={i} className="text-xs text-red-500">{err}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={restoreConfirmOpen} onOpenChange={setRestoreConfirmOpen}>
          <DialogContent data-testid="dialog-restore-confirm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Confirm Data Restore
              </DialogTitle>
              <DialogDescription>
                This action will permanently delete all current data in the system and replace it with the contents of the backup file. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg bg-destructive/10 p-3 text-sm">
              <p className="font-medium">File: {restoreFile?.name}</p>
              <p className="text-muted-foreground mt-1">Size: {restoreFile ? (restoreFile.size / 1024).toFixed(1) + ' KB' : ''}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRestoreConfirmOpen(false)} data-testid="button-cancel-restore">
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={backupRestoring}
                data-testid="button-confirm-restore"
                onClick={async () => {
                  if (!restoreFile) return;
                  setBackupRestoring(true);
                  setRestoreConfirmOpen(false);
                  try {
                    const formData = new FormData();
                    formData.append('file', restoreFile);
                    const response = await fetch('/api/import/full-backup', {
                      method: 'POST',
                      body: formData,
                    });
                    const result = await response.json();
                    setRestoreResult(result);
                    if (result.success) {
                      toast({ title: 'Restore completed', description: 'All data has been restored from backup.' });
                    } else {
                      toast({ title: 'Restore completed with errors', description: 'Some data may not have been restored.', variant: 'destructive' });
                    }
                  } catch {
                    toast({ title: 'Restore failed', description: 'An error occurred during restore.', variant: 'destructive' });
                  } finally {
                    setBackupRestoring(false);
                  }
                }}
              >
                {backupRestoring ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Yes, Replace All Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                    <SelectItem value="Universal">Universal (All Departments)</SelectItem>
                    {[...departments]
                      .sort((a: any, b: any) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
                      .map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
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
          onComplete={() => queryClient.invalidateQueries({ queryKey: ["induction-templates"] })}
        />

        <CsvImportDialog
          open={importCompetenciesOpen}
          onOpenChange={setImportCompetenciesOpen}
          title="Import Training Matrix Skills"
          description="Upload a CSV to bulk-create skill categories and items. Categories are auto-created if they don't exist."
          expectedColumns={['category_name', 'category_department_type', 'category_sort_order', 'item_name', 'item_description', 'item_sort_order']}
          onImport={(rows) => api.importCsv('competencies', rows)}
          onComplete={() => queryClient.invalidateQueries({ queryKey: ["competencies"] })}
        />

        <CsvImportDialog
          open={importStandardsOpen}
          onOpenChange={setImportStandardsOpen}
          title="Import Standards Survey Items"
          description="Upload a CSV to bulk-create survey items. Survey roles are auto-created if they don't exist."
          expectedColumns={['roleTitle', 'roleSlug', 'itemText', 'isFeedback', 'sortOrder']}
          onImport={(rows) => api.importCsv('standards-surveys', rows)}
          onComplete={() => queryClient.invalidateQueries({ queryKey: ["standards-surveys"] })}
        />
      </div>
    </Layout>
  );
}
