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
import { inductionItems, jobRoles } from '@/lib/mockData';
import {
  ClipboardCheck,
  GraduationCap,
  Plus,
  Edit,
  Copy,
  Trash2,
  FileCheck,
  History,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminTemplates() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const sections = Array.from(new Set(inductionItems.map(item => item.section)));

  const trainingRequirements = [
    { category: 'Mandatory', items: ['Health & Safety Fundamentals', 'Data Protection & GDPR', 'Fire Safety Awareness', 'Manual Handling'] },
    { category: 'Role-Specific', items: ['First Aid at Work', 'Technical Equipment Training', 'Quality Assurance Procedures'] },
    { category: 'Optional', items: ['Environmental Awareness'] },
    { category: 'Development', items: ['Leadership Fundamentals', 'Project Management Basics'] },
  ];

  const handleAction = (action: string, item: string) => {
    toast({
      title: `${action} action`,
      description: `${action} performed on "${item}".`,
    });
  };

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

              {jobRoles.map(role => (
                <Card key={role.id} className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ClipboardCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{role.title} Induction</CardTitle>
                          <CardDescription>{role.department} Department</CardDescription>
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
                          onClick={() => handleAction('Edit', role.title)}
                          data-testid={`button-edit-induction-${role.id}`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction('Duplicate', role.title)}
                          data-testid={`button-duplicate-${role.id}`}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Duplicate
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {sections.map((section, idx) => (
                        <AccordionItem key={section} value={section}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{section}</span>
                              <Badge variant="secondary">
                                {inductionItems.filter(i => i.section === section).length} items
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              {inductionItems
                                .filter(i => i.section === section)
                                .map(item => (
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
              ))}
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

              {jobRoles.map(role => (
                <Card key={role.id} className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{role.title} Training Matrix</CardTitle>
                          <CardDescription>{role.department} Department</CardDescription>
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
                          onClick={() => handleAction('Edit', role.title)}
                          data-testid={`button-edit-training-${role.id}`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {trainingRequirements.map(category => (
                        <div key={category.category} className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{category.category}</h4>
                            <Badge variant="secondary">{category.items.length} items</Badge>
                          </div>
                          <div className="space-y-2">
                            {category.items.map(item => (
                              <div
                                key={item}
                                className="flex items-center justify-between p-2 rounded bg-background"
                              >
                                <span className="text-sm">{item}</span>
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
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
