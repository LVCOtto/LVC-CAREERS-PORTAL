import { db } from "./db";
import { eq } from "drizzle-orm";
import { competencyCategories } from "@shared/schema";

export async function migrateCompetencyDepartmentTypes() {
  const legacyMigrations: Record<string, string> = {
    'all': 'Universal',
    'engineering': 'Engineering',
    'admin': 'Admin / Office',
  };

  for (const [oldVal, newVal] of Object.entries(legacyMigrations)) {
    await db.update(competencyCategories)
      .set({ departmentType: newVal })
      .where(eq(competencyCategories.departmentType, oldVal));
  }
}
