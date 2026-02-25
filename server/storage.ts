import { eq, and } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  getAllUsers(): Promise<schema.User[]>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUser(id: string, data: Partial<schema.InsertUser>): Promise<schema.User | undefined>;
  deleteUser(id: string): Promise<void>;
  getTeamMembers(managerId: string): Promise<schema.User[]>;

  getInductionTemplateItems(): Promise<schema.InductionTemplateItem[]>;
  createInductionTemplateItem(item: schema.InsertInductionTemplateItem): Promise<schema.InductionTemplateItem>;
  updateInductionTemplateItem(id: number, data: Partial<schema.InsertInductionTemplateItem>): Promise<schema.InductionTemplateItem | undefined>;
  deleteInductionTemplateItem(id: number): Promise<void>;

  getInductionInstance(userId: string): Promise<schema.InductionInstance | undefined>;
  createInductionInstance(instance: schema.InsertInductionInstance): Promise<schema.InductionInstance>;

  getInductionCompletions(instanceId: number): Promise<schema.InductionItemCompletion[]>;
  upsertInductionCompletion(data: schema.InsertInductionItemCompletion): Promise<schema.InductionItemCompletion>;

  getCompetencyCategories(departmentType?: string): Promise<schema.CompetencyCategory[]>;
  getCompetencyItems(categoryId?: number): Promise<schema.CompetencyItem[]>;
  getAllCompetencyItemsWithCategories(): Promise<{ categories: (schema.CompetencyCategory & { items: schema.CompetencyItem[] })[] }>;

  getTrainingMatrixSubmission(userId: string): Promise<schema.TrainingMatrixSubmission | undefined>;
  getAllTrainingMatrixSubmissions(): Promise<schema.TrainingMatrixSubmission[]>;
  createTrainingMatrixSubmission(sub: schema.InsertTrainingMatrixSubmission): Promise<schema.TrainingMatrixSubmission>;
  updateTrainingMatrixSubmission(id: number, data: Partial<schema.InsertTrainingMatrixSubmission>): Promise<schema.TrainingMatrixSubmission | undefined>;

  getStandardsSurveyRoles(): Promise<schema.StandardsSurveyRole[]>;
  getStandardsSurveyItems(surveyRoleId: number): Promise<schema.StandardsSurveyItem[]>;
  createStandardsSurveyRole(role: schema.InsertStandardsSurveyRole): Promise<schema.StandardsSurveyRole>;
  createStandardsSurveyItem(item: schema.InsertStandardsSurveyItem): Promise<schema.StandardsSurveyItem>;
  updateStandardsSurveyItem(id: number, data: Partial<schema.InsertStandardsSurveyItem>): Promise<schema.StandardsSurveyItem | undefined>;
  deleteStandardsSurveyItem(id: number): Promise<void>;

  getResources(): Promise<schema.Resource[]>;
  createResource(resource: schema.InsertResource): Promise<schema.Resource>;
  updateResource(id: number, data: Partial<schema.InsertResource>): Promise<schema.Resource | undefined>;
  deleteResource(id: number): Promise<void>;

  getCertificateDefinitions(): Promise<schema.CertificateDefinition[]>;
  createCertificateDefinition(def: schema.InsertCertificateDefinition): Promise<schema.CertificateDefinition>;
  updateCertificateDefinition(id: number, data: Partial<schema.InsertCertificateDefinition>): Promise<schema.CertificateDefinition | undefined>;
  deleteCertificateDefinition(id: number): Promise<void>;

  getUserCertificates(userId?: string): Promise<schema.UserCertificate[]>;
  createUserCertificate(cert: schema.InsertUserCertificate): Promise<schema.UserCertificate>;
  deleteUserCertificate(id: number): Promise<void>;

  getCareerMilestones(userId: string): Promise<schema.CareerMilestone[]>;
  createCareerMilestone(milestone: schema.InsertCareerMilestone): Promise<schema.CareerMilestone>;

  getCareerNodes(): Promise<schema.CareerNode[]>;
  createCareerNode(node: schema.InsertCareerNode): Promise<schema.CareerNode>;

  getTrainingRecords(userId?: string): Promise<schema.TrainingRecord[]>;
  createTrainingRecord(record: schema.InsertTrainingRecord): Promise<schema.TrainingRecord>;
  updateTrainingRecord(id: number, data: Partial<schema.InsertTrainingRecord>): Promise<schema.TrainingRecord | undefined>;

  getJobRoles(): Promise<schema.JobRole[]>;
  createJobRole(role: schema.InsertJobRole): Promise<schema.JobRole>;
  updateJobRole(id: number, data: Partial<schema.InsertJobRole>): Promise<schema.JobRole | undefined>;
  deleteJobRole(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async getAllUsers() {
    return db.select().from(schema.users);
  }

  async createUser(user: schema.InsertUser) {
    const [created] = await db.insert(schema.users).values(user).returning();
    return created;
  }

  async updateUser(id: string, data: Partial<schema.InsertUser>) {
    const [updated] = await db.update(schema.users).set(data).where(eq(schema.users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string) {
    await db.delete(schema.users).where(eq(schema.users.id, id));
  }

  async getTeamMembers(managerId: string) {
    return db.select().from(schema.users).where(eq(schema.users.managerId, managerId));
  }

  async getInductionTemplateItems() {
    return db.select().from(schema.inductionTemplateItems).orderBy(schema.inductionTemplateItems.sortOrder);
  }

  async createInductionTemplateItem(item: schema.InsertInductionTemplateItem) {
    const [created] = await db.insert(schema.inductionTemplateItems).values(item).returning();
    return created;
  }

  async updateInductionTemplateItem(id: number, data: Partial<schema.InsertInductionTemplateItem>) {
    const [updated] = await db.update(schema.inductionTemplateItems).set(data).where(eq(schema.inductionTemplateItems.id, id)).returning();
    return updated;
  }

  async deleteInductionTemplateItem(id: number) {
    await db.delete(schema.inductionTemplateItems).where(eq(schema.inductionTemplateItems.id, id));
  }

  async getInductionInstance(userId: string) {
    const [instance] = await db.select().from(schema.inductionInstances).where(eq(schema.inductionInstances.userId, userId));
    return instance;
  }

  async createInductionInstance(instance: schema.InsertInductionInstance) {
    const [created] = await db.insert(schema.inductionInstances).values(instance).returning();
    return created;
  }

  async getInductionCompletions(instanceId: number) {
    return db.select().from(schema.inductionItemCompletions).where(eq(schema.inductionItemCompletions.instanceId, instanceId));
  }

  async upsertInductionCompletion(data: schema.InsertInductionItemCompletion) {
    const existing = await db.select().from(schema.inductionItemCompletions)
      .where(and(
        eq(schema.inductionItemCompletions.instanceId, data.instanceId),
        eq(schema.inductionItemCompletions.templateItemId, data.templateItemId)
      ));

    if (existing.length > 0) {
      const [updated] = await db.update(schema.inductionItemCompletions)
        .set(data)
        .where(eq(schema.inductionItemCompletions.id, existing[0].id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(schema.inductionItemCompletions).values(data).returning();
    return created;
  }

  async getCompetencyCategories(departmentType?: string) {
    if (departmentType) {
      return db.select().from(schema.competencyCategories)
        .where(eq(schema.competencyCategories.departmentType, departmentType))
        .orderBy(schema.competencyCategories.sortOrder);
    }
    return db.select().from(schema.competencyCategories).orderBy(schema.competencyCategories.sortOrder);
  }

  async getCompetencyItems(categoryId?: number) {
    if (categoryId) {
      return db.select().from(schema.competencyItems)
        .where(eq(schema.competencyItems.categoryId, categoryId))
        .orderBy(schema.competencyItems.sortOrder);
    }
    return db.select().from(schema.competencyItems).orderBy(schema.competencyItems.sortOrder);
  }

  async getAllCompetencyItemsWithCategories() {
    const cats = await this.getCompetencyCategories();
    const items = await this.getCompetencyItems();
    const categories = cats.map(cat => ({
      ...cat,
      items: items.filter(item => item.categoryId === cat.id),
    }));
    return { categories };
  }

  async getTrainingMatrixSubmission(userId: string) {
    const [sub] = await db.select().from(schema.trainingMatrixSubmissions)
      .where(eq(schema.trainingMatrixSubmissions.userId, userId));
    return sub;
  }

  async getAllTrainingMatrixSubmissions() {
    return db.select().from(schema.trainingMatrixSubmissions);
  }

  async createTrainingMatrixSubmission(sub: schema.InsertTrainingMatrixSubmission) {
    const [created] = await db.insert(schema.trainingMatrixSubmissions).values(sub).returning();
    return created;
  }

  async updateTrainingMatrixSubmission(id: number, data: Partial<schema.InsertTrainingMatrixSubmission>) {
    const [updated] = await db.update(schema.trainingMatrixSubmissions)
      .set(data).where(eq(schema.trainingMatrixSubmissions.id, id)).returning();
    return updated;
  }

  async getStandardsSurveyRoles() {
    return db.select().from(schema.standardsSurveyRoles);
  }

  async getStandardsSurveyItems(surveyRoleId: number) {
    return db.select().from(schema.standardsSurveyItems)
      .where(eq(schema.standardsSurveyItems.surveyRoleId, surveyRoleId))
      .orderBy(schema.standardsSurveyItems.sortOrder);
  }

  async createStandardsSurveyRole(role: schema.InsertStandardsSurveyRole) {
    const [created] = await db.insert(schema.standardsSurveyRoles).values(role).returning();
    return created;
  }

  async createStandardsSurveyItem(item: schema.InsertStandardsSurveyItem) {
    const [created] = await db.insert(schema.standardsSurveyItems).values(item).returning();
    return created;
  }

  async updateStandardsSurveyItem(id: number, data: Partial<schema.InsertStandardsSurveyItem>) {
    const [updated] = await db.update(schema.standardsSurveyItems).set(data)
      .where(eq(schema.standardsSurveyItems.id, id)).returning();
    return updated;
  }

  async deleteStandardsSurveyItem(id: number) {
    await db.delete(schema.standardsSurveyItems).where(eq(schema.standardsSurveyItems.id, id));
  }

  async getResources() {
    return db.select().from(schema.resources);
  }

  async createResource(resource: schema.InsertResource) {
    const [created] = await db.insert(schema.resources).values(resource).returning();
    return created;
  }

  async updateResource(id: number, data: Partial<schema.InsertResource>) {
    const [updated] = await db.update(schema.resources).set(data).where(eq(schema.resources.id, id)).returning();
    return updated;
  }

  async deleteResource(id: number) {
    await db.delete(schema.resources).where(eq(schema.resources.id, id));
  }

  async getCertificateDefinitions() {
    return db.select().from(schema.certificateDefinitions);
  }

  async createCertificateDefinition(def: schema.InsertCertificateDefinition) {
    const [created] = await db.insert(schema.certificateDefinitions).values(def).returning();
    return created;
  }

  async updateCertificateDefinition(id: number, data: Partial<schema.InsertCertificateDefinition>) {
    const [updated] = await db.update(schema.certificateDefinitions).set(data)
      .where(eq(schema.certificateDefinitions.id, id)).returning();
    return updated;
  }

  async deleteCertificateDefinition(id: number) {
    await db.delete(schema.certificateDefinitions).where(eq(schema.certificateDefinitions.id, id));
  }

  async getUserCertificates(userId?: string) {
    if (userId) {
      return db.select().from(schema.userCertificates).where(eq(schema.userCertificates.userId, userId));
    }
    return db.select().from(schema.userCertificates);
  }

  async createUserCertificate(cert: schema.InsertUserCertificate) {
    const [created] = await db.insert(schema.userCertificates).values(cert).returning();
    return created;
  }

  async deleteUserCertificate(id: number) {
    await db.delete(schema.userCertificates).where(eq(schema.userCertificates.id, id));
  }

  async getCareerMilestones(userId: string) {
    return db.select().from(schema.careerMilestones).where(eq(schema.careerMilestones.userId, userId));
  }

  async createCareerMilestone(milestone: schema.InsertCareerMilestone) {
    const [created] = await db.insert(schema.careerMilestones).values(milestone).returning();
    return created;
  }

  async getCareerNodes() {
    return db.select().from(schema.careerNodes).orderBy(schema.careerNodes.level);
  }

  async createCareerNode(node: schema.InsertCareerNode) {
    const [created] = await db.insert(schema.careerNodes).values(node).returning();
    return created;
  }

  async getTrainingRecords(userId?: string) {
    if (userId) {
      return db.select().from(schema.trainingRecords).where(eq(schema.trainingRecords.userId, userId));
    }
    return db.select().from(schema.trainingRecords);
  }

  async createTrainingRecord(record: schema.InsertTrainingRecord) {
    const [created] = await db.insert(schema.trainingRecords).values(record).returning();
    return created;
  }

  async updateTrainingRecord(id: number, data: Partial<schema.InsertTrainingRecord>) {
    const [updated] = await db.update(schema.trainingRecords).set(data)
      .where(eq(schema.trainingRecords.id, id)).returning();
    return updated;
  }

  async getJobRoles() {
    return db.select().from(schema.jobRoles);
  }

  async createJobRole(role: schema.InsertJobRole) {
    const [created] = await db.insert(schema.jobRoles).values(role).returning();
    return created;
  }

  async updateJobRole(id: number, data: Partial<schema.InsertJobRole>) {
    const [updated] = await db.update(schema.jobRoles).set(data).where(eq(schema.jobRoles.id, id)).returning();
    return updated;
  }

  async deleteJobRole(id: number) {
    await db.delete(schema.jobRoles).where(eq(schema.jobRoles.id, id));
  }
}

export const storage = new DatabaseStorage();
