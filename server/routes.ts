import { getAllSeedRoles, markSeedRoleAsDeleted } from "./ensureJobRoles";
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { exportFullBackup } from "./backup";
import { exportTrainingMatrixCsv } from "./trainingMatrixExport";
import { importFullBackup } from "./restore";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

function sanitizeUser<T extends Record<string, any> | undefined>(user: T) {
  if (!user) return user;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function isPublicApiRoute(req: Request) {
  const routePath = `${req.baseUrl}${req.path}`;
  const isSharedInductionItemPatch =
    req.method === "PATCH" &&
    /^\/api\/induction\/shared\/[^/]+\/items\/\d+$/.test(routePath);

  if (routePath === "/api/auth/request-code") return true;
  if (routePath === "/api/auth/verify-code") return true;
  if (req.method === "GET" && routePath.startsWith("/api/induction/shared/")) return true;
  if (isSharedInductionItemPatch) return true;
  if (req.method === "GET" && routePath.startsWith("/api/training-matrix/shared/")) return true;
  return false;
}

type AppRole = "colleague" | "manager" | "admin" | "architect";

function isPrivilegedRole(role?: string): role is AppRole {
  return role === "manager" || role === "admin";
}

function isAdminWriteRoute(routePath: string, method: string) {
  if (method === "GET") return false;
  const adminWritePrefixes = [
    "/api/import/",
    "/api/export/",
    "/api/portal-settings",
    "/api/departments",
    "/api/job-roles",
    "/api/induction-section-settings",
    "/api/induction-templates",
    "/api/induction-sections/rename",
    "/api/competency-categories",
    "/api/competency-items",
    "/api/standards-surveys",
    "/api/certificate-definitions",
    "/api/resources",
  ];
  return adminWritePrefixes.some((prefix) => routePath.startsWith(prefix));
}

function isAdminOnlyRoute(routePath: string) {
  const adminOnlyPrefixes = [
    "/api/import/",
    "/api/export/",
    "/api/portal-settings",
    "/api/induction-section-settings",
  ];
  return adminOnlyPrefixes.some((prefix) => routePath.startsWith(prefix));
}

async function canAccessUser(req: Request, targetUserId: string) {
  if (!req.session.userId) return false;
  if (req.session.userId === targetUserId) return true;
  if (req.session.role === "admin") return true;
  if (req.session.role !== "manager") return false;

  const targetUser = await storage.getUser(targetUserId);
  return targetUser?.managerId === req.session.userId;
}

function normalizeLookup(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const trainingMatrixSnapshotFields = [
  "userNameSnapshot",
  "departmentIdSnapshot",
  "departmentSnapshot",
  "jobRoleIdSnapshot",
  "jobRoleSnapshot",
] as const;

async function buildTrainingMatrixSnapshot(userId: string) {
  const user = await storage.getUser(userId);
  if (!user) return {};
  return {
    userNameSnapshot: user.name,
    departmentIdSnapshot: user.departmentId ?? null,
    departmentSnapshot: user.department,
    jobRoleIdSnapshot: user.jobRoleId ?? null,
    jobRoleSnapshot: user.jobRole,
  };
}

function mergeMissingTrainingMatrixSnapshot(existing: Record<string, any> | undefined, updates: Record<string, any>, snapshot: Record<string, any>) {
  const next = { ...updates };
  for (const field of trainingMatrixSnapshotFields) {
    if (next[field] === undefined && !existing?.[field] && snapshot[field] !== undefined) {
      next[field] = snapshot[field];
    }
  }
  return next;
}

function toOptionalInt(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

async function resolveDepartment(departmentId: unknown, departmentName: unknown) {
  const departments = await storage.getDepartments();
  const parsedDepartmentId = toOptionalInt(departmentId);
  if (typeof parsedDepartmentId === "number") {
    return departments.find((department) => department.id === parsedDepartmentId) ?? null;
  }
  if (typeof departmentName === "string" && departmentName.trim()) {
    const normalized = normalizeLookup(departmentName);
    return departments.find((department) => normalizeLookup(department.name) === normalized) ?? null;
  }
  return null;
}

async function resolveJobRole(jobRoleId: unknown, jobRoleTitle: unknown) {
  const roles = await storage.getJobRoles();
  const parsedJobRoleId = toOptionalInt(jobRoleId);
  if (typeof parsedJobRoleId === "number") {
    return roles.find((role) => role.id === parsedJobRoleId) ?? null;
  }
  if (typeof jobRoleTitle === "string" && jobRoleTitle.trim()) {
    const normalized = normalizeLookup(jobRoleTitle);
    return roles.find((role) => normalizeLookup(role.title) === normalized) ?? null;
  }
  return null;
}

async function normalizeUserRelationships<T extends Record<string, any>>(input: T): Promise<T & Record<string, any>> {
  const data: Record<string, any> = { ...input };
  const requestedJobRoleId = data.jobRoleId ?? data.job_role_id;
  const requestedDepartmentId = data.departmentId ?? data.department_id;
  const requestedJobRole = data.jobRole ?? data.job_role;
  const requestedDepartment = data.department;
  const role = await resolveJobRole(requestedJobRoleId, requestedJobRole);

  if (role) {
    data.jobRoleId = role.id;
    data.jobRole = role.title;
  } else if (toOptionalInt(requestedJobRoleId) === null) {
    data.jobRoleId = null;
  } else if (typeof requestedJobRole === "string") {
    data.jobRole = requestedJobRole.trim();
  }

  let department = await resolveDepartment(requestedDepartmentId, requestedDepartment);
  if (!department && role?.departmentId) {
    department = await resolveDepartment(role.departmentId, undefined);
  }
  if (!department && role?.department) {
    department = await resolveDepartment(undefined, role.department);
  }

  if (department) {
    data.departmentId = department.id;
    data.department = department.name;
  } else if (toOptionalInt(requestedDepartmentId) === null) {
    data.departmentId = null;
  } else if (typeof requestedDepartment === "string") {
    data.department = requestedDepartment.trim();
  } else if (role?.department) {
    data.department = role.department;
  }

  delete data.job_role_id;
  delete data.department_id;
  delete data.job_role;
  return data as T & Record<string, any>;
}

async function normalizeDepartmentBackedInput<T extends Record<string, any>>(input: T, textField: string): Promise<T & Record<string, any>> {
  const data: Record<string, any> = { ...input };
  const requestedDepartmentId = data.departmentId ?? data.department_id;
  const requestedDepartment = data[textField];
  const department = await resolveDepartment(requestedDepartmentId, requestedDepartment);
  if (department) {
    data.departmentId = department.id;
    data[textField] = department.name;
  } else if (toOptionalInt(requestedDepartmentId) === null) {
    data.departmentId = null;
  } else if (typeof requestedDepartment === "string") {
    data[textField] = requestedDepartment.trim();
  }
  delete data.department_id;
  return data as T & Record<string, any>;
}

async function normalizeStandardsSurveyRoleInput<T extends Record<string, any>>(input: T): Promise<T & Record<string, any>> {
  const data: Record<string, any> = { ...input };
  const role = await resolveJobRole(data.jobRoleId ?? data.job_role_id, data.roleTitle ?? data.role_title);
  if (role) {
    data.jobRoleId = role.id;
    data.roleTitle = data.roleTitle || role.title;
    data.roleSlug = data.roleSlug || slugify(role.title);
  }
  delete data.job_role_id;
  return data as T & Record<string, any>;
}

async function normalizeCareerNodeInput<T extends Record<string, any>>(input: T): Promise<T & Record<string, any>> {
  const data: Record<string, any> = await normalizeDepartmentBackedInput(input, "department");
  const role = await resolveJobRole(data.jobRoleId ?? data.job_role_id, data.title);
  if (role) {
    data.jobRoleId = role.id;
    data.title = data.title || role.title;
    data.departmentId = data.departmentId ?? role.departmentId ?? null;
    data.department = data.department || role.department;
  }
  delete data.job_role_id;
  return data as T & Record<string, any>;
}

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter for auth endpoints
// ---------------------------------------------------------------------------
const _authRateLimitStore = new Map<string, { count: number; windowStart: number }>();
const _RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const _RATE_LIMIT_MAX = 5;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = _authRateLimitStore.get(key);
  if (!entry || now - entry.windowStart > _RATE_LIMIT_WINDOW_MS) {
    _authRateLimitStore.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= _RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/api", (req, res, next) => {
    if (isPublicApiRoute(req)) return next();
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const routePath = `${req.baseUrl}${req.path}`;
    const role = req.session.role;

    if (routePath === "/api/users" && req.method === "GET" && !isPrivilegedRole(role)) {
      return res.status(403).json({ message: "Manager access required" });
    }
    if (routePath.startsWith("/api/users") && req.method !== "GET" && role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    if (routePath.match(/^\/api\/users\/[^/]+\/team$/) && !isPrivilegedRole(role)) {
      return res.status(403).json({ message: "Manager access required" });
    }
    if (routePath === "/api/training-matrix" && req.method === "GET" && !isPrivilegedRole(role)) {
      return res.status(403).json({ message: "Manager access required" });
    }
    if (routePath.startsWith("/api/training-matrix/shared/") && req.method === "PATCH" && !isPrivilegedRole(role)) {
      return res.status(403).json({ message: "Manager access required" });
    }
    if (isAdminOnlyRoute(routePath) && role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    if (isAdminWriteRoute(routePath, req.method) && role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  });

  // ===== USERS =====
  app.get("/api/users", async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map((user) => sanitizeUser(user)));
  });

  app.get("/api/users/:id", async (req, res) => {
    if (!await canAccessUser(req, req.params.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitizeUser(user));
  });

  app.post("/api/users", async (req, res) => {
    const body = await normalizeUserRelationships(req.body);
    body.email = normalizeEmail(body.email);
    delete body.username;
    delete body.password;

    if (body.email) {
      const existingByEmail = await storage.getUserByEmail(body.email);
      if (existingByEmail) {
        return res.status(409).json({ message: "Email is already used by another user" });
      }
    }

    if (!body.id) {
      const slug = (body.name || "user")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      body.id = `${slug}-${Date.now().toString(36)}`;
    }
    body.username = null;
    body.password = null;
    body.activated = !!body.email;
    const user = await storage.createUser(body);
    res.status(201).json(sanitizeUser(user));
  });

  app.patch("/api/users/:id", async (req, res) => {
    const existing = await storage.getUser(req.params.id);
    if (!existing) return res.status(404).json({ message: "User not found" });
    const data = await normalizeUserRelationships(req.body);
    delete data.username;
    if (data.email !== undefined) {
      data.email = normalizeEmail(data.email);
      if (data.email) {
        const existingByEmail = await storage.getUserByEmail(data.email);
        if (existingByEmail && existingByEmail.id !== existing.id) {
          return res.status(409).json({ message: "Email is already used by another user" });
        }
      }
    }
    delete data.password;
    data.username = null;
    data.password = null;
    const mergedEmail = data.email !== undefined ? data.email : existing.email;
    data.activated = !!mergedEmail;
    const user = await storage.updateUser(req.params.id, data);
    res.json(sanitizeUser(user));
  });

  app.delete("/api/users/:id", async (req, res) => {
    await storage.deleteUser(req.params.id);
    res.status(204).send();
  });

  app.get("/api/users/:id/team", async (req, res) => {
    if (req.session.role !== "admin" && req.session.userId !== req.params.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const members = await storage.getTeamMembers(req.params.id);
    res.json(members.map((member) => sanitizeUser(member)));
  });

  // POST /api/auth/request-code — step 1: send a one-time code to the user's email
  app.post("/api/auth/request-code", async (req, res) => {
    const ip = (req.ip || req.socket?.remoteAddress || "unknown").toString();
    if (!checkRateLimit(`ip:${ip}`)) {
      return res.status(429).json({ message: "Too many requests. Please wait a moment and try again." });
    }

    const rawEmail = req.body?.email;
    if (!rawEmail || typeof rawEmail !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }
    const email = rawEmail.trim().toLowerCase();

    // Always return the same response regardless of whether the email exists
    // to prevent email enumeration attacks
    const GENERIC_OK = { message: "If that email is registered, a sign-in code has been sent." };

    try {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.activated) return res.json(GENERIC_OK);

      // Per-user rate limit (separate from IP limit)
      if (!checkRateLimit(`user:${user.id}`)) return res.json(GENERIC_OK);

      const code = String(randomInt(100000, 1000000)); // 6-digit code
      const codeHash = await bcrypt.hash(code, 10);
      const ttlMinutes = parseInt(process.env.AUTH_CODE_TTL_MINUTES || "10", 10);
      const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

      const authCode = await storage.createEmailAuthCode({
        userId: user.id,
        email,
        codeHash,
        expiresAt,
        attemptCount: 0,
        consumedAt: null,
        createdAt: new Date().toISOString(),
        requestIp: ip,
        userAgent: (req.headers["user-agent"] as string) || null,
      });

      // Invalidate any previous unused codes for this user
      await storage.invalidatePreviousEmailAuthCodes(user.id, authCode.id);

      const { sendAuthCodeEmail } = await import("./email");
      const delivery = await sendAuthCodeEmail({ to: email, recipientName: user.name, code });

      if (delivery.mode === "logged") {
        console.warn(`[auth] OTP for ${email} was logged locally, not emailed. Add RESEND_API_KEY to enable delivery.`);
      } else {
        console.log(
          `[auth] OTP email sent to ${email} via ${delivery.fromAddress || "configured sender"}${delivery.providerId ? ` (resend id: ${delivery.providerId})` : ""}`
        );
      }

      return res.json(GENERIC_OK);
    } catch (err: any) {
      console.error("[auth] request-code error:", err.message);
      // Still return the generic response so failures don't leak info
      return res.json(GENERIC_OK);
    }
  });

  // POST /api/auth/verify-code — step 2: verify the code and establish a session
  app.post("/api/auth/verify-code", async (req, res) => {
    const ip = (req.ip || req.socket?.remoteAddress || "unknown").toString();
    if (!checkRateLimit(`verify:${ip}`)) {
      return res.status(429).json({ message: "Too many requests. Please wait a moment and try again." });
    }

    const rawEmail = req.body?.email;
    const rawCode = req.body?.code;
    if (!rawEmail || !rawCode || typeof rawEmail !== "string" || typeof rawCode !== "string") {
      return res.status(400).json({ message: "Email and code are required" });
    }
    const email = rawEmail.trim().toLowerCase();
    const code = rawCode.trim();

    try {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.activated) {
        return res.status(401).json({ message: "Invalid or expired code" });
      }

      const authCode = await storage.getLatestActiveEmailAuthCode(user.id);
      if (!authCode) {
        return res.status(401).json({ message: "Invalid or expired code" });
      }

      if (new Date(authCode.expiresAt) < new Date()) {
        return res.status(401).json({ message: "Code has expired. Please request a new one." });
      }

      const MAX_ATTEMPTS = 5;
      if (authCode.attemptCount >= MAX_ATTEMPTS) {
        return res.status(401).json({ message: "Code has been locked after too many attempts. Please request a new one." });
      }

      const isValid = await bcrypt.compare(code, authCode.codeHash);
      if (!isValid) {
        await storage.incrementEmailAuthCodeAttempts(authCode.id);
        return res.status(401).json({ message: "Invalid or expired code" });
      }

      // Consume the code so it cannot be reused
      await storage.consumeEmailAuthCode(authCode.id);

      // Regenerate session to prevent session-fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => (err ? reject(err) : resolve()));
      });

      req.session.userId = user.id;
      req.session.role = user.role;

      return res.json(sanitizeUser(user));
    } catch (err: any) {
      console.error("[auth] verify-code error:", err.message);
      return res.status(500).json({ message: "An error occurred. Please try again." });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(sanitizeUser(user));
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(204).send();
    });
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

    if (user?.jobRoleId || user?.jobRole) {
      const allowedSections = await storage.getInductionSectionsForUser(user.jobRoleId ?? user.jobRole);
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
    if (!await canAccessUser(req, req.params.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
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
    if (user?.jobRoleId || user?.jobRole) {
      const allowedSections = await storage.getInductionSectionsForUser(user.jobRoleId ?? user.jobRole);
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
    if (!await canAccessUser(req, req.params.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { templateItemId, completed, inProgress, completedDate, targetDate, reviewDate, signedOffBy, signedOffDate, assignedTo } = req.body;

    const isSignOffChange = signedOffBy !== undefined || signedOffDate !== undefined;
    if (isSignOffChange && !isPrivilegedRole(req.session.role)) {
      return res.status(403).json({ message: "Manager access required for sign-off" });
    }

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
      reviewDate: reviewDate !== undefined ? (reviewDate || null) : undefined,
      signedOffBy: signedOffBy || null,
      signedOffDate: signedOffDate || null,
      assignedTo: assignedTo !== undefined ? assignedTo : undefined,
    });

    // Sync to Outlook if reviewDate was set
    if (reviewDate && req.params.userId) {
      try {
        const allItems = await storage.getInductionTemplateItems();
        const templateItem = allItems.find(item => item.id === templateItemId);
        const { syncInductionReviewDate } = await import("./calendarSync");
        await syncInductionReviewDate(
          req.params.userId,
          completion.id,
          reviewDate,
          templateItem?.title || `Category Review Item ${templateItemId}`
        );
      } catch (error) {
        console.error("Failed to sync induction review to Outlook:", error);
        // Don't fail the request if sync fails
      }
    }

    res.json(completion);
  });

  app.patch("/api/induction/shared/:token/items/:templateItemId", async (req, res) => {
    const instance = await storage.getInductionByShareToken(req.params.token);
    if (!instance) return res.status(404).json({ message: "Not found" });

    const templateItemId = Number(req.params.templateItemId);
    if (Number.isNaN(templateItemId)) {
      return res.status(400).json({ message: "Invalid template item id" });
    }

    const forbiddenSharedFields = [
      "signedOffBy",
      "signedOffDate",
      "assignedTo",
      "targetDate",
      "reviewDate",
      "instanceId",
      "templateItemId",
    ];

    const hasForbiddenField = forbiddenSharedFields.some((field) => req.body[field] !== undefined);
    if (hasForbiddenField) {
      return res.status(403).json({ message: "Sign-off and manager fields are portal-only" });
    }

    const user = await storage.getUser(instance.userId);
    let templateItems = await storage.getInductionTemplateItems();
    if (user?.jobRoleId || user?.jobRole) {
      const allowedSections = await storage.getInductionSectionsForUser(user.jobRoleId ?? user.jobRole);
      templateItems = templateItems.filter((item) => allowedSections.includes(item.section));
    }

    const templateItem = templateItems.find((item) => item.id === templateItemId);
    if (!templateItem) {
      return res.status(404).json({ message: "Template item not found" });
    }

    const completions = await storage.getInductionCompletions(instance.id);
    const existing = completions.find((c) => c.templateItemId === templateItemId);
    if (existing?.signedOffBy) {
      return res.status(409).json({ message: "Item is already signed off by manager and cannot be edited from shared link" });
    }

    const hasCompleted = req.body.completed !== undefined;
    const hasInProgress = req.body.inProgress !== undefined;
    const hasCompletedDate = req.body.completedDate !== undefined;
    if (!hasCompleted && !hasInProgress && !hasCompletedDate) {
      return res.status(400).json({ message: "No editable fields provided" });
    }

    if (hasCompleted && typeof req.body.completed !== "boolean") {
      return res.status(400).json({ message: "completed must be boolean" });
    }
    if (hasInProgress && typeof req.body.inProgress !== "boolean") {
      return res.status(400).json({ message: "inProgress must be boolean" });
    }
    if (hasCompletedDate && req.body.completedDate !== null && typeof req.body.completedDate !== "string") {
      return res.status(400).json({ message: "completedDate must be a string or null" });
    }

    const completed = hasCompleted ? req.body.completed : (existing?.completed ?? false);
    const inProgress = hasInProgress ? req.body.inProgress : (existing?.inProgress ?? false);
    const completedDate = completed
      ? (hasCompletedDate ? req.body.completedDate : (existing?.completedDate ?? new Date().toISOString().slice(0, 10)))
      : null;

    const completion = await storage.upsertInductionCompletion({
      instanceId: instance.id,
      templateItemId,
      completed,
      inProgress,
      completedDate,
      targetDate: existing?.targetDate ?? null,
      reviewDate: existing?.reviewDate ?? null,
      signedOffBy: null,
      signedOffDate: null,
      assignedTo: existing?.assignedTo ?? null,
    });

    res.json(completion);
  });

  app.post("/api/induction/:userId/share", async (req, res) => {
    if (!await canAccessUser(req, req.params.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
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
    const data = await normalizeDepartmentBackedInput(req.body, "departmentType");
    const cat = await storage.createCompetencyCategory(data);
    res.status(201).json(cat);
  });

  app.patch("/api/competency-categories/:id", async (req, res) => {
    const data = await normalizeDepartmentBackedInput(req.body, "departmentType");
    const cat = await storage.updateCompetencyCategory(Number(req.params.id), data);
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
    if (!await canAccessUser(req, req.params.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const history = await storage.getTrainingMatrixHistory(req.params.userId);
    res.json(history);
  });

  app.get("/api/training-matrix/export", async (req, res) => {
    const scope = String(req.query.scope || "team");
    const history = String(req.query.history || "latest");
    const detail = String(req.query.detail || "summary");

    if (!["all", "department", "team", "user"].includes(scope)) {
      return res.status(400).json({ message: "Invalid export scope" });
    }
    if (!["latest", "all"].includes(history)) {
      return res.status(400).json({ message: "Invalid export history" });
    }
    if (!["summary", "competency"].includes(detail)) {
      return res.status(400).json({ message: "Invalid export detail" });
    }

    try {
      const role = req.session.role;
      const params: {
        scope: "all" | "department" | "team" | "user";
        history: "latest" | "all";
        detail: "summary" | "competency";
        userId?: string;
        managerId?: string;
        departmentId?: number;
        department?: string;
      } = {
        scope: scope as "all" | "department" | "team" | "user",
        history: history as "latest" | "all",
        detail: detail as "summary" | "competency",
      };

      if (scope === "all") {
        if (role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
      } else if (scope === "department") {
        if (role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const departmentId = toOptionalInt(req.query.departmentId);
        const department = typeof req.query.department === "string" ? req.query.department.trim() : "";
        if (departmentId === undefined) {
          return res.status(400).json({ message: "Invalid departmentId" });
        }
        if (departmentId == null && !department) {
          return res.status(400).json({ message: "departmentId or department is required" });
        }
        if (departmentId != null) {
          params.departmentId = departmentId;
        } else {
          params.department = department;
        }
      } else if (scope === "team") {
        if (role === "manager") {
          params.managerId = req.session.userId!;
        } else if (role === "admin") {
          const managerId = typeof req.query.managerId === "string" ? req.query.managerId : "";
          if (!managerId) {
            return res.status(400).json({ message: "managerId is required for admin team exports" });
          }
          params.managerId = managerId;
        } else {
          return res.status(403).json({ message: "Manager access required" });
        }
      } else if (scope === "user") {
        const userId = typeof req.query.userId === "string" ? req.query.userId : "";
        if (!userId) {
          return res.status(400).json({ message: "userId is required" });
        }
        if (!await canAccessUser(req, userId)) {
          return res.status(403).json({ message: "Forbidden" });
        }
        params.userId = userId;
      }

      const { filename, csvContent } = await exportTrainingMatrixCsv(params);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Training matrix export failed" });
    }
  });

  app.get("/api/training-matrix/:userId", async (req, res) => {
    if (!await canAccessUser(req, req.params.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const submission = await storage.getTrainingMatrixSubmission(req.params.userId);
    res.json(submission || null);
  });

  app.post("/api/training-matrix", async (req, res) => {
    if (!req.body?.userId || !await canAccessUser(req, req.body.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const snapshot = await buildTrainingMatrixSnapshot(req.body.userId);
    const submission = await storage.createTrainingMatrixSubmission({
      ...req.body,
      ...snapshot,
    });
    res.status(201).json(submission);
  });

  app.patch("/api/training-matrix/:id", async (req, res) => {
    const existing = await storage.getTrainingMatrixSubmissionById(Number(req.params.id));
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (!await canAccessUser(req, existing.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const snapshot = await buildTrainingMatrixSnapshot(existing.userId);
    const submission = await storage.updateTrainingMatrixSubmission(
      existing.id,
      mergeMissingTrainingMatrixSnapshot(existing, req.body, snapshot)
    );
    if (!submission) return res.status(404).json({ message: "Not found" });
    
    // Sync to Outlook if nextReviewDate was updated
    if (req.body.nextReviewDate && submission.userId) {
      try {
        const { syncTrainingMatrixReviewDate } = await import("./calendarSync");
        await syncTrainingMatrixReviewDate(submission.userId, submission.id, req.body.nextReviewDate);
      } catch (error) {
        console.error("Failed to sync training matrix review to Outlook:", error);
        // Don't fail the request if sync fails
      }
    }
    
    res.json(submission);
  });

  app.post("/api/training-matrix/:id/share", async (req, res) => {
    const found = await storage.getTrainingMatrixSubmissionById(Number(req.params.id));
    if (!found) return res.status(404).json({ message: "Submission not found" });
    if (!await canAccessUser(req, found.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
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
    if (user?.jobRoleId || user?.jobRole) {
      competencies = await storage.getCompetencyCategoriesForJobRole(user.jobRoleId ?? user.jobRole);
    }
    if (!competencies) {
      const userDept = user?.department || '';
      const allCats = userDept
        ? await storage.getCompetencyCategories(userDept)
        : await storage.getCompetencyCategories('Universal');
      const items = await storage.getCompetencyItems();
      competencies = allCats.map(cat => ({
        ...cat,
        items: items.filter(item => item.categoryId === cat.id),
      }));
    }
    res.json({
      submission,
      competencies,
      userName: submission.userNameSnapshot || user?.name || 'Unknown',
      jobRole: submission.jobRoleSnapshot || user?.jobRole || '',
      department: submission.departmentSnapshot || user?.department || '',
    });
  });

  app.patch("/api/training-matrix/shared/:token", async (req, res) => {
    const submission = await storage.getTrainingMatrixByToken(req.params.token);
    if (!submission) return res.status(404).json({ message: "Not found" });
    const snapshot = await buildTrainingMatrixSnapshot(submission.userId);
    const updated = await storage.updateTrainingMatrixSubmission(
      submission.id,
      mergeMissingTrainingMatrixSnapshot(submission, req.body, snapshot)
    );
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
    const requestedId = Number(req.params.roleId);
    const role = roles.find((r) =>
      r.roleSlug === req.params.roleId ||
      r.jobRoleId === requestedId ||
      r.id === requestedId
    );
    if (!role) return res.status(404).json({ message: "Survey role not found" });
    const items = await storage.getStandardsSurveyItems(role.id);
    res.json({ ...role, items });
  });

  app.post("/api/standards-surveys/roles", async (req, res) => {
    const data = await normalizeStandardsSurveyRoleInput(req.body);
    const role = await storage.createStandardsSurveyRole(data);
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
    if (userId && !await canAccessUser(req, userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!userId && !isPrivilegedRole(req.session.role)) {
      return res.status(403).json({ message: "Manager access required" });
    }
    const certs = await storage.getUserCertificates(userId);
    res.json(certs);
  });

  app.post("/api/user-certificates", async (req, res) => {
    if (!req.body?.userId || !await canAccessUser(req, req.body.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const cert = await storage.createUserCertificate(req.body);
    res.status(201).json(cert);
  });

  app.delete("/api/user-certificates/:id", async (req, res) => {
    const certificate = await storage.getUserCertificate(Number(req.params.id));
    if (!certificate) return res.status(404).json({ message: "Not found" });
    if (!await canAccessUser(req, certificate.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await storage.deleteUserCertificate(certificate.id);
    res.status(204).send();
  });

  // ===== CAREER MILESTONES =====
  app.get("/api/career-milestones/:userId", async (req, res) => {
    if (!await canAccessUser(req, req.params.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const milestones = await storage.getCareerMilestones(req.params.userId);
    res.json(milestones);
  });

  app.post("/api/career-milestones", async (req, res) => {
    if (!req.body?.userId || !await canAccessUser(req, req.body.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const milestone = await storage.createCareerMilestone(req.body);
    res.status(201).json(milestone);
  });

  app.patch("/api/career-milestones/:id", async (req, res) => {
    const existing = await storage.getCareerMilestone(Number(req.params.id));
    if (!existing) return res.status(404).json({ message: "Milestone not found" });
    if (!await canAccessUser(req, existing.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const milestone = await storage.updateCareerMilestone(existing.id, req.body);
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });
    res.json(milestone);
  });

  app.delete("/api/career-milestones/:id", async (req, res) => {
    const milestone = await storage.getCareerMilestone(Number(req.params.id));
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });
    if (!await canAccessUser(req, milestone.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await storage.deleteCareerMilestone(milestone.id);
    res.status(204).send();
  });

  // ===== CAREER NODES =====
  app.get("/api/career-nodes", async (_req, res) => {
    const nodes = await storage.getCareerNodes();
    res.json(nodes);
  });

  app.post("/api/career-nodes", async (req, res) => {
    const data = await normalizeCareerNodeInput(req.body);
    const node = await storage.createCareerNode(data);
    res.status(201).json(node);
  });

  // ===== TRAINING RECORDS =====
  app.get("/api/training-records", async (req, res) => {
    const userId = req.query.userId as string | undefined;
    if (userId && !await canAccessUser(req, userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!userId && !isPrivilegedRole(req.session.role)) {
      return res.status(403).json({ message: "Manager access required" });
    }
    const records = await storage.getTrainingRecords(userId);
    res.json(records);
  });

  app.post("/api/training-records", async (req, res) => {
    if (!req.body?.userId || !await canAccessUser(req, req.body.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const record = await storage.createTrainingRecord(req.body);
    res.status(201).json(record);
  });

  app.patch("/api/training-records/:id", async (req, res) => {
    const existing = await storage.getTrainingRecord(Number(req.params.id));
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (!await canAccessUser(req, existing.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const record = await storage.updateTrainingRecord(existing.id, req.body);
    if (!record) return res.status(404).json({ message: "Not found" });
    res.json(record);
  });

  // ===== JOB ROLES =====
  app.get("/api/job-roles", async (_req, res) => {
    const roles = await storage.getJobRoles();
    res.json(roles);
  });

  app.post("/api/job-roles", async (req, res) => {
    const data = await normalizeDepartmentBackedInput(req.body, "department");
    const role = await storage.createJobRole(data);
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
    const data = await normalizeDepartmentBackedInput(req.body, "department");
    const role = await storage.updateJobRole(id, data);
    if (!role) return res.status(404).json({ message: "Not found" });
    res.json(role);
  });

  app.delete("/api/job-roles/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const role = (await storage.getJobRoles()).find((jobRole) => jobRole.id === id);
      if (!role) return res.status(404).json({ message: "Not found" });
      const assignedUsers = (await storage.getAllUsers()).filter((user) => user.jobRoleId === id || user.jobRole === role.title);
      if (assignedUsers.length > 0) {
        return res.status(400).json({ message: `Cannot delete: ${assignedUsers.length} user(s) are assigned to this job role` });
      }
      await storage.deleteJobRole(id);
      const seedRoleKeys = new Set(getAllSeedRoles().map((seedRole) => seedRole.title.trim().replace(/\s+/g, " ").toLowerCase()));
      const roleKey = role.title.trim().replace(/\s+/g, " ").toLowerCase();
      if (seedRoleKeys.has(roleKey)) {
        await markSeedRoleAsDeleted(role.title);
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete job role" });
    }
  });

  app.get("/api/job-roles/:id/categories", async (req, res) => {
    const layout = await storage.getJobRoleCategoryLayout(Number(req.params.id));
    res.json(layout);
  });

  app.get("/api/job-role-categories", async (_req, res) => {
    const assignments = await storage.getAllJobRoleCategories();
    res.json(assignments);
  });

  app.put("/api/job-roles/:id/categories", async (req, res) => {
    const { assignments, sections } = req.body || {};
    if (!Array.isArray(assignments) || !Array.isArray(sections)) {
      return res.status(400).json({ message: "sections and assignments must be arrays" });
    }
    await storage.setJobRoleCategoryLayout(Number(req.params.id), { sections, assignments });
    res.json({ success: true });
  });

  app.get("/api/competencies-for-role", async (req, res) => {
    const jobRole = req.query.jobRole as string | undefined;
    const jobRoleId = toOptionalInt(req.query.jobRoleId);
    const roleLookup = typeof jobRoleId === "number" ? jobRoleId : jobRole;
    if (!roleLookup) {
      return res.status(400).json({ message: "jobRole query parameter required" });
    }
    const result = await storage.getCompetencyCategoriesForJobRole(roleLookup);
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
    const usersInDept = users.filter(u => u.departmentId === id || u.department === dept.name);
    if (usersInDept.length > 0) {
      return res.status(400).json({ message: `Cannot delete: ${usersInDept.length} user(s) are assigned to this department` });
    }
    const rolesInDept = (await storage.getJobRoles()).filter(role => role.departmentId === id || role.department === dept.name);
    if (rolesInDept.length > 0) {
      return res.status(400).json({ message: `Cannot delete: ${rolesInDept.length} job role(s) are assigned to this department` });
    }
    const categoriesInDept = (await storage.getCompetencyCategories()).filter(category => category.departmentId === id || category.departmentType === dept.name);
    if (categoriesInDept.length > 0) {
      return res.status(400).json({ message: `Cannot delete: ${categoriesInDept.length} competency category(s) are assigned to this department` });
    }
    const careerNodesInDept = (await storage.getCareerNodes()).filter(node => node.departmentId === id || node.department === dept.name);
    if (careerNodesInDept.length > 0) {
      return res.status(400).json({ message: `Cannot delete: ${careerNodesInDept.length} career node(s) are assigned to this department` });
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
        csvContent = "ID,Name,Email,Role,Job Role,Department,Manager ID,Start Date,Requires Induction,Activated\n";
        csvContent += users.map(u =>
          `"${u.id}","${u.name}","${u.email || ''}","${u.role}","${u.jobRole}","${u.department}","${u.managerId || ''}","${u.startDate}",${u.requiresInduction},${u.activated}`
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
      const out: Record<string, string> = { ...r };
      for (const [k, v] of Object.entries(r)) {
        out[k.trim().toLowerCase().replace(/\s+/g, "_")] = v;
        out[k.trim().toLowerCase().replace(/[\s_-]+/g, "")] = v;
      }
      return out;
    });
    try {
      let created = 0;
      let skipped = 0;
      let colleaguesUpdated = 0;
      let accountsCreated = 0;
      const createdAccounts: Array<{ name: string; email: string }> = [];
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
            const normalizedEmail = normalizeEmail(row.email);
            if (normalizedEmail) {
              const existingByEmail = await storage.getUserByEmail(normalizedEmail);
              if (existingByEmail) {
                errors.push(`Row ${i + 1} (${row.name}): Email \"${normalizedEmail}\" already exists`);
                skipped++;
                continue;
              }
            }
            const hasCredentials = !!normalizedEmail;
            const userData = await normalizeUserRelationships({
              id: row.id || `${slug}-${Date.now().toString(36)}${i}`,
              username: null,
              password: null,
              name: row.name,
              email: normalizedEmail,
              role: row.role || "colleague",
              jobRole: row.jobRole || row.job_role || "",
              department: row.department || "",
              managerId: row.managerId || row.manager_id || null,
              startDate: row.startDate || row.start_date || new Date().toISOString().split("T")[0],
              requiresInduction,
              activated: hasCredentials,
            });
            await storage.createUser(userData);
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
              const roleData = await normalizeDepartmentBackedInput({
                title,
                department,
                summary: row.summary || "",
                responsibilities: row.responsibilities ? JSON.parse(row.responsibilities) : [],
                reportsTo: reportsToId,
                sortOrder: row.sortorder ? parseInt(row.sortorder) : 0,
              }, "department");
              const newRole = await storage.createJobRole(roleData);
              roleTitleToId.set(title, newRole.id);
              created++;
              roleCreated = true;
            }

            const email = normalizeEmail(getColEmail(row));
            if (email) {
              const user = allUsers.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
              if (user) {
                await storage.updateUser(user.id, await normalizeUserRelationships({ jobRole: title, department }));
                colleaguesUpdated++;
              } else {
                const colleagueName = row["colleague_name"] || row.colleaguename || "";
                if (colleagueName) {
                  const slug = colleagueName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  const userId = `${slug}-${Date.now().toString(36)}${i}`;
                  const today = new Date().toISOString().split("T")[0];
                  const userData = await normalizeUserRelationships({
                    id: userId,
                    username: null,
                    password: null,
                    name: colleagueName,
                    email,
                    role: "colleague",
                    jobRole: title,
                    department: department,
                    managerId: null,
                    startDate: today,
                    requiresInduction: true,
                    activated: true,
                  });
                  await storage.createUser(userData);
                  allUsers.push({
                    id: userId,
                    username: null,
                    password: null,
                    name: colleagueName,
                    email,
                    role: "colleague",
                    jobRoleId: userData.jobRoleId ?? null,
                    jobRole: userData.jobRole,
                    departmentId: userData.departmentId ?? null,
                    department: userData.department,
                    managerId: null,
                    startDate: today,
                    requiresInduction: true,
                    activated: true,
                  });
                  accountsCreated++;
                  createdAccounts.push({ name: colleagueName, email });
                } else {
                  errors.push(`Row ${i + 1}: No user found with email "${email}" and no colleague name provided to create account`);
                  if (!roleCreated) skipped++;
                }
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
              const categoryData = await normalizeDepartmentBackedInput({
                slug: `${slug}-${Date.now().toString(36)}`,
                name: catName,
                departmentType: row.category_department_type || "Universal",
                sortOrder: parseInt(row.category_sort_order) || 0,
              }, "departmentType");
              const newCat = await storage.createCompetencyCategory(categoryData);
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
              const roleData = await normalizeStandardsSurveyRoleInput({
                roleSlug,
                roleTitle: roleTitle || roleSlug,
              });
              const newRole = await storage.createStandardsSurveyRole(roleData);
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

      res.json({ created, skipped, colleaguesUpdated, accountsCreated, createdAccounts, errors });
    } catch (error) {
      res.status(500).json({ message: "Import failed" });
    }
  });

  // ===== OUTLOOK CALENDAR INTEGRATION =====
  app.get("/api/outlook/init-auth", async (req, res) => {
    try {
      const { initializeOutlookAuth, getAuthorizationUrl } = await import("./outlookAuth");
      
      const clientId = process.env.MICROSOFT_CLIENT_ID;
      const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
      const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:5000'}/api/outlook/callback`;

      if (!clientId || !clientSecret) {
        return res.status(400).json({ 
          message: "Outlook integration not configured. Please set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET environment variables." 
        });
      }

      initializeOutlookAuth({ clientId, clientSecret, redirectUri });

      // Generate state token and store in session
      const state = Math.random().toString(36).substring(7);
      req.session.outlookState = state;

      const authUrl = getAuthorizationUrl(state);
      res.json({ authUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/outlook/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).json({ message: "Missing code or state parameter" });
      }

      if (state !== req.session.outlookState) {
        return res.status(400).json({ message: "Invalid state parameter" });
      }

      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { exchangeCodeForToken } = await import("./outlookAuth");
      const { db } = await import("./db");
      const { outlookIntegrations } = await import("../shared/schema");
      const { eq } = await import("drizzle-orm");

      const token = await exchangeCodeForToken(code as string);
      
      // Store or update integration
      const existing = await db.query.outlookIntegrations.findFirst({
        where: eq(outlookIntegrations.userId, userId),
      });

      if (existing) {
        await db
          .update(outlookIntegrations)
          .set({
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            expiresAt: token.expiresAt,
            isEnabled: true,
            updatedDate: new Date().toISOString(),
          })
          .where(eq(outlookIntegrations.userId, userId));
      } else {
        await db.insert(outlookIntegrations).values({
          userId,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expiresAt: token.expiresAt,
          isEnabled: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        });
      }

      // Redirect to a success page or back to settings
      res.redirect("/");
    } catch (error: any) {
      console.error("Outlook callback error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/outlook/status", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { db } = await import("./db");
      const { outlookIntegrations } = await import("../shared/schema");
      const { eq } = await import("drizzle-orm");

      const integration = await db.query.outlookIntegrations.findFirst({
        where: eq(outlookIntegrations.userId, req.session.userId),
      });

      res.json({
        connected: !!integration && integration.isEnabled,
        email: integration ? "Connected to Outlook" : null,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/outlook/disconnect", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { db } = await import("./db");
      const { outlookIntegrations } = await import("../shared/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .update(outlookIntegrations)
        .set({ isEnabled: false })
        .where(eq(outlookIntegrations.userId, req.session.userId));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/outlook/sync-all", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { syncAllUserEvents } = await import("./calendarSync");
      await syncAllUserEvents(req.session.userId);
      res.json({ success: true, message: "All events synced to Outlook" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
