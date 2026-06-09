import { db, pool } from "./db";
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
  // With OTP-only auth, activation requires only an email address.
  await db.update(users)
    .set({ activated: true })
    .where(
      and(
        eq(users.activated, false),
        isNotNull(users.email),
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

export async function migrateCanonicalRelationshipColumns() {
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS job_role_id integer;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id integer;
    ALTER TABLE job_roles ADD COLUMN IF NOT EXISTS department_id integer;
    ALTER TABLE competency_categories ADD COLUMN IF NOT EXISTS department_id integer;
    ALTER TABLE career_nodes ADD COLUMN IF NOT EXISTS job_role_id integer;
    ALTER TABLE career_nodes ADD COLUMN IF NOT EXISTS department_id integer;
    ALTER TABLE standards_survey_roles ADD COLUMN IF NOT EXISTS job_role_id integer;

    CREATE INDEX IF NOT EXISTS "IDX_users_job_role_id" ON users (job_role_id);
    CREATE INDEX IF NOT EXISTS "IDX_users_department_id" ON users (department_id);
    CREATE INDEX IF NOT EXISTS "IDX_job_roles_department_id" ON job_roles (department_id);
    CREATE INDEX IF NOT EXISTS "IDX_competency_categories_department_id" ON competency_categories (department_id);
    CREATE INDEX IF NOT EXISTS "IDX_career_nodes_job_role_id" ON career_nodes (job_role_id);
    CREATE INDEX IF NOT EXISTS "IDX_career_nodes_department_id" ON career_nodes (department_id);
    CREATE INDEX IF NOT EXISTS "IDX_standards_survey_roles_job_role_id" ON standards_survey_roles (job_role_id);
  `);

  await pool.query(`
    UPDATE users u
    SET job_role_id = NULL
    WHERE u.job_role_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM job_roles jr WHERE jr.id = u.job_role_id);

    UPDATE users u
    SET department_id = NULL
    WHERE u.department_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM departments d WHERE d.id = u.department_id);

    UPDATE job_roles jr
    SET department_id = NULL
    WHERE jr.department_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM departments d WHERE d.id = jr.department_id);

    UPDATE competency_categories cc
    SET department_id = NULL
    WHERE cc.department_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM departments d WHERE d.id = cc.department_id);

    UPDATE career_nodes cn
    SET job_role_id = NULL
    WHERE cn.job_role_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM job_roles jr WHERE jr.id = cn.job_role_id);

    UPDATE career_nodes cn
    SET department_id = NULL
    WHERE cn.department_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM departments d WHERE d.id = cn.department_id);

    UPDATE standards_survey_roles ssr
    SET job_role_id = NULL
    WHERE ssr.job_role_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM job_roles jr WHERE jr.id = ssr.job_role_id);

    UPDATE job_roles jr
    SET department_id = d.id
    FROM departments d
    WHERE jr.department_id IS NULL
      AND lower(btrim(jr.department)) = lower(btrim(d.name));

    UPDATE competency_categories cc
    SET department_id = d.id
    FROM departments d
    WHERE cc.department_id IS NULL
      AND lower(btrim(cc.department_type)) = lower(btrim(d.name));

    UPDATE career_nodes cn
    SET department_id = d.id
    FROM departments d
    WHERE cn.department_id IS NULL
      AND lower(btrim(cn.department)) = lower(btrim(d.name));

    UPDATE users u
    SET job_role_id = jr.id
    FROM job_roles jr
    WHERE u.job_role_id IS NULL
      AND lower(btrim(u.job_role)) = lower(btrim(jr.title));

    UPDATE users u
    SET department_id = d.id
    FROM departments d
    WHERE u.department_id IS NULL
      AND lower(btrim(u.department)) = lower(btrim(d.name));

    UPDATE users u
    SET department_id = jr.department_id
    FROM job_roles jr
    WHERE u.department_id IS NULL
      AND u.job_role_id = jr.id
      AND jr.department_id IS NOT NULL;

    UPDATE career_nodes cn
    SET job_role_id = jr.id
    FROM job_roles jr
    WHERE cn.job_role_id IS NULL
      AND lower(btrim(cn.title)) = lower(btrim(jr.title));

    UPDATE standards_survey_roles ssr
    SET job_role_id = jr.id
    FROM job_roles jr
    WHERE ssr.job_role_id IS NULL
      AND (
        lower(btrim(ssr.role_title)) = lower(btrim(jr.title))
        OR lower(btrim(ssr.role_slug)) = regexp_replace(lower(btrim(jr.title)), '[^a-z0-9]+', '-', 'g')
      );
  `);

  await pool.query(`
    UPDATE job_roles jr
    SET department = d.name
    FROM departments d
    WHERE jr.department_id = d.id
      AND jr.department IS DISTINCT FROM d.name;

    UPDATE competency_categories cc
    SET department_type = d.name
    FROM departments d
    WHERE cc.department_id = d.id
      AND cc.department_type IS DISTINCT FROM d.name;

    UPDATE career_nodes cn
    SET title = jr.title
    FROM job_roles jr
    WHERE cn.job_role_id = jr.id
      AND cn.title IS DISTINCT FROM jr.title;

    UPDATE career_nodes cn
    SET department = d.name
    FROM departments d
    WHERE cn.department_id = d.id
      AND cn.department IS DISTINCT FROM d.name;

    UPDATE users u
    SET job_role = jr.title
    FROM job_roles jr
    WHERE u.job_role_id = jr.id
      AND u.job_role IS DISTINCT FROM jr.title;

    UPDATE users u
    SET department = d.name
    FROM departments d
    WHERE u.department_id = d.id
      AND u.department IS DISTINCT FROM d.name;
  `);
}
