import { db } from "./db";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";
import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";

function parseCsv(content: string): Record<string, string>[] {
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  });
}

function toBool(val: string): boolean {
  return val === "true" || val === "1" || val === "yes";
}

function toIntOrNull(val: string): number | null {
  if (!val || val === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function toInt(val: string, fallback = 0): number {
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}

function parseJson(val: string, fallback: any = []): any {
  if (!val || val === "") return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

export async function importFullBackup(zipBuffer: Buffer): Promise<{ success: boolean; summary: Record<string, number>; errors: string[] }> {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  const files: Record<string, string> = {};
  for (const entry of entries) {
    if (!entry.isDirectory && entry.entryName.endsWith(".csv")) {
      const name = entry.entryName.replace(/^.*\//, "");
      files[name] = entry.getData().toString("utf8");
    }
  }

  const summary: Record<string, number> = {};
  const errors: string[] = [];

  const importFile = async (filename: string, fn: (rows: Record<string, string>[]) => Promise<number>) => {
    if (!files[filename]) return;
    try {
      const rows = parseCsv(files[filename]);
      if (rows.length === 0) return;
      const count = await fn(rows);
      summary[filename] = count;
    } catch (err: any) {
      errors.push(`${filename}: ${err.message}`);
    }
  };

  await db.delete(schema.inductionItemCompletions).execute();
  await db.delete(schema.inductionInstances).execute();
  await db.delete(schema.trainingMatrixSubmissions).execute();
  await db.delete(schema.userCertificates).execute();
  await db.delete(schema.trainingRecords).execute();
  await db.delete(schema.careerMilestones).execute();
  await db.delete(schema.standardsSurveyItems).execute();
  await db.delete(schema.standardsSurveyRoles).execute();
  await db.delete(schema.competencyItems).execute();
  await db.delete(schema.competencyCategories).execute();
  await db.delete(schema.jobRoleCategories).execute();
  await db.delete(schema.jobRoleInductionSections).execute();
  await db.delete(schema.inductionSectionSettings).execute();
  await db.delete(schema.jobRoles).execute();
  await db.delete(schema.certificateDefinitions).execute();
  await db.delete(schema.careerNodes).execute();
  await db.delete(schema.inductionTemplateItems).execute();
  await db.delete(schema.users).execute();
  await db.delete(schema.departmentsTable).execute();
  await db.delete(schema.resources).execute();
  await db.delete(schema.portalSettings).execute();

  await importFile("portal-settings.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.portalSettings).values({
        id: toInt(r.id),
        key: r.key,
        value: r.value,
        category: r.category,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("departments.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.departmentsTable).values({
        id: toInt(r.id),
        name: r.name,
        parentId: toIntOrNull(r.parentId),
        color: r.color || "bg-gray-500",
        sortOrder: toInt(r.sortOrder),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("resources.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.resources).values({
        id: toInt(r.id),
        title: r.title,
        description: r.description || "",
        category: r.category,
        url: r.url,
        icon: r.icon || "FileText",
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("users.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.users).values({
        id: r.id,
        username: r.username,
        password: r.password,
        name: r.name,
        email: r.email,
        role: r.role,
        jobRole: r.jobRole || "",
        department: r.department || "",
        managerId: r.managerId || null,
        startDate: r.startDate,
        requiresInduction: toBool(r.requiresInduction),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("job-roles.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.jobRoles).values({
        id: toInt(r.id),
        title: r.title,
        department: r.department,
        summary: r.summary || "",
        responsibilities: parseJson(r.responsibilities, []),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("certificate-definitions.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.certificateDefinitions).values({
        id: toInt(r.id),
        name: r.name,
        description: r.description || "",
        category: r.category,
        level: r.level,
        icon: r.icon || "Award",
        provider: r.provider || "",
        validityMonths: toIntOrNull(r.validityMonths),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("induction-templates.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.inductionTemplateItems).values({
        id: toInt(r.id),
        slug: r.slug,
        section: r.section,
        title: r.title,
        description: r.description || "",
        requiresEvidence: toBool(r.requiresEvidence),
        sortOrder: toInt(r.sortOrder),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("career-nodes.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.careerNodes).values({
        id: toInt(r.id),
        slug: r.slug,
        title: r.title,
        description: r.description || "",
        level: toInt(r.level),
        department: r.department || "",
        requirements: parseJson(r.requirements, []),
        x: toInt(r.x),
        y: toInt(r.y),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("standards-survey-roles.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.standardsSurveyRoles).values({
        id: toInt(r.id),
        roleSlug: r.roleSlug,
        roleTitle: r.roleTitle,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("induction-section-settings.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.inductionSectionSettings).values({
        id: toInt(r.id),
        sectionName: r.sectionName,
        isUniversal: toBool(r.isUniversal),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("competency-categories.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.competencyCategories).values({
        id: toInt(r.id),
        slug: r.slug,
        name: r.name,
        departmentType: r.departmentType,
        sortOrder: toInt(r.sortOrder),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("job-role-categories.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.jobRoleCategories).values({
        id: toInt(r.id),
        jobRoleId: toInt(r.jobRoleId),
        categoryId: toInt(r.categoryId),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("job-role-induction-sections.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.jobRoleInductionSections).values({
        id: toInt(r.id),
        jobRoleId: toInt(r.jobRoleId),
        sectionName: r.sectionName,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("competency-items.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.competencyItems).values({
        id: toInt(r.id),
        categoryId: toInt(r.categoryId),
        slug: r.slug,
        name: r.name,
        description: r.description || "",
        sortOrder: toInt(r.sortOrder),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("standards-survey-items.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.standardsSurveyItems).values({
        id: toInt(r.id),
        surveyRoleId: toInt(r.surveyRoleId),
        text: r.text,
        isFeedback: toBool(r.isFeedback),
        sortOrder: toInt(r.sortOrder),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("induction-instances.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.inductionInstances).values({
        id: toInt(r.id),
        userId: r.userId,
        templateName: r.templateName,
        status: r.status,
        createdDate: r.createdDate,
        shareToken: r.shareToken || null,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("training-matrix-submissions.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.trainingMatrixSubmissions).values({
        id: toInt(r.id),
        userId: r.userId,
        status: r.status,
        ratings: parseJson(r.ratings, {}),
        submittedDate: r.submittedDate || null,
        approvedBy: r.approvedBy || null,
        approvedDate: r.approvedDate || null,
        shareToken: r.shareToken || null,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("user-certificates.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.userCertificates).values({
        id: toInt(r.id),
        userId: r.userId,
        definitionId: toInt(r.definitionId),
        issueDate: r.issueDate,
        expiryDate: r.expiryDate || null,
        status: r.status,
        fileUrl: r.fileUrl || null,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("training-records.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.trainingRecords).values({
        id: toInt(r.id),
        userId: r.userId,
        requirementName: r.requirementName,
        category: r.category,
        completedDate: r.completedDate || null,
        expiresDate: r.expiresDate || null,
        status: r.status,
        notes: r.notes || null,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("career-milestones.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.careerMilestones).values({
        id: toInt(r.id),
        userId: r.userId,
        title: r.title,
        description: r.description || "",
        date: r.date,
        type: r.type,
        icon: r.icon || "",
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  await importFile("induction-completions.csv", async (rows) => {
    for (const r of rows) {
      await db.insert(schema.inductionItemCompletions).values({
        id: toInt(r.id),
        instanceId: toInt(r.instanceId),
        templateItemId: toInt(r.templateItemId),
        completed: toBool(r.completed),
        inProgress: toBool(r.inProgress),
        completedDate: r.completedDate || null,
        signedOffBy: r.signedOffBy || null,
        signedOffDate: r.signedOffDate || null,
        assignedTo: r.assignedTo || null,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

  const seqTables = [
    "users", "induction_template_items", "induction_instances", "induction_item_completions",
    "competency_categories", "competency_items", "training_matrix_submissions",
    "certificate_definitions", "user_certificates", "training_records",
    "job_roles", "job_role_categories", "job_role_induction_sections", "induction_section_settings",
    "career_nodes", "career_milestones", "standards_survey_roles", "standards_survey_items",
    "resources", "departments", "portal_settings",
  ];
  for (const table of seqTables) {
    try {
      await db.execute(sql.raw(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)`));
    } catch {}
  }

  return { success: errors.length === 0, summary, errors };
}
