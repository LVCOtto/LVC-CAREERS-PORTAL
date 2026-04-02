import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";

const DEMO_USER_ID = "demo-colleague-1";
const DEMO_USERNAME = "demo.colleague";
const DEMO_MANAGER_ID = "demo-manager-1";
const DEMO_MANAGER_USERNAME = "demo.manager";
const SOURCE_COLLEAGUE_NAME = "Adrian Barber";

async function upsertDemoManager() {
  const managerPayload: schema.InsertUser = {
    id: DEMO_MANAGER_ID,
    username: DEMO_MANAGER_USERNAME,
    password: "Demo123!",
    name: "Demo Manager",
    email: "demo.manager@lvc-demo.local",
    role: "manager",
    jobRole: "Line Manager",
    department: "Workshop",
    managerId: null,
    startDate: "2025-01-01",
    requiresInduction: false,
    activated: true,
  };

  const [existingByUsername] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, DEMO_MANAGER_USERNAME));

  if (existingByUsername) {
    await db.update(schema.users)
      .set({
        username: managerPayload.username,
        password: managerPayload.password,
        name: managerPayload.name,
        email: managerPayload.email,
        role: managerPayload.role,
        jobRole: managerPayload.jobRole,
        department: managerPayload.department,
        managerId: null,
        startDate: managerPayload.startDate,
        requiresInduction: managerPayload.requiresInduction,
        activated: true,
      })
      .where(eq(schema.users.id, existingByUsername.id));

    return existingByUsername.id;
  }

  const [existingById] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, DEMO_MANAGER_ID));

  if (existingById) {
    await db.update(schema.users)
      .set({
        username: managerPayload.username,
        password: managerPayload.password,
        name: managerPayload.name,
        email: managerPayload.email,
        role: managerPayload.role,
        jobRole: managerPayload.jobRole,
        department: managerPayload.department,
        managerId: null,
        startDate: managerPayload.startDate,
        requiresInduction: managerPayload.requiresInduction,
        activated: true,
      })
      .where(eq(schema.users.id, DEMO_MANAGER_ID));

    return DEMO_MANAGER_ID;
  }

  await db.insert(schema.users).values(managerPayload);
  return DEMO_MANAGER_ID;
}

async function upsertDemoUser(managerId: string) {
  const demoPayload: schema.InsertUser = {
    id: DEMO_USER_ID,
    username: DEMO_USERNAME,
    password: "Demo123!",
    name: "Demo Colleague",
    email: "demo.colleague@lvc-demo.local",
    role: "colleague",
    jobRole: "Workshop Engineer",
    department: "Workshop",
    managerId,
    startDate: "2026-04-01",
    requiresInduction: true,
    activated: true,
  };

  const [existingByUsername] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, DEMO_USERNAME));

  if (existingByUsername) {
    await db.update(schema.users)
      .set({
        username: DEMO_USERNAME,
        password: demoPayload.password,
        name: demoPayload.name,
        email: demoPayload.email,
        role: demoPayload.role,
        jobRole: demoPayload.jobRole,
        department: demoPayload.department,
        managerId: demoPayload.managerId,
        startDate: demoPayload.startDate,
        requiresInduction: demoPayload.requiresInduction,
        activated: true,
      })
      .where(eq(schema.users.id, existingByUsername.id));

    return existingByUsername.id;
  }

  const [existingById] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, DEMO_USER_ID));

  if (existingById) {
    await db.update(schema.users)
      .set({
        username: DEMO_USERNAME,
        password: demoPayload.password,
        name: demoPayload.name,
        email: demoPayload.email,
        role: demoPayload.role,
        jobRole: demoPayload.jobRole,
        department: demoPayload.department,
        managerId: demoPayload.managerId,
        startDate: demoPayload.startDate,
        requiresInduction: demoPayload.requiresInduction,
        activated: true,
      })
      .where(eq(schema.users.id, DEMO_USER_ID));

    return DEMO_USER_ID;
  }

  await db.insert(schema.users).values(demoPayload);
  return DEMO_USER_ID;
}

async function ensureDemoInductionJourney(userId: string) {
  const [sourceUser] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.name, SOURCE_COLLEAGUE_NAME));

  if (sourceUser) {
    await mirrorInductionFromUser(userId, sourceUser.id);
    return;
  }

  const [existingInstance] = await db
    .select()
    .from(schema.inductionInstances)
    .where(eq(schema.inductionInstances.userId, userId));

  const [manager] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.role, "manager"));

  const createdDate = new Date().toISOString().slice(0, 10);

  let instanceId = existingInstance?.id;
  if (!instanceId) {
    const [newInstance] = await db.insert(schema.inductionInstances).values({
      userId,
      templateName: "Standard Induction",
      status: "in_progress",
      createdDate,
    }).returning();
    instanceId = newInstance.id;
  }

  const templateItems = await db
    .select({ id: schema.inductionTemplateItems.id })
    .from(schema.inductionTemplateItems)
    .orderBy(asc(schema.inductionTemplateItems.sortOrder));

  const seededTemplateItems = templateItems.slice(0, 3);

  for (let index = 0; index < seededTemplateItems.length; index += 1) {
    const item = seededTemplateItems[index];
    const [existingCompletion] = await db
      .select()
      .from(schema.inductionItemCompletions)
      .where(and(
        eq(schema.inductionItemCompletions.instanceId, instanceId),
        eq(schema.inductionItemCompletions.templateItemId, item.id),
      ));

    const payload = {
      instanceId,
      templateItemId: item.id,
      completed: true,
      inProgress: false,
      completedDate: createdDate,
      signedOffBy: index === 0 ? (manager?.id ?? null) : null,
      signedOffDate: index === 0 ? createdDate : null,
      assignedTo: null,
      targetDate: null,
    };

    if (existingCompletion) {
      await db.update(schema.inductionItemCompletions)
        .set(payload)
        .where(eq(schema.inductionItemCompletions.id, existingCompletion.id));
    } else {
      await db.insert(schema.inductionItemCompletions).values(payload);
    }
  }
}

async function mirrorInductionFromUser(targetUserId: string, sourceUserId: string) {
  const [sourceInstance] = await db
    .select()
    .from(schema.inductionInstances)
    .where(eq(schema.inductionInstances.userId, sourceUserId))
    .orderBy(desc(schema.inductionInstances.id));

  if (!sourceInstance) {
    return;
  }

  const [existingTargetInstance] = await db
    .select()
    .from(schema.inductionInstances)
    .where(eq(schema.inductionInstances.userId, targetUserId))
    .orderBy(desc(schema.inductionInstances.id));

  let targetInstanceId = existingTargetInstance?.id;

  if (!targetInstanceId) {
    const [newTargetInstance] = await db
      .insert(schema.inductionInstances)
      .values({
        userId: targetUserId,
        templateName: sourceInstance.templateName,
        status: sourceInstance.status,
        createdDate: sourceInstance.createdDate,
      })
      .returning();

    targetInstanceId = newTargetInstance.id;
  } else {
    await db
      .update(schema.inductionInstances)
      .set({
        templateName: sourceInstance.templateName,
        status: sourceInstance.status,
        createdDate: sourceInstance.createdDate,
      })
      .where(eq(schema.inductionInstances.id, targetInstanceId));
  }

  const sourceCompletions = await db
    .select()
    .from(schema.inductionItemCompletions)
    .where(eq(schema.inductionItemCompletions.instanceId, sourceInstance.id));

  await db
    .delete(schema.inductionItemCompletions)
    .where(eq(schema.inductionItemCompletions.instanceId, targetInstanceId));

  if (sourceCompletions.length === 0) {
    return;
  }

  await db.insert(schema.inductionItemCompletions).values(
    sourceCompletions.map((completion) => ({
      instanceId: targetInstanceId,
      templateItemId: completion.templateItemId,
      completed: completion.completed,
      inProgress: completion.inProgress,
      completedDate: completion.completedDate,
      targetDate: completion.targetDate,
      signedOffBy: completion.signedOffBy,
      signedOffDate: completion.signedOffDate,
      assignedTo: completion.assignedTo,
    })),
  );
}

async function main() {
  const managerId = await upsertDemoManager();
  const userId = await upsertDemoUser(managerId);
  await ensureDemoInductionJourney(userId);

  console.log("Demo colleague is ready.");
  console.log("Username: demo.colleague");
  console.log("Password: Demo123!");
  console.log("Demo manager is ready.");
  console.log("Username: demo.manager");
  console.log("Password: Demo123!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to prepare demo colleague:", error);
    process.exit(1);
  });
