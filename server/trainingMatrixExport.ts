import type { CompetencyCategory, CompetencyItem, TrainingMatrixSubmission, User } from "@shared/schema";
import { storage } from "./storage";

type ExportScope = "all" | "department" | "team" | "user";
type ExportHistory = "latest" | "all";
type ExportDetail = "summary" | "competency";

type ExportMeta = {
  userId: string;
  userName: string;
  departmentId: number | null;
  department: string;
  jobRoleId: number | null;
  jobRole: string;
};

type ExportCategory = CompetencyCategory & { items: CompetencyItem[] };

type SummaryRow = Record<string, string | number | null>;
type DetailRow = Record<string, string | number | null>;

export interface TrainingMatrixExportParams {
  scope: ExportScope;
  history: ExportHistory;
  detail: ExportDetail;
  userId?: string;
  departmentId?: number;
  department?: string;
  managerId?: string;
}

function normalizeLookup(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function csvCell(value: unknown) {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: Array<Record<string, string | number | null>>) {
  const headerLine = headers.map(csvCell).join(",");
  const rowLines = rows.map((row) => headers.map((header) => csvCell(row[header])).join(","));
  return [headerLine, ...rowLines].join("\n");
}

function pickLatestPerUser(submissions: TrainingMatrixSubmission[]) {
  const latest = new Map<string, TrainingMatrixSubmission>();
  for (const submission of [...submissions].sort((left, right) => right.id - left.id)) {
    if (!latest.has(submission.userId)) {
      latest.set(submission.userId, submission);
    }
  }
  return [...latest.values()].sort((left, right) => right.id - left.id);
}

function buildMeta(submission: TrainingMatrixSubmission, user?: User): ExportMeta {
  return {
    userId: submission.userId,
    userName: submission.userNameSnapshot || user?.name || submission.userId,
    departmentId: submission.departmentIdSnapshot ?? user?.departmentId ?? null,
    department: submission.departmentSnapshot || user?.department || "",
    jobRoleId: submission.jobRoleIdSnapshot ?? user?.jobRoleId ?? null,
    jobRole: submission.jobRoleSnapshot || user?.jobRole || "",
  };
}

async function resolveScopeUserIds(params: TrainingMatrixExportParams, allUsers: User[]) {
  if (params.scope === "all") {
    return new Set(allUsers.map((user) => user.id));
  }

  if (params.scope === "user") {
    return new Set(params.userId ? [params.userId] : []);
  }

  if (params.scope === "team") {
    const managerId = params.managerId;
    if (!managerId) return new Set<string>();
    const teamMembers = await storage.getTeamMembers(managerId);
    return new Set(teamMembers.map((member) => member.id));
  }

  const departmentName = params.department ? normalizeLookup(params.department) : null;
  return new Set(
    allUsers
      .filter((user) => {
        if (params.departmentId !== undefined && params.departmentId !== null) {
          return user.departmentId === params.departmentId;
        }
        if (departmentName) {
          return normalizeLookup(user.department) === departmentName;
        }
        return false;
      })
      .map((user) => user.id)
  );
}

async function resolveCategories(meta: ExportMeta, cache: Map<string, Promise<ExportCategory[]>>) {
  const roleKey = meta.jobRoleId != null
    ? `role-id:${meta.jobRoleId}`
    : meta.jobRole
    ? `role:${normalizeLookup(meta.jobRole)}`
    : "";
  const departmentKey = meta.departmentId != null
    ? `department-id:${meta.departmentId}`
    : meta.department
    ? `department:${normalizeLookup(meta.department)}`
    : "department:universal";
  const cacheKey = roleKey || departmentKey;

  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, (async () => {
      if (meta.jobRoleId != null || meta.jobRole) {
        const roleCategories = await storage.getCompetencyCategoriesForJobRole(meta.jobRoleId ?? meta.jobRole);
        if (roleCategories) {
          return roleCategories;
        }
      }

      const categories = await storage.getCompetencyCategories(meta.department || "Universal");
      const items = await storage.getCompetencyItems();
      return categories.map((category) => ({
        ...category,
        items: items.filter((item) => item.categoryId === category.id),
      }));
    })());
  }

  return cache.get(cacheKey)!;
}

function buildSummaryRow(
  submission: TrainingMatrixSubmission,
  meta: ExportMeta,
  categories: ExportCategory[]
): SummaryRow {
  const ratings = (submission.ratings as Record<string, number>) || {};
  const competencyItems = categories.flatMap((category) => category.items);
  let totalScore = 0;
  let ratedCount = 0;

  for (const item of competencyItems) {
    const rating = ratings[item.slug];
    if (rating !== undefined) {
      ratedCount += 1;
    }
    totalScore += rating ?? 0;
  }

  return {
    submissionId: submission.id,
    userId: meta.userId,
    colleagueName: meta.userName,
    department: meta.department,
    jobRole: meta.jobRole,
    status: submission.status,
    submittedDate: submission.submittedDate || "",
    approvedDate: submission.approvedDate || "",
    approvedBy: submission.approvedBy || "",
    nextReviewDate: submission.nextReviewDate || "",
    lastAssessment: submission.lastAssessment || "",
    competencyCount: competencyItems.length,
    ratedCompetencyCount: ratedCount,
    overallScore: competencyItems.length > 0 ? Number((totalScore / competencyItems.length).toFixed(2)) : 0,
  };
}

function buildDetailRows(
  submission: TrainingMatrixSubmission,
  meta: ExportMeta,
  categories: ExportCategory[]
): DetailRow[] {
  const ratings = (submission.ratings as Record<string, number>) || {};
  const rows: DetailRow[] = [];

  for (const category of categories) {
    for (const item of category.items) {
      const rating = ratings[item.slug];
      rows.push({
        submissionId: submission.id,
        userId: meta.userId,
        colleagueName: meta.userName,
        department: meta.department,
        jobRole: meta.jobRole,
        status: submission.status,
        submittedDate: submission.submittedDate || "",
        approvedDate: submission.approvedDate || "",
        approvedBy: submission.approvedBy || "",
        nextReviewDate: submission.nextReviewDate || "",
        categoryName: category.name,
        competencyName: item.name,
        competencySlug: item.slug,
        rating: rating ?? "",
      });
    }
  }

  if (rows.length === 0) {
    rows.push({
      submissionId: submission.id,
      userId: meta.userId,
      colleagueName: meta.userName,
      department: meta.department,
      jobRole: meta.jobRole,
      status: submission.status,
      submittedDate: submission.submittedDate || "",
      approvedDate: submission.approvedDate || "",
      approvedBy: submission.approvedBy || "",
      nextReviewDate: submission.nextReviewDate || "",
      categoryName: "",
      competencyName: "",
      competencySlug: "",
      rating: "",
    });
  }

  return rows;
}

function buildFilename(params: TrainingMatrixExportParams) {
  const parts = ["training-matrix", params.scope];
  if (params.scope === "user" && params.userId) {
    parts.push(params.userId);
  }
  if (params.scope === "team" && params.managerId) {
    parts.push(params.managerId);
  }
  if (params.scope === "department") {
    if (params.departmentId != null) {
      parts.push(`department-${params.departmentId}`);
    } else if (params.department) {
      parts.push(normalizeLookup(params.department).replace(/[^a-z0-9]+/g, "-"));
    }
  }
  parts.push(params.history, params.detail);
  return `${parts.join("-")}.csv`;
}

export async function exportTrainingMatrixCsv(params: TrainingMatrixExportParams) {
  const [allUsers, allSubmissions] = await Promise.all([
    storage.getAllUsers(),
    storage.getAllTrainingMatrixSubmissions(),
  ]);

  const userIds = await resolveScopeUserIds(params, allUsers);
  const userMap = new Map(allUsers.map((user) => [user.id, user]));
  const filteredSubmissions = allSubmissions
    .filter((submission) => userIds.has(submission.userId))
    .sort((left, right) => right.id - left.id);
  const submissions = params.history === "latest"
    ? pickLatestPerUser(filteredSubmissions)
    : filteredSubmissions;

  const categoryCache = new Map<string, Promise<ExportCategory[]>>();

  if (params.detail === "summary") {
    const headers = [
      "submissionId",
      "userId",
      "colleagueName",
      "department",
      "jobRole",
      "status",
      "submittedDate",
      "approvedDate",
      "approvedBy",
      "nextReviewDate",
      "lastAssessment",
      "competencyCount",
      "ratedCompetencyCount",
      "overallScore",
    ];
    const rows: SummaryRow[] = [];

    for (const submission of submissions) {
      const meta = buildMeta(submission, userMap.get(submission.userId));
      const categories = await resolveCategories(meta, categoryCache);
      rows.push(buildSummaryRow(submission, meta, categories));
    }

    return {
      filename: buildFilename(params),
      csvContent: toCsv(headers, rows),
    };
  }

  const headers = [
    "submissionId",
    "userId",
    "colleagueName",
    "department",
    "jobRole",
    "status",
    "submittedDate",
    "approvedDate",
    "approvedBy",
    "nextReviewDate",
    "categoryName",
    "competencyName",
    "competencySlug",
    "rating",
  ];
  const rows: DetailRow[] = [];

  for (const submission of submissions) {
    const meta = buildMeta(submission, userMap.get(submission.userId));
    const categories = await resolveCategories(meta, categoryCache);
    rows.push(...buildDetailRows(submission, meta, categories));
  }

  return {
    filename: buildFilename(params),
    csvContent: toCsv(headers, rows),
  };
}
