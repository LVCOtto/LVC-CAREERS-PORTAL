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

  try {
    await db.transaction(async (tx) => {
      const importFile = async (filename: string, fn: (rows: Record<string, string>[]) => Promise<number>) => {
        if (!files[filename]) return;
        const rows = parseCsv(files[filename]);
        if (rows.length === 0) return;
        const count = await fn(rows);
        summary[filename] = count;
      };

      await tx.delete(schema.inductionItemCompletions).execute();
      await tx.delete(schema.inductionInstances).execute();
      await tx.delete(schema.trainingMatrixSubmissions).execute();
      await tx.delete(schema.userCertificates).execute();
      await tx.delete(schema.trainingRecords).execute();
      await tx.delete(schema.careerMilestones).execute();
      await tx.delete(schema.standardsSurveyItems).execute();
      await tx.delete(schema.standardsSurveyRoles).execute();
      await tx.delete(schema.competencyItems).execute();
      await tx.delete(schema.competencyCategories).execute();
      await tx.delete(schema.jobRoleCategories).execute();
      await tx.delete(schema.jobRoleInductionSections).execute();
      await tx.delete(schema.inductionSectionSettings).execute();
      await tx.delete(schema.jobRoles).execute();
      await tx.delete(schema.certificateDefinitions).execute();
      await tx.delete(schema.careerNodes).execute();
      await tx.delete(schema.inductionTemplateItems).execute();
      await tx.delete(schema.users).execute();
      await tx.delete(schema.departmentsTable).execute();
      await tx.delete(schema.resources).execute();
      await tx.delete(schema.portalSettings).execute();

      await importFile("portal-settings.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.portalSettings).values({
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
      await tx.insert(schema.departmentsTable).values({
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
      await tx.insert(schema.resources).values({
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
      await tx.insert(schema.users).values({
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
        activated: toBool(r.activated),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

      await importFile("job-roles.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.jobRoles).values({
        id: toInt(r.id),
        title: r.title,
        department: r.department,
        summary: r.summary || "",
        responsibilities: parseJson(r.responsibilities, []),
        reportsTo: r.reports_to || r.reportsTo ? toInt(r.reports_to || r.reportsTo) : null,
        sortOrder: r.sort_order || r.sortOrder ? toInt(r.sort_order || r.sortOrder) : 0,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

      await importFile("certificate-definitions.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.certificateDefinitions).values({
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
      await tx.insert(schema.inductionTemplateItems).values({
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
      await tx.insert(schema.careerNodes).values({
        id: toInt(r.id),
        slug: r.slug,
        title: r.title,
        description: r.description || "",
        level: toInt(r.level),
        department: r.department || "",
        requirements: parseJson(r.requirements, []),
        nextSteps: parseJson(r.nextSteps, []),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

      await importFile("standards-survey-roles.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.standardsSurveyRoles).values({
        id: toInt(r.id),
        roleSlug: r.roleSlug,
        roleTitle: r.roleTitle,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

      await importFile("induction-section-settings.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.inductionSectionSettings).values({
        id: toInt(r.id),
        sectionName: r.sectionName,
        isUniversal: toBool(r.isUniversal),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

      await importFile("competency-categories.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.competencyCategories).values({
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
      await tx.insert(schema.jobRoleCategories).values({
        id: toInt(r.id),
        jobRoleId: toInt(r.jobRoleId),
        categoryId: toInt(r.categoryId),
      }).onConflictDoNothing();
    }
    return rows.length;
  });

      await importFile("job-role-induction-sections.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.jobRoleInductionSections).values({
        id: toInt(r.id),
        jobRoleId: toInt(r.jobRoleId),
        sectionName: r.sectionName,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

      await importFile("competency-items.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.competencyItems).values({
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
      await tx.insert(schema.standardsSurveyItems).values({
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
      await tx.insert(schema.inductionInstances).values({
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
      await tx.insert(schema.trainingMatrixSubmissions).values({
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
      await tx.insert(schema.userCertificates).values({
        id: toInt(r.id),
        userId: r.userId,
        definitionId: toInt(r.definitionId),
        issueDate: r.issueDate,
        expiryDate: r.expiryDate || null,
        status: r.status,
        credentialId: r.credentialId || null,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

      await importFile("training-records.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.trainingRecords).values({
        id: toInt(r.id),
        userId: r.userId,
        requirementName: r.requirementName,
        category: r.category,
        completedDate: r.completedDate || null,
        expiresDate: r.expiresDate || null,
        status: r.status,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

      await importFile("career-milestones.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.careerMilestones).values({
        id: toInt(r.id),
        userId: r.userId,
        title: r.title,
        description: r.description || "",
        date: r.date,
      }).onConflictDoNothing();
    }
    return rows.length;
  });

      await importFile("induction-completions.csv", async (rows) => {
    for (const r of rows) {
      await tx.insert(schema.inductionItemCompletions).values({
        id: toInt(r.id),
        instanceId: toInt(r.instanceId),
        templateItemId: toInt(r.templateItemId),
        completed: toBool(r.completed),
        inProgress: toBool(r.inProgress),
        completedDate: r.completedDate || null,
        targetDate: r.targetDate || null,
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
          await tx.execute(sql.raw(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)`));
        } catch {}
      }
    });
  } catch (err: any) {
    errors.push(err?.message || "Restore transaction failed");
  }

  return { success: errors.length === 0, summary, errors };
}
