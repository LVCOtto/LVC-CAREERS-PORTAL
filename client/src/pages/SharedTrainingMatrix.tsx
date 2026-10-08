import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { usePortalSettings } from '@/lib/portalSettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useSharedTrainingMatrix, useStartSharedTrainingMatrix, useUpdateSharedTrainingMatrix } from '@/lib/hooks';
import { Spinner } from '@/components/ui/spinner';
import TrainingMatrixWizard from '@/components/TrainingMatrixWizard';
import { ratingsForSkills, trainingRatingsSchema, type TrainingRatings } from '@shared/trainingAssessment';

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
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data, isLoading, error } = useSharedTrainingMatrix(token);
  const updateShared = useUpdateSharedTrainingMatrix();
  const startShared = useStartSharedTrainingMatrix();

  const [localDraft, setLocalDraft] = useState<{ id: number; ratings: TrainingRatings } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const categories = data?.competencies || [];
  const submission = data?.submission;
  const readOnly = submission?.status !== 'draft' || submission?.id !== data?.currentAssessment?.id || !!data?.awaitingSignoff;
  const savedRatings = trainingRatingsSchema.parse(submission?.ratings || {});
  const skillSlugs = categories.flatMap(category => category.items.map(item => item.slug));
  const existingRatings = readOnly ? savedRatings : ratingsForSkills(savedRatings, skillSlugs);
  const previous = data?.previousAssessment;
  const previousRatings = trainingRatingsSchema.parse(previous?.ratings || {});
  const draftRatings = localDraft?.id === submission?.id ? localDraft?.ratings || existingRatings : existingRatings;
  const ratings = readOnly ? savedRatings : ratingsForSkills(draftRatings, skillSlugs);
  const removedDraftAnswers = !readOnly && Object.keys(savedRatings).some(slug => !skillSlugs.includes(slug));
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
    const keys = Object.keys({ ...existingRatings, ...ratings });
    return keys.some(key => existingRatings[key] !== ratings[key]);
  }, [existingRatings, ratings]);

  useEffect(() => {
    setSubmitted(false);
  }, [token]);

  const setRating = useCallback((slug: string, value: number) => {
    if (!submission) throw new Error('Open an assessment before rating skills.');
    setLocalDraft(prev => ({
      id: submission.id,
      ratings: { ...(prev?.id === submission.id ? prev.ratings : existingRatings), [slug]: value },
    }));
  }, [submission?.id, existingRatings]);

  const handleStart = async () => {
    try {
      const result = await startShared.mutateAsync(token);
      setLocalDraft(null);
      navigate(`/training-matrix/shared/${result.token}`);
    } catch (error) {
      toast({ title: 'Could not open assessment', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    }
  };

  const handleSubmit = async () => {
    try {
      await updateShared.mutateAsync({
        token,
        data: {
          ratings,
          status: 'pending_review',
        },
      });
      setSubmitted(true);
      toast({
        title: 'Submitted successfully',
        description: 'Your training matrix has been submitted for review.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit training matrix.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      const saved = await updateShared.mutateAsync({
        token,
        data: {
          ratings,
          status: 'draft',
        },
      });
      setLocalDraft({ id: saved.id, ratings: trainingRatingsSchema.parse(saved.ratings) });
      toast({
        title: 'Progress saved',
        description: 'Your current ratings have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save progress.',
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
              <p className="text-lg font-semibold text-destructive" data-testid="text-share-error">Unable to open assessment</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error?.message || 'This shareable link is invalid or has expired.'}
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
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{readOnly ? 'Saved assessment - read-only' : previous ? 'New self-assessment' : 'Self-assessment draft'}</p>
                  <h1 className="text-2xl font-display font-bold" data-testid="text-shared-user-name">{data.userName}</h1>
                  <p className="text-sm text-muted-foreground" data-testid="text-shared-user-role">
                    {data.jobRole} • {data.department}
                  </p>
                  {(submission?.submittedDate || submission?.lastAssessment) && <p className="mt-1 text-xs text-muted-foreground">
                    {readOnly ? 'Assessment date' : 'Started'}: {new Date((submission.submittedDate || submission.lastAssessment) + 'T00:00:00').toLocaleDateString('en-GB')}
                  </p>}
                </div>
              </div>
              <span className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
                {statusLabel}
              </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border bg-white/80 px-3 py-2">
                <p className="text-xs text-muted-foreground">{readOnly ? 'Saved results' : 'Progress for this assessment'}</p>
                <p className="text-lg font-semibold">{ratedItems}/{totalItems} rated ({completion}%)</p>
              </div>
              <div className="rounded-lg border bg-white/80 px-3 py-2">
                <p className="text-xs text-muted-foreground">Save state</p>
                <p className="text-lg font-semibold inline-flex items-center gap-2">
                  {hasUnsavedChanges ? <Sparkles className="h-4 w-4 text-amber-600" /> : <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                  {readOnly ? 'Read-only' : hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 rounded-xl border bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-sm font-medium">{readOnly
              ? 'These saved answers cannot be changed. A new assessment has its own answers and progress.'
              : 'Rate every skill for this assessment. Previous scores are reference only. Save progress anytime, then submit for manager sign-off.'}</p>
            {readOnly && (
              <Button className="mt-3" onClick={handleStart} disabled={data.awaitingSignoff || startShared.isPending}
                data-testid="button-start-shared-assessment">
                {startShared.isPending ? 'Opening assessment...' : data.awaitingSignoff
                  ? 'Awaiting manager sign-off' : data.currentAssessment?.status === 'draft' ? 'Continue current assessment' : 'Start new self-assessment'}
              </Button>
            )}
            {readOnly && data.awaitingSignoff && <p className="mt-2 text-xs text-muted-foreground">You can start a new assessment after manager approval.</p>}
            {!readOnly && <p className="text-xs text-muted-foreground mt-1">Selecting the same score as last time still counts as a new answer. Use 0 for no experience.</p>}
            {removedDraftAnswers && <p role="status" className="mt-2 text-xs text-amber-700">Your skill list has changed. Saved answers for removed skills will not be included in this draft; new skills need a rating.</p>}
            {readOnly && <p className="mt-2 text-xs text-muted-foreground">Saved scores are shown against your current skill list. Skills added later may have no saved score.</p>}
          </div>

          <div className="flex-1 min-h-0 overflow-hidden rounded-xl border bg-white shadow-sm">
            <TrainingMatrixWizard
              key={data.submission.id}
              title={readOnly ? 'Saved assessment' : previous ? 'New self-assessment' : 'Self-assessment draft'}
              description={readOnly ? 'View your saved results below.' : 'Work through each section, review your ratings, and submit this assessment for sign-off.'}
              sectionGroups={sectionGroups.length > 0 ? sectionGroups : [{ key: 'default', label: 'Training Matrix', sortOrder: 0, categories }]}
              ratings={ratings}
              previousRatings={readOnly ? {} : previousRatings}
              previousAssessmentDate={readOnly ? null : previous?.submittedDate || previous?.lastAssessment}
              readOnly={readOnly}
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
