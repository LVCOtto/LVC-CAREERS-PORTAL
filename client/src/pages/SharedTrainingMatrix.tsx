import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRoute } from 'wouter';
import { usePortalSettings } from '@/lib/portalSettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useSharedTrainingMatrix, useUpdateSharedTrainingMatrix } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';
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

export default function SharedTrainingMatrix() {
  const competencyLevels = useCompetencyLevels();
  const [, params] = useRoute('/training-matrix/shared/:token');
  const token = params?.token || '';
  const { toast } = useToast();

  const { data, isLoading, error } = useSharedTrainingMatrix(token);
  const updateShared = useUpdateSharedTrainingMatrix();

  const [localRatings, setLocalRatings] = useState<Record<string, number> | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const categories = data?.competencies || [];
  const submission = data?.submission;
  const existingRatings = (submission?.ratings as Record<string, number>) || {};

  const ratings = localRatings ?? existingRatings;
  const sectionGroups = useMemo(() => groupCategoriesBySection(categories), [categories]);
  const totalItems = useMemo(
    () => categories.reduce((count: number, category: any) => count + category.items.length, 0),
    [categories]
  );
  const ratedItems = useMemo(
    () => categories.reduce((count: number, category: any) => count + category.items.filter((item: any) => ratings[item.slug] !== undefined).length, 0),
    [categories, ratings]
  );
  const completion = totalItems > 0 ? Math.round((ratedItems / totalItems) * 100) : 0;
  const statusLabel = submission?.status === 'pending_review'
    ? 'Pending review'
    : submission?.status === 'approved'
      ? 'Approved'
      : 'Draft in progress';
  const hasUnsavedChanges = useMemo(() => {
    const keys = new Set([...Object.keys(existingRatings), ...Object.keys(ratings)]);
    for (const key of keys) {
      if (existingRatings[key] !== ratings[key]) {
        return true;
      }
    }
    return false;
  }, [existingRatings, ratings]);
  const estimatedMinutes = Math.max(5, Math.round(totalItems * 0.4));

  useEffect(() => {
    if (!submission) return;
    setLocalRatings({ ...existingRatings });
  }, [token, submission?.id]);

  const setRating = useCallback((slug: string, value: number) => {
    setLocalRatings(prev => ({ ...(prev || {}), [slug]: value }));
  }, []);

  const handleSubmit = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await updateShared.mutateAsync({
        token,
        data: {
          ratings,
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

  const handleSaveDraft = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await updateShared.mutateAsync({
        token,
        data: {
          ratings,
          status: 'draft',
          lastAssessment: submission?.lastAssessment || today,
        },
      });
      toast({
        title: 'Progress saved',
        description: 'Your current ratings have been saved.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save progress.',
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-background to-background flex flex-col">
        <Toaster />
        <header className="border-b bg-white/95 backdrop-blur-sm shrink-0">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <img src="/favicon.png" alt="LVC" className="h-8 w-8" />
            <span className="font-display font-bold text-lg">LVC Training Matrix</span>
          </div>
        </header>

        <div className="max-w-4xl mx-auto w-full px-6 py-6 flex flex-col flex-1 min-h-0">
          <div className="mb-4 rounded-2xl border bg-gradient-to-br from-white to-muted/20 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Self-assessment link</p>
                  <h1 className="text-2xl font-display font-bold" data-testid="text-shared-user-name">{data.userName}</h1>
                  <p className="text-sm text-muted-foreground" data-testid="text-shared-user-role">
                    {data.jobRole} • {data.department}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
                {statusLabel}
              </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border bg-white/80 px-3 py-2">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-lg font-semibold">{ratedItems}/{totalItems} rated ({completion}%)</p>
              </div>
              <div className="rounded-lg border bg-white/80 px-3 py-2">
                <p className="text-xs text-muted-foreground">Estimated time</p>
                <p className="text-lg font-semibold inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> ~{estimatedMinutes} min</p>
              </div>
              <div className="rounded-lg border bg-white/80 px-3 py-2">
                <p className="text-xs text-muted-foreground">Save state</p>
                <p className="text-lg font-semibold inline-flex items-center gap-2">
                  {hasUnsavedChanges ? <Sparkles className="h-4 w-4 text-amber-600" /> : <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                  {hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 rounded-xl border bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-sm font-medium">Complete one section at a time. Save progress anytime, then submit for manager sign-off.</p>
            <p className="text-xs text-muted-foreground mt-1">This link is secure and only used for this assessment session.</p>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden rounded-xl border bg-white shadow-sm">
            <TrainingMatrixWizard
              title="Self-Assessment"
              description="Work through each section, review your ratings, and submit when ready."
              sectionGroups={sectionGroups.length > 0 ? sectionGroups : [{ key: 'default', label: 'Training Matrix', sortOrder: 0, categories }]}
              ratings={ratings}
              baselineRatings={existingRatings}
              competencyLevels={competencyLevels}
              onRate={setRating}
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              isSubmitting={updateShared.isPending}
              isSavingDraft={updateShared.isPending}
              submitLabel="Submit for sign-off"
              saveDraftLabel="Save progress"
              dataTestPrefix="shared-wizard"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
