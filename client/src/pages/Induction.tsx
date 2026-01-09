import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  getInductionForUser,
  getInductionProgress,
  ChecklistItem,
} from '@/lib/mockData';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Induction() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  if (!currentUser) return null;

  const induction = getInductionForUser(currentUser.id);
  const [items, setItems] = useState<ChecklistItem[]>(induction.items);
  const progress = getInductionProgress(items);

  const sections = Array.from(new Set(items.map(item => item.section)));

  const handleToggleItem = (itemId: string) => {
    if (currentUser.role === 'colleague') {
      setItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                completed: !item.completed,
                completedDate: !item.completed
                  ? new Date().toISOString().split('T')[0]
                  : undefined,
              }
            : item
        )
      );
      toast({
        title: 'Progress updated',
        description: 'Your induction progress has been saved.',
      });
    }
  };

  const handleSignOff = (itemId: string) => {
    if (currentUser.role === 'manager' || currentUser.role === 'admin') {
      setItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                signedOffBy: currentUser.id,
                signedOffDate: new Date().toISOString().split('T')[0],
              }
            : item
        )
      );
      toast({
        title: 'Item signed off',
        description: 'You have signed off this induction item.',
      });
    }
  };

  const getSectionItems = (section: string) => items.filter(item => item.section === section);
  const getSectionProgress = (section: string) => {
    const sectionItems = getSectionItems(section);
    const completed = sectionItems.filter(i => i.completed).length;
    return Math.round((completed / sectionItems.length) * 100);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Induction Checklist
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your onboarding progress and complete required items
          </p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{induction.templateName}</CardTitle>
                  <CardDescription>Started {induction.createdDate}</CardDescription>
                </div>
              </div>
              <StatusBadge status={induction.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
                <div className="flex items-center gap-3">
                  <Progress value={progress.progressPercent} className="h-3 flex-1" />
                  <span className="text-lg font-semibold">{progress.progressPercent}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-primary">
                  {progress.completed}
                </p>
                <p className="text-sm text-muted-foreground">Items Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-emerald-600">
                  {progress.signedOff}
                </p>
                <p className="text-sm text-muted-foreground">Items Signed Off</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion type="multiple" defaultValue={sections} className="space-y-4">
          {sections.map(section => (
            <AccordionItem
              key={section}
              value={section}
              className="border rounded-lg bg-card px-6"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-semibold text-lg">{section}</span>
                    <Badge variant="secondary">
                      {getSectionItems(section).filter(i => i.completed).length} /{' '}
                      {getSectionItems(section).length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={getSectionProgress(section)} className="w-24 h-2" />
                    <span className="text-sm text-muted-foreground w-10">
                      {getSectionProgress(section)}%
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  {getSectionItems(section).map(item => (
                    <div
                      key={item.id}
                      data-testid={`checklist-item-${item.id}`}
                      className={`p-4 rounded-lg border transition-colors ${
                        item.completed
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          id={item.id}
                          checked={item.completed}
                          onCheckedChange={() => handleToggleItem(item.id)}
                          disabled={currentUser.role !== 'colleague'}
                          className="mt-1"
                          data-testid={`checkbox-${item.id}`}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={item.id}
                            className={`font-medium cursor-pointer ${
                              item.completed ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {item.title}
                          </label>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            {item.requiresEvidence && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                Evidence Required
                              </Badge>
                            )}
                            {item.dueDate && !item.completed && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </Badge>
                            )}
                            {item.completedDate && (
                              <span className="text-xs text-muted-foreground">
                                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                Completed {new Date(item.completedDate).toLocaleDateString()}
                              </span>
                            )}
                            {item.signedOffBy && (
                              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Signed Off
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.requiresEvidence && currentUser.role === 'colleague' && (
                            <Button variant="outline" size="sm" data-testid={`button-upload-${item.id}`}>
                              <Upload className="w-4 h-4 mr-1" />
                              Upload
                            </Button>
                          )}
                          {item.completed &&
                            !item.signedOffBy &&
                            (currentUser.role === 'manager' || currentUser.role === 'admin') && (
                              <Button
                                size="sm"
                                onClick={() => handleSignOff(item.id)}
                                data-testid={`button-signoff-${item.id}`}
                              >
                                Sign Off
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
}
