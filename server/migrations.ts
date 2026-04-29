import { db } from "./db";
import { eq, sql, and, isNotNull } from "drizzle-orm";
import { careerNodes, competencyCategories, departmentsTable, jobRoles, users } from "@shared/schema";

export async function migrateCompetencyDepartmentTypes() {
  const departments = await db.select().from(departmentsTable);
  const deptNames = new Set(departments.map(d => d.name));

  const legacyMigrations: Record<string, string> = {
    'all': 'Universal',
    'engineering': 'Engineering',
    'admin': 'Accounts',
  };

  for (const [oldVal, target] of Object.entries(legacyMigrations)) {
    const newVal = (target !== 'Universal' && !deptNames.has(target)) ? 'Universal' : target;
    await db.update(competencyCategories)
      .set({ departmentType: newVal })
      .where(eq(competencyCategories.departmentType, oldVal));
  }
}

export async function migrateActivateExistingUsers() {
  await db.update(users)
    .set({ activated: true })
    .where(
      and(
        eq(users.activated, false),
        isNotNull(users.username),
        isNotNull(users.email),
        isNotNull(users.password)
      )
    );
}

export async function migrateEngineeringDepartmentModel() {
  const departments = await db.select().from(departmentsTable);

  const operationsDept = departments.find((d) => d.name === "Operations");
  const engineeringDept = departments.find((d) => d.name === "Engineering");
  let serviceDept = departments.find((d) => d.name === "Service");

  if (!serviceDept) {
    const [createdService] = await db.insert(departmentsTable)
      .values({
        name: "Service",
        color: "bg-blue-600",
        sortOrder: 2,
        parentId: operationsDept?.id,
      })
      .returning();
    serviceDept = createdService;
  } else if (operationsDept && serviceDept.parentId !== operationsDept.id) {
    await db.update(departmentsTable)
      .set({ parentId: operationsDept.id })
      .where(eq(departmentsTable.id, serviceDept.id));
  }

  if (!engineeringDept) {
    return;
  }

  if (operationsDept) {
    await db.update(departmentsTable)
      .set({ parentId: operationsDept.id })
      .where(eq(departmentsTable.name, "Workshop"));
  }

  await db.update(users)
    .set({ department: "Workshop" })
    .where(sql`${users.department} = 'Engineering' and lower(${users.jobRole}) like '%workshop%'`);

  await db.update(users)
    .set({ department: "Service" })
    .where(eq(users.department, "Engineering"));

  await db.update(jobRoles)
    .set({ department: "Workshop" })
    .where(sql`${jobRoles.department} = 'Engineering' and lower(${jobRoles.title}) like '%workshop%'`);

  await db.update(jobRoles)
    .set({ department: "Service" })
    .where(eq(jobRoles.department, "Engineering"));

  await db.update(careerNodes)
    .set({ department: "Workshop" })
    .where(sql`${careerNodes.department} = 'Engineering' and lower(${careerNodes.title}) like '%workshop%'`);

  await db.update(careerNodes)
    .set({ department: "Service" })
    .where(eq(careerNodes.department, "Engineering"));

  await db.delete(departmentsTable).where(eq(departmentsTable.id, engineeringDept.id));
}
