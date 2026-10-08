import { z } from "zod";
import type { CompetencyCategory, CompetencyItem, TrainingMatrixSubmission } from "./schema";

export const trainingRatingsSchema = z.record(z.number().int().min(0).max(4));
export const assessmentUpdateSchema = z.object({
  ratings: trainingRatingsSchema,
  status: z.enum(["draft", "pending_review"]),
}).strict();

export type TrainingRatings = z.infer<typeof trainingRatingsSchema>;
export type AssessmentUpdate = z.infer<typeof assessmentUpdateSchema>;
export type AssessmentReference = Pick<TrainingMatrixSubmission, "id" | "ratings" | "submittedDate" | "lastAssessment" | "status">;
export type TrainingAssessmentCategory = CompetencyCategory & {
  items: CompetencyItem[];
  sectionKey?: string;
  sectionLabel?: string;
  sectionSortOrder?: number;
  roleSortOrder?: number;
};
export type SharedTrainingAssessment = {
  submission: TrainingMatrixSubmission;
  previousAssessment: AssessmentReference | null;
  currentAssessment: Pick<TrainingMatrixSubmission, "id" | "status"> | null;
  awaitingSignoff: boolean;
  competencies: TrainingAssessmentCategory[];
  userName: string;
  jobRole: string;
  department: string;
};

export class TrainingAssessmentError extends Error {
  constructor(message: string, public readonly status: number = 409) {
    super(message);
    this.name = "TrainingAssessmentError";
  }
}

export function assessmentStatus(assessment: Pick<TrainingMatrixSubmission, "status" | "submittedDate" | "approvedDate" | "approvedBy">): string {
  if (assessment.status !== "draft") return assessment.status;
  if (assessment.approvedDate || assessment.approvedBy) return "approved";
  return assessment.submittedDate ? "pending_review" : "draft";
}

export function previousAssessment(history: TrainingMatrixSubmission[], currentId: number): AssessmentReference | null {
  const previous = history
    .filter(entry => entry.id < currentId && ["approved", "pending_review"].includes(assessmentStatus(entry)))
    .sort((a, b) => b.id - a.id)[0];
  return previous ? {
    id: previous.id, ratings: previous.ratings, submittedDate: previous.submittedDate,
    lastAssessment: previous.lastAssessment, status: assessmentStatus(previous),
  } : null;
}

export function assessmentAwaitingSignoff(history: TrainingMatrixSubmission[]): boolean {
  const latestSubmitted = [...history].sort((a, b) => b.id - a.id).find(entry => assessmentStatus(entry) !== "draft");
  return !!latestSubmitted && assessmentStatus(latestSubmitted) === "pending_review";
}

export function assessmentToResume(history: TrainingMatrixSubmission[]): TrainingMatrixSubmission | undefined {
  if (assessmentAwaitingSignoff(history)) {
    throw new TrainingAssessmentError("Your assessment is awaiting manager sign-off. A new assessment can be started after approval.");
  }
  const latest = [...history].sort((a, b) => b.id - a.id)[0];
  if (latest && assessmentStatus(latest) === "draft") return latest;
  if (latest && assessmentStatus(latest) !== "approved") {
    throw new TrainingAssessmentError("This assessment cannot be restarted in its current state.");
  }
  return undefined;
}

export function assertEditableAssessment(
  assessment: TrainingMatrixSubmission,
  latestId: number,
) {
  if (assessmentStatus(assessment) !== "draft" || assessment.id !== latestId) {
    throw new TrainingAssessmentError("This assessment is read-only. Open the current draft, or start a new assessment after approval.");
  }
}

export function ratingProgress(slugs: string[], ratings: TrainingRatings) {
  const applicable = Array.from(new Set(slugs));
  const missing = applicable.filter(slug => !Number.isInteger(ratings[slug]) || ratings[slug] < 0 || ratings[slug] > 4);
  return { total: applicable.length, rated: applicable.length - missing.length, missing };
}

export function ratingsForSkills(ratings: TrainingRatings, slugs: string[]): TrainingRatings {
  const applicable = new Set(slugs);
  return Object.fromEntries(Object.entries(ratings).filter(([slug]) => applicable.has(slug)));
}
