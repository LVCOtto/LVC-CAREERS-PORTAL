import { db } from "./db";
import { eq, sql, and, isNotNull } from "drizzle-orm";
import { competencyCategories, departmentsTable, users } from "@shared/schema";

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
