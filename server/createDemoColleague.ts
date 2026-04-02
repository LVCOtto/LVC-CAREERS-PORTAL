import { and, asc, eq } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";

const DEMO_USER_ID = "demo-colleague-1";
const DEMO_USERNAME = "demo.colleague";

async function upsertDemoUser() {
  const demoPayload: schema.InsertUser = {
    id: DEMO_USER_ID,
    username: DEMO_USERNAME,
    password: "Demo123!",
    name: "Demo Colleague",
    email: "demo.colleague@lvc-demo.local",
    role: "colleague",
    jobRole: "Workshop Engineer",
    department: "Workshop",
    managerId: null,
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

async function main() {
  const userId = await upsertDemoUser();
  await ensureDemoInductionJourney(userId);

  console.log("Demo colleague is ready.");
  console.log("Username: demo.colleague");
  console.log("Password: Demo123!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to prepare demo colleague:", error);
    process.exit(1);
  });
