import type { TrainingMatrixSubmission } from "./schema";

export type TeamTrainingStatus = "never_completed" | "expired" | "awaiting_signoff" | "review_missing" | "current";

export interface TeamTrainingRow {
  userId: string;
  name: string;
  status: TeamTrainingStatus;
  needsAttention: boolean;
  awaitingSignoff: boolean;
  lastSubmitted: string | null;
  score: number | null;
  reviewDue: string | null;
  requestSent: string | null;
  awaitingResponse: boolean;
}

export function summarizeTraining(
  history: TrainingMatrixSubmission[],
  today: string,
) {
  const ordered = [...history].sort((left, right) => right.id - left.id);
  const submitted = ordered.find((entry) => entry.submittedDate || entry.status === "pending_review" || entry.status === "approved");
  const approved = ordered.find((entry) => entry.status === "approved");
  const reviewDue = approved?.nextReviewDate ?? null;
  const expired = !!reviewDue && reviewDue < today;
  const awaitingSignoff = submitted?.status === "pending_review";
  const status: TeamTrainingStatus = !submitted ? "never_completed"
    : expired ? "expired"
    : awaitingSignoff ? "awaiting_signoff"
    : !reviewDue ? "review_missing" : "current";
  return {
    submitted,
    status,
    needsAttention: status === "never_completed" || expired,
    awaitingSignoff,
    lastSubmitted: submitted?.submittedDate ?? submitted?.lastAssessment ?? null,
    reviewDue,
  };
}

export function trainingScore(ratings: Record<string, number>, slugs: string[]): number | null {
  if (!slugs.length) return null;
  return slugs.reduce((total, slug) => total + (ratings[slug] ?? 0), 0) / slugs.length;
}

export function isNewTrainingSubmission(previous: TrainingMatrixSubmission | undefined, next: TrainingMatrixSubmission): boolean {
  return !!next.submittedDate && (!previous?.submittedDate || next.submittedDate !== previous.submittedDate
    || (previous.status === "draft" && next.status === "pending_review"));
}