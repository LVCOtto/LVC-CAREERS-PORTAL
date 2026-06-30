import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from 'lucide-react';

export type WizardCompetencyLevel = {
  value: number;
  label: string;
  description: string;
  color: string;
};

export type WizardSectionGroup = {
  key: string;
  label: string;
  sortOrder: number;
  categories: Array<{
    id?: number;
    slug: string;
    name: string;
    items: Array<{
      id: number;
      slug: string;
      name: string;
      description?: string | null;
    }>;
  }>;
};

type TrainingMatrixWizardProps = {
  title: string;
  description?: string;
  sectionGroups: WizardSectionGroup[];
  ratings: Record<string, number>;
  baselineRatings?: Record<string, number>;
  competencyLevels: WizardCompetencyLevel[];
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  saveDraftLabel?: string;
  onRate: (slug: string, value: number) => void;
  onSubmit: () => void;
  dataTestPrefix?: string;
};

type FlatItem = {
  id?: number;
  slug: string;
  name: string;
  description?: string | null;
  categoryName: string;
  sectionIndex: number;
  sectionLabel: string;
};

function getSectionLabel(section: WizardSectionGroup, index: number) {
  return section.label || `Section ${index + 1}`;
}

function RatingGuide({
  competencyLevels,
  expanded,
  onToggle,
}: {
  competencyLevels: WizardCompetencyLevel[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 rounded-lg border bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Rating guide (0-4)</p>
          <p className="text-xs text-muted-foreground">Choose the level that best matches each skill today.</p>
        </div>
        <span className="text-xs font-medium text-primary">{expanded ? 'Hide details' : 'Show details'}</span>
      </button>

      {expanded ? (
        <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {competencyLevels.map((level) => (
            <div key={level.value} className="flex items-start gap-2 rounded-md border bg-muted/20 px-2 py-1.5">
              <span
                className={`${level.color} mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-semibold`}
                aria-hidden="true"
              >
                {level.value}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium leading-tight">{level.label}</p>
                <p className="text-xs leading-tight text-muted-foreground">{level.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1">
          {competencyLevels.map((level) => (
            <div key={level.value} className="inline-flex items-center gap-1 rounded-full border bg-muted/20 px-2 py-0.5 text-xs">
              <span className={`${level.color} inline-flex h-4 w-4 items-center justify-center rounded text-[10px] font-semibold`}>
                {level.value}
              </span>
              <span className="text-muted-foreground">{level.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrainingMatrixWizard({
  title,
  description,
  sectionGroups,
  ratings,
  baselineRatings = {},
  competencyLevels,
  isSubmitting = false,
  submitLabel = 'Submit for sign-off',
  cancelLabel = 'Cancel',
  onCancel,
  onSaveDraft,
  isSavingDraft = false,
  saveDraftLabel = 'Save draft',
  onRate,
  onSubmit,
  dataTestPrefix = 'wizard',
}: TrainingMatrixWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [guideExpanded, setGuideExpanded] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [focusItemIndex, setFocusItemIndex] = useState(0);

  const steps = useMemo(() => {
    const normalized = sectionGroups.length > 0
      ? sectionGroups
      : [{ key: 'default', label: 'Training Matrix', sortOrder: 0, categories: [] }];
    return [...normalized, { key: '__review__', label: 'Review & Submit', sortOrder: Number.MAX_SAFE_INTEGER, categories: [] }];
  }, [sectionGroups]);

  const isReviewStep = stepIndex === steps.length - 1;
  const currentSection = isReviewStep ? null : steps[stepIndex];

  const allItems = useMemo<FlatItem[]>(() => {
    return sectionGroups.flatMap((section, sectionIndex) =>
      section.categories.flatMap((category) =>
        category.items.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description,
          categoryName: category.name,
          sectionIndex,
          sectionLabel: getSectionLabel(section, sectionIndex),
        }))
      )
    );
  }, [sectionGroups]);

  const totalItems = allItems.length;
  const ratedCount = useMemo(
    () => allItems.reduce((count, item) => (ratings[item.slug] !== undefined ? count + 1 : count), 0),
    [allItems, ratings]
  );

  const sectionItems = useMemo(() => {
    if (!currentSection) return [] as FlatItem[];
    return currentSection.categories.flatMap((category) =>
      category.items.map((item) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description,
        categoryName: category.name,
        sectionIndex: stepIndex,
        sectionLabel: getSectionLabel(currentSection, stepIndex),
      }))
    );
  }, [currentSection, stepIndex]);

  useEffect(() => {
    setFocusItemIndex(0);
    if (stepIndex === 0) {
      setGuideExpanded(true);
    }
  }, [stepIndex]);

  const sectionRatedCount = sectionItems.reduce(
    (count, item) => (ratings[item.slug] !== undefined ? count + 1 : count),
    0
  );

  const sectionMissing = sectionItems.filter((item) => ratings[item.slug] === undefined);
  const allMissing = allItems.filter((item) => ratings[item.slug] === undefined);
  const changedCount = allItems.filter((item) => baselineRatings[item.slug] !== undefined && baselineRatings[item.slug] !== ratings[item.slug]).length;
  const missingBySection = useMemo(
    () => Array.from(
      allMissing.reduce((map, item) => {
        const current = map.get(item.sectionIndex);
        if (current) {
          current.count += 1;
          current.items.push(item.name);
          return map;
        }
        map.set(item.sectionIndex, {
          sectionIndex: item.sectionIndex,
          sectionLabel: item.sectionLabel,
          count: 1,
          items: [item.name],
        });
        return map;
      }, new Map<number, { sectionIndex: number; sectionLabel: string; count: number; items: string[] }>())
      .values()
    ).sort((a, b) => a.sectionIndex - b.sectionIndex),
    [allMissing]
  );

  const overallProgress = totalItems > 0 ? Math.round((ratedCount / totalItems) * 100) : 0;
  const sectionProgress = sectionItems.length > 0 ? Math.round((sectionRatedCount / sectionItems.length) * 100) : 100;
  const focusItem = focusMode && sectionItems.length > 0 ? sectionItems[Math.min(focusItemIndex, sectionItems.length - 1)] : null;

  const back = () => setStepIndex((prev) => Math.max(0, prev - 1));
  const next = () => setStepIndex((prev) => Math.min(steps.length - 1, prev + 1));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b bg-gradient-to-b from-slate-50 to-white px-6 py-5">
        <div className="space-y-2">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span data-testid={`${dataTestPrefix}-overall-progress`}>
              {ratedCount} / {totalItems} rated
            </span>
            <span className="text-muted-foreground">{overallProgress}% complete</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="hidden text-xs text-muted-foreground lg:block">Follow sections in order, or jump using the section list.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFocusMode((prev) => !prev)}
            className="h-8"
            data-testid={`${dataTestPrefix}-toggle-focus-mode`}
          >
            {focusMode ? 'List mode' : 'Focus mode'}
          </Button>
        </div>

        <div className="mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 lg:hidden">
          {steps.slice(0, -1).map((step, index) => {
            const complete = index < stepIndex;
            const active = index === stepIndex && !isReviewStep;
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => setStepIndex(index)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : complete
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted/40'
                }`}
                data-testid={`${dataTestPrefix}-step-${index + 1}`}
              >
                {index + 1}. {getSectionLabel(step, index)}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setStepIndex(steps.length - 1)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors ${isReviewStep ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:bg-muted/40'}`}
          >
            Review
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {!isReviewStep && currentSection ? (
          <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-4 rounded-xl border bg-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sections</p>
                <div className="mt-2 space-y-1">
                  {steps.slice(0, -1).map((step, index) => {
                    const complete = index < stepIndex;
                    const active = index === stepIndex;
                    return (
                      <button
                        key={step.key}
                        type="button"
                        onClick={() => setStepIndex(index)}
                        className={`w-full rounded-lg border px-2 py-2 text-left text-xs transition-colors ${
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : complete
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        {index + 1}. {getSectionLabel(step, index)}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setStepIndex(steps.length - 1)}
                    className="w-full rounded-lg border border-border bg-background px-2 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40"
                  >
                    Review and submit
                  </button>
                </div>
              </div>
            </aside>

            <div className="space-y-4">
              <RatingGuide
                competencyLevels={competencyLevels}
                expanded={guideExpanded}
                onToggle={() => setGuideExpanded((prev) => !prev)}
              />

              <div className="sticky top-[4.65rem] z-10 rounded-lg border bg-muted/15 px-4 py-3 backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{getSectionLabel(currentSection, stepIndex)}</p>
                    <p className="text-xs text-muted-foreground">
                      Page {stepIndex + 1} of {steps.length - 1}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {sectionRatedCount}/{sectionItems.length} rated
                  </Badge>
                </div>
                <div className="mt-2">
                  <Progress value={sectionProgress} className="h-1.5" />
                </div>
                {sectionMissing.length > 0 ? (
                  <p className="mt-2 text-xs text-amber-700">{sectionMissing.length} item(s) still unrated in this section.</p>
                ) : (
                  <p className="mt-2 text-xs text-emerald-700">Section complete.</p>
                )}
              </div>

              {focusMode && focusItem ? (
                <div className="rounded-xl border bg-background p-4" data-testid={`${dataTestPrefix}-focus-item`}>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{focusItem.categoryName}</Badge>
                    <p className="text-xs text-muted-foreground">Item {focusItemIndex + 1} of {sectionItems.length}</p>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-base font-semibold">{focusItem.name}</p>
                    {focusItem.description ? <p className="text-sm text-muted-foreground">{focusItem.description}</p> : null}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border bg-muted/10 p-2">
                    {competencyLevels.map((level) => {
                      const isActive = ratings[focusItem.slug] === level.value;
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => onRate(focusItem.slug, level.value)}
                          aria-label={`Rate ${focusItem.name} as ${level.value} - ${level.label}`}
                          title={`${level.value}: ${level.label}`}
                          className={`h-10 w-10 rounded-lg text-sm font-semibold transition-all ${
                            isActive
                              ? `${level.color} scale-105 ring-2 ring-current ring-offset-1`
                              : 'bg-background text-muted-foreground ring-1 ring-border hover:bg-muted/40'
                          }`}
                        >
                          {level.value}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFocusItemIndex((prev) => Math.max(0, prev - 1))}
                      disabled={focusItemIndex === 0}
                    >
                      Previous skill
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setFocusItemIndex((prev) => Math.min(sectionItems.length - 1, prev + 1))}
                      disabled={focusItemIndex === sectionItems.length - 1}
                    >
                      Next skill
                    </Button>
                  </div>
                </div>
              ) : (
                currentSection.categories.map((category) => (
                  <div key={category.slug} className="rounded-lg border overflow-hidden bg-background">
                    <div className="border-b bg-muted/25 px-4 py-2">
                      <p className="text-sm font-semibold">{category.name}</p>
                    </div>
                    <div className="divide-y">
                      {category.items.map((item) => {
                        const currentRating = ratings[item.slug];
                        const previousRating = baselineRatings[item.slug];
                        const hasPrevious = previousRating !== undefined && previousRating !== currentRating;

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between"
                            data-testid={`${dataTestPrefix}-item-${item.slug}`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">{item.name}</p>
                              {item.description ? <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p> : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 rounded-xl border bg-muted/10 p-1">
                              {competencyLevels.map((level) => {
                                const isActive = currentRating === level.value;
                                const wasPrevious = hasPrevious && previousRating === level.value;
                                return (
                                  <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => onRate(item.slug, level.value)}
                                    title={`${level.value}: ${level.label}`}
                                    aria-label={`Rate ${item.name} as ${level.value} - ${level.label}`}
                                    className={`relative h-10 w-10 rounded-lg text-sm font-semibold transition-all ${
                                      isActive
                                        ? `${level.color} scale-105 ring-2 ring-current ring-offset-1`
                                        : wasPrevious
                                          ? `${level.color} opacity-35 ring-1 ring-current`
                                          : 'bg-background text-muted-foreground ring-1 ring-border hover:bg-muted/50'
                                    }`}
                                    data-testid={`${dataTestPrefix}-rate-${item.slug}-${level.value}`}
                                  >
                                    {level.value}
                                    {wasPrevious ? (
                                      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-muted-foreground/40" />
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/10 px-4 py-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-semibold">Review your assessment before submitting</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                You can jump back to any section to adjust scores.
              </p>
            </div>

            {allMissing.length > 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3">
                <p className="text-sm font-medium text-amber-800">
                  {allMissing.length} item(s) are still unrated.
                </p>
                <div className="mt-3 space-y-2">
                  {missingBySection.map((section) => (
                    <div key={section.sectionIndex} className="rounded-md border border-amber-200 bg-white/80 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-amber-900">Section {section.sectionIndex + 1}: {section.sectionLabel}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setStepIndex(section.sectionIndex)}
                          className="h-8"
                          data-testid={`${dataTestPrefix}-jump-section-${section.sectionIndex + 1}`}
                        >
                          Fix {section.count}
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-amber-800">
                        {section.items.slice(0, 3).join(', ')}{section.items.length > 3 ? '...' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                <p className="text-sm font-medium text-emerald-800">All items are rated. Ready to submit.</p>
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-3" data-testid={`${dataTestPrefix}-review-summary`}>
              <div className="rounded-lg border bg-muted/10 px-3 py-2">
                <p className="text-xs text-muted-foreground">Rated</p>
                <p className="text-lg font-semibold">{ratedCount} / {totalItems}</p>
              </div>
              <div className="rounded-lg border bg-muted/10 px-3 py-2">
                <p className="text-xs text-muted-foreground">Completion</p>
                <p className="text-lg font-semibold">{overallProgress}%</p>
              </div>
              <div className="rounded-lg border bg-muted/10 px-3 py-2">
                <p className="text-xs text-muted-foreground">Changed vs previous</p>
                <p className="text-lg font-semibold">{changedCount}</p>
              </div>
            </div>

            <div className="space-y-3">
              {sectionGroups.map((section, sectionIndex) => {
                const label = getSectionLabel(section, sectionIndex);
                const items = section.categories.flatMap((category) =>
                  category.items.map((item) => ({ slug: item.slug, categoryName: category.name, name: item.name }))
                );
                const sectionRated = items.filter((item) => ratings[item.slug] !== undefined).length;

                return (
                  <div key={section.key} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{label}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{sectionRated}/{items.length}</Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setStepIndex(sectionIndex)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 border-t bg-white/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onCancel ? (
              <Button type="button" variant="ghost" onClick={onCancel} data-testid={`${dataTestPrefix}-cancel`}>
                {cancelLabel}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={back}
              disabled={stepIndex === 0}
              className="gap-2"
              data-testid={`${dataTestPrefix}-back`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {onSaveDraft ? (
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSavingDraft || isSubmitting}
                data-testid={`${dataTestPrefix}-save-draft`}
              >
                {saveDraftLabel}
              </Button>
            ) : null}
          </div>

          {isReviewStep ? (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="gap-2"
              data-testid={`${dataTestPrefix}-submit`}
            >
              <Send className="h-4 w-4" />
              {submitLabel}
            </Button>
          ) : (
            <Button type="button" onClick={next} className="gap-2" data-testid={`${dataTestPrefix}-next`}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
