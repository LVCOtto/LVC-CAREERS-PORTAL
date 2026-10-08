import type { Department, JobRole, StandardsSurveyRole } from "@shared/schema";

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

export function roleMatchesDepartment(
  role: Pick<JobRole, "departmentId" | "department">,
  department: Pick<Department, "id" | "name">,
) {
  return role.departmentId != null
    ? role.departmentId === department.id
    : normalize(role.department) === normalize(department.name);
}

export function surveyMatchesRoles(
  survey: Pick<StandardsSurveyRole, "jobRoleId" | "roleTitle">,
  roles: Pick<JobRole, "id" | "title">[],
) {
  return roles.some(role => survey.jobRoleId != null
    ? survey.jobRoleId === role.id
    : normalize(survey.roleTitle) === normalize(role.title));
}

export function applicableInductionSections(
  allSections: string[],
  universalSections: string[],
  roleSections: string[],
) {
  const allowed = new Set([...universalSections, ...roleSections]);
  return allowed.size > 0 ? allSections.filter(section => allowed.has(section)) : allSections;
}
