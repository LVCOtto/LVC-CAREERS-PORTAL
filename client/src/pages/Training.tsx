import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import {
  ChevronDown,
  ChevronRight,
  Users,
  User,
  Calendar,
  TrendingUp,
  Download,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
  Headphones,
  Plus,
  Clock,
  Target,
  UserPlus,
  CalendarPlus,
} from 'lucide-react';
import {
  engineeringCategories,
  adminCategories,
  engineerMatrices,
  adminMatrices,
  competencyLevels,
  getCompetencyColor,
  calculateCategoryAverage,
  calculateOverallAverage,
  identifySkillGaps,
  scheduledTrainingSessions,
  type CompetencyCategory,
  type EngineerMatrix,
  type SkillGap,
  type ScheduledTraining,
} from '@/lib/trainingMatrixData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

function RatingCell({ rating, compact = false }: { rating: number; compact?: boolean }) {
  const level = competencyLevels[rating];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${level.color} ${compact ? 'w-8 h-8 text-sm' : 'w-10 h-10'} rounded-lg flex items-center justify-center font-semibold cursor-help transition-transform hover:scale-110`}
          >
            {rating}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold">{level.label}</p>
          <p className="text-xs text-muted-foreground">{level.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function CompetencyLegend() {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg">
      {competencyLevels.map((level) => (
        <div key={level.value} className="flex items-center gap-2">
          <div className={`${level.color} w-7 h-7 rounded flex items-center justify-center font-semibold text-sm`}>
            {level.value}
          </div>
          <span className="text-sm text-muted-foreground">{level.label}</span>
        </div>
      ))}
    </div>
  );
}

function CategorySection({
  category,
  engineer,
  expanded,
  onToggle,
}: {
  category: CompetencyCategory;
  engineer: EngineerMatrix;
  expanded: boolean;
  onToggle: () => void;
}) {
  const avgRating = calculateCategoryAverage(engineer.ratings, category);
  const avgColor = getCompetencyColor(Math.round(avgRating));

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
        data-testid={`category-toggle-${category.id}`}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          <span className="font-medium">{category.name}</span>
          <Badge variant="secondary" className="ml-2">
            {category.items.length} items
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Avg:</span>
          <div className={`${avgColor} w-10 h-8 rounded flex items-center justify-center font-semibold text-sm`}>
            {avgRating.toFixed(1)}
          </div>
        </div>
      </button>
      
      {expanded && (
        <div className="divide-y">
          {category.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 hover:bg-muted/20"
              data-testid={`competency-row-${item.id}`}
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                )}
              </div>
              <RatingCell rating={engineer.ratings[item.id] ?? 0} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EngineerDetailView({
  engineer,
  categories,
}: {
  engineer: EngineerMatrix;
  categories: CompetencyCategory[];
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([categories[0]?.id]));
  const overallAvg = calculateOverallAverage(engineer.ratings, categories);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getStatusIcon = (avg: number) => {
    if (avg >= 3) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    if (avg >= 2) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">{engineer.name}</h2>
            <p className="text-muted-foreground">{engineer.role} • {engineer.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Overall Competency</p>
            <div className="flex items-center gap-2 justify-end">
              {getStatusIcon(overallAvg)}
              <span className="text-2xl font-bold">{overallAvg.toFixed(1)}</span>
              <span className="text-muted-foreground">/ 4</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Last Assessment</p>
            <p className="font-medium">{new Date(engineer.lastAssessment).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.slice(0, 4).map((category) => {
          const avg = calculateCategoryAverage(engineer.ratings, category);
          const percentage = (avg / 4) * 100;
          return (
            <Card key={category.id}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground truncate mb-2">{category.name}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold">{avg.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">/ 4</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CompetencyLegend />

      <div className="space-y-3">
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            engineer={engineer}
            expanded={expandedCategories.has(category.id)}
            onToggle={() => toggleCategory(category.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TeamOverviewGrid({
  engineers,
  categories,
  onSelectEngineer,
}: {
  engineers: EngineerMatrix[];
  categories: CompetencyCategory[];
  onSelectEngineer: (engineer: EngineerMatrix) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" data-testid="team-matrix-table">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold sticky left-0 bg-background min-w-[200px]">
              Team Member
            </th>
            {categories.map((category) => (
              <th key={category.id} className="p-3 text-center min-w-[100px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs font-medium text-muted-foreground cursor-help truncate block max-w-[90px]">
                        {category.name.replace('Technical Expertise - ', '').replace('Occupational ', '').replace(' and Communication', '')}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.items.length} competencies</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </th>
            ))}
            <th className="p-3 text-center min-w-[80px] font-semibold bg-primary/5">Overall</th>
          </tr>
        </thead>
        <tbody>
          {engineers.map((engineer) => {
            const overallAvg = calculateOverallAverage(engineer.ratings, categories);
            return (
              <tr
                key={engineer.id}
                className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onSelectEngineer(engineer)}
                data-testid={`engineer-row-${engineer.id}`}
              >
                <td className="p-3 sticky left-0 bg-background">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{engineer.name}</p>
                      <p className="text-xs text-muted-foreground">{engineer.role}</p>
                    </div>
                  </div>
                </td>
                {categories.map((category) => {
                  const avg = calculateCategoryAverage(engineer.ratings, category);
                  return (
                    <td key={category.id} className="p-3 text-center">
                      <div className="flex justify-center">
                        <RatingCell rating={Math.round(avg)} compact />
                      </div>
                    </td>
                  );
                })}
                <td className="p-3 text-center bg-primary/5">
                  <div className={`${getCompetencyColor(Math.round(overallAvg))} w-12 h-10 rounded-lg flex items-center justify-center font-bold mx-auto`}>
                    {overallAvg.toFixed(1)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Training() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('engineering');
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerMatrix | null>(null);
  const [viewMode, setViewMode] = useState<'team' | 'individual'>('team');

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager' || isAdmin;
  const isColleague = currentUser.role === 'colleague';

  // For colleagues, find their own matrix data
  const myMatrix: EngineerMatrix = {
    id: 'self',
    name: currentUser.name,
    role: currentUser.department === 'Engineering' ? 'Engineer' : 'Administrator',
    department: currentUser.department,
    ratings: engineerMatrices[1].ratings, // Use sample ratings for demo
    lastAssessment: '2025-12-01',
  };

  const currentCategories = activeTab === 'engineering' ? engineeringCategories : adminCategories;
  const currentEngineers = activeTab === 'engineering' ? engineerMatrices : adminMatrices;

  const handleSelectEngineer = (engineer: EngineerMatrix) => {
    setSelectedEngineer(engineer);
    setViewMode('individual');
  };

  const handleBackToTeam = () => {
    setSelectedEngineer(null);
    setViewMode('team');
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Training Matrix</h1>
            <p className="text-muted-foreground mt-1">
              Competency assessments and skill development tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-sm p-4">
                  <p className="font-semibold mb-2">Rating Scale (0-4)</p>
                  {competencyLevels.map((level) => (
                    <p key={level.value} className="text-xs mb-1">
                      <span className="font-medium">{level.value}:</span> {level.label}
                    </p>
                  ))}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isManager && (
              <Button variant="outline" className="gap-2" data-testid="button-export-matrix">
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setViewMode('team'); setSelectedEngineer(null); }}>
          <div className="flex items-center justify-between mb-4">
            {!isColleague && (
              <TabsList>
                <TabsTrigger value="engineering" className="gap-2" data-testid="tab-engineering">
                  <Wrench className="h-4 w-4" />
                  Engineering
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-2" data-testid="tab-admin">
                  <Headphones className="h-4 w-4" />
                  Service Admin
                </TabsTrigger>
              </TabsList>
            )}
            {isColleague && <div />}

            {viewMode === 'individual' && selectedEngineer && !isColleague && (
              <Button variant="ghost" onClick={handleBackToTeam} data-testid="button-back-to-team">
                ← Back to Team View
              </Button>
            )}
          </div>

          <TabsContent value="engineering" className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {isColleague ? 'My Competency Matrix' : viewMode === 'team' ? 'Engineering Team Competency Matrix' : 'Individual Assessment'}
                  </CardTitle>
                  {viewMode === 'team' && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Last updated: Dec 2025
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isColleague ? (
                  <EngineerDetailView
                    engineer={myMatrix}
                    categories={engineeringCategories}
                  />
                ) : viewMode === 'team' ? (
                  <>
                    <CompetencyLegend />
                    <div className="mt-6">
                      <TeamOverviewGrid
                        engineers={engineerMatrices}
                        categories={engineeringCategories}
                        onSelectEngineer={handleSelectEngineer}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Click on a team member to view their detailed competency breakdown
                    </p>
                  </>
                ) : selectedEngineer ? (
                  <EngineerDetailView
                    engineer={selectedEngineer}
                    categories={engineeringCategories}
                  />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {isColleague ? 'My Competency Matrix' : viewMode === 'team' ? 'Service Admin Team Competency Matrix' : 'Individual Assessment'}
                  </CardTitle>
                  {viewMode === 'team' && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Last updated: Nov 2025
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isColleague ? (
                  <EngineerDetailView
                    engineer={myMatrix}
                    categories={adminCategories}
                  />
                ) : viewMode === 'team' ? (
                  <>
                    <CompetencyLegend />
                    <div className="mt-6">
                      <TeamOverviewGrid
                        engineers={adminMatrices}
                        categories={adminCategories}
                        onSelectEngineer={handleSelectEngineer}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Click on a team member to view their detailed competency breakdown
                    </p>
                  </>
                ) : selectedEngineer ? (
                  <EngineerDetailView
                    engineer={selectedEngineer}
                    categories={adminCategories}
                  />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isManager && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-red-500" />
                    Skills Gaps Identified
                  </CardTitle>
                  <Badge variant="destructive">
                    {identifySkillGaps(activeTab === 'engineering' ? engineerMatrices : adminMatrices, activeTab === 'engineering' ? engineeringCategories : adminCategories).length} gaps
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {identifySkillGaps(
                    activeTab === 'engineering' ? engineerMatrices : adminMatrices,
                    activeTab === 'engineering' ? engineeringCategories : adminCategories
                  ).slice(0, 8).map((gap, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{gap.competencyName}</p>
                        <p className="text-xs text-muted-foreground">{gap.engineerName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`${getCompetencyColor(gap.currentRating)} w-8 h-8 rounded flex items-center justify-center font-semibold text-sm`}>
                          {gap.currentRating}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1" data-testid={`button-schedule-gap-${idx}`}>
                              <CalendarPlus className="h-3 w-3" />
                              Schedule
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Schedule Training Session</DialogTitle>
                              <DialogDescription>
                                Create a training session to address this skill gap
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-sm font-medium">{gap.competencyName}</p>
                                <p className="text-xs text-muted-foreground mt-1">For: {gap.engineerName} • Current Level: {gap.currentRating}/4</p>
                              </div>
                              <div className="grid gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="date">Training Date</Label>
                                  <Input id="date" type="date" />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="trainer">Trainer / Provider</Label>
                                  <Input id="trainer" placeholder="e.g., James Wilson, i-Hasco, External" />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="notes">Notes</Label>
                                  <Input id="notes" placeholder="Additional details..." />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={() => toast({ title: 'Training Scheduled', description: `Training session for ${gap.competencyName} has been scheduled.` })}>
                                Schedule Training
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
                {identifySkillGaps(activeTab === 'engineering' ? engineerMatrices : adminMatrices, activeTab === 'engineering' ? engineeringCategories : adminCategories).length > 8 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    + {identifySkillGaps(activeTab === 'engineering' ? engineerMatrices : adminMatrices, activeTab === 'engineering' ? engineeringCategories : adminCategories).length - 8} more gaps identified
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Scheduled Training Sessions
                  </CardTitle>
                  <Button size="sm" variant="outline" className="gap-1" data-testid="button-add-training">
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scheduledTrainingSessions.map((session) => (
                    <div key={session.id} className={`p-3 rounded-lg border ${session.status === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-background'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{session.competencyName}</p>
                            {session.status === 'completed' && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{session.categoryName}</p>
                        </div>
                        <Badge variant={session.status === 'completed' ? 'secondary' : 'default'} className="flex-shrink-0">
                          {new Date(session.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{session.attendees.map(a => a.name.split(' ')[0]).join(', ')}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Trainer: {session.trainer}</span>
                      </div>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{session.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Training Matrix Self-Assessment</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Team members complete self-assessments via the Smartsheet form. Results are reviewed by managers 
                  and used to identify training needs and development opportunities.
                </p>
                <Button variant="link" className="px-0 mt-2 h-auto text-primary" data-testid="link-smartsheet">
                  Open Smartsheet Assessment Form →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
