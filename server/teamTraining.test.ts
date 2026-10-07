import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { User, TrainingMatrixSubmission } from "@shared/schema";
import { storage } from "./storage";
import { getTeamTraining } from "./teamTraining";
import { registerRoutes } from "./routes";

const member: User = {
  id: "member", username: null, password: null, name: "Alex Smith", email: null,
  role: "colleague", jobRoleId: 1, jobRole: "Engineer", departmentId: null,
  department: "Service", managerId: "manager", startDate: "2026-01-01",
  requiresInduction: true, activated: true,
};

function assessment(id: number, fields: Partial<TrainingMatrixSubmission> = {}): TrainingMatrixSubmission {
  return { id, userId: member.id, status: "draft", ratings: {}, submittedDate: null,
    lastAssessment: null, approvedBy: null, approvedDate: null, nextReviewDate: null,
    shareToken: null, userNameSnapshot: null, departmentIdSnapshot: null,
    departmentSnapshot: null, jobRoleIdSnapshot: null, jobRoleSnapshot: null, ...fields };
}

test("summary batches only the manager's team and retains the submitted score behind a draft", async (context) => {
  context.mock.method(storage, "getTeamMembers", async (managerId: string) => {
    assert.equal(managerId, "manager");
    return [member, { ...member, id: "never", name: "Zoe Brown" }];
  });
  context.mock.method(storage, "getTrainingMatrixSubmissionsForUsers", async (ids: string[]) => {
    assert.deepEqual(ids, ["member", "never"]);
    return [assessment(2, { ratings: { first: 1 } }), assessment(1, {
      status: "approved", submittedDate: "2026-09-12", nextReviewDate: "2999-01-01", ratings: { first: 4 },
    })];
  });
  context.mock.method(storage, "getTrainingMatrixRequests", async () => [
    { userId: "member", sentAt: "2026-10-06T12:00:00Z", respondedAt: null },
    { userId: "never", sentAt: "2026-10-06T12:00:00Z", respondedAt: "2026-10-06T13:00:00Z" },
  ]);
  context.mock.method(storage, "getCompetencyCategoriesForJobRole", async () => [{
    id: 1, name: "Core", slug: "core", departmentId: null, departmentType: "Service", sortOrder: 0,
    sectionKey: "core", sectionLabel: "Core", sectionSortOrder: 0, roleSortOrder: 0,
    items: ["first", "second"].map((slug, index) => ({ id: index, slug, name: slug, description: null, sortOrder: index, categoryId: 1 })),
  }]);
  const rows = await getTeamTraining("manager");
  assert.equal(rows[0].userId, "never");
  assert.equal(rows[0].score, null);
  assert.equal(rows[0].requestSent, null);
  assert.equal(rows[1].score, 2);
  assert.equal(rows[1].lastSubmitted, "2026-09-12");
  assert.equal(rows[1].awaitingResponse, true);
  assert.equal(rows[1].requestSent, "2026-10-06T12:00:00Z");
});

test("summary and sent endpoints reject unauthenticated, colleague and other-team requests", async (context) => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.session = { userId: req.header("x-test-user"), role: req.header("x-test-role") } as typeof req.session;
    next();
  });
  context.mock.method(storage, "getUser", async () => ({ ...member, managerId: "other-manager" }));
  context.mock.method(storage, "getTeamMembers", async () => []);
  context.mock.method(storage, "getTrainingMatrixSubmissionsForUsers", async () => []);
  context.mock.method(storage, "getTrainingMatrixRequests", async () => []);
  const sent = context.mock.method(storage, "markTrainingMatrixSent", async () => {});
  const server = createServer(app);
  await registerRoutes(server, app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    assert.equal((await fetch(`${base}/api/training-matrix/team-summary`)).status, 401);
    assert.equal((await fetch(`${base}/api/training-matrix/team-summary`, { headers: { "x-test-user": "colleague", "x-test-role": "colleague" } })).status, 403);
    const managerHeaders = { "x-test-user": "manager", "x-test-role": "manager" };
    const summary = await fetch(`${base}/api/training-matrix/team-summary`, { headers: managerHeaders });
    assert.equal(summary.status, 200);
    assert.deepEqual(await summary.json(), []);
    assert.equal((await fetch(`${base}/api/training-matrix/requests/member/sent`, { method: "POST", headers: managerHeaders })).status, 403);
    assert.equal(sent.mock.callCount(), 0);
    assert.equal((await fetch(`${base}/api/training-matrix/requests/member/sent`, { method: "POST", headers: { "x-test-user": "admin", "x-test-role": "admin" } })).status, 204);
    assert.equal(sent.mock.callCount(), 1);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});