import assert from "node:assert/strict";
import { test } from "node:test";
import type { TrainingMatrixSubmission } from "./schema";
import { assessmentAwaitingSignoff, assessmentsToSupersede, assessmentStatus, assessmentToResume, assessmentUpdateSchema, assertEditableAssessment, previousAssessment, ratingProgress, ratingsForSkills } from "./trainingAssessment";

function assessment(id: number, fields: Partial<TrainingMatrixSubmission> = {}): TrainingMatrixSubmission {
  return { id, userId: "member", status: "draft", ratings: {}, submittedDate: null,
    lastAssessment: null, approvedBy: null, approvedDate: null, nextReviewDate: null,
    shareToken: null, userNameSnapshot: null, departmentIdSnapshot: null,
    departmentSnapshot: null, jobRoleIdSnapshot: null, jobRoleSnapshot: null, ...fields };
}

test("new assessments start blank while existing drafts are resumed without changing answers", () => {
  const approved = assessment(1, { status: "approved", ratings: { first: 4 } });
  assert.equal(assessmentToResume([]), undefined);
  assert.equal(assessmentToResume([approved]), undefined);
  const draft = assessment(2, { ratings: { first: 0 } });
  assert.equal(assessmentToResume([approved, draft]), draft);
  assert.deepEqual(approved.ratings, { first: 4 });
  assert.deepEqual(draft.ratings, { first: 0 });
  assert.equal(assessmentToResume([assessment(0), approved]), undefined);
});

test("pending sign-off blocks new cycles even when an older client created another draft", () => {
  assert.throws(() => assessmentToResume([assessment(3), assessment(2, { status: "pending_review" })]), /awaiting manager sign-off/);
  assert.throws(() => assessmentToResume([assessment(1, { status: "unknown" })]), /current state/);
  const history = [assessment(2, { status: "approved" }), assessment(1, { status: "pending_review" })];
  assert.equal(assessmentAwaitingSignoff(history), false);
  assert.equal(assessmentToResume(history), undefined);
});

test("only the latest draft is editable; pending, approved and stale drafts stay read-only", () => {
  assert.doesNotThrow(() => assertEditableAssessment(assessment(2), 2));
  for (const record of [assessment(1), assessment(2, { status: "pending_review" }), assessment(2, { status: "approved" })]) {
    assert.throws(() => assertEditableAssessment(record, 2), /read-only/);
  }
});

test("historical comparison selects the previous submitted assessment, not a draft or a newer record", () => {
  const earlier = assessment(2, { status: "approved", ratings: { first: 3 }, submittedDate: "2026-09-01" });
  const result = previousAssessment([assessment(4, { status: "approved" }), assessment(3), earlier, assessment(1, { status: "approved" })], 4);
  assert.equal(result?.id, 2);
  assert.deepEqual(result?.ratings, { first: 3 });
  assert.equal(previousAssessment([earlier], 1), null);
});

test("progress counts only current answers; zero and unchanged scores are valid answers", () => {
  assert.deepEqual(ratingProgress(["first", "second"], {}), { total: 2, rated: 0, missing: ["first", "second"] });
  assert.deepEqual(ratingProgress(["first", "second"], { first: 0, second: 3 }), { total: 2, rated: 2, missing: [] });
  assert.deepEqual(ratingProgress(["first", "first", "second"], { first: 3 }), { total: 2, rated: 1, missing: ["second"] });
  assert.equal(ratingProgress(["first"], { unrelated: 4 }).rated, 0);
});

test("assessment updates reject invalid ratings, review metadata and invalid state changes", () => {
  for (const ratings of [{ first: -1 }, { first: 5 }, { first: 1.5 }, { first: "3" }]) {
    assert.equal(assessmentUpdateSchema.safeParse({ ratings, status: "draft" }).success, false);
  }
  assert.equal(assessmentUpdateSchema.safeParse({ ratings: {}, status: "approved" }).success, false);
  assert.equal(assessmentUpdateSchema.safeParse({ ratings: {}, status: "draft", approvedDate: "2026-10-08" }).success, false);
  assert.equal(assessmentUpdateSchema.safeParse({ ratings: { first: 0 }, status: "draft" }).success, true);
});

test("changed skill lists retain applicable draft answers but require new skills to be rated", () => {
  const saved = { first: 0, removed: 4 };
  const current = ratingsForSkills(saved, ["first", "new"]);
  assert.deepEqual(current, { first: 0 });
  assert.deepEqual(ratingProgress(["first", "new"], current).missing, ["new"]);
  assert.deepEqual(saved, { first: 0, removed: 4 });
});

test("legacy shared-link saves cannot disguise previously submitted records as editable drafts", () => {
  const legacyApproved = assessment(1, { submittedDate: "2026-09-01", approvedDate: "2026-09-02", approvedBy: "manager", ratings: { first: 4 } });
  assert.equal(assessmentStatus(legacyApproved), "approved");
  assert.equal(assessmentToResume([legacyApproved]), undefined);
  assert.throws(() => assertEditableAssessment(legacyApproved, 1), /read-only/);
  assert.equal(previousAssessment([legacyApproved], 2)?.id, 1);
  const legacyPending = assessment(2, { submittedDate: "2026-10-01" });
  assert.equal(assessmentStatus(legacyPending), "pending_review");
  assert.throws(() => assessmentToResume([legacyPending]), /awaiting manager/);
  assert.throws(() => assertEditableAssessment(legacyPending, 2), /read-only/);
  assert.deepEqual(legacyApproved.ratings, { first: 4 });
  assert.equal(legacyApproved.status, "draft");
});

test("manager resets supersede draft and pending work, but never approved results", () => {
  const approved = assessment(1, { status: "approved", ratings: { first: 4 } });
  const legacyApproved = assessment(2, { approvedBy: "manager", approvedDate: "2026-09-01" });
  const pending = assessment(3, { status: "pending_review", submittedDate: "2026-10-01", ratings: { first: 3 } });
  const draft = assessment(4, { ratings: { first: 2 } });
  assert.deepEqual(assessmentsToSupersede([approved, legacyApproved, pending, draft]), [3, 4]);
  const history = [assessment(5), { ...draft, status: "superseded" }, { ...pending, status: "superseded" }, approved];
  assert.equal(assessmentAwaitingSignoff(history), false);
  assert.equal(assessmentToResume(history)?.id, 5);
  assert.equal(previousAssessment(history, 5)?.id, 3);
  assert.deepEqual(previousAssessment(history, 5)?.ratings, { first: 3 });
  assert.throws(() => assertEditableAssessment(history[1], 5), /read-only/);
  assert.throws(() => assertEditableAssessment(history[2], 5), /read-only/);
});
