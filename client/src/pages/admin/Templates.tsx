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
  Copy,
  Trash2,
  FileCheck,
  History,
  ClipboardList,
  Search,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';

export default function AdminTemplates() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const { data: inductionTemplates = [], isLoading: loadingInduction } = useInductionTemplates();
  const { data: competencies = [], isLoading: loadingCompetencies } = useCompetencies();
  const { data: standardsSurveys = [], isLoading: loadingStandards } = useStandardsSurveys();

  const createInductionItem = useCreateInductionTemplate();
  const updateInductionItem = useUpdateInductionTemplate();
  const deleteInductionItem = useDeleteInductionTemplate();
  const createSurveyItem = useCreateStandardsSurveyItem();
  const updateSurveyItem = useUpdateStandardsSurveyItem();
  const deleteSurveyItem = useDeleteStandardsSurveyItem();

  const [surveySearch, setSurveySearch] = useState('');
  const [editingSurvey, setEditingSurvey] = useState<any | null>(null);

  const [inductionDialog, setInductionDialog] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    item?: any;
    section?: string;
    templateSlug?: string;
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

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleAction = (action: string, item: string) => {
    toast({
      title: `${action} action`,
      description: `${action} performed on "${item}".`,
    });
  };

  const openAddInductionItem = (section: string, templateSlug?: string) => {
    setInductionForm({
      section,
      title: '',
      description: '',
      requiresEvidence: false,
      slug: templateSlug || '',
      sortOrder: 0,
    });
    setInductionDialog({ open: true, mode: 'add', section, templateSlug });
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
          slug: inductionForm.slug || inductionForm.title.toLowerCase().replace(/\s+/g, '-'),
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

  const filteredSurveys = standardsSurveys.filter((s: any) =>
    s.roleTitle.toLowerCase().includes(surveySearch.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage induction checklists and training matrix templates
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
                  <h2 className="text-xl font-semibold">Induction Checklist Templates</h2>
                  <p className="text-sm text-muted-foreground">
                    Define induction checklists for each job role
                  </p>
                </div>
                <Button
                  onClick={() => openAddInductionItem('')}
                  data-testid="button-add-induction-template"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Item
                </Button>
              </div>

              {loadingInduction ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : (
                inductionTemplates.map((template: any) => {
                  const sections: string[] = Array.from(new Set((template.items || []).map((item: any) => item.section)));
                  return (
                    <Card key={template.id} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <ClipboardCheck className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              <CardDescription>{template.jobRole || 'All roles'}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              <History className="w-3 h-3" />
                              v1.0
                            </Badge>
                            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                              Active
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('Edit', template.name)}
                              data-testid={`button-edit-induction-${template.id}`}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('Duplicate', template.name)}
                              data-testid={`button-duplicate-${template.id}`}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Duplicate
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible>
                          {sections.map((section) => (
                            <AccordionItem key={section} value={section}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{section}</span>
                                  <Badge variant="secondary">
                                    {(template.items || []).filter((i: any) => i.section === section).length} items
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 pl-4">
                                  {(template.items || [])
                                    .filter((i: any) => i.section === section)
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
                                    onClick={() => openAddInductionItem(section, template.slug)}
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
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="training">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Training Matrix Templates</h2>
                  <p className="text-sm text-muted-foreground">
                    Define training requirements for each job role
                  </p>
                </div>
                <Button data-testid="button-add-training-template">
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>

              {loadingCompetencies ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : (
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Training Matrix Competencies</CardTitle>
                          <CardDescription>All Departments</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <History className="w-3 h-3" />
                          v1.0
                        </Badge>
                        <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                          Active
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction('Edit', 'Training Matrix')}
                          data-testid="button-edit-training-matrix"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {competencies.map((category: any) => (
                        <div key={category.id} className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{category.name}</h4>
                            <Badge variant="secondary">{(category.items || []).length} items</Badge>
                          </div>
                          <div className="space-y-2">
                            {(category.items || []).map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-2 rounded bg-background"
                              >
                                <span className="text-sm">{item.name}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button variant="ghost" size="sm" className="w-full mt-2">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Requirement
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="standards">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Standards Survey Templates</h2>
                  <p className="text-sm text-muted-foreground">
                    Link and maintain the standards survey for each job role
                  </p>
                </div>

                <div className="flex items-center gap-2">
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
                  <Button
                    variant="outline"
                    onClick={() => toast({ title: 'Add survey template', description: 'In this prototype, surveys are loaded from the standards survey dataset.' })}
                    data-testid="button-add-standards-template"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                  </Button>
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
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <p className="text-sm font-medium" data-testid={`text-standards-preview-title-${survey.id}`}>Preview</p>
                            <p className="text-sm text-muted-foreground mt-1" data-testid={`text-standards-preview-body-${survey.id}`}>
                              This role has a standards survey linked. Open Edit to view or adjust items.
                            </p>
                            {(survey.items || []).length > 0 && (
                              <div className="mt-4 grid sm:grid-cols-2 gap-2">
                                {(survey.items || []).slice(0, 4).map((item: any) => (
                                  <div key={item.id} className="p-2 rounded-md bg-background border text-sm" data-testid={`row-standards-item-${survey.id}-${item.id}`}>
                                    {item.text}
                                  </div>
                                ))}
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
                        <p className="font-medium">No job roles match that search</p>
                        <p className="text-sm text-muted-foreground mt-1">Try a different keyword.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <Dialog open={!!editingSurvey} onOpenChange={(open) => !open && setEditingSurvey(null)}>
                <DialogContent className="max-w-2xl" data-testid="dialog-edit-standards-template">
                  <DialogHeader>
                    <DialogTitle className="font-display">Edit standards survey</DialogTitle>
                    <DialogDescription>
                      Edit, add, or remove items for this role's standards survey.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Job role</Label>
                        <div className="mt-2 p-3 rounded-lg border bg-muted/20" data-testid="text-edit-standards-role">
                          {editingSurvey?.roleTitle}
                        </div>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="mt-2 p-3 rounded-lg border bg-muted/20" data-testid="text-edit-standards-status">
                          Configured
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-background">
                      <div className="p-4 border-b flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Items</p>
                          <p className="text-sm text-muted-foreground">{(editingSurvey?.items || []).length} items total.</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setAddingSurveyItem(true); setNewSurveyItemText(''); }}
                          data-testid="button-add-survey-item"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      <div className="p-4 space-y-2 max-h-[320px] overflow-auto">
                        {addingSurveyItem && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                            <div className="flex-1">
                              <Input
                                value={newSurveyItemText}
                                onChange={(e) => setNewSurveyItemText(e.target.value)}
                                placeholder="Enter survey item text..."
                                data-testid="input-new-survey-item"
                              />
                            </div>
                            <Button
                              size="sm"
                              onClick={handleAddSurveyItem}
                              disabled={!newSurveyItemText.trim() || createSurveyItem.isPending}
                              data-testid="button-save-new-survey-item"
                            >
                              {createSurveyItem.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAddingSurveyItem(false)}
                              data-testid="button-cancel-new-survey-item"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        {(editingSurvey?.items || []).map((item: any) => (
                          <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/20" data-testid={`row-edit-standards-item-${item.id}`}>
                            {editingSurveyItem?.id === item.id ? (
                              <div className="flex-1 flex items-start gap-2">
                                <Input
                                  value={surveyItemText}
                                  onChange={(e) => setSurveyItemText(e.target.value)}
                                  className="flex-1"
                                  data-testid={`input-edit-survey-item-${item.id}`}
                                />
                                <Button
                                  size="sm"
                                  onClick={handleSaveSurveyItem}
                                  disabled={updateSurveyItem.isPending}
                                  data-testid={`button-save-survey-item-${item.id}`}
                                >
                                  {updateSurveyItem.isPending ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingSurveyItem(null)}
                                  data-testid={`button-cancel-edit-survey-item-${item.id}`}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="text-sm flex-1">{item.text}</div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEditSurveyItem(item)}
                                    data-testid={`button-edit-standards-item-${item.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteSurveyItem(item)}
                                    data-testid={`button-delete-standards-item-${item.id}`}
                                  >
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
              <DialogTitle className="font-display">
                {inductionDialog.mode === 'edit' ? 'Edit Induction Item' : 'Add Induction Item'}
              </DialogTitle>
              <DialogDescription>
                {inductionDialog.mode === 'edit' ? 'Update the details of this induction checklist item.' : 'Add a new item to the induction checklist.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="induction-section">Section</Label>
                <Input
                  id="induction-section"
                  value={inductionForm.section}
                  onChange={(e) => setInductionForm({ ...inductionForm, section: e.target.value })}
                  placeholder="e.g. 1. Pre-Start Setup"
                  data-testid="input-induction-section"
                />
              </div>
              <div>
                <Label htmlFor="induction-title">Title</Label>
                <Input
                  id="induction-title"
                  value={inductionForm.title}
                  onChange={(e) => setInductionForm({ ...inductionForm, title: e.target.value })}
                  placeholder="Item title"
                  data-testid="input-induction-title"
                />
              </div>
              <div>
                <Label htmlFor="induction-description">Description</Label>
                <Textarea
                  id="induction-description"
                  value={inductionForm.description}
                  onChange={(e) => setInductionForm({ ...inductionForm, description: e.target.value })}
                  placeholder="Optional description"
                  data-testid="input-induction-description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="induction-evidence"
                  checked={inductionForm.requiresEvidence}
                  onCheckedChange={(checked) => setInductionForm({ ...inductionForm, requiresEvidence: !!checked })}
                  data-testid="checkbox-induction-evidence"
                />
                <Label htmlFor="induction-evidence">Requires evidence</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInductionDialog({ open: false, mode: 'add' })}
                data-testid="button-cancel-induction-item"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveInductionItem}
                disabled={!inductionForm.title.trim() || !inductionForm.section.trim() || createInductionItem.isPending || updateInductionItem.isPending}
                data-testid="button-save-induction-item"
              >
                {(createInductionItem.isPending || updateInductionItem.isPending) ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
