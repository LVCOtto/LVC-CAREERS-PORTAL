import { db } from "./db";
import { eq } from "drizzle-orm";
import { competencyCategories, departmentsTable } from "@shared/schema";

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
