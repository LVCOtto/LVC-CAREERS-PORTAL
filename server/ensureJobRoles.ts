import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ");
}

function parseCsvJobRoles(): Array<{ title: string; department: string }> {
  const csvPath = path.resolve(process.cwd(), "attached_assets/job-roles_1773315091892.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.trim().split("\n");
  const roles: Array<{ title: string; department: string }> = [];
  const seenNormalized = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 3) continue;
    const rawTitle = parts[1];
    const rawDept = parts[2];
    if (!rawTitle || !rawDept) continue;

    const title = normalizeTitle(rawTitle);
    const department = normalizeTitle(rawDept);

    if (!seenNormalized.has(title.toLowerCase())) {
      seenNormalized.add(title.toLowerCase());
      roles.push({ title, department });
    }
  }
  return roles;
}

const hardcodedExtras = [
  { title: "Engineer", department: "Service", summary: "Responsible for technical operations and equipment maintenance", responsibilities: ["Maintain and repair technical equipment", "Follow safety protocols and procedures", "Document work completed and issues identified", "Collaborate with team members on complex projects", "Participate in continuous improvement initiatives"] },
];

export function getAllSeedRoles() {
  const csvRoles = parseCsvJobRoles();
  const allRoles: Array<{ title: string; department: string; summary: string; responsibilities?: string[] }> = [];
  const seenNormalized = new Set<string>();

  for (const role of csvRoles) {
    const key = role.title.toLowerCase();
    if (!seenNormalized.has(key)) {
      seenNormalized.add(key);
      allRoles.push({ ...role, summary: "" });
    }
  }

  for (const role of hardcodedExtras) {
    const key = role.title.toLowerCase();
    if (!seenNormalized.has(key)) {
      seenNormalized.add(key);
      allRoles.push(role);
    }
  }

  const summaryDefaults: Record<string, string> = {
    "Operations Manager": "Oversees daily operations and manages operational teams",
    "Senior Field Engineer": "Experienced field engineer handling complex service calls",
    "IT & Procurement Manager": "Manages IT infrastructure and procurement processes",
    "Hire dept. Manager": "Manages the hire department operations",
    "General Manager": "Oversees general business operations and strategy",
    "Accounts Manager": "Manages accounts team and financial operations",
    "Sales Director": "Directs sales strategy and team performance",
    "H&S & Quality Coordinator/Director": "Coordinates health, safety and quality standards",
    "Sales Order Coordinator": "Coordinates sales orders and customer fulfilment",
    "Workshop Service engineer": "Services and repairs equipment in the workshop",
    "Service Administrator": "Provides administrative support for service operations",
    "Workshop Manager": "Manages workshop operations and team",
    "Purchase Ledger Administrator": "Manages purchase ledger and supplier invoices",
    "Accounts Administrator": "Provides administrative support for the accounts team",
    "Warehouse Manager": "Manages warehouse operations and inventory",
    "Delivery driver": "Handles deliveries and logistics operations",
    "Field Service Engineer": "Provides on-site service and repairs for customers",
    "Sales Consultant": "Consults with customers on product solutions and sales",
    "Warehouse Assistant": "Assists with warehouse operations and stock management",
    "Warehouse / Sales assistant": "Supports warehouse and sales operations",
    "Service Co-Ordinator": "Coordinates service schedules and engineer assignments",
    "Accounts Assistant": "Assists with accounts and administrative tasks",
  };

  for (const role of allRoles) {
    if (!role.summary) {
      role.summary = summaryDefaults[role.title] || `Responsible for ${role.department} operations`;
    }
  }

  return allRoles;
}

export async function ensureAllJobRoles() {
  try {
    await deduplicateExistingRoles();
    await removeDeprecatedRoles();

    const allRoles = getAllSeedRoles();
    const existingRoles = await db.select().from(schema.jobRoles);
    const existingNormalized = new Map<string, string>();
    for (const r of existingRoles) {
      existingNormalized.set(normalizeTitle(r.title).toLowerCase(), r.title);
    }

    let inserted = 0;
    for (const role of allRoles) {
      const key = normalizeTitle(role.title).toLowerCase();
      if (!existingNormalized.has(key)) {
        await db.insert(schema.jobRoles).values({
          title: role.title,
          department: role.department,
          summary: role.summary,
          responsibilities: role.responsibilities || [],
        }).onConflictDoNothing();
        existingNormalized.set(key, role.title);
        inserted++;
      }
    }
    if (inserted > 0) {
      console.log(`Ensured all job roles exist: ${inserted} new roles added`);
    }

    await normalizeUserJobRoles();
  } catch (e) {
    console.error("Failed to ensure job roles:", e);
  }
}

async function deduplicateExistingRoles() {
  const allRoles = await db.select().from(schema.jobRoles);
  const seen = new Map<string, number>();
  for (const role of allRoles) {
    const normalized = normalizeTitle(role.title).toLowerCase();
    if (seen.has(normalized)) {
      const keepId = seen.get(normalized)!;
      await db.update(schema.jobRoleInductionSections)
        .set({ jobRoleId: keepId })
        .where(eq(schema.jobRoleInductionSections.jobRoleId, role.id));
      await db.delete(schema.jobRoles).where(eq(schema.jobRoles.id, role.id));
      console.log(`Deduplicated job role: removed "${role.title}" (id ${role.id}), kept id ${keepId}`);
    } else {
      seen.set(normalized, role.id);
    }
  }

  for (const role of allRoles) {
    const normalized = normalizeTitle(role.title);
    if (normalized !== role.title && seen.has(normalizeTitle(role.title).toLowerCase())) {
      const keepId = seen.get(normalizeTitle(role.title).toLowerCase());
      if (keepId === role.id) {
        await db.update(schema.jobRoles)
          .set({ title: normalized })
          .where(eq(schema.jobRoles.id, role.id));
      }
    }
  }
}

async function removeDeprecatedRoles() {
  const deprecatedRoleRemap: Record<string, string> = {
    "operations coordinator": "Operations Manager",
  };

  const allRoles = await db.select().from(schema.jobRoles);
  const byNormalized = new Map<string, typeof allRoles[number]>();
  for (const role of allRoles) {
    byNormalized.set(normalizeTitle(role.title).toLowerCase(), role);
  }

  for (const [deprecatedNormalized, replacementTitle] of Object.entries(deprecatedRoleRemap)) {
    const deprecatedRole = byNormalized.get(deprecatedNormalized);
    if (!deprecatedRole) continue;

    const replacementRole = byNormalized.get(normalizeTitle(replacementTitle).toLowerCase());
    if (replacementRole) {
      await db.update(schema.jobRoleInductionSections)
        .set({ jobRoleId: replacementRole.id })
        .where(eq(schema.jobRoleInductionSections.jobRoleId, deprecatedRole.id));
    }

    await db.delete(schema.jobRoles).where(eq(schema.jobRoles.id, deprecatedRole.id));
    console.log(`Removed deprecated job role: "${deprecatedRole.title}"`);
  }
}

async function normalizeUserJobRoles() {
  const allRoles = await db.select().from(schema.jobRoles);
  const roleTitleSet = new Set(allRoles.map(r => r.title));
  const normalizedToCanonical = new Map<string, string>();
  const deprecatedRoleRemap: Record<string, string> = {
    "operations coordinator": "Operations Manager",
  };
  for (const role of allRoles) {
    normalizedToCanonical.set(normalizeTitle(role.title).toLowerCase(), role.title);
  }

  const allUsers = await db.select().from(schema.users);
  let fixed = 0;
  for (const user of allUsers) {
    if (!user.jobRole) continue;
    if (roleTitleSet.has(user.jobRole)) continue;

    const normalized = normalizeTitle(user.jobRole).toLowerCase();
    const canonical = deprecatedRoleRemap[normalized] || normalizedToCanonical.get(normalized);
    if (canonical && roleTitleSet.has(canonical) && canonical !== user.jobRole) {
      await db.update(schema.users)
        .set({ jobRole: canonical })
        .where(eq(schema.users.id, user.id));
      fixed++;
      console.log(`Normalized user ${user.id} jobRole from "${user.jobRole}" to "${canonical}"`);
    }
  }
  if (fixed > 0) {
    console.log(`Normalized ${fixed} user jobRole values`);
  }
}
