import { useState, useMemo, useCallback } from 'react';
import { useRoute } from 'wouter';
import { usePortalSettings } from '@/lib/portalSettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  ChevronRight,
  Send,
  CheckCircle2,
  User as UserIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useSharedTrainingMatrix, useUpdateSharedTrainingMatrix } from '@/lib/hooks';
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

export default function SharedTrainingMatrix() {
  const competencyLevels = useCompetencyLevels();
  const [, params] = useRoute('/training-matrix/shared/:token');
  const token = params?.token || '';
  const { toast } = useToast();

  const { data, isLoading, error } = useSharedTrainingMatrix(token);
  const updateShared = useUpdateSharedTrainingMatrix();

  const [localRatings, setLocalRatings] = useState<Record<string, number> | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const categories = data?.competencies || [];
  const submission = data?.submission;
  const existingRatings = (submission?.ratings as Record<string, number>) || {};

  const ratings = localRatings ?? existingRatings;

  if (localRatings === null && categories.length > 0 && submission) {
    setLocalRatings({ ...existingRatings });
    setExpandedCategories(new Set(categories.map((c: any) => c.slug)));
  }

  const totalItems = useMemo(() => {
    let count = 0;
    categories.forEach((cat: any) => {
      count += cat.items.length;
    });
    return count;
  }, [categories]);

  const ratedCount = useMemo(() => {
    let count = 0;
    categories.forEach((cat: any) => {
      cat.items.forEach((item: any) => {
        if (ratings[item.slug] !== undefined) count++;
      });
    });
    return count;
  }, [ratings, categories]);

  const setRating = useCallback((slug: string, value: number) => {
    setLocalRatings(prev => ({ ...(prev || {}), [slug]: value }));
  }, []);

  const toggleCategory = useCallback((slug: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await updateShared.mutateAsync({
        token,
        data: {
          ratings: localRatings || {},
          status: 'pending_review',
          submittedDate: today,
          lastAssessment: today,
        },
      });
      setSubmitted(true);
      toast({
        title: 'Submitted successfully',
        description: 'Your training matrix has been submitted for review.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit training matrix.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster />
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <p className="text-lg font-semibold text-destructive" data-testid="text-share-error">Link not found</p>
              <p className="text-sm text-muted-foreground mt-2">
                This shareable link is invalid or has expired.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster />
        <header className="border-b bg-white">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <img src="/favicon.png" alt="LVC" className="h-8 w-8" />
            <span className="font-display font-bold text-lg">LVC Training Matrix</span>
          </div>
        </header>
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 65px)' }}>
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
              <p className="text-xl font-semibold" data-testid="text-share-success">Submitted successfully</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your training matrix self-assessment has been submitted for review by your line manager.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Toaster />
        <header className="border-b bg-white shrink-0">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <img src="/favicon.png" alt="LVC" className="h-8 w-8" />
            <span className="font-display font-bold text-lg">LVC Training Matrix</span>
          </div>
        </header>

        <div className="max-w-4xl mx-auto w-full px-6 py-6 flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold" data-testid="text-shared-user-name">{data.userName}</h1>
              <p className="text-sm text-muted-foreground" data-testid="text-shared-user-role">
                {data.jobRole} • {data.department}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-medium" data-testid="text-shared-progress-count">
                {ratedCount} / {totalItems} items rated
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {totalItems > 0 ? Math.round((ratedCount / totalItems) * 100) : 0}%
              </span>
            </div>
          </div>
          <Progress value={totalItems > 0 ? (ratedCount / totalItems) * 100 : 0} className="h-2 mb-4" data-testid="progress-shared-rated" />

          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border mb-4">
            {competencyLevels.map((level) => (
              <div key={level.value} className="flex items-center gap-1.5">
                <div className={`${level.color} w-6 h-6 rounded flex items-center justify-center font-semibold text-xs`}>
                  {level.value}
                </div>
                <span className="text-xs text-muted-foreground">{level.label}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-auto space-y-3 mb-6">
            {categories.map((category: any) => {
              const isExpanded = expandedCategories.has(category.slug);
              const categoryRatedCount = category.items.filter((item: any) => ratings[item.slug] !== undefined).length;
              return (
                <div key={category.slug} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.slug)}
                    className="w-full flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 transition-colors"
                    data-testid={`shared-category-toggle-${category.slug}`}
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
                        const currentRating = ratings[item.slug];
                        const previousRating = existingRatings[item.slug];
                        const hasPrevious = previousRating !== undefined && previousRating !== currentRating;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 hover:bg-muted/10 gap-3"
                            data-testid={`shared-competency-row-${item.slug}`}
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
                                    data-testid={`shared-rating-btn-${item.slug}-${level.value}`}
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

          <div className="border-t pt-4 bg-background shrink-0">
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                className="gap-2"
                disabled={updateShared.isPending}
                data-testid="button-shared-submit"
              >
                <Send className="h-4 w-4" />
                Submit for sign-off
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
