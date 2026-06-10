import { pgTable, text, varchar, integer, boolean, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  username: text("username").unique(),
  password: text("password"),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role").notNull(),
  jobRoleId: integer("job_role_id"),
  jobRole: text("job_role").notNull(),
  departmentId: integer("department_id"),
  department: text("department").notNull(),
  managerId: varchar("manager_id", { length: 50 }),
  startDate: text("start_date").notNull(),
  requiresInduction: boolean("requires_induction").notNull().default(true),
  activated: boolean("activated").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const inductionTemplateItems = pgTable("induction_template_items", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  section: text("section").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  requiresEvidence: boolean("requires_evidence").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertInductionTemplateItemSchema = createInsertSchema(inductionTemplateItems).omit({ id: true });
export type InsertInductionTemplateItem = z.infer<typeof insertInductionTemplateItemSchema>;
export type InductionTemplateItem = typeof inductionTemplateItems.$inferSelect;

export const inductionInstances = pgTable("induction_instances", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  templateName: text("template_name").notNull().default("Standard Induction"),
  status: text("status").notNull().default("not_started"),
  createdDate: text("created_date").notNull(),
  shareToken: varchar("share_token", { length: 100 }).unique(),
});

export const insertInductionInstanceSchema = createInsertSchema(inductionInstances).omit({ id: true });
export type InsertInductionInstance = z.infer<typeof insertInductionInstanceSchema>;
export type InductionInstance = typeof inductionInstances.$inferSelect;

export const inductionItemCompletions = pgTable("induction_item_completions", {
  id: serial("id").primaryKey(),
  instanceId: integer("instance_id").notNull(),
  templateItemId: integer("template_item_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  inProgress: boolean("in_progress").notNull().default(false),
  completedDate: text("completed_date"),
  targetDate: text("target_date"),
  reviewDate: text("review_date"),
  signedOffBy: varchar("signed_off_by", { length: 50 }),
  signedOffDate: text("signed_off_date"),
  assignedTo: varchar("assigned_to", { length: 100 }),
});

export const insertInductionItemCompletionSchema = createInsertSchema(inductionItemCompletions).omit({ id: true });
export type InsertInductionItemCompletion = z.infer<typeof insertInductionItemCompletionSchema>;
export type InductionItemCompletion = typeof inductionItemCompletions.$inferSelect;

export const competencyCategories = pgTable("competency_categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: text("name").notNull(),
  departmentId: integer("department_id"),
  departmentType: text("department_type").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertCompetencyCategorySchema = createInsertSchema(competencyCategories).omit({ id: true });
export type InsertCompetencyCategory = z.infer<typeof insertCompetencyCategorySchema>;
export type CompetencyCategory = typeof competencyCategories.$inferSelect;

export const competencyItems = pgTable("competency_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertCompetencyItemSchema = createInsertSchema(competencyItems).omit({ id: true });
export type InsertCompetencyItem = z.infer<typeof insertCompetencyItemSchema>;
export type CompetencyItem = typeof competencyItems.$inferSelect;

export const trainingMatrixSubmissions = pgTable("training_matrix_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  userNameSnapshot: text("user_name_snapshot"),
  departmentIdSnapshot: integer("department_id_snapshot"),
  departmentSnapshot: text("department_snapshot"),
  jobRoleIdSnapshot: integer("job_role_id_snapshot"),
  jobRoleSnapshot: text("job_role_snapshot"),
  status: text("status").notNull().default("draft"),
  ratings: jsonb("ratings").notNull().default({}),
  lastAssessment: text("last_assessment"),
  submittedDate: text("submitted_date"),
  approvedBy: varchar("approved_by", { length: 50 }),
  approvedDate: text("approved_date"),
  nextReviewDate: text("next_review_date"),
  shareToken: varchar("share_token", { length: 100 }).unique(),
});

export const insertTrainingMatrixSubmissionSchema = createInsertSchema(trainingMatrixSubmissions).omit({ id: true });
export type InsertTrainingMatrixSubmission = z.infer<typeof insertTrainingMatrixSubmissionSchema>;
export type TrainingMatrixSubmission = typeof trainingMatrixSubmissions.$inferSelect;

export const standardsSurveyRoles = pgTable("standards_survey_roles", {
  id: serial("id").primaryKey(),
  jobRoleId: integer("job_role_id"),
  roleSlug: varchar("role_slug", { length: 100 }).notNull().unique(),
  roleTitle: text("role_title").notNull(),
});

export const insertStandardsSurveyRoleSchema = createInsertSchema(standardsSurveyRoles).omit({ id: true });
export type InsertStandardsSurveyRole = z.infer<typeof insertStandardsSurveyRoleSchema>;
export type StandardsSurveyRole = typeof standardsSurveyRoles.$inferSelect;

export const standardsSurveyItems = pgTable("standards_survey_items", {
  id: serial("id").primaryKey(),
  surveyRoleId: integer("survey_role_id").notNull(),
  text: text("text").notNull(),
  isFeedback: boolean("is_feedback").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertStandardsSurveyItemSchema = createInsertSchema(standardsSurveyItems).omit({ id: true });
export type InsertStandardsSurveyItem = z.infer<typeof insertStandardsSurveyItemSchema>;
export type StandardsSurveyItem = typeof standardsSurveyItems.$inferSelect;

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).omit({ id: true });
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export const certificateDefinitions = pgTable("certificate_definitions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(),
  icon: text("icon").notNull(),
  provider: text("provider").notNull(),
  validityMonths: integer("validity_months"),
});

export const insertCertificateDefinitionSchema = createInsertSchema(certificateDefinitions).omit({ id: true });
export type InsertCertificateDefinition = z.infer<typeof insertCertificateDefinitionSchema>;
export type CertificateDefinition = typeof certificateDefinitions.$inferSelect;

export const userCertificates = pgTable("user_certificates", {
  id: serial("id").primaryKey(),
  definitionId: integer("definition_id").notNull(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  issueDate: text("issue_date").notNull(),
  expiryDate: text("expiry_date"),
  credentialId: text("credential_id"),
  status: text("status").notNull().default("valid"),
});

export const insertUserCertificateSchema = createInsertSchema(userCertificates).omit({ id: true });
export type InsertUserCertificate = z.infer<typeof insertUserCertificateSchema>;
export type UserCertificate = typeof userCertificates.$inferSelect;

export const careerMilestones = pgTable("career_milestones", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull(),
});

export const insertCareerMilestoneSchema = createInsertSchema(careerMilestones).omit({ id: true });
export type InsertCareerMilestone = z.infer<typeof insertCareerMilestoneSchema>;
export type CareerMilestone = typeof careerMilestones.$inferSelect;

export const careerNodes = pgTable("career_nodes", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  jobRoleId: integer("job_role_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  departmentId: integer("department_id"),
  department: text("department").notNull(),
  level: integer("level").notNull(),
  requirements: jsonb("requirements").notNull().default([]),
  nextSteps: text("next_steps").array().notNull().default([]),
});

export const insertCareerNodeSchema = createInsertSchema(careerNodes).omit({ id: true });
export type InsertCareerNode = z.infer<typeof insertCareerNodeSchema>;
export type CareerNode = typeof careerNodes.$inferSelect;

export const trainingRecords = pgTable("training_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  requirementName: text("requirement_name").notNull(),
  category: text("category").notNull(),
  completedDate: text("completed_date"),
  expiresDate: text("expires_date"),
  status: text("status").notNull(),
});

export const insertTrainingRecordSchema = createInsertSchema(trainingRecords).omit({ id: true });
export type InsertTrainingRecord = z.infer<typeof insertTrainingRecordSchema>;
export type TrainingRecord = typeof trainingRecords.$inferSelect;

export const jobRoles = pgTable("job_roles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  departmentId: integer("department_id"),
  department: text("department").notNull(),
  summary: text("summary").notNull(),
  responsibilities: jsonb("responsibilities").notNull().default([]),
  reportsTo: integer("reports_to"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertJobRoleSchema = createInsertSchema(jobRoles).omit({ id: true });
export type InsertJobRole = z.infer<typeof insertJobRoleSchema>;
export type JobRole = typeof jobRoles.$inferSelect;

export const jobRoleCategories = pgTable("job_role_categories", {
  id: serial("id").primaryKey(),
  jobRoleId: integer("job_role_id").notNull(),
  categoryId: integer("category_id").notNull(),
});

export const insertJobRoleCategorySchema = createInsertSchema(jobRoleCategories).omit({ id: true });
export type InsertJobRoleCategory = z.infer<typeof insertJobRoleCategorySchema>;
export type JobRoleCategory = typeof jobRoleCategories.$inferSelect;

export const jobRoleInductionSections = pgTable("job_role_induction_sections", {
  id: serial("id").primaryKey(),
  jobRoleId: integer("job_role_id").notNull(),
  sectionName: text("section_name").notNull(),
});

export const insertJobRoleInductionSectionSchema = createInsertSchema(jobRoleInductionSections).omit({ id: true });
export type InsertJobRoleInductionSection = z.infer<typeof insertJobRoleInductionSectionSchema>;
export type JobRoleInductionSection = typeof jobRoleInductionSections.$inferSelect;

export const inductionSectionSettings = pgTable("induction_section_settings", {
  id: serial("id").primaryKey(),
  sectionName: text("section_name").notNull().unique(),
  isUniversal: boolean("is_universal").notNull().default(false),
});

export const insertInductionSectionSettingSchema = createInsertSchema(inductionSectionSettings).omit({ id: true });
export type InsertInductionSectionSetting = z.infer<typeof insertInductionSectionSettingSchema>;
export type InductionSectionSetting = typeof inductionSectionSettings.$inferSelect;

export const portalSettings = pgTable("portal_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 200 }).notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull(),
});

export const insertPortalSettingSchema = createInsertSchema(portalSettings).omit({ id: true });
export type InsertPortalSetting = z.infer<typeof insertPortalSettingSchema>;
export type PortalSetting = typeof portalSettings.$inferSelect;

export const departmentsTable = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull().unique(),
  parentId: integer("parent_id"),
  color: varchar("color", { length: 100 }).notNull().default("bg-gray-500"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertDepartmentSchema = createInsertSchema(departmentsTable).omit({ id: true });
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departmentsTable.$inferSelect;

export const outlookIntegrations = pgTable("outlook_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: text("expires_at").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdDate: text("created_date").notNull(),
  updatedDate: text("updated_date").notNull(),
});

export const insertOutlookIntegrationSchema = createInsertSchema(outlookIntegrations).omit({ id: true });
export type InsertOutlookIntegration = z.infer<typeof insertOutlookIntegrationSchema>;
export type OutlookIntegration = typeof outlookIntegrations.$inferSelect;

export const calendarSyncLog = pgTable("calendar_sync_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  sourceType: text("source_type").notNull(), // "induction_category" or "training_matrix"
  sourceId: varchar("source_id", { length: 100 }).notNull(),
  outlookEventId: text("outlook_event_id").notNull(),
  eventTitle: text("event_title").notNull(),
  eventDate: text("event_date").notNull(),
  syncedDate: text("synced_date").notNull(),
  lastUpdated: text("last_updated").notNull(),
});

export const insertCalendarSyncLogSchema = createInsertSchema(calendarSyncLog).omit({ id: true });
export type InsertCalendarSyncLog = z.infer<typeof insertCalendarSyncLogSchema>;
export type CalendarSyncLog = typeof calendarSyncLog.$inferSelect;

// One-time email auth codes (passwordless login)
export const emailAuthCodes = pgTable("email_auth_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: text("expires_at").notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  consumedAt: text("consumed_at"),
  createdAt: text("created_at").notNull(),
  requestIp: text("request_ip"),
  userAgent: text("user_agent"),
});

export const insertEmailAuthCodeSchema = createInsertSchema(emailAuthCodes).omit({ id: true });
export type InsertEmailAuthCode = z.infer<typeof insertEmailAuthCodeSchema>;
export type EmailAuthCode = typeof emailAuthCodes.$inferSelect;
