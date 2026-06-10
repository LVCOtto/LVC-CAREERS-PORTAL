import { db } from "./db";
import * as schema from "@shared/schema";
import archiver from "archiver";
import type { Response } from "express";

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: any[], mapFn: (row: any) => string[]): string {
  let csv = headers.join(",") + "\n";
  for (const row of rows) {
    csv += mapFn(row).map(escapeCsv).join(",") + "\n";
  }
  return csv;
}

export async function exportFullBackup(res: Response) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="lvc-backup-${new Date().toISOString().split("T")[0]}.zip"`);
  archive.pipe(res);

  const users = await db.select().from(schema.users);
  archive.append(toCsv(
    ["id", "name", "email", "role", "jobRoleId", "jobRole", "departmentId", "department", "managerId", "startDate", "requiresInduction", "activated"],
    users,
    (u) => [u.id, u.name, u.email, u.role, u.jobRoleId != null ? String(u.jobRoleId) : "", u.jobRole, u.departmentId != null ? String(u.departmentId) : "", u.department, u.managerId || "", u.startDate, String(u.requiresInduction), String(u.activated)]
  ), { name: "users.csv" });

  const inductionTemplates = await db.select().from(schema.inductionTemplateItems);
  archive.append(toCsv(
    ["id", "slug", "section", "title", "description", "requiresEvidence", "sortOrder"],
    inductionTemplates,
    (i) => [String(i.id), i.slug, i.section, i.title, i.description || "", String(i.requiresEvidence), String(i.sortOrder)]
  ), { name: "induction-templates.csv" });

  const inductionInstances = await db.select().from(schema.inductionInstances);
  archive.append(toCsv(
    ["id", "userId", "templateName", "status", "createdDate", "shareToken"],
    inductionInstances,
    (i) => [String(i.id), i.userId, i.templateName, i.status, i.createdDate, i.shareToken || ""]
  ), { name: "induction-instances.csv" });

  const inductionCompletions = await db.select().from(schema.inductionItemCompletions);
  archive.append(toCsv(
    ["id", "instanceId", "templateItemId", "completed", "inProgress", "completedDate", "targetDate", "reviewDate", "signedOffBy", "signedOffDate", "assignedTo"],
    inductionCompletions,
    (c) => [String(c.id), String(c.instanceId), String(c.templateItemId), String(c.completed), String(c.inProgress), c.completedDate || "", c.targetDate || "", c.reviewDate || "", c.signedOffBy || "", c.signedOffDate || "", c.assignedTo || ""]
  ), { name: "induction-completions.csv" });

  const competencyCategories = await db.select().from(schema.competencyCategories);
  archive.append(toCsv(
    ["id", "slug", "name", "departmentId", "departmentType", "sortOrder"],
    competencyCategories,
    (c) => [String(c.id), c.slug, c.name, c.departmentId != null ? String(c.departmentId) : "", c.departmentType, String(c.sortOrder)]
  ), { name: "competency-categories.csv" });

  const competencyItems = await db.select().from(schema.competencyItems);
  archive.append(toCsv(
    ["id", "categoryId", "slug", "name", "description", "sortOrder"],
    competencyItems,
    (i) => [String(i.id), String(i.categoryId), i.slug, i.name, i.description || "", String(i.sortOrder)]
  ), { name: "competency-items.csv" });

  const trainingMatrixSubmissions = await db.select().from(schema.trainingMatrixSubmissions);
  archive.append(toCsv(
    ["id", "userId", "userNameSnapshot", "departmentIdSnapshot", "departmentSnapshot", "jobRoleIdSnapshot", "jobRoleSnapshot", "status", "ratings", "lastAssessment", "submittedDate", "approvedBy", "approvedDate", "nextReviewDate", "shareToken"],
    trainingMatrixSubmissions,
    (s) => [
      String(s.id),
      s.userId,
      s.userNameSnapshot || "",
      s.departmentIdSnapshot != null ? String(s.departmentIdSnapshot) : "",
      s.departmentSnapshot || "",
      s.jobRoleIdSnapshot != null ? String(s.jobRoleIdSnapshot) : "",
      s.jobRoleSnapshot || "",
      s.status,
      JSON.stringify(s.ratings),
      s.lastAssessment || "",
      s.submittedDate || "",
      s.approvedBy || "",
      s.approvedDate || "",
      s.nextReviewDate || "",
      s.shareToken || "",
    ]
  ), { name: "training-matrix-submissions.csv" });

  const certDefs = await db.select().from(schema.certificateDefinitions);
  archive.append(toCsv(
    ["id", "name", "description", "category", "level", "icon", "provider", "validityMonths"],
    certDefs,
    (d) => [String(d.id), d.name, d.description || "", d.category, d.level, d.icon, d.provider, String(d.validityMonths || "")]
  ), { name: "certificate-definitions.csv" });

  const userCerts = await db.select().from(schema.userCertificates);
  archive.append(toCsv(
    ["id", "userId", "definitionId", "issueDate", "expiryDate", "status", "credentialId"],
    userCerts,
    (c) => [String(c.id), c.userId, String(c.definitionId), c.issueDate, c.expiryDate || "", c.status, c.credentialId || ""]
  ), { name: "user-certificates.csv" });

  const trainingRecords = await db.select().from(schema.trainingRecords);
  archive.append(toCsv(
    ["id", "userId", "requirementName", "category", "completedDate", "expiresDate", "status"],
    trainingRecords,
    (r) => [String(r.id), r.userId, r.requirementName, r.category, r.completedDate || "", r.expiresDate || "", r.status]
  ), { name: "training-records.csv" });

  const jobRoles = await db.select().from(schema.jobRoles);
  archive.append(toCsv(
    ["id", "title", "departmentId", "department", "summary", "responsibilities", "reportsTo", "sortOrder"],
    jobRoles,
    (r) => [String(r.id), r.title, r.departmentId != null ? String(r.departmentId) : "", r.department, r.summary, JSON.stringify(r.responsibilities), r.reportsTo != null ? String(r.reportsTo) : "", String(r.sortOrder)]
  ), { name: "job-roles.csv" });

  const jobRoleCategories = await db.select().from(schema.jobRoleCategories);
  archive.append(toCsv(
    ["id", "jobRoleId", "categoryId"],
    jobRoleCategories,
    (r) => [String(r.id), String(r.jobRoleId), String(r.categoryId)]
  ), { name: "job-role-categories.csv" });

  const jobRoleInductionSections = await db.select().from(schema.jobRoleInductionSections);
  archive.append(toCsv(
    ["id", "jobRoleId", "sectionName"],
    jobRoleInductionSections,
    (r) => [String(r.id), String(r.jobRoleId), r.sectionName]
  ), { name: "job-role-induction-sections.csv" });

  const inductionSectionSettings = await db.select().from(schema.inductionSectionSettings);
  archive.append(toCsv(
    ["id", "sectionName", "isUniversal"],
    inductionSectionSettings,
    (s) => [String(s.id), s.sectionName, String(s.isUniversal)]
  ), { name: "induction-section-settings.csv" });

  const careerNodes = await db.select().from(schema.careerNodes);
  archive.append(toCsv(
    ["id", "slug", "jobRoleId", "title", "description", "level", "departmentId", "department", "requirements", "nextSteps"],
    careerNodes,
    (n) => [String(n.id), n.slug, n.jobRoleId != null ? String(n.jobRoleId) : "", n.title, n.description || "", String(n.level), n.departmentId != null ? String(n.departmentId) : "", n.department || "", JSON.stringify(n.requirements), JSON.stringify(n.nextSteps || [])]
  ), { name: "career-nodes.csv" });

  const careerMilestones = await db.select().from(schema.careerMilestones);
  archive.append(toCsv(
    ["id", "userId", "title", "description", "date"],
    careerMilestones,
    (m) => [String(m.id), m.userId, m.title, m.description || "", m.date]
  ), { name: "career-milestones.csv" });

  const surveyRoles = await db.select().from(schema.standardsSurveyRoles);
  archive.append(toCsv(
    ["id", "jobRoleId", "roleSlug", "roleTitle"],
    surveyRoles,
    (r) => [String(r.id), r.jobRoleId != null ? String(r.jobRoleId) : "", r.roleSlug, r.roleTitle]
  ), { name: "standards-survey-roles.csv" });

  const surveyItems = await db.select().from(schema.standardsSurveyItems);
  archive.append(toCsv(
    ["id", "surveyRoleId", "text", "isFeedback", "sortOrder"],
    surveyItems,
    (i) => [String(i.id), String(i.surveyRoleId), i.text, String(i.isFeedback), String(i.sortOrder)]
  ), { name: "standards-survey-items.csv" });

  const resources = await db.select().from(schema.resources);
  archive.append(toCsv(
    ["id", "title", "description", "category", "url", "icon"],
    resources,
    (r) => [String(r.id), r.title, r.description || "", r.category, r.url, r.icon]
  ), { name: "resources.csv" });

  const departments = await db.select().from(schema.departmentsTable);
  archive.append(toCsv(
    ["id", "name", "parentId", "color", "sortOrder"],
    departments,
    (d) => [String(d.id), d.name, d.parentId ? String(d.parentId) : "", d.color, String(d.sortOrder)]
  ), { name: "departments.csv" });

  const portalSettings = await db.select().from(schema.portalSettings);
  archive.append(toCsv(
    ["id", "key", "value", "category"],
    portalSettings,
    (s) => [String(s.id), s.key, s.value, s.category]
  ), { name: "portal-settings.csv" });

  await archive.finalize();
}
