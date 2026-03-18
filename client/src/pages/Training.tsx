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
import { useCompetencies, useCompetenciesForRole, useTrainingMatrixForUser, useCreateTrainingMatrix, useUpdateTrainingMatrix, useGenerateShareToken } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';

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
}: {
  name: string;
  jobRole: string;
  department: string;
  ratings: Record<string, number>;
  lastAssessment?: string;
  categories: any[];
  onBack?: () => void;
  showBackButton?: boolean;
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([categories[0]?.slug]));
  const overallAvg = calculateOverallAverage(ratings, categories);

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.slice(0, 4).map((category: any) => {
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

      <CompetencyLegend />

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
    </div>
  );
}

export default function Training() {
  const { currentUser } = useAuth();
  const { getSetting } = usePortalSettings();
  const competencyLevels = useCompetencyLevels();
  const { toast } = useToast();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [dialogRatings, setDialogRatings] = useState<Record<string, number>>({});
  const [dialogExpandedCategories, setDialogExpandedCategories] = useState<Set<string>>(new Set());
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const isEngineeringUser = (currentUser?.department || '').toLowerCase().includes('engineering');
  const departmentType = isEngineeringUser ? 'engineering' : 'admin';

  const { data: roleCategories, isLoading: roleLoading } = useCompetenciesForRole(currentUser?.jobRole);
  const { data: deptCategories = [], isLoading: deptLoading } = useCompetencies(departmentType);
  const categories = roleCategories || deptCategories;
  const categoriesLoading = roleLoading || deptLoading;
  const { data: matrixSubmission, isLoading: matrixLoading } = useTrainingMatrixForUser(currentUser?.id || '');
  const createMatrix = useCreateTrainingMatrix();
  const updateMatrix = useUpdateTrainingMatrix();
  const generateShareToken = useGenerateShareToken();

  const totalItems = useMemo(() => {
    let count = 0;
    categories.forEach((cat: any) => { count += cat.items.length; });
    return count;
  }, [categories]);

  const ratedCount = useMemo(() => {
    let count = 0;
    categories.forEach((cat: any) => {
      cat.items.forEach((item: any) => {
        if (dialogRatings[item.slug] !== undefined) count++;
      });
    });
    return count;
  }, [dialogRatings, categories]);

  const setRating = useCallback((slug: string, value: number) => {
    setDialogRatings(prev => ({ ...prev, [slug]: value }));
  }, []);

  const toggleDialogCategory = useCallback((slug: string) => {
    setDialogExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

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
  const lastAssessment = matrixSubmission?.lastAssessment || undefined;

  const openSelfAssessment = () => {
    if (matrixStatus === 'approved') {
      setDialogRatings({});
    } else {
      setDialogRatings({ ...ratings });
    }
    setDialogExpandedCategories(new Set(categories.map((c: any) => c.slug)));
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
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">{getSetting('page.training.heading')}</h1>
            <p className="text-muted-foreground mt-1">{getSetting('page.training.description')}</p>
          </div>
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
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  My Training Matrix
                </CardTitle>
                <CardDescription>
                  Your self-assessment ratings. Submit when you&apos;re happy — your line manager will review and sign it off.
                </CardDescription>
              </div>

              {isColleague && (
                <div className="flex items-center gap-2">
                  {matrixStatus === 'pending_review' && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800" data-testid="status-matrix-pending">
                      Pending line manager sign-off
                    </Badge>
                  )}
                  {matrixStatus === 'approved' && (
                    <>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800" data-testid="status-matrix-approved">
                        Approved
                      </Badge>
                      {matrixSubmission?.nextReviewDate && (
                        <span className={`text-sm font-medium flex items-center gap-1.5 ${(() => {
                          const due = new Date(matrixSubmission.nextReviewDate + 'T00:00:00');
                          const daysUntil = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return daysUntil < 0 ? 'text-red-600' : daysUntil <= 14 ? 'text-amber-600' : 'text-muted-foreground';
                        })()}`} data-testid="text-next-assessment-due">
                          <CalendarIcon className="w-4 h-4" />
                          Next assessment due: {new Date(matrixSubmission.nextReviewDate + 'T00:00:00').toLocaleDateString('en-GB')}
                          {(() => {
                            const due = new Date(matrixSubmission.nextReviewDate + 'T00:00:00');
                            const daysUntil = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return daysUntil < 0 ? ' (overdue)' : daysUntil <= 14 ? ' (due soon)' : '';
                          })()}
                        </span>
                      )}
                    </>
                  )}
                  {matrixStatus === 'draft' && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-800" data-testid="status-matrix-draft">
                      Draft
                    </Badge>
                  )}

                  {matrixSubmission?.submittedDate && (
                    <span className="text-xs text-muted-foreground" data-testid="text-colleague-submitted-date">
                      Submitted: {new Date(matrixSubmission.submittedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                    </span>
                  )}
                  {matrixSubmission?.approvedDate && (
                    <span className="text-xs text-muted-foreground" data-testid="text-colleague-approved-date">
                      Approved: {new Date(matrixSubmission.approvedDate + 'T00:00:00').toLocaleDateString('en-GB')}
                    </span>
                  )}

                  <Button
                    onClick={openSelfAssessment}
                    className="gap-2"
                    disabled={matrixStatus === 'pending_review'}
                    data-testid="button-submit-matrix"
                  >
                    <Send className="h-4 w-4" />
                    {matrixStatus === 'approved' ? 'Start new self-assessment' : 'Submit training matrix'}
                  </Button>
                </div>
              )}

            </div>
          </CardHeader>
          <CardContent>
            <IndividualView
              name={currentUser.name}
              jobRole={currentUser.jobRole || 'Engineer'}
              department={currentUser.department}
              ratings={ratings}
              lastAssessment={lastAssessment}
              categories={categories}
              showBackButton={false}
            />
          </CardContent>
        </Card>

        <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
          <DialogContent className="max-w-4xl h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col [display:flex]" data-testid="dialog-submit-matrix">
            <div className="px-6 py-5 border-b bg-gradient-to-b from-slate-50 to-white shrink-0">
              <DialogHeader>
                <DialogTitle className="text-xl font-display">Self-Assessment</DialogTitle>
                <DialogDescription>
                  {getSetting('page.training.assessmentInstructions')}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" data-testid="text-progress-count">{ratedCount} / {totalItems} items rated</span>
                    <span className="text-xs text-muted-foreground">{totalItems > 0 ? Math.round((ratedCount / totalItems) * 100) : 0}%</span>
                  </div>
                  <Progress value={totalItems > 0 ? (ratedCount / totalItems) * 100 : 0} className="h-2" data-testid="progress-rated" />
                </div>
              </div>
              <div className="mt-3">
                <CompetencyLegend />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="px-6 py-4 space-y-3">
                {categories.map((category: any) => {
                  const isExpanded = dialogExpandedCategories.has(category.slug);
                  const categoryRatedCount = category.items.filter((item: any) => dialogRatings[item.slug] !== undefined).length;
                  return (
                    <div key={category.slug} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleDialogCategory(category.slug)}
                        className="w-full flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 transition-colors"
                        data-testid={`dialog-category-toggle-${category.slug}`}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <span className="font-medium text-sm">{category.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {categoryRatedCount}/{category.items.length}
                          </Badge>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="divide-y">
                          {category.items.map((item: any) => {
                            const currentRating = dialogRatings[item.slug];
                            const previousRating = ratings[item.slug];
                            const hasPrevious = previousRating !== undefined && previousRating !== currentRating;
                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 hover:bg-muted/10 gap-3"
                                data-testid={`dialog-competency-row-${item.slug}`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{item.name}</p>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {competencyLevels.map((level) => {
                                    const isActive = currentRating === level.value;
                                    const wasPrevious = hasPrevious && previousRating === level.value;
                                    return (
                                      <button
                                        key={level.value}
                                        onClick={() => setRating(item.slug, level.value)}
                                        className={`relative w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                                          isActive
                                            ? `${level.color} ring-2 ring-offset-1 ring-current scale-110`
                                            : wasPrevious
                                              ? `${level.color} opacity-30 ring-1 ring-current`
                                              : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                                        }`}
                                        title={wasPrevious ? `Previous rating: ${level.label}` : level.label}
                                        data-testid={`rating-btn-${item.slug}-${level.value}`}
                                      >
                                        {level.value}
                                        {wasPrevious && (
                                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-muted-foreground/40" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-white shrink-0">
              <DialogFooter className="sm:justify-between">
                <Button variant="ghost" onClick={() => setIsSubmitOpen(false)} data-testid="button-cancel-submit">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="gap-2"
                  disabled={createMatrix.isPending || updateMatrix.isPending}
                  data-testid="button-confirm-submit"
                >
                  <Send className="h-4 w-4" />
                  Submit for sign-off
                </Button>
              </DialogFooter>
            </div>
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
