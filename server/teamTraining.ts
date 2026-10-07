import type { TeamTrainingRow } from "@shared/teamTraining";
import { summarizeTraining, trainingScore } from "@shared/teamTraining";
import type { CompetencyCategory, CompetencyItem } from "@shared/schema";
import { storage } from "./storage";

export async function getTeamTraining(managerId: string): Promise<TeamTrainingRow[]> {
  const members = await storage.getTeamMembers(managerId);
  const userIds = members.map((member) => member.id);
  const [submissions, requests] = await Promise.all([
    storage.getTrainingMatrixSubmissionsForUsers(userIds), storage.getTrainingMatrixRequests(userIds),
  ]);
  const requestByUser = new Map(requests.map((request) => [request.userId, request]));
  const histories = new Map<string, typeof submissions>();
  for (const submission of submissions) {
    const history = histories.get(submission.userId) ?? [];
    history.push(submission);
    histories.set(submission.userId, history);
  }
  const categoryCache = new Map<string, Promise<(CompetencyCategory & { items: CompetencyItem[] })[]>>();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const rows = await Promise.all(members.map(async (member): Promise<TeamTrainingRow> => {
    const summary = summarizeTraining(histories.get(member.id) ?? [], today);
    let score: number | null = null;
    if (summary.submitted) {
      const submission = summary.submitted;
      const role = submission.jobRoleIdSnapshot ?? submission.jobRoleSnapshot ?? member.jobRoleId ?? member.jobRole;
      const department = submission.departmentSnapshot || member.department || "Universal";
      const key = JSON.stringify([role, department]);
      if (!categoryCache.has(key)) {
        categoryCache.set(key, (async () => {
          const roleCategories = role ? await storage.getCompetencyCategoriesForJobRole(role) : null;
          if (roleCategories) return roleCategories.filter((category) => category !== null);
          const [categories, items] = await Promise.all([
            storage.getCompetencyCategories(department), storage.getCompetencyItems(),
          ]);
          return categories.map((category) => ({ ...category, items: items.filter((item) => item.categoryId === category.id) }));
        })());
      }
      const categories = await categoryCache.get(key)!;
      score = trainingScore(submission.ratings as Record<string, number>, categories.flatMap((category) => category.items.map((item) => item.slug)));
    }
    const request = requestByUser.get(member.id);
    const awaitingResponse = !!request && !request.respondedAt;
    return {
      userId: member.id, name: member.name, status: summary.status,
      needsAttention: summary.needsAttention, awaitingSignoff: summary.awaitingSignoff,
      lastSubmitted: summary.lastSubmitted, reviewDue: summary.reviewDue, score,
      requestSent: awaitingResponse ? request.sentAt : null, awaitingResponse,
    };
  }));
  return rows.sort((left, right) => Number(right.needsAttention) - Number(left.needsAttention) || left.name.localeCompare(right.name));
}