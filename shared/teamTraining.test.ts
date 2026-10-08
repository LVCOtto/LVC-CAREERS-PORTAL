import assert from "node:assert/strict";
import { test } from "node:test";
import type { TrainingMatrixSubmission } from "./schema";
import { summarizeTraining, trainingScore, isNewTrainingSubmission } from "./teamTraining";

function assessment(id: number, fields: Partial<TrainingMatrixSubmission> = {}): TrainingMatrixSubmission {
  return { id, userId: "member", status: "draft", ratings: {}, submittedDate: null,
    lastAssessment: null, approvedBy: null, approvedDate: null, nextReviewDate: null,
    shareToken: null, userNameSnapshot: null, departmentIdSnapshot: null,
    departmentSnapshot: null, jobRoleIdSnapshot: null, jobRoleSnapshot: null, ...fields };
}

test("missing assessments and drafts have never been completed", () => {
  for (const history of [[], [assessment(1)]]) {
    assert.equal(summarizeTraining(history, "2026-10-07").status, "never_completed");
  }
});

test("a draft preserves the previous submitted date and assessment", () => {
  const result = summarizeTraining([assessment(2), assessment(1, {
    status: "approved", submittedDate: "2026-09-01", nextReviewDate: "2027-03-01",
  })], "2026-10-07");
  assert.equal(result.status, "current");
  assert.equal(result.submitted?.id, 1);
  assert.equal(result.lastSubmitted, "2026-09-01");
});

test("expired training stays highlighted while a replacement awaits sign-off", () => {
  const result = summarizeTraining([assessment(2, { status: "pending_review", submittedDate: "2026-10-06" }),
    assessment(1, { status: "approved", nextReviewDate: "2026-10-01" })], "2026-10-07");
  assert.equal(result.status, "expired");
  assert.equal(result.needsAttention, true);
  assert.equal(result.awaitingSignoff, true);
  assert.equal(result.submitted?.id, 2);
});

test("a review due today is not expired; missing review dates are explicit", () => {
  assert.equal(summarizeTraining([assessment(1, { status: "approved", nextReviewDate: "2026-10-07" })], "2026-10-07").status, "current");
  assert.equal(summarizeTraining([assessment(1, { status: "approved" })], "2026-10-07").status, "review_missing");
  assert.equal(summarizeTraining([assessment(1, { status: "pending_review" })], "2026-10-07").status, "awaiting_signoff");
});

test("scores include unrated applicable competencies as zero, not unrelated ratings", () => {
  assert.equal(trainingScore({ first: 4, unrelated: 4 }, ["first", "second"]), 2);
  assert.equal(trainingScore({}, []), null);
});

test("only a new submission clears requests, including a same-day draft submission", () => {
  const draft = assessment(1);
  const submitted = assessment(1, { status: "pending_review", submittedDate: "2026-10-07" });
  assert.equal(isNewTrainingSubmission(draft, submitted), true);
  assert.equal(isNewTrainingSubmission(undefined, submitted), true);
  assert.equal(isNewTrainingSubmission(draft, draft), false);
  assert.equal(isNewTrainingSubmission(submitted, { ...submitted, status: "approved" }), false);
});

test("legacy shared-link drafts with submission metadata retain sign-off and review status", () => {
  assert.equal(summarizeTraining([assessment(1, {
    submittedDate: "2026-10-01",
  })], "2026-10-08").awaitingSignoff, true);
  const approved = summarizeTraining([assessment(1, {
    submittedDate: "2026-09-01", approvedDate: "2026-09-02", nextReviewDate: "2027-03-01",
  })], "2026-10-08");
  assert.equal(approved.status, "current");
  assert.equal(approved.reviewDue, "2027-03-01");
});

test("manager reset keeps submitted scores and review dates without counting a superseded draft as a submission", () => {
  const history = [assessment(4), assessment(3, { status: "superseded", ratings: { first: 0 } }),
    assessment(2, { status: "superseded", submittedDate: "2026-10-01", ratings: { first: 3 } }),
    assessment(1, { status: "approved", submittedDate: "2026-09-01", nextReviewDate: "2027-03-01" })];
  const summary = summarizeTraining(history, "2026-10-08");
  assert.equal(summary.submitted?.id, 2);
  assert.equal(summary.lastSubmitted, "2026-10-01");
  assert.equal(summary.reviewDue, "2027-03-01");
  assert.equal(summary.awaitingSignoff, false);
  assert.equal(summary.status, "current");
  assert.equal(isNewTrainingSubmission(history[1], history[0]), false);
});