import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import {
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  TrendingUp,
  Download,
  HelpCircle,
  Clock,
  Target,
  CalendarPlus,
  Building2,
  Filter,
  ArrowLeft,
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
} from '@/lib/trainingMatrixData';
import { departments } from '@/lib/departmentData';
import { useToast } from '@/hooks/use-toast';

function RatingCell({ rating, compact = false }: { rating: number; compact?: boolean }) {
  const level = competencyLevels[rating];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${level.color} ${compact ? 'w-8 h-8 text-sm' : 'w-10 h-10'} rounded-lg flex items-center justify-center font-semibold cursor-help transition-transform hover:scale-105`}
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
    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
      {competencyLevels.map((level) => (
        <div key={level.value} className="flex items-center gap-1.5">
          <div className={`${level.color} w-6 h-6 rounded flex items-center justify-center font-semibold text-xs`}>
            {level.value}
          </div>
          <span className="text-xs text-muted-foreground">{level.label}</span>
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
        className="w-full flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 transition-colors"
        data-testid={`category-toggle-${category.id}`}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-medium text-sm">{category.name}</span>
          <Badge variant="secondary" className="text-xs">
            {category.items.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Avg:</span>
          <div className={`${avgColor} w-8 h-6 rounded flex items-center justify-center font-semibold text-xs`}>
            {avgRating.toFixed(1)}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="divide-y">
          {category.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-muted/10"
              data-testid={`competency-row-${item.id}`}
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                )}
              </div>
              <RatingCell rating={engineer.ratings[item.id] ?? 0} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function IndividualView({
  engineer,
  categories,
  onBack,
  showBackButton = true,
}: {
  engineer: EngineerMatrix;
  categories: CompetencyCategory[];
  onBack?: () => void;
  showBackButton?: boolean;
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

  return (
    <div className="space-y-6">
      {showBackButton && onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2" data-testid="button-back-to-team">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">{engineer.name}</h2>
            <p className="text-sm text-muted-foreground">
              {engineer.role} • {engineer.department}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Overall Score</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">{overallAvg.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 4</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Updated: {new Date(engineer.lastAssessment).toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.slice(0, 4).map((category) => {
          const avg = calculateCategoryAverage(engineer.ratings, category);
          const percentage = (avg / 4) * 100;
          return (
            <Card key={category.id} className="border-border/50">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground truncate mb-1">
                  {category.name.replace('Technical Expertise - ', '')}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-lg font-bold">{avg.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">/ 4</span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CompetencyLegend />

      <div className="space-y-2">
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

export default function Training() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState('engineering');

  if (!currentUser) return null;

  const isColleague = currentUser.role === 'colleague';

  const currentCategories = selectedDepartment === 'engineering' ? engineeringCategories : adminCategories;

  const myMatrix: EngineerMatrix = {
    id: 'self',
    name: currentUser.name,
    role: currentUser.jobRole || 'Engineering Manager',
    department: currentUser.department,
    ratings: engineerMatrices[0]?.ratings || {},
    lastAssessment: '2025-01-01',
  };

  const myLineManager = 'James Wilson (Operations Director)';

  const departmentOptions = [
    { value: 'engineering', label: 'Engineering', color: 'bg-blue-600' },
    { value: 'admin', label: 'Service Administration', color: 'bg-amber-600' },
    { value: 'warehouse', label: 'Warehouse & Logistics', color: 'bg-orange-600' },
    { value: 'sales', label: 'Sales', color: 'bg-purple-600' },
    { value: 'quality', label: 'Quality & Compliance', color: 'bg-red-600' },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Training Matrix</h1>
            <p className="text-muted-foreground mt-1">Competency assessments and skill development tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" data-testid="button-training-help">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs p-3">
                  <p className="font-semibold mb-2 text-sm">Rating Scale (0-4)</p>
                  <div className="space-y-1">
                    {competencyLevels.map((level) => (
                      <p key={level.value} className="text-xs">
                        <span className="font-medium">{level.value}:</span> {level.label}
                      </p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" className="gap-2" data-testid="button-export-matrix" disabled>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {!isColleague && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Your Development Journey</p>
                  <p className="text-sm text-muted-foreground">
                    This is your personal training matrix. For team specifics, open a colleague from your dashboard to view their profile.
                    <span className="block mt-1">Line manager: <span className="font-medium text-foreground">{myLineManager}</span></span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[220px]" data-testid="select-department">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${dept.color}`} />
                      {dept.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="gap-1 w-fit">
            <Calendar className="h-3 w-3" />
            Last updated: Jan 2026
          </Badge>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              My Training Matrix
            </CardTitle>
            <CardDescription>
              Your self-assessment ratings. Complete the Smartsheet form to update.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IndividualView engineer={myMatrix} categories={currentCategories} showBackButton={false} />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  My Skills Gaps
                </CardTitle>
                <Badge variant="destructive" className="text-xs">6</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Managers can review skills gaps per colleague from their profile.
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  My Scheduled Training
                </CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled data-testid="button-schedule-training">
                  <CalendarPlus className="h-3 w-3" />
                  Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No training sessions scheduled</p>
                <p className="text-xs mt-1">Contact your line manager to book training</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
