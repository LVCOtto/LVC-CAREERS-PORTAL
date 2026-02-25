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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useInductionTemplates, useCompetencies, useStandardsSurveys } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';

export default function AdminTemplates() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const { data: inductionTemplates = [], isLoading: loadingInduction } = useInductionTemplates();
  const { data: competencies = [], isLoading: loadingCompetencies } = useCompetencies();
  const { data: standardsSurveys = [], isLoading: loadingStandards } = useStandardsSurveys();

  const [surveySearch, setSurveySearch] = useState('');
  const [editingSurvey, setEditingSurvey] = useState<any | null>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleAction = (action: string, item: string) => {
    toast({
      title: `${action} action`,
      description: `${action} performed on "${item}".`,
    });
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
                <Button data-testid="button-add-induction-template">
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
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
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  <Button variant="ghost" size="sm" className="w-full mt-2">
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
                      This is a template linked to the job role. In this prototype, editing is visual-only.
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
                      <div className="p-4 border-b">
                        <p className="text-sm font-medium">Items</p>
                        <p className="text-sm text-muted-foreground">Showing the first 12 items for a quick edit view.</p>
                      </div>
                      <div className="p-4 space-y-2 max-h-[320px] overflow-auto">
                        {(editingSurvey?.items || []).slice(0, 12).map((item: any) => (
                          <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/20" data-testid={`row-edit-standards-item-${item.id}`}>
                            <div className="text-sm">{item.text}</div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-edit-standards-item-${item.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingSurvey(null)} data-testid="button-close-standards-editor">
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        toast({ title: 'Saved', description: 'Standards survey template saved.' });
                        setEditingSurvey(null);
                      }}
                      data-testid="button-save-standards-template"
                    >
                      Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
