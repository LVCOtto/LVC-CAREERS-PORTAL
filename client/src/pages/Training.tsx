import { useState, useMemo, useCallback } from 'react';
import { useAuth, User } from '@/lib/authContext';
import { usePortalSettings } from '@/lib/portalSettingsContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import {
  ChevronDown,
  ChevronRight,
  User as UserIcon,
  TrendingUp,
  HelpCircle,
  ArrowLeft,
  Send,
  Share2,
  Copy,
  Check,
  Link,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUser, useCompetencies, useCompetenciesForRole, useTrainingMatrixForUser, useTrainingMatrixHistory, useCreateTrainingMatrix, useUpdateTrainingMatrix, useGenerateShareToken } from '@/lib/hooks';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Spinner } from '@/components/ui/spinner';
import { getCompetencyDepartmentType } from '@/lib/departmentClassification';
import TrainingMatrixWizard from '@/components/TrainingMatrixWizard';

const competencyColors = [
  'bg-gray-200 text-gray-600',
  'bg-red-100 text-red-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
];

const competencyDescriptions = [
  'Has no experience, or does not understand',
  'Has some experience but not confident, more training required',
  'Has experience and is reasonably confident but occasional support required',
  'Is highly confident and does not require support',
  'Thorough knowledge, willing and able to train others',
];

function useCompetencyLevels() {
  const { getSetting } = usePortalSettings();
  return [0, 1, 2, 3, 4].map(i => ({
    value: i,
    label: getSetting(`rating.${i}`),
    description: competencyDescriptions[i],
    color: competencyColors[i],
  }));
}

function getCompetencyColor(rating: number): string {
  return competencyColors[rating] || competencyColors[0];
}

function calculateCategoryAverage(ratings: Record<string, number>, category: any): number {
  const categoryRatings = category.items.map((item: any) => ratings[item.slug] ?? 0);
  return categoryRatings.reduce((a: number, b: number) => a + b, 0) / (categoryRatings.length || 1);
}

function calculateOverallAverage(ratings: Record<string, number>, categories: any[]): number {
  let total = 0;
  let count = 0;
  categories.forEach((cat: any) => {
    cat.items.forEach((item: any) => {
      total += ratings[item.slug] ?? 0;
      count++;
    });
  });
  return count > 0 ? total / count : 0;
}

function groupCategoriesBySection(categories: any[]) {
  if (!categories.some((category: any) => category.sectionKey)) {
    return [] as Array<{ key: string; label: string; sortOrder: number; categories: any[] }>;
  }

  const groups = new Map<string, { key: string; label: string; sortOrder: number; categories: any[] }>();
  categories.forEach((category: any, index: number) => {
    const key = category.sectionKey || 'matrix';
    const existing = groups.get(key);
    if (existing) {
      existing.categories.push(category);
      return;
    }
    groups.set(key, {
      key,
      label: category.sectionLabel || 'Training Matrix',
      sortOrder: category.sectionSortOrder ?? index,
      categories: [category],
    });
  });

  return Array.from(groups.values())
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
    .map((group) => ({
      ...group,
      categories: [...group.categories].sort((a: any, b: any) => (a.roleSortOrder ?? a.sortOrder ?? 0) - (b.roleSortOrder ?? b.sortOrder ?? 0)),
    }));
}

function RatingCell({ rating, compact = false }: { rating: number; compact?: boolean }) {
  const competencyLevels = useCompetencyLevels();
  const level = competencyLevels[rating] || competencyLevels[0];

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
  const competencyLevels = useCompetencyLevels();
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
  ratings,
  expanded,
  onToggle,
}: {
  category: any;
  ratings: Record<string, number>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const avgRating = calculateCategoryAverage(ratings, category);
  const avgColor = getCompetencyColor(Math.round(avgRating));

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 transition-colors"
        data-testid={`category-toggle-${category.slug}`}
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
          {category.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-muted/10"
              data-testid={`competency-row-${item.slug}`}
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                )}
              </div>
              <RatingCell rating={ratings[item.slug] ?? 0} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function IndividualView({
  name,
  jobRole,
  department,
  ratings,
  lastAssessment,
  categories,
  onBack,
  showBackButton = true,
  compact = false,
}: {
  name: string;
  jobRole: string;
  department: string;
  ratings: Record<string, number>;
  lastAssessment?: string;
  categories: any[];
  onBack?: () => void;
  showBackButton?: boolean;
  compact?: boolean;
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [showAllCategoryCards, setShowAllCategoryCards] = useState(false);
  const sectionGroups = useMemo(() => groupCategoriesBySection(categories), [categories]);
  const overallAvg = calculateOverallAverage(ratings, categories);
  const totalCompetencies = categories.reduce((count: number, category: any) => count + category.items.length, 0);
  const previewCategoryCount = 3;
  const visibleCategories = showAllCategoryCards ? categories : categories.slice(0, previewCategoryCount);
  const hasHiddenCategoryCards = categories.length > previewCategoryCount;

  const toggleCategory = (categorySlug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categorySlug)) {
        next.delete(categorySlug);
      } else {
        next.add(categorySlug);
      }
      return next;
    });
  };

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {showBackButton && onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2" data-testid="button-back-to-team">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      {!compact && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">{name}</h2>
              <p className="text-sm text-muted-foreground">
                {jobRole} • {department}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Overall Score</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{overallAvg.toFixed(1)}</span>
              <span className="text-muted-foreground">/ 4</span>
            </div>
            {lastAssessment && (
              <p className="text-xs text-muted-foreground mt-1">
                Updated: {new Date(lastAssessment).toLocaleDateString('en-GB')}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Score Snapshot</p>
          <p className="text-xs text-muted-foreground">Top categories at a glance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleCategories.map((category: any) => {
          const avg = calculateCategoryAverage(ratings, category);
          const percentage = (avg / 4) * 100;
          return (
            <Card key={category.slug} className="border-border/50">
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
        {hasHiddenCategoryCards && (
          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAllCategoryCards((prev) => !prev)}
              data-testid="button-toggle-category-preview"
            >
              {showAllCategoryCards ? 'Show fewer categories' : `Show all ${categories.length} categories`}
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded-xl overflow-hidden">
        <button
          onClick={() => setDetailsExpanded((prev) => !prev)}
          className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/35 transition-colors flex items-center justify-between"
          data-testid="button-toggle-training-details"
        >
          <div className="flex items-center gap-2 text-left">
            <span className="font-medium text-sm">Detailed competency results</span>
            <Badge variant="secondary" className="text-xs">
              {categories.length} categories • {totalCompetencies} skills
            </Badge>
          </div>
          {detailsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {detailsExpanded && (
          <div className="border-t p-4 space-y-3 bg-background/80">
            <CompetencyLegend />
            {sectionGroups.length > 0 ? (
              <div className="space-y-4">
                {sectionGroups.map((section) => (
                  <div key={section.key} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/15 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold">{section.label}</p>
                        <p className="text-xs text-muted-foreground">{section.categories.length} categor{section.categories.length === 1 ? 'y' : 'ies'}</p>
                      </div>
                      <Badge variant="secondary">Section</Badge>
                    </div>
                    <div className="space-y-2">
                      {section.categories.map((category: any) => (
                        <CategorySection
                          key={category.slug}
                          category={category}
                          ratings={ratings}
                          expanded={expandedCategories.has(category.slug)}
                          onToggle={() => toggleCategory(category.slug)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category: any) => (
                  <CategorySection
                    key={category.slug}
                    category={category}
                    ratings={ratings}
                    expanded={expandedCategories.has(category.slug)}
                    onToggle={() => toggleCategory(category.slug)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TrainingProgressChart({
  userId,
  categories,
  nextReviewDate,
}: {
  userId: string;
  categories: any[];
  nextReviewDate?: string | null;
}) {
  const { data: history = [], isLoading } = useTrainingMatrixHistory(userId);

  const chartData = useMemo(() => {
    const points = (history as any[])
      .filter((sub) => sub.status === 'approved' || sub.status === 'pending_review')
      .map((sub) => ({
        date: sub.lastAssessment || sub.submittedDate || '',
        score: parseFloat(
          calculateOverallAverage(sub.ratings as Record<string, number>, categories).toFixed(2)
        ),
        status: sub.status as string,
        isNextReview: false,
      }))
      .filter((d) => d.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (nextReviewDate && !points.find((d) => d.date === nextReviewDate)) {
      points.push({ date: nextReviewDate, score: null as any, status: 'upcoming', isNextReview: true });
      points.sort((a, b) => a.date.localeCompare(b.date));
    }

    return points;
  }, [history, categories, nextReviewDate]);

  const hasRealData = chartData.some((d) => !d.isNextReview);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner />
      </div>
    );
  }

  if (!hasRealData) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No submitted assessments yet. Submit your training matrix to start tracking progress.
      </p>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isNextReview || payload.score == null) return null;
    const fill = payload.status === 'approved' ? '#10b981' : '#f59e0b';
    return <circle cx={cx} cy={cy} r={5} fill={fill} stroke="white" strokeWidth={2} />;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 4]}
          ticks={[0, 1, 2, 3, 4]}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={24}
        />
        <RechartsTooltip
          content={({ active, payload }) => {
            if (active && payload?.length) {
              const d = payload[0]?.payload;
              if (!d || d.isNextReview) return null;
              return (
                <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-lg">
                  <p className="font-medium mb-1">{formatDate(d.date)}</p>
                  <p className="text-muted-foreground">
                    Score:{' '}
                    <span className="font-semibold text-foreground">
                      {d.score?.toFixed(2)} / 4
                    </span>
                  </p>
                  <p className="text-muted-foreground capitalize mt-0.5">
                    {d.status === 'pending_review' ? 'Pending review' : d.status}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        {nextReviewDate && (
          <ReferenceLine
            x={nextReviewDate}
            stroke="hsl(var(--primary))"
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{
              value: 'Next review due',
              position: 'insideTopRight',
              fontSize: 10,
              fill: 'hsl(var(--primary))',
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 6, strokeWidth: 2 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function Training() {
  const { currentUser } = useAuth();
  const { getSetting } = usePortalSettings();
  const competencyLevels = useCompetencyLevels();
  const { toast } = useToast();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [dialogRatings, setDialogRatings] = useState<Record<string, number>>({});
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);

  const departmentType = currentUser?.department || getCompetencyDepartmentType(currentUser);

  const { data: roleCategories, isLoading: roleLoading } = useCompetenciesForRole(currentUser?.jobRoleId ?? currentUser?.jobRole);
  const { data: deptCategories = [], isLoading: deptLoading } = useCompetencies(departmentType);
  const categories = roleCategories && roleCategories.length > 0 ? roleCategories : deptCategories;
  const categoriesLoading = roleLoading || deptLoading;
  const { data: matrixSubmission, isLoading: matrixLoading } = useTrainingMatrixForUser(currentUser?.id || '');
  const { data: approverUser } = useUser(matrixSubmission?.approvedBy || '');
  const createMatrix = useCreateTrainingMatrix();
  const updateMatrix = useUpdateTrainingMatrix();
  const generateShareToken = useGenerateShareToken();

  const setRating = useCallback((slug: string, value: number) => {
    setDialogRatings(prev => ({ ...prev, [slug]: value }));
  }, []);

  const dialogSectionGroups = useMemo(() => groupCategoriesBySection(categories), [categories]);

  if (!currentUser) return null;

  const isColleague = currentUser.role === 'colleague';
  const isLoading = categoriesLoading || matrixLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </Layout>
    );
  }

  const ratings: Record<string, number> = (matrixSubmission?.ratings as Record<string, number>) || {};
  const matrixStatus = matrixSubmission?.status || 'draft';
  const submitButtonDisabled = matrixStatus === 'pending_review';
  const submitButtonLabel = matrixStatus === 'approved'
    ? 'Start new self-assessment'
    : matrixStatus === 'pending_review'
      ? 'Awaiting manager sign-off'
      : 'Submit training matrix';
  const totalSkills = categories.reduce((count: number, category: any) => count + category.items.length, 0);
  const ratedSkills = categories.reduce(
    (count: number, category: any) => count + category.items.filter((item: any) => ratings[item.slug] !== undefined).length,
    0
  );
  const completionPercent = totalSkills > 0 ? Math.round((ratedSkills / totalSkills) * 100) : 0;
  const overallScore = calculateOverallAverage(ratings, categories);
  const nextActionText = matrixStatus === 'pending_review'
    ? 'No action needed right now. Your manager will review and sign this off.'
    : matrixStatus === 'approved'
      ? 'Your last matrix is approved. Start a new self-assessment when ready.'
      : 'Continue rating your skills, then submit for manager sign-off.';
  const statusPanelTone = matrixStatus === 'approved'
    ? 'border-emerald-200 bg-emerald-50/40'
    : matrixStatus === 'pending_review'
      ? 'border-amber-200 bg-amber-50/35'
      : 'border-slate-200 bg-slate-50/60';
  const actionPanelTone = matrixStatus === 'pending_review'
    ? 'border-amber-200/80 bg-amber-50/30'
    : 'border-border bg-background';
  const lastAssessment = matrixSubmission?.lastAssessment || undefined;
  const nextReviewDate = matrixSubmission?.nextReviewDate
    ? new Date(matrixSubmission.nextReviewDate + 'T00:00:00')
    : null;
  const daysUntilReview = nextReviewDate
    ? Math.ceil((nextReviewDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const reviewTone = daysUntilReview === null
    ? 'text-muted-foreground'
    : daysUntilReview < 0
      ? 'text-red-600'
      : daysUntilReview <= 14
        ? 'text-amber-600'
        : 'text-muted-foreground';

  const openSelfAssessment = () => {
    if (matrixStatus === 'approved') {
      setDialogRatings({});
    } else {
      setDialogRatings({ ...ratings });
    }
    setIsSubmitOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (matrixSubmission?.id && matrixStatus !== 'approved') {
        await updateMatrix.mutateAsync({
          id: matrixSubmission.id,
          data: { ratings: dialogRatings, status: 'pending_review', submittedDate: today, lastAssessment: today },
        });
      } else {
        await createMatrix.mutateAsync({
          userId: currentUser.id,
          status: 'pending_review',
          ratings: dialogRatings,
          lastAssessment: today,
          submittedDate: today,
          nextReviewDate: matrixSubmission?.nextReviewDate || undefined,
        });
      }
      setIsSubmitOpen(false);
      toast({
        title: 'Submitted for sign-off',
        description: 'Your line manager can now review and approve your training matrix.',
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to submit training matrix.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (matrixSubmission?.id && matrixStatus !== 'approved') {
        await updateMatrix.mutateAsync({
          id: matrixSubmission.id,
          data: {
            ratings: dialogRatings,
            status: 'draft',
            lastAssessment: matrixSubmission.lastAssessment || today,
          },
        });
      } else {
        await createMatrix.mutateAsync({
          userId: currentUser.id,
          status: 'draft',
          ratings: dialogRatings,
          lastAssessment: today,
          nextReviewDate: matrixSubmission?.nextReviewDate || undefined,
        });
      }

      setIsSubmitOpen(false);
      toast({
        title: 'Draft saved',
        description: 'Your progress has been saved and you can continue later.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save draft.',
        variant: 'destructive',
      });
    }
  };

  const handleShareLink = async () => {
    try {
      let submissionId = matrixSubmission?.id;
      if (!submissionId) {
        const newSub = await createMatrix.mutateAsync({
          userId: currentUser.id,
          status: 'draft',
          ratings: ratings,
          lastAssessment: new Date().toISOString().slice(0, 10),
        });
        submissionId = newSub.id;
      }
      const result = await generateShareToken.mutateAsync(submissionId);
      const url = `${window.location.origin}/training-matrix/shared/${result.token}`;
      setShareUrl(url);
      setCopied(false);
      setIsShareOpen(true);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to generate shareable link.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Link copied', description: 'Shareable link copied to clipboard.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy link.', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-6xl space-y-6 animate-fade-in">
        <Card className="relative overflow-hidden border-border/60 shadow-sm bg-gradient-to-br from-card via-card to-muted/20">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent" aria-hidden="true" />
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Training overview</p>
                <h1 className="mt-1 text-3xl font-display font-bold md:text-4xl">{getSetting('page.training.heading')}</h1>
                <p className="text-muted-foreground mt-2 max-w-3xl">{getSetting('page.training.description')}</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-background/90" data-testid="button-training-help">
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
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="pb-3 bg-gradient-to-b from-muted/20 to-background">
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  My Training Matrix
                </CardTitle>
                <CardDescription className="mt-1">
                  Clear status, clear next step, and your latest competency snapshot.
                </CardDescription>
              </div>

              {isColleague && (
                <div className="grid gap-3 lg:grid-cols-3">
                  <div className={`rounded-xl border px-4 py-4 lg:col-span-2 ${statusPanelTone}`}>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Current assessment status</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {matrixStatus === 'pending_review' && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800" data-testid="status-matrix-pending">
                          Pending line manager sign-off
                        </Badge>
                      )}
                      {matrixStatus === 'approved' && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800" data-testid="status-matrix-approved">
                          Approved
                        </Badge>
                      )}
                      {matrixStatus === 'draft' && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-800" data-testid="status-matrix-draft">
                          Draft
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {matrixSubmission?.submittedDate && (
                        <span data-testid="text-colleague-submitted-date">
                          Submitted: {new Date(matrixSubmission.submittedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                        </span>
                      )}
                      {matrixSubmission?.approvedDate && (
                        <span data-testid="text-colleague-approved-date">
                          Approved: {new Date(matrixSubmission.approvedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                          {approverUser ? ` by ${approverUser.name}` : ''}
                        </span>
                      )}
                      {nextReviewDate && (
                        <span className={`font-medium flex items-center gap-1 ${reviewTone}`} data-testid="text-next-assessment-due">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          Next review: {nextReviewDate.toLocaleDateString('en-GB')}
                          {daysUntilReview !== null && (daysUntilReview < 0 ? ' (overdue)' : daysUntilReview <= 14 ? ' (due soon)' : '')}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="matrix-state-steps">
                      <div className={`rounded-md border px-2 py-1 text-xs ${matrixStatus !== 'draft' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'bg-background text-foreground'}`}>
                        1. Draft
                      </div>
                      <div className={`rounded-md border px-2 py-1 text-xs ${(matrixSubmission?.submittedDate || matrixStatus === 'pending_review' || matrixStatus === 'approved') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'bg-background text-muted-foreground'}`}>
                        2. Submitted
                      </div>
                      <div className={`rounded-md border px-2 py-1 text-xs ${matrixStatus === 'pending_review' || matrixStatus === 'approved' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'bg-background text-muted-foreground'}`}>
                        3. Pending review
                      </div>
                      <div className={`rounded-md border px-2 py-1 text-xs ${matrixStatus === 'approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'bg-background text-muted-foreground'}`}>
                        4. Approved
                      </div>
                    </div>

                    <p className="mt-3 text-sm font-medium text-foreground" data-testid="text-next-action-hint">{nextActionText}</p>
                  </div>

                  <div className={`rounded-xl border px-4 py-4 ${actionPanelTone}`}>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Next action</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <Button
                        onClick={openSelfAssessment}
                        className="gap-2 justify-start"
                        disabled={submitButtonDisabled}
                        data-testid="button-submit-matrix"
                      >
                        <Send className="h-4 w-4" />
                        {submitButtonLabel}
                      </Button>

                      <Button
                        onClick={handleShareLink}
                        variant="outline"
                        className="gap-2 justify-start"
                        disabled={generateShareToken.isPending}
                        data-testid="button-share-matrix"
                      >
                        <Share2 className="h-4 w-4" />
                        Share link
                      </Button>
                    </div>

                    {submitButtonDisabled && (
                      <p className="mt-3 text-xs text-muted-foreground" data-testid="text-submit-disabled-reason">
                        Already submitted. You can open a new assessment after manager sign-off.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-3" data-testid="matrix-snapshot-cards">
                <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Overall score</p>
                  <p className="text-xl font-semibold">{overallScore.toFixed(1)} / 4</p>
                </div>
                <div className="rounded-lg border border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100/60 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Completion</p>
                  <p className="text-xl font-semibold">{completionPercent}%</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/60 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Rated skills</p>
                  <p className="text-xl font-semibold">{ratedSkills} / {totalSkills}</p>
                </div>
              </div>

              {matrixSubmission?.submittedDate && (
                <p className="text-xs text-muted-foreground">
                  Current cycle submitted on {new Date(matrixSubmission.submittedDate + 'T00:00:00').toLocaleDateString('en-GB')}.
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <IndividualView
              name={currentUser.name}
              jobRole={currentUser.jobRole || 'Engineer'}
              department={currentUser.department}
              ratings={ratings}
              lastAssessment={lastAssessment}
              categories={categories}
              showBackButton={false}
              compact
            />
          </CardContent>
        </Card>

        {categories.length > 0 && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2 bg-gradient-to-b from-muted/10 to-background">
              <button
                type="button"
                onClick={() => setTimelineExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
                data-testid="button-toggle-progress-timeline"
              >
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Progress Timeline
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Track score history across submitted assessments.
                    <span className="ml-2 inline-flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        Approved
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                        Pending review
                      </span>
                    </span>
                  </CardDescription>
                </div>
                {timelineExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </CardHeader>

            {timelineExpanded ? (
              <CardContent>
                <TrainingProgressChart
                  userId={currentUser.id}
                  categories={categories}
                  nextReviewDate={matrixSubmission?.nextReviewDate}
                />
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-sm text-muted-foreground">Collapsed to keep focus on your current assessment.</p>
              </CardContent>
            )}
          </Card>
        )}

        <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
          <DialogContent className="max-w-4xl h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col [display:flex]" data-testid="dialog-submit-matrix">
            <TrainingMatrixWizard
              title="Self-Assessment"
              description={getSetting('page.training.assessmentInstructions')}
              sectionGroups={dialogSectionGroups.length > 0 ? dialogSectionGroups : [{ key: 'default', label: 'Training Matrix', sortOrder: 0, categories }]}
              ratings={dialogRatings}
              baselineRatings={ratings}
              competencyLevels={competencyLevels}
              onRate={setRating}
              onSubmit={handleSubmit}
              onCancel={() => setIsSubmitOpen(false)}
              onSaveDraft={handleSaveDraft}
              isSubmitting={createMatrix.isPending || updateMatrix.isPending}
              isSavingDraft={createMatrix.isPending || updateMatrix.isPending}
              submitLabel="Submit for sign-off"
              saveDraftLabel="Save draft"
              dataTestPrefix="dialog-wizard"
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogContent className="sm:max-w-md" data-testid="dialog-share-matrix">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-primary" />
                Shareable Link
              </DialogTitle>
              <DialogDescription>
                Share this link with someone so they can fill in the training matrix without logging in.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="text-sm"
                data-testid="input-share-url"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                data-testid="button-copy-share-link"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsShareOpen(false)} data-testid="button-close-share">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
