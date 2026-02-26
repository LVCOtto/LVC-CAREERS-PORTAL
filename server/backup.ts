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

function jsonStr(val: any): string {
  if (val === null || val === undefined) return "";
  return escapeCsv(JSON.stringify(val));
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
    ["id", "username", "password", "name", "email", "role", "jobRole", "department", "managerId", "startDate", "requiresInduction"],
    users,
    (u) => [u.id, u.username, u.password, u.name, u.email, u.role, u.jobRole, u.department, u.managerId || "", u.startDate, String(u.requiresInduction)]
  ), { name: "users.csv" });

  const inductionTemplates = await db.select().from(schema.inductionTemplateItems);
  archive.append(toCsv(
    ["id", "slug", "section", "title", "description", "requiresEvidence", "sortOrder"],
    inductionTemplates,
    (i) => [String(i.id), i.slug, i.section, i.title, i.description || "", String(i.requiresEvidence), String(i.sortOrder)]
  ), { name: "induction-templates.csv" });

  const inductionInstances = await db.select().from(schema.inductionInstances);
  archive.append(toCsv(
    ["id", "userId", "templateName", "status", "createdDate"],
    inductionInstances,
    (i) => [String(i.id), i.userId, i.templateName, i.status, i.createdDate]
  ), { name: "induction-instances.csv" });

  const inductionCompletions = await db.select().from(schema.inductionItemCompletions);
  archive.append(toCsv(
    ["id", "instanceId", "templateItemId", "completed", "completedDate", "signedOffBy", "signedOffDate", "assignedTo"],
    inductionCompletions,
    (c) => [String(c.id), String(c.instanceId), String(c.templateItemId), String(c.completed), c.completedDate || "", c.signedOffBy || "", c.signedOffDate || "", c.assignedTo || ""]
  ), { name: "induction-completions.csv" });

  const competencyCategories = await db.select().from(schema.competencyCategories);
  archive.append(toCsv(
    ["id", "slug", "name", "departmentType", "sortOrder"],
    competencyCategories,
    (c) => [String(c.id), c.slug, c.name, c.departmentType, String(c.sortOrder)]
  ), { name: "competency-categories.csv" });

  const competencyItems = await db.select().from(schema.competencyItems);
  archive.append(toCsv(
    ["id", "categoryId", "slug", "name", "description", "sortOrder"],
    competencyItems,
    (i) => [String(i.id), String(i.categoryId), i.slug, i.name, i.description || "", String(i.sortOrder)]
  ), { name: "competency-items.csv" });

  const trainingMatrixSubmissions = await db.select().from(schema.trainingMatrixSubmissions);
  archive.append(toCsv(
    ["id", "userId", "status", "ratings", "submittedDate", "approvedBy", "approvedDate", "shareToken"],
    trainingMatrixSubmissions,
    (s) => [String(s.id), s.userId, s.status, JSON.stringify(s.ratings), s.submittedDate || "", s.approvedBy || "", s.approvedDate || "", s.shareToken || ""]
  ), { name: "training-matrix-submissions.csv" });

  const certDefs = await db.select().from(schema.certificateDefinitions);
  archive.append(toCsv(
    ["id", "name", "description", "category", "level", "icon", "provider", "validityMonths"],
    certDefs,
    (d) => [String(d.id), d.name, d.description || "", d.category, d.level, d.icon, d.provider, String(d.validityMonths || "")]
  ), { name: "certificate-definitions.csv" });

  const userCerts = await db.select().from(schema.userCertificates);
  archive.append(toCsv(
    ["id", "userId", "definitionId", "issueDate", "expiryDate", "status", "fileUrl"],
    userCerts,
    (c) => [String(c.id), c.userId, String(c.definitionId), c.issueDate, c.expiryDate || "", c.status, c.fileUrl || ""]
  ), { name: "user-certificates.csv" });

  const trainingRecords = await db.select().from(schema.trainingRecords);
  archive.append(toCsv(
    ["id", "userId", "requirementName", "category", "completedDate", "expiresDate", "status", "notes"],
    trainingRecords,
    (r) => [String(r.id), r.userId, r.requirementName, r.category, r.completedDate || "", r.expiresDate || "", r.status, r.notes || ""]
  ), { name: "training-records.csv" });

  const jobRoles = await db.select().from(schema.jobRoles);
  archive.append(toCsv(
    ["id", "title", "department", "summary", "responsibilities"],
    jobRoles,
    (r) => [String(r.id), r.title, r.department, r.summary, JSON.stringify(r.responsibilities)]
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
    ["id", "slug", "title", "description", "level", "department", "requirements", "x", "y"],
    careerNodes,
    (n) => [String(n.id), n.slug, n.title, n.description || "", String(n.level), n.department || "", JSON.stringify(n.requirements), String(n.x || 0), String(n.y || 0)]
  ), { name: "career-nodes.csv" });

  const careerMilestones = await db.select().from(schema.careerMilestones);
  archive.append(toCsv(
    ["id", "userId", "title", "description", "date", "type", "icon"],
    careerMilestones,
    (m) => [String(m.id), m.userId, m.title, m.description || "", m.date, m.type, m.icon || ""]
  ), { name: "career-milestones.csv" });

  const surveyRoles = await db.select().from(schema.standardsSurveyRoles);
  archive.append(toCsv(
    ["id", "roleSlug", "roleTitle"],
    surveyRoles,
    (r) => [String(r.id), r.roleSlug, r.roleTitle]
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
