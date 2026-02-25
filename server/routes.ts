import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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
    const user = await storage.createUser(req.body);
    res.status(201).json(user);
  });

  app.patch("/api/users/:id", async (req, res) => {
    const user = await storage.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });
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
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
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

  app.patch("/api/induction-templates/:id", async (req, res) => {
    const item = await storage.updateInductionTemplateItem(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/induction-templates/:id", async (req, res) => {
    await storage.deleteInductionTemplateItem(Number(req.params.id));
    res.status(204).send();
  });

  // ===== INDUCTION INSTANCES =====
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
    const templateItems = await storage.getInductionTemplateItems();
    const completions = await storage.getInductionCompletions(instance.id);

    const items = templateItems.map((tmpl) => {
      const completion = completions.find((c) => c.templateItemId === tmpl.id);
      return {
        ...tmpl,
        completed: completion?.completed ?? false,
        completedDate: completion?.completedDate ?? null,
        signedOffBy: completion?.signedOffBy ?? null,
        signedOffDate: completion?.signedOffDate ?? null,
      };
    });

    res.json({ instance, items });
  });

  app.post("/api/induction/:userId/complete-item", async (req, res) => {
    const { templateItemId, completed, completedDate, signedOffBy, signedOffDate } = req.body;
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
      completedDate: completedDate || null,
      signedOffBy: signedOffBy || null,
      signedOffDate: signedOffDate || null,
    });

    res.json(completion);
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

  // ===== TRAINING MATRIX SUBMISSIONS =====
  app.get("/api/training-matrix", async (_req, res) => {
    const submissions = await storage.getAllTrainingMatrixSubmissions();
    res.json(submissions);
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

  app.patch("/api/job-roles/:id", async (req, res) => {
    const role = await storage.updateJobRole(Number(req.params.id), req.body);
    if (!role) return res.status(404).json({ message: "Not found" });
    res.json(role);
  });

  app.delete("/api/job-roles/:id", async (req, res) => {
    await storage.deleteJobRole(Number(req.params.id));
    res.status(204).send();
  });

  // ===== EXPORT (CSV) =====
  app.get("/api/export/:type", async (req, res) => {
    const { type } = req.params;
    try {
      let csvContent = "";
      let filename = "";

      if (type === "users") {
        const users = await storage.getAllUsers();
        csvContent = "ID,Name,Email,Role,Job Role,Department,Manager ID,Start Date\n";
        csvContent += users.map(u =>
          `"${u.id}","${u.name}","${u.email}","${u.role}","${u.jobRole}","${u.department}","${u.managerId || ''}","${u.startDate}"`
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

  return httpServer;
}
