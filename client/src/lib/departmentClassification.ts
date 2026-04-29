type DepartmentUserLike = {
  department?: string | null;
  jobRole?: string | null;
};

function normalize(value?: string | null): string {
  return (value || '').trim().toLowerCase();
}

export function isEngineeringTrackUser(user: DepartmentUserLike | null | undefined): boolean {
  const department = normalize(user?.department);
  const jobRole = normalize(user?.jobRole);

  if (
    department.includes('service') ||
    department.includes('workshop') ||
    department.includes('engineering')
  ) {
    return true;
  }

  return (
    jobRole.includes('engineer') ||
    jobRole.includes('workshop') ||
    jobRole.includes('technician')
  );
}

export function getCompetencyDepartmentType(user: DepartmentUserLike | null | undefined): 'engineering' | 'admin' {
  return isEngineeringTrackUser(user) ? 'engineering' : 'admin';
}
