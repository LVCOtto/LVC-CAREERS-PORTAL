import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { exportFullBackup } from "./backup";
import { importFullBackup } from "./restore";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===== USERS =====
  app.get("/api/users", async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    const body = req.body;
    if (!body.id) {
      const slug = (body.name || "user")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      body.id = `${slug}-${Date.now().toString(36)}`;
    }
    if (body.username && body.email && body.password) {
      body.activated = true;
    }
    const user = await storage.createUser(body);
    res.status(201).json(user);
  });

  app.patch("/api/users/:id", async (req, res) => {
    const existing = await storage.getUser(req.params.id);
    if (!existing) return res.status(404).json({ message: "User not found" });
    const data = { ...req.body };
    const mergedUsername = data.username !== undefined ? data.username : existing.username;
    const mergedEmail = data.email !== undefined ? data.email : existing.email;
    const mergedPassword = data.password !== undefined ? data.password : existing.password;
    if (mergedUsername && mergedEmail && mergedPassword) {
      data.activated = true;
    }
    const user = await storage.updateUser(req.params.id, data);
    res.json(user);
  });

  app.delete("/api/users/:id", async (req, res) => {
    await storage.deleteUser(req.params.id);
    res.status(204).send();
  });

  app.get("/api/users/:id/team", async (req, res) => {
    const members = await storage.getTeamMembers(req.params.id);
    res.json(members);
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username) return res.status(401).json({ message: "Invalid credentials" });
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.activated) {
      return res.status(403).json({ message: "Account not yet activated — contact your administrator" });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json(user);
  });

  // ===== INDUCTION TEMPLATES =====
  app.get("/api/induction-templates", async (_req, res) => {
    const items = await storage.getInductionTemplateItems();
    res.json(items);
  });

  app.post("/api/induction-templates", async (req, res) => {
    const item = await storage.createInductionTemplateItem(req.body);
    res.status(201).json(item);
  });

  app.patch("/api/induction-templates/reorder", async (req, res) => {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "updates array required" });
    }
    try {
      for (const { id, sortOrder, section } of updates) {
        const data: any = { sortOrder };
        if (section !== undefined) data.section = section;
        await storage.updateInductionTemplateItem(id, data);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Reorder failed" });
    }
  });

  app.patch("/api/induction-templates/:id", async (req, res) => {
    const item = await storage.updateInductionTemplateItem(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/induction-templates/:id", async (req, res) => {
    await storage.deleteInductionTemplateItem(Number(req.params.id));
    res.status(204).send();
  });

  app.patch("/api/induction-sections/rename", async (req, res) => {
    const { oldName, newName } = req.body;
    if (!oldName || !newName) {
      return res.status(400).json({ message: "oldName and newName are required" });
    }
    try {
      await storage.renameInductionSection(oldName, newName);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Rename failed" });
    }
  });

  // ===== INDUCTION INSTANCES =====
  app.get("/api/induction/shared/:token", async (req, res) => {
    const instance = await storage.getInductionByShareToken(req.params.token);
    if (!instance) return res.status(404).json({ message: "Not found" });

    const user = await storage.getUser(instance.userId);
    let templateItems = await storage.getInductionTemplateItems();
    const completions = await storage.getInductionCompletions(instance.id);

    if (user?.jobRole) {
      const allowedSections = await storage.getInductionSectionsForUser(user.jobRole);
      templateItems = templateItems.filter(item => allowedSections.includes(item.section));
    }

    const items = templateItems.map((tmpl) => {
      const completion = completions.find((c) => c.templateItemId === tmpl.id);
      return {
        ...tmpl,
        completed: completion?.completed ?? false,
        inProgress: completion?.inProgress ?? false,
        completedDate: completion?.completedDate ?? null,
        targetDate: completion?.targetDate ?? null,
        signedOffBy: completion?.signedOffBy ?? null,
        signedOffDate: completion?.signedOffDate ?? null,
        assignedTo: completion?.assignedTo ?? null,
      };
    });

    res.json({
      instance,
      items,
      user: user ? { name: user.name, jobRole: user.jobRole, department: user.department } : null,
    });
  });

  app.get("/api/induction/:userId", async (req, res) => {
    let instance = await storage.getInductionInstance(req.params.userId);
    if (!instance) {
      instance = await storage.createInductionInstance({
        userId: req.params.userId,
        templateName: "Standard Induction",
        status: "not_started",
        createdDate: new Date().toISOString().split("T")[0],
      });
    }
    let templateItems = await storage.getInductionTemplateItems();
    const completions = await storage.getInductionCompletions(instance.id);

    const user = await storage.getUser(req.params.userId);
    if (user?.jobRole) {
      const allowedSections = await storage.getInductionSectionsForUser(user.jobRole);
      templateItems = templateItems.filter(item => allowedSections.includes(item.section));
    }

    const items = templateItems.map((tmpl) => {
      const completion = completions.find((c) => c.templateItemId === tmpl.id);
      return {
        ...tmpl,
        completed: completion?.completed ?? false,
        inProgress: completion?.inProgress ?? false,
        completedDate: completion?.completedDate ?? null,
        targetDate: completion?.targetDate ?? null,
        signedOffBy: completion?.signedOffBy ?? null,
        signedOffDate: completion?.signedOffDate ?? null,
        assignedTo: completion?.assignedTo ?? null,
      };
    });

    res.json({ instance, items });
  });

  app.post("/api/induction/:userId/complete-item", async (req, res) => {
    const { templateItemId, completed, inProgress, completedDate, targetDate, signedOffBy, signedOffDate, assignedTo } = req.body;
    let instance = await storage.getInductionInstance(req.params.userId);
    if (!instance) {
      instance = await storage.createInductionInstance({
        userId: req.params.userId,
        templateName: "Standard Induction",
        status: "in_progress",
        createdDate: new Date().toISOString().split("T")[0],
      });
    }

    const completion = await storage.upsertInductionCompletion({
      instanceId: instance.id,
      templateItemId,
      completed,
      inProgress: inProgress ?? false,
      completedDate: completedDate || null,
      targetDate: targetDate !== undefined ? (targetDate || null) : undefined,
      signedOffBy: signedOffBy || null,
      signedOffDate: signedOffDate || null,
      assignedTo: assignedTo !== undefined ? assignedTo : undefined,
    });

    res.json(completion);
  });

  app.post("/api/induction/:userId/share", async (req, res) => {
    let instance = await storage.getInductionInstance(req.params.userId);
    if (!instance) {
      instance = await storage.createInductionInstance({
        userId: req.params.userId,
        templateName: "Standard Induction",
        status: "not_started",
        createdDate: new Date().toISOString().split("T")[0],
      });
    }
    if (instance.shareToken) {
      return res.json({ token: instance.shareToken });
    }
    const token = await storage.generateInductionShareToken(instance.id);
    res.json({ token });
  });

  // ===== COMPETENCIES (Training Matrix Template) =====
  app.get("/api/competencies", async (req, res) => {
    const departmentType = req.query.departmentType as string | undefined;
    const categories = await storage.getCompetencyCategories(departmentType);
    const items = await storage.getCompetencyItems();
    const result = categories.map((cat) => ({
      ...cat,
      items: items.filter((item) => item.categoryId === cat.id),
    }));
    res.json(result);
  });

  app.post("/api/competency-categories", async (req, res) => {
    const cat = await storage.createCompetencyCategory(req.body);
    res.status(201).json(cat);
  });

  app.patch("/api/competency-categories/:id", async (req, res) => {
    const cat = await storage.updateCompetencyCategory(Number(req.params.id), req.body);
    if (!cat) return res.status(404).json({ message: "Not found" });
    res.json(cat);
  });

  app.delete("/api/competency-categories/:id", async (req, res) => {
    await storage.deleteCompetencyCategory(Number(req.params.id));
    res.status(204).send();
  });

  app.patch("/api/competency-items/reorder", async (req, res) => {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "updates array required" });
    }
    try {
      for (const { id, sortOrder } of updates) {
        await storage.updateCompetencyItem(id, { sortOrder });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Reorder failed" });
    }
  });

  app.post("/api/competency-items", async (req, res) => {
    const item = await storage.createCompetencyItem(req.body);
    res.status(201).json(item);
  });

  app.patch("/api/competency-items/:id", async (req, res) => {
    const item = await storage.updateCompetencyItem(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/competency-items/:id", async (req, res) => {
    await storage.deleteCompetencyItem(Number(req.params.id));
    res.status(204).send();
  });

  // ===== TRAINING MATRIX SUBMISSIONS =====
  app.get("/api/training-matrix", async (_req, res) => {
    const submissions = await storage.getAllTrainingMatrixSubmissions();
    res.json(submissions);
  });

  app.get("/api/training-matrix/history/:userId", async (req, res) => {
    const history = await storage.getTrainingMatrixHistory(req.params.userId);
    res.json(history);
  });

  app.get("/api/training-matrix/:userId", async (req, res) => {
    const submission = await storage.getTrainingMatrixSubmission(req.params.userId);
    res.json(submission || null);
  });

  app.post("/api/training-matrix", async (req, res) => {
    const submission = await storage.createTrainingMatrixSubmission(req.body);
    res.status(201).json(submission);
  });

  app.patch("/api/training-matrix/:id", async (req, res) => {
    const submission = await storage.updateTrainingMatrixSubmission(Number(req.params.id), req.body);
    if (!submission) return res.status(404).json({ message: "Not found" });
    res.json(submission);
  });

  app.post("/api/training-matrix/:id/share", async (req, res) => {
    const sub = await storage.getAllTrainingMatrixSubmissions();
    const found = sub.find(s => s.id === Number(req.params.id));
    if (!found) return res.status(404).json({ message: "Submission not found" });
    if (found.shareToken) {
      return res.json({ token: found.shareToken });
    }
    const token = await storage.generateShareToken(found.id);
    res.json({ token });
  });

  app.get("/api/training-matrix/shared/:token", async (req, res) => {
    const submission = await storage.getTrainingMatrixByToken(req.params.token);
    if (!submission) return res.status(404).json({ message: "Not found" });
    const user = await storage.getUser(submission.userId);
    let competencies: any[] | null = null;
    if (user?.jobRole) {
      competencies = await storage.getCompetencyCategoriesForJobRole(user.jobRole);
    }
    if (!competencies) {
      const userDept = user?.department || '';
      const deptCategories = userDept ? await storage.getCompetencyCategories(userDept) : [];
      const universalCategories = await storage.getCompetencyCategories('Universal');
      const allCats = [...universalCategories, ...deptCategories];
      const items = await storage.getCompetencyItems();
      competencies = allCats.map(cat => ({
        ...cat,
        items: items.filter(item => item.categoryId === cat.id),
      }));
    }
    res.json({
      submission,
      competencies,
      userName: user?.name || 'Unknown',
      jobRole: user?.jobRole || '',
      department: user?.department || '',
    });
  });

  app.patch("/api/training-matrix/shared/:token", async (req, res) => {
    const submission = await storage.getTrainingMatrixByToken(req.params.token);
    if (!submission) return res.status(404).json({ message: "Not found" });
    const updated = await storage.updateTrainingMatrixSubmission(submission.id, req.body);
    res.json(updated);
  });

  // ===== STANDARDS SURVEYS =====
  app.get("/api/standards-surveys", async (_req, res) => {
    const roles = await storage.getStandardsSurveyRoles();
    const result = await Promise.all(
      roles.map(async (role) => {
        const items = await storage.getStandardsSurveyItems(role.id);
        return { ...role, items };
      })
    );
    res.json(result);
  });

  app.get("/api/standards-surveys/:roleId", async (req, res) => {
    const roles = await storage.getStandardsSurveyRoles();
    const role = roles.find((r) => r.roleSlug === req.params.roleId || r.id === Number(req.params.roleId));
    if (!role) return res.status(404).json({ message: "Survey role not found" });
    const items = await storage.getStandardsSurveyItems(role.id);
    res.json({ ...role, items });
  });

  app.post("/api/standards-surveys/roles", async (req, res) => {
    const role = await storage.createStandardsSurveyRole(req.body);
    res.status(201).json(role);
  });

  app.delete("/api/standards-surveys/roles/:id", async (req, res) => {
    await storage.deleteStandardsSurveyRole(Number(req.params.id));
    res.status(204).send();
  });

  app.post("/api/standards-surveys/items", async (req, res) => {
    const item = await storage.createStandardsSurveyItem(req.body);
    res.status(201).json(item);
  });

  app.patch("/api/standards-surveys/items/:id", async (req, res) => {
    const item = await storage.updateStandardsSurveyItem(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/standards-surveys/items/:id", async (req, res) => {
    await storage.deleteStandardsSurveyItem(Number(req.params.id));
    res.status(204).send();
  });

  // ===== RESOURCES =====
  app.get("/api/resources", async (_req, res) => {
    const resources = await storage.getResources();
    res.json(resources);
  });

  app.post("/api/resources", async (req, res) => {
    const resource = await storage.createResource(req.body);
    res.status(201).json(resource);
  });

  app.patch("/api/resources/:id", async (req, res) => {
    const resource = await storage.updateResource(Number(req.params.id), req.body);
    if (!resource) return res.status(404).json({ message: "Not found" });
    res.json(resource);
  });

  app.delete("/api/resources/:id", async (req, res) => {
    await storage.deleteResource(Number(req.params.id));
    res.status(204).send();
  });

  // ===== CERTIFICATE DEFINITIONS =====
  app.get("/api/certificate-definitions", async (_req, res) => {
    const defs = await storage.getCertificateDefinitions();
    res.json(defs);
  });

  app.post("/api/certificate-definitions", async (req, res) => {
    const def = await storage.createCertificateDefinition(req.body);
    res.status(201).json(def);
  });

  app.patch("/api/certificate-definitions/:id", async (req, res) => {
    const def = await storage.updateCertificateDefinition(Number(req.params.id), req.body);
    if (!def) return res.status(404).json({ message: "Not found" });
    res.json(def);
  });

  app.delete("/api/certificate-definitions/:id", async (req, res) => {
    await storage.deleteCertificateDefinition(Number(req.params.id));
    res.status(204).send();
  });

  // ===== USER CERTIFICATES =====
  app.get("/api/user-certificates", async (req, res) => {
    const userId = req.query.userId as string | undefined;
    const certs = await storage.getUserCertificates(userId);
    res.json(certs);
  });

  app.post("/api/user-certificates", async (req, res) => {
    const cert = await storage.createUserCertificate(req.body);
    res.status(201).json(cert);
  });

  app.delete("/api/user-certificates/:id", async (req, res) => {
    await storage.deleteUserCertificate(Number(req.params.id));
    res.status(204).send();
  });

  // ===== CAREER MILESTONES =====
  app.get("/api/career-milestones/:userId", async (req, res) => {
    const milestones = await storage.getCareerMilestones(req.params.userId);
    res.json(milestones);
  });

  app.post("/api/career-milestones", async (req, res) => {
    const milestone = await storage.createCareerMilestone(req.body);
    res.status(201).json(milestone);
  });

  app.patch("/api/career-milestones/:id", async (req, res) => {
    const milestone = await storage.updateCareerMilestone(Number(req.params.id), req.body);
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });
    res.json(milestone);
  });

  app.delete("/api/career-milestones/:id", async (req, res) => {
    await storage.deleteCareerMilestone(Number(req.params.id));
    res.status(204).send();
  });

  // ===== CAREER NODES =====
  app.get("/api/career-nodes", async (_req, res) => {
    const nodes = await storage.getCareerNodes();
    res.json(nodes);
  });

  app.post("/api/career-nodes", async (req, res) => {
    const node = await storage.createCareerNode(req.body);
    res.status(201).json(node);
  });

  // ===== TRAINING RECORDS =====
  app.get("/api/training-records", async (req, res) => {
    const userId = req.query.userId as string | undefined;
    const records = await storage.getTrainingRecords(userId);
    res.json(records);
  });

  app.post("/api/training-records", async (req, res) => {
    const record = await storage.createTrainingRecord(req.body);
    res.status(201).json(record);
  });

  app.patch("/api/training-records/:id", async (req, res) => {
    const record = await storage.updateTrainingRecord(Number(req.params.id), req.body);
    if (!record) return res.status(404).json({ message: "Not found" });
    res.json(record);
  });

  // ===== JOB ROLES =====
  app.get("/api/job-roles", async (_req, res) => {
    const roles = await storage.getJobRoles();
    res.json(roles);
  });

  app.post("/api/job-roles", async (req, res) => {
    const role = await storage.createJobRole(req.body);
    res.status(201).json(role);
  });

  async function wouldCreateCycle(roleId: number, newParentId: number | null | undefined): Promise<boolean> {
    if (newParentId === null || newParentId === undefined) return false;
    if (newParentId === roleId) return true;
    const allRoles = await storage.getJobRoles();
    const visited = new Set<number>();
    let current: number | null = newParentId;
    while (current !== null) {
      if (current === roleId) return true;
      if (visited.has(current)) return true;
      visited.add(current);
      const parent = allRoles.find(r => r.id === current);
      current = parent?.reportsTo ?? null;
    }
    return false;
  }

  app.patch("/api/job-roles/reorder", async (req, res) => {
    const { id, reportsTo, sortOrder } = req.body;
    if (typeof id !== "number") return res.status(400).json({ message: "id is required" });
    if (reportsTo !== undefined && await wouldCreateCycle(id, reportsTo)) {
      return res.status(400).json({ message: "Cannot set parent: this would create a circular reporting chain." });
    }
    const updates: any = {};
    if (reportsTo !== undefined) updates.reportsTo = reportsTo;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    const role = await storage.updateJobRole(id, updates);
    if (!role) return res.status(404).json({ message: "Not found" });
    res.json(role);
  });

  app.patch("/api/job-roles/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (req.body.reportsTo !== undefined && await wouldCreateCycle(id, req.body.reportsTo)) {
      return res.status(400).json({ message: "Cannot set parent: this would create a circular reporting chain." });
    }
    const role = await storage.updateJobRole(id, req.body);
    if (!role) return res.status(404).json({ message: "Not found" });
    res.json(role);
  });

  app.delete("/api/job-roles/:id", async (req, res) => {
    try {
      await storage.deleteJobRole(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete job role" });
    }
  });

  app.get("/api/job-roles/:id/categories", async (req, res) => {
    const assignments = await storage.getJobRoleCategories(Number(req.params.id));
    res.json(assignments.map(a => a.categoryId));
  });

  app.put("/api/job-roles/:id/categories", async (req, res) => {
    const { categoryIds } = req.body;
    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ message: "categoryIds must be an array" });
    }
    await storage.setJobRoleCategories(Number(req.params.id), categoryIds);
    res.json({ success: true });
  });

  app.get("/api/competencies-for-role", async (req, res) => {
    const jobRole = req.query.jobRole as string | undefined;
    if (!jobRole) {
      return res.status(400).json({ message: "jobRole query parameter required" });
    }
    const result = await storage.getCompetencyCategoriesForJobRole(jobRole);
    if (result) {
      return res.json(result);
    }
    return res.json(null);
  });

  // ===== INDUCTION SECTION SETTINGS =====
  app.get("/api/induction-section-settings", async (_req, res) => {
    const settings = await storage.getInductionSectionSettings();
    res.json(settings);
  });

  app.put("/api/induction-section-settings", async (req, res) => {
    const { sectionName, isUniversal } = req.body;
    if (!sectionName) return res.status(400).json({ message: "sectionName required" });
    const setting = await storage.upsertInductionSectionSetting(sectionName, !!isUniversal);
    res.json(setting);
  });

  app.get("/api/job-roles/:id/induction-sections", async (req, res) => {
    const sections = await storage.getJobRoleInductionSections(Number(req.params.id));
    res.json(sections);
  });

  app.put("/api/job-roles/:id/induction-sections", async (req, res) => {
    const { sections } = req.body;
    if (!Array.isArray(sections)) {
      return res.status(400).json({ message: "sections must be an array of section names" });
    }
    await storage.setJobRoleInductionSections(Number(req.params.id), sections);
    res.json({ success: true });
  });

  // ===== DEPARTMENTS =====
  app.get("/api/departments", async (_req, res) => {
    const departments = await storage.getDepartments();
    res.json(departments);
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const dept = await storage.createDepartment(req.body);
      res.status(201).json(dept);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/departments/:id/rename", async (req, res) => {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    try {
      const updated = await storage.renameDepartment(id, name.trim());
      if (!updated) return res.status(404).json({ message: "Department not found" });
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/departments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateDepartment(id, req.body);
    if (!updated) return res.status(404).json({ message: "Department not found" });
    res.json(updated);
  });

  app.delete("/api/departments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const users = await storage.getAllUsers();
    const depts = await storage.getDepartments();
    const dept = depts.find(d => d.id === id);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    const usersInDept = users.filter(u => u.department === dept.name);
    if (usersInDept.length > 0) {
      return res.status(400).json({ message: `Cannot delete: ${usersInDept.length} user(s) are assigned to this department` });
    }
    const childDepts = depts.filter(d => d.parentId === id);
    if (childDepts.length > 0) {
      return res.status(400).json({ message: `Cannot delete: this department has ${childDepts.length} sub-department(s)` });
    }
    await storage.deleteDepartment(id);
    res.status(204).end();
  });

  // ===== PORTAL SETTINGS =====
  app.get("/api/portal-settings", async (_req, res) => {
    const settings = await storage.getPortalSettings();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  });

  app.put("/api/portal-settings", async (req, res) => {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
      return res.status(400).json({ message: "settings must be an array of {key, value, category}" });
    }
    await storage.batchUpsertPortalSettings(settings);
    res.json({ success: true });
  });

  // ===== FULL BACKUP / RESTORE =====
  app.get("/api/export/full-backup", async (_req, res) => {
    try {
      await exportFullBackup(res);
    } catch (error) {
      res.status(500).json({ message: "Full backup export failed" });
    }
  });

  app.post("/api/import/full-backup", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const result = await importFullBackup(req.file.buffer);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Full backup restore failed" });
    }
  });

  // ===== EXPORT (CSV) =====
  app.get("/api/export/:type", async (req, res) => {
    const { type } = req.params;
    try {
      let csvContent = "";
      let filename = "";

      if (type === "users") {
        const users = await storage.getAllUsers();
        csvContent = "ID,Name,Email,Username,Role,Job Role,Department,Manager ID,Start Date,Requires Induction,Activated\n";
        csvContent += users.map(u =>
          `"${u.id}","${u.name}","${u.email || ''}","${u.username || ''}","${u.role}","${u.jobRole}","${u.department}","${u.managerId || ''}","${u.startDate}",${u.requiresInduction},${u.activated}`
        ).join("\n");
        filename = "users.csv";
      } else if (type === "training-records") {
        const records = await storage.getTrainingRecords();
        csvContent = "ID,User ID,Requirement,Category,Completed Date,Expires Date,Status\n";
        csvContent += records.map(r =>
          `${r.id},"${r.userId}","${r.requirementName}","${r.category}","${r.completedDate || ''}","${r.expiresDate || ''}","${r.status}"`
        ).join("\n");
        filename = "training-records.csv";
      } else if (type === "certificates") {
        const certs = await storage.getUserCertificates();
        const defs = await storage.getCertificateDefinitions();
        csvContent = "ID,User ID,Certificate,Provider,Issue Date,Expiry Date,Status\n";
        csvContent += certs.map(c => {
          const def = defs.find(d => d.id === c.definitionId);
          return `${c.id},"${c.userId}","${def?.name || ''}","${def?.provider || ''}","${c.issueDate}","${c.expiryDate || ''}","${c.status}"`;
        }).join("\n");
        filename = "certificates.csv";
      } else if (type === "job-roles") {
        const roles = await storage.getJobRoles();
        const allUsers = await storage.getAllUsers();
        const roleMap = new Map(roles.map(r => [r.id, r]));
        csvContent = "Role Title,Department,Reports To,Colleague Name,Colleague Email\n";
        const csvRows: string[] = [];
        for (const role of roles) {
          const reportsToRole = role.reportsTo ? roleMap.get(role.reportsTo) : null;
          const reportsToTitle = reportsToRole ? reportsToRole.title : "";
          const colleagues = allUsers.filter(u => u.jobRole === role.title);
          if (colleagues.length === 0) {
            csvRows.push(`"${role.title.replace(/"/g, '""')}","${role.department.replace(/"/g, '""')}","${reportsToTitle.replace(/"/g, '""')}","",""`);
          } else {
            for (const col of colleagues) {
              csvRows.push(`"${role.title.replace(/"/g, '""')}","${role.department.replace(/"/g, '""')}","${reportsToTitle.replace(/"/g, '""')}","${(col.name || '').replace(/"/g, '""')}","${(col.email || '').replace(/"/g, '""')}"`);
            }
          }
        }
        csvContent += csvRows.join("\n");
        filename = "job-roles-with-colleagues.csv";
      } else if (type === "competencies") {
        const { categories } = await storage.getAllCompetencyItemsWithCategories();
        csvContent = "category_name,category_department_type,category_sort_order,item_name,item_description,item_sort_order\n";
        for (const cat of categories) {
          for (const item of cat.items) {
            csvContent += `"${cat.name}","${cat.departmentType}",${cat.sortOrder},"${item.name}","${(item.description || '').replace(/"/g, '""')}",${item.sortOrder}\n`;
          }
          if (cat.items.length === 0) {
            csvContent += `"${cat.name}","${cat.departmentType}",${cat.sortOrder},"","",0\n`;
          }
        }
        filename = "competencies.csv";
      } else if (type === "induction-templates") {
        const items = await storage.getInductionTemplateItems();
        csvContent = "section,title,description,requiresEvidence,sortOrder\n";
        csvContent += items.map(i =>
          `"${i.section}","${i.title}","${(i.description || '').replace(/"/g, '""')}",${i.requiresEvidence},${i.sortOrder}`
        ).join("\n");
        filename = "induction-templates.csv";
      } else if (type === "certificate-definitions") {
        const defs = await storage.getCertificateDefinitions();
        csvContent = "name,description,category,level,icon,provider,validityMonths\n";
        csvContent += defs.map(d =>
          `"${d.name}","${(d.description || '').replace(/"/g, '""')}","${d.category}","${d.level}","${d.icon}","${d.provider}",${d.validityMonths || ''}`
        ).join("\n");
        filename = "certificate-definitions.csv";
      } else if (type === "resources") {
        const resources = await storage.getResources();
        csvContent = "title,description,category,url,icon\n";
        csvContent += resources.map(r =>
          `"${r.title}","${(r.description || '').replace(/"/g, '""')}","${r.category}","${r.url}","${r.icon}"`
        ).join("\n");
        filename = "resources.csv";
      } else if (type === "standards-surveys") {
        const roles = await storage.getStandardsSurveyRoles();
        csvContent = "roleTitle,roleSlug,itemText,isFeedback,sortOrder\n";
        for (const role of roles) {
          const items = await storage.getStandardsSurveyItems(role.id);
          for (const item of items) {
            csvContent += `"${role.roleTitle}","${role.roleSlug}","${item.text.replace(/"/g, '""')}",${item.isFeedback},${item.sortOrder}\n`;
          }
        }
        filename = "standards-surveys.csv";
      } else {
        return res.status(400).json({ message: "Unknown export type" });
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Export failed" });
    }
  });

  // ===== CSV IMPORT =====
  app.post("/api/import/:type", async (req, res) => {
    const { type } = req.params;
    const { rows: rawRows } = req.body;
    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      return res.status(400).json({ message: "No data rows provided" });
    }
    const rows = rawRows.map((r: Record<string, string>) => {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) {
        out[k.trim().toLowerCase().replace(/\s+/g, "_")] = v;
      }
      return out;
    });
    try {
      let created = 0;
      let skipped = 0;
      let colleaguesUpdated = 0;
      const errors: string[] = [];

      if (type === "users") {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            if (!row.name) {
              errors.push(`Row ${i + 1}: Missing required field (name)`);
              skipped++;
              continue;
            }
            const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            const ri = row.requiresInduction || row.requires_induction || "";
            const requiresInduction = ri === "true" || ri === "yes" || ri === "1";
            const hasCredentials = !!(row.username && row.email && row.password);
            await storage.createUser({
              id: row.id || `${slug}-${Date.now().toString(36)}${i}`,
              username: row.username || null,
              password: row.password || null,
              name: row.name,
              email: row.email || null,
              role: row.role || "colleague",
              jobRole: row.jobRole || row.job_role || "",
              department: row.department || "",
              managerId: row.managerId || row.manager_id || null,
              startDate: row.startDate || row.start_date || new Date().toISOString().split("T")[0],
              requiresInduction,
              activated: hasCredentials,
            });
            created++;
          } catch (e: any) {
            errors.push(`Row ${i + 1} (${row.name || 'unknown'}): ${e.message}`);
            skipped++;
          }
        }
      } else if (type === "job-roles") {
        const allUsers = await storage.getAllUsers();
        const existingRoles = await storage.getJobRoles();
        const roleTitleToId = new Map<string, number>(existingRoles.map(r => [r.title, r.id]));
        const deferredReportsTo: Array<{ roleTitle: string; reportsToTitle: string }> = [];

        const getRoleTitle = (row: any) => row["role_title"] || row.title || "";
        const getRoleDept = (row: any) => row.department || "";
        const getRoleReportsTo = (row: any) => row["reports_to"] || row.reportsto || "";
        const getColEmail = (row: any) => row["colleague_email"] || "";

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            const title = getRoleTitle(row);
            const department = getRoleDept(row);
            if (!title || !department) {
              errors.push(`Row ${i + 1}: Missing required field (title or department)`);
              skipped++;
              continue;
            }

            let roleCreated = false;
            if (!roleTitleToId.has(title)) {
              const reportsToTitle = getRoleReportsTo(row);
              let reportsToId: number | null = null;
              if (reportsToTitle) {
                const parentId = roleTitleToId.get(reportsToTitle);
                if (parentId !== undefined) {
                  reportsToId = parentId;
                } else {
                  deferredReportsTo.push({ roleTitle: title, reportsToTitle });
                }
              }
              const newRole = await storage.createJobRole({
                title,
                department,
                summary: row.summary || "",
                responsibilities: row.responsibilities ? JSON.parse(row.responsibilities) : [],
                reportsTo: reportsToId,
                sortOrder: row.sortorder ? parseInt(row.sortorder) : 0,
              });
              roleTitleToId.set(title, newRole.id);
              created++;
              roleCreated = true;
            }

            const email = getColEmail(row);
            if (email) {
              const user = allUsers.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
              if (user) {
                await storage.updateUser(user.id, { jobRole: title, department });
                colleaguesUpdated++;
              } else {
                errors.push(`Row ${i + 1}: No user found with email "${email}"`);
                if (!roleCreated) skipped++;
              }
            } else if (!roleCreated) {
              skipped++;
            }
          } catch (e: any) {
            errors.push(`Row ${i + 1} (${getRoleTitle(row) || 'unknown'}): ${e.message}`);
            skipped++;
          }
        }

        for (const deferred of deferredReportsTo) {
          const parentId = roleTitleToId.get(deferred.reportsToTitle);
          const roleId = roleTitleToId.get(deferred.roleTitle);
          if (parentId !== undefined && roleId !== undefined) {
            try {
              await storage.updateJobRole(roleId, { reportsTo: parentId });
            } catch (e: any) {
              errors.push(`Failed to set Reports To for "${deferred.roleTitle}": ${e.message}`);
            }
          }
        }
      } else if (type === "competencies") {
        const existingCats = await storage.getCompetencyCategories();
        const catMap = new Map<string, number>();
        for (const cat of existingCats) {
          catMap.set(cat.name, cat.id);
        }
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            const catName = row.category_name;
            if (!catName) {
              errors.push(`Row ${i + 1}: Missing category_name`);
              skipped++;
              continue;
            }
            let catId = catMap.get(catName);
            if (!catId) {
              const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              const newCat = await storage.createCompetencyCategory({
                slug: `${slug}-${Date.now().toString(36)}`,
                name: catName,
                departmentType: row.category_department_type || "Universal",
                sortOrder: parseInt(row.category_sort_order) || 0,
              });
              catId = newCat.id;
              catMap.set(catName, catId);
            }
            const itemName = row.item_name;
            if (!itemName) continue;
            const itemSlug = itemName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            await storage.createCompetencyItem({
              categoryId: catId,
              slug: `${itemSlug}-${Date.now().toString(36)}${i}`,
              name: itemName,
              description: row.item_description || "",
              sortOrder: parseInt(row.item_sort_order) || 0,
            });
            created++;
          } catch (e: any) {
            errors.push(`Row ${i + 1}: ${e.message}`);
            skipped++;
          }
        }
      } else if (type === "induction-templates") {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            if (!row.section || !row.title) {
              errors.push(`Row ${i + 1}: Missing required field (section or title)`);
              skipped++;
              continue;
            }
            const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            await storage.createInductionTemplateItem({
              slug: `${slug}-${Date.now().toString(36)}${i}`,
              section: row.section,
              title: row.title,
              description: row.description || "",
              requiresEvidence: row.requiresEvidence === "true" || row.requiresEvidence === "1",
              sortOrder: parseInt(row.sortOrder) || 0,
            });
            created++;
          } catch (e: any) {
            errors.push(`Row ${i + 1} (${row.title || 'unknown'}): ${e.message}`);
            skipped++;
          }
        }
      } else if (type === "certificate-definitions") {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            if (!row.name) {
              errors.push(`Row ${i + 1}: Missing required field (name)`);
              skipped++;
              continue;
            }
            await storage.createCertificateDefinition({
              name: row.name,
              description: row.description || "",
              category: row.category || "Technical",
              level: row.level || "Standard",
              icon: row.icon || "Award",
              provider: row.provider || "",
              validityMonths: row.validityMonths ? parseInt(row.validityMonths) : null,
            });
            created++;
          } catch (e: any) {
            errors.push(`Row ${i + 1} (${row.name || 'unknown'}): ${e.message}`);
            skipped++;
          }
        }
      } else if (type === "resources") {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            if (!row.title) {
              errors.push(`Row ${i + 1}: Missing required field (title)`);
              skipped++;
              continue;
            }
            await storage.createResource({
              title: row.title,
              description: row.description || "",
              category: row.category || "General",
              url: row.url || "",
              icon: row.icon || "FileText",
            });
            created++;
          } catch (e: any) {
            errors.push(`Row ${i + 1} (${row.title || 'unknown'}): ${e.message}`);
            skipped++;
          }
        }
      } else if (type === "standards-surveys") {
        const existingRoles = await storage.getStandardsSurveyRoles();
        const roleMap = new Map<string, number>();
        for (const role of existingRoles) {
          roleMap.set(role.roleSlug, role.id);
        }
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            const roleSlug = row.roleSlug;
            const roleTitle = row.roleTitle;
            if (!roleSlug || !row.itemText) {
              errors.push(`Row ${i + 1}: Missing required field (roleSlug or itemText)`);
              skipped++;
              continue;
            }
            let roleId = roleMap.get(roleSlug);
            if (!roleId) {
              const newRole = await storage.createStandardsSurveyRole({
                roleSlug,
                roleTitle: roleTitle || roleSlug,
              });
              roleId = newRole.id;
              roleMap.set(roleSlug, roleId);
            }
            await storage.createStandardsSurveyItem({
              surveyRoleId: roleId,
              text: row.itemText,
              isFeedback: row.isFeedback === "true" || row.isFeedback === "1",
              sortOrder: parseInt(row.sortOrder) || 0,
            });
            created++;
          } catch (e: any) {
            errors.push(`Row ${i + 1}: ${e.message}`);
            skipped++;
          }
        }
      } else {
        return res.status(400).json({ message: "Unknown import type" });
      }

      res.json({ created, skipped, colleaguesUpdated, errors });
    } catch (error) {
      res.status(500).json({ message: "Import failed" });
    }
  });

  return httpServer;
}
