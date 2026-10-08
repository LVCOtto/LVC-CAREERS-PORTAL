import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import express from "express";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { InsertTrainingMatrixSubmission, TrainingMatrixSubmission, User } from "@shared/schema";
import { assertEditableAssessment, assessmentToResume, TrainingAssessmentError } from "@shared/trainingAssessment";
import { storage } from "./storage";
import { registerRoutes } from "./routes";
import { db } from "./db";

const member: User = {
  id: "member", username: null, password: null, name: "Test Member", email: null,
  role: "colleague", jobRoleId: 1, jobRole: "Engineer", departmentId: 1,
  department: "Engineering", managerId: "manager", startDate: "2026-01-01",
  requiresInduction: true, activated: true,
};

function assessment(id: number, fields: Partial<TrainingMatrixSubmission> = {}): TrainingMatrixSubmission {
  return { id, userId: member.id, status: "draft", ratings: {}, submittedDate: null,
    lastAssessment: null, approvedBy: null, approvedDate: null, nextReviewDate: null,
    shareToken: null, userNameSnapshot: null, departmentIdSnapshot: null,
    departmentSnapshot: null, jobRoleIdSnapshot: null, jobRoleSnapshot: null, ...fields };
}

async function harness(context: TestContext, initial: TrainingMatrixSubmission[]) {
  let history = [...initial];
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.session = { userId: req.header("x-test-user"), role: req.header("x-test-role") } as typeof req.session;
    next();
  });
  context.mock.method(storage, "getUser", async () => member);
  context.mock.method(storage, "getTrainingMatrixHistory", async () => [...history].sort((a, b) => b.id - a.id));
  context.mock.method(storage, "getTrainingMatrixSubmission", async () => [...history].sort((a, b) => b.id - a.id)[0]);
  context.mock.method(storage, "getTrainingMatrixSubmissionById", async (id: number) => history.find(entry => entry.id === id));
  context.mock.method(storage, "getTrainingMatrixByToken", async (token: string) => history.find(entry => entry.shareToken === token));
  context.mock.method(storage, "getCompetencyCategoriesForJobRole", async () => [{
    id: 1, name: "Core", slug: "core", departmentId: 1, departmentType: "Engineering", sortOrder: 0,
    sectionKey: "core", sectionLabel: "Core", sectionSortOrder: 0, roleSortOrder: 0,
    items: ["first", "second"].map((slug, index) => ({ id: index + 1, slug, name: slug, description: null, sortOrder: index, categoryId: 1 })),
  }]);
  const start = context.mock.method(storage, "startTrainingMatrixAssessment", async (userId: string) => {
    assert.equal(userId, member.id);
    const draft = assessmentToResume(history);
    if (draft) return draft;
    const created = assessment(Math.max(0, ...history.map(entry => entry.id)) + 1, {
      lastAssessment: "2026-10-08", nextReviewDate: history.find(entry => entry.status === "approved")?.nextReviewDate || null,
    });
    history = [created, ...history];
    return created;
  });
  const update = context.mock.method(storage, "updateTrainingMatrixSubmission", async (
    id: number, data: Partial<InsertTrainingMatrixSubmission>, mode: "assessment" | "review",
  ) => {
    const existing = history.find(entry => entry.id === id);
    if (!existing) return undefined;
    if (mode === "assessment") assertEditableAssessment(existing, Math.max(...history.map(entry => entry.id)));
    else if (data.status === "approved" && existing.status !== "pending_review") throw new TrainingAssessmentError("Only pending assessments can be approved.");
    const saved = { ...existing, ...data };
    history = history.map(entry => entry.id === id ? saved : entry);
    return saved;
  });
  context.mock.method(storage, "generateShareToken", async (id: number) => {
    const record = history.find(entry => entry.id === id);
    if (!record) throw new Error("Missing test assessment");
    record.shareToken ||= `token-${id}`;
    return record.shareToken;
  });
  const server = createServer(app);
  await registerRoutes(server, app);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  context.after(async () => {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const request = (path: string, method = "GET", body?: unknown, role?: string, userId = member.id) =>
    fetch(`${base}/api/training-matrix${path}`, { method,
      headers: { "Content-Type": "application/json", ...(role ? { "x-test-user": userId, "x-test-role": role } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  return { request, history: () => history, start, update };
}

test("portal and shared starts create a separate blank draft, resume it and preserve the previous record", async context => {
  const original = assessment(1, { status: "approved", ratings: { first: 4, second: 3 }, submittedDate: "2026-09-01", shareToken: "old", nextReviewDate: "2027-03-01" });
  const { request, history } = await harness(context, [original]);
  const started = await request("/start", "POST", { userId: member.id }, "colleague");
  assert.equal(started.status, 200);
  const draft = await started.json();
  assert.equal(draft.id, 2);
  assert.deepEqual(draft.ratings, {});
  assert.equal(draft.nextReviewDate, original.nextReviewDate);
  const repeated = await request("/shared/old/start", "POST");
  assert.equal(repeated.status, 200);
  const shared = await repeated.json();
  assert.equal(shared.submission.id, 2);
  assert.equal(history().length, 2);
  const contextResponse = await request(`/shared/${shared.token}`);
  const data = await contextResponse.json();
  assert.equal(data.previousAssessment.id, 1);
  assert.deepEqual(data.previousAssessment.ratings, original.ratings);
  assert.deepEqual(history().find(entry => entry.id === 1), original);
});

test("copying a completed assessment link and marking a request do not start or reset its cycle", async context => {
  const original = assessment(1, { status: "approved", ratings: { first: 4 }, submittedDate: "2026-09-01", shareToken: "old" });
  const { request, history, start, update } = await harness(context, [original]);
  const sent = context.mock.method(storage, "markTrainingMatrixSent", async () => {});
  assert.equal((await request("/share", "POST", { userId: member.id }, "manager", "manager")).status, 200);
  assert.equal((await request("/requests/member/sent", "POST", undefined, "manager", "manager")).status, 204);
  assert.equal(sent.mock.callCount(), 1);
  assert.equal(start.mock.callCount(), 0);
  assert.equal(update.mock.callCount(), 0);
  assert.deepEqual(history(), [original]);
});

test("all applicable skills are required at both submission endpoints; zero is valid", async context => {
  const { request, update } = await harness(context, [assessment(1, { shareToken: "draft" })]);
  for (const path of ["/1", "/shared/draft"]) {
    const role = path === "/1" ? "colleague" : undefined;
    assert.equal((await request(path, "PATCH", { ratings: { first: 3 }, status: "pending_review" }, role)).status, 400);
    assert.equal((await request(path, "PATCH", { ratings: { first: 3, second: 5 }, status: "pending_review" }, role)).status, 400);
    assert.equal((await request(path, "PATCH", { ratings: { first: 3, second: 0, retired: 4 }, status: "pending_review" }, role)).status, 400);
  }
  assert.equal(update.mock.callCount(), 0);
  const saved = await request("/shared/draft", "PATCH", { ratings: { first: 3 }, status: "draft" });
  assert.equal(saved.status, 200);
  const submitted = await request("/1", "PATCH", { ratings: { first: 3, second: 0 }, status: "pending_review" }, "colleague");
  assert.equal(submitted.status, 200);
  const record = await submitted.json();
  assert.equal(record.status, "pending_review");
  assert.match(record.submittedDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(record.approvedDate, null);
});

test("completed and stale drafts cannot be overwritten by either entry route", async context => {
  const records = [assessment(3, { shareToken: "current" }), assessment(2, { shareToken: "stale" }),
    assessment(1, { status: "approved", ratings: { first: 4, second: 4 }, shareToken: "old" })];
  const { request, history } = await harness(context, records);
  const saved = structuredClone(records);
  for (const path of ["/1", "/2", "/shared/old", "/shared/stale"]) {
    assert.equal((await request(path, "PATCH", { ratings: { first: 0, second: 0 }, status: "draft" }, path.startsWith("/shared") ? undefined : "colleague")).status, 409);
  }
  assert.deepEqual(history(), saved);
});

test("pending assessments stay read-only, block new starts and permit manager approval", async context => {
  context.mock.method(db.query.outlookIntegrations, "findFirst", async () => undefined);
  const { request, history } = await harness(context, [assessment(1, {
    status: "pending_review", ratings: { first: 3, second: 0 }, submittedDate: "2026-10-08", shareToken: "pending",
  })]);
  assert.equal((await request("/start", "POST", { userId: member.id }, "colleague")).status, 409);
  assert.equal((await request("/shared/pending/start", "POST")).status, 409);
  assert.equal((await request("/shared/pending", "PATCH", { ratings: { first: 4, second: 4 }, status: "draft" })).status, 409);
  assert.equal((await request("/1", "PATCH", { status: "approved" }, "colleague")).status, 400);
  const approved = await request("/1", "PATCH", {
    status: "approved", approvedBy: "spoofed", approvedDate: "2000-01-01", nextReviewDate: "2027-04-08",
  }, "manager", "manager");
  assert.equal(approved.status, 200);
  assert.equal(history()[0].approvedBy, "manager");
  assert.notEqual(history()[0].approvedDate, "2000-01-01");
  assert.deepEqual(history()[0].ratings, { first: 3, second: 0 });
  assert.equal((await request("/1", "PATCH", { nextReviewDate: "2027-05-08" }, "manager", "manager")).status, 200);
});

test("start endpoints enforce access and legacy create cannot inject completed assessments", async context => {
  const { request } = await harness(context, []);
  assert.equal((await request("/start", "POST", { userId: member.id })).status, 401);
  assert.equal((await request("/start", "POST", { userId: "someone-else" }, "colleague")).status, 403);
  assert.equal((await request("/shared/missing/start", "POST")).status, 404);
  assert.equal((await request("", "POST", { userId: member.id, status: "approved", ratings: { first: 4 } }, "colleague")).status, 400);
  assert.equal((await request("", "POST", { userId: member.id, status: "draft", ratings: {} }, "colleague")).status, 200);
});
