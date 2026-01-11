export interface Department {
  id: string;
  name: string;
  headId?: string;
  parentId?: string;
  color: string;
}

export interface JobRole {
  id: string;
  title: string;
  departmentId: string;
  level: 'entry' | 'mid' | 'senior' | 'manager' | 'director';
  reportsToRoleId?: string;
}

export interface OrgMember {
  id: string;
  name: string;
  jobRoleId: string;
  departmentId: string;
  managerId?: string;
  email: string;
  avatar?: string;
  startDate: string;
}

export const departments: Department[] = [
  { id: 'dept-exec', name: 'Executive', color: 'bg-slate-600' },
  { id: 'dept-eng', name: 'Engineering', parentId: 'dept-ops', color: 'bg-blue-600' },
  { id: 'dept-ops', name: 'Operations', parentId: 'dept-exec', color: 'bg-emerald-600' },
  { id: 'dept-sales', name: 'Sales', parentId: 'dept-exec', color: 'bg-purple-600' },
  { id: 'dept-admin', name: 'Service Administration', parentId: 'dept-ops', color: 'bg-amber-600' },
  { id: 'dept-hr', name: 'Human Resources', parentId: 'dept-exec', color: 'bg-pink-600' },
  { id: 'dept-finance', name: 'Finance', parentId: 'dept-exec', color: 'bg-cyan-600' },
  { id: 'dept-warehouse', name: 'Warehouse & Logistics', parentId: 'dept-ops', color: 'bg-orange-600' },
  { id: 'dept-quality', name: 'Quality & Compliance', parentId: 'dept-ops', color: 'bg-red-600' },
  { id: 'dept-it', name: 'IT & Systems', parentId: 'dept-exec', color: 'bg-indigo-600' },
];

export const jobRoles: JobRole[] = [
  { id: 'role-md', title: 'Managing Director', departmentId: 'dept-exec', level: 'director' },
  { id: 'role-ops-dir', title: 'Operations Director', departmentId: 'dept-ops', level: 'director', reportsToRoleId: 'role-md' },
  { id: 'role-sales-dir', title: 'Sales Director', departmentId: 'dept-sales', level: 'director', reportsToRoleId: 'role-md' },
  { id: 'role-hr-mgr', title: 'HR Manager', departmentId: 'dept-hr', level: 'manager', reportsToRoleId: 'role-md' },
  { id: 'role-fin-mgr', title: 'Finance Manager', departmentId: 'dept-finance', level: 'manager', reportsToRoleId: 'role-md' },
  { id: 'role-it-mgr', title: 'IT Manager', departmentId: 'dept-it', level: 'manager', reportsToRoleId: 'role-md' },
  
  { id: 'role-eng-mgr', title: 'Engineering Manager', departmentId: 'dept-eng', level: 'manager', reportsToRoleId: 'role-ops-dir' },
  { id: 'role-eng-lead', title: 'Engineering Team Lead', departmentId: 'dept-eng', level: 'senior', reportsToRoleId: 'role-eng-mgr' },
  { id: 'role-engineer', title: 'Engineer', departmentId: 'dept-eng', level: 'mid', reportsToRoleId: 'role-eng-lead' },
  { id: 'role-engineer-jr', title: 'Junior Engineer', departmentId: 'dept-eng', level: 'entry', reportsToRoleId: 'role-eng-lead' },
  { id: 'role-apprentice', title: 'Engineering Apprentice', departmentId: 'dept-eng', level: 'entry', reportsToRoleId: 'role-eng-lead' },
  
  { id: 'role-admin-mgr', title: 'Service Admin Manager', departmentId: 'dept-admin', level: 'manager', reportsToRoleId: 'role-ops-dir' },
  { id: 'role-admin-coord', title: 'Service Coordinator', departmentId: 'dept-admin', level: 'mid', reportsToRoleId: 'role-admin-mgr' },
  { id: 'role-admin-asst', title: 'Admin Assistant', departmentId: 'dept-admin', level: 'entry', reportsToRoleId: 'role-admin-mgr' },
  
  { id: 'role-wh-mgr', title: 'Warehouse Manager', departmentId: 'dept-warehouse', level: 'manager', reportsToRoleId: 'role-ops-dir' },
  { id: 'role-wh-lead', title: 'Warehouse Team Lead', departmentId: 'dept-warehouse', level: 'senior', reportsToRoleId: 'role-wh-mgr' },
  { id: 'role-wh-operative', title: 'Warehouse Operative', departmentId: 'dept-warehouse', level: 'entry', reportsToRoleId: 'role-wh-lead' },
  { id: 'role-driver', title: 'Delivery Driver', departmentId: 'dept-warehouse', level: 'mid', reportsToRoleId: 'role-wh-mgr' },
  
  { id: 'role-qa-mgr', title: 'Quality Manager', departmentId: 'dept-quality', level: 'manager', reportsToRoleId: 'role-ops-dir' },
  { id: 'role-qa-officer', title: 'Quality Officer', departmentId: 'dept-quality', level: 'mid', reportsToRoleId: 'role-qa-mgr' },
  
  { id: 'role-sales-mgr', title: 'Sales Manager', departmentId: 'dept-sales', level: 'manager', reportsToRoleId: 'role-sales-dir' },
  { id: 'role-account-mgr', title: 'Account Manager', departmentId: 'dept-sales', level: 'mid', reportsToRoleId: 'role-sales-mgr' },
  { id: 'role-sales-exec', title: 'Sales Executive', departmentId: 'dept-sales', level: 'entry', reportsToRoleId: 'role-sales-mgr' },
  
  { id: 'role-hr-officer', title: 'HR Officer', departmentId: 'dept-hr', level: 'mid', reportsToRoleId: 'role-hr-mgr' },
  { id: 'role-hr-admin', title: 'HR Administrator', departmentId: 'dept-hr', level: 'entry', reportsToRoleId: 'role-hr-mgr' },
  
  { id: 'role-accountant', title: 'Accountant', departmentId: 'dept-finance', level: 'mid', reportsToRoleId: 'role-fin-mgr' },
  { id: 'role-fin-asst', title: 'Finance Assistant', departmentId: 'dept-finance', level: 'entry', reportsToRoleId: 'role-fin-mgr' },
  
  { id: 'role-it-tech', title: 'IT Technician', departmentId: 'dept-it', level: 'mid', reportsToRoleId: 'role-it-mgr' },
];

export const orgMembers: OrgMember[] = [
  { id: 'mem-1', name: 'Richard Stevens', jobRoleId: 'role-md', departmentId: 'dept-exec', email: 'r.stevens@lvc.co.uk', startDate: '2010-01-15' },
  
  { id: 'mem-2', name: 'Sarah Mitchell', jobRoleId: 'role-ops-dir', departmentId: 'dept-ops', managerId: 'mem-1', email: 's.mitchell@lvc.co.uk', startDate: '2015-03-20' },
  { id: 'mem-3', name: 'James Thompson', jobRoleId: 'role-sales-dir', departmentId: 'dept-sales', managerId: 'mem-1', email: 'j.thompson@lvc.co.uk', startDate: '2016-06-01' },
  { id: 'mem-4', name: 'Emma Davies', jobRoleId: 'role-hr-mgr', departmentId: 'dept-hr', managerId: 'mem-1', email: 'e.davies@lvc.co.uk', startDate: '2018-09-10' },
  { id: 'mem-5', name: 'Michael Brown', jobRoleId: 'role-fin-mgr', departmentId: 'dept-finance', managerId: 'mem-1', email: 'm.brown@lvc.co.uk', startDate: '2017-04-15' },
  { id: 'mem-6', name: 'David Wilson', jobRoleId: 'role-it-mgr', departmentId: 'dept-it', managerId: 'mem-1', email: 'd.wilson@lvc.co.uk', startDate: '2019-02-01' },
  
  { id: 'mem-7', name: 'John Cooper', jobRoleId: 'role-eng-mgr', departmentId: 'dept-eng', managerId: 'mem-2', email: 'j.cooper@lvc.co.uk', startDate: '2017-08-01' },
  { id: 'mem-8', name: 'Lisa Anderson', jobRoleId: 'role-admin-mgr', departmentId: 'dept-admin', managerId: 'mem-2', email: 'l.anderson@lvc.co.uk', startDate: '2019-05-20' },
  { id: 'mem-9', name: 'Robert Taylor', jobRoleId: 'role-wh-mgr', departmentId: 'dept-warehouse', managerId: 'mem-2', email: 'r.taylor@lvc.co.uk', startDate: '2018-11-12' },
  { id: 'mem-10', name: 'Helen Clark', jobRoleId: 'role-qa-mgr', departmentId: 'dept-quality', managerId: 'mem-2', email: 'h.clark@lvc.co.uk', startDate: '2020-01-06' },
  
  { id: 'mem-11', name: 'Mark Williams', jobRoleId: 'role-eng-lead', departmentId: 'dept-eng', managerId: 'mem-7', email: 'm.williams@lvc.co.uk', startDate: '2019-03-15' },
  { id: 'mem-12', name: 'Chris Evans', jobRoleId: 'role-engineer', departmentId: 'dept-eng', managerId: 'mem-11', email: 'c.evans@lvc.co.uk', startDate: '2021-06-01' },
  { id: 'mem-13', name: 'Tom Hughes', jobRoleId: 'role-engineer', departmentId: 'dept-eng', managerId: 'mem-11', email: 't.hughes@lvc.co.uk', startDate: '2022-02-14' },
  { id: 'mem-14', name: 'Alex Johnson', jobRoleId: 'role-engineer-jr', departmentId: 'dept-eng', managerId: 'mem-11', email: 'a.johnson@lvc.co.uk', startDate: '2024-11-01' },
  { id: 'mem-15', name: 'Ryan Smith', jobRoleId: 'role-apprentice', departmentId: 'dept-eng', managerId: 'mem-11', email: 'r.smith@lvc.co.uk', startDate: '2024-09-01' },
  
  { id: 'mem-16', name: 'Sophie Turner', jobRoleId: 'role-admin-coord', departmentId: 'dept-admin', managerId: 'mem-8', email: 's.turner@lvc.co.uk', startDate: '2021-04-12' },
  { id: 'mem-17', name: 'Katie Roberts', jobRoleId: 'role-admin-asst', departmentId: 'dept-admin', managerId: 'mem-8', email: 'k.roberts@lvc.co.uk', startDate: '2023-08-21' },
  
  { id: 'mem-18', name: 'Peter Green', jobRoleId: 'role-wh-lead', departmentId: 'dept-warehouse', managerId: 'mem-9', email: 'p.green@lvc.co.uk', startDate: '2020-03-02' },
  { id: 'mem-19', name: 'Steve Baker', jobRoleId: 'role-wh-operative', departmentId: 'dept-warehouse', managerId: 'mem-18', email: 's.baker@lvc.co.uk', startDate: '2022-07-18' },
  { id: 'mem-20', name: 'Mike Harrison', jobRoleId: 'role-driver', departmentId: 'dept-warehouse', managerId: 'mem-9', email: 'm.harrison@lvc.co.uk', startDate: '2021-11-29' },
  
  { id: 'mem-21', name: 'Rachel Adams', jobRoleId: 'role-sales-mgr', departmentId: 'dept-sales', managerId: 'mem-3', email: 'r.adams@lvc.co.uk', startDate: '2019-09-16' },
  { id: 'mem-22', name: 'Daniel Moore', jobRoleId: 'role-account-mgr', departmentId: 'dept-sales', managerId: 'mem-21', email: 'd.moore@lvc.co.uk', startDate: '2021-02-08' },
  { id: 'mem-23', name: 'Emily Carter', jobRoleId: 'role-sales-exec', departmentId: 'dept-sales', managerId: 'mem-21', email: 'e.carter@lvc.co.uk', startDate: '2023-05-15' },
  
  { id: 'mem-24', name: 'Laura White', jobRoleId: 'role-hr-officer', departmentId: 'dept-hr', managerId: 'mem-4', email: 'l.white@lvc.co.uk', startDate: '2020-10-05' },
  { id: 'mem-25', name: 'Amy Jackson', jobRoleId: 'role-hr-admin', departmentId: 'dept-hr', managerId: 'mem-4', email: 'a.jackson@lvc.co.uk', startDate: '2022-12-01' },
  
  { id: 'mem-26', name: 'Kevin Hall', jobRoleId: 'role-accountant', departmentId: 'dept-finance', managerId: 'mem-5', email: 'k.hall@lvc.co.uk', startDate: '2019-07-22' },
  { id: 'mem-27', name: 'Jessica Lee', jobRoleId: 'role-fin-asst', departmentId: 'dept-finance', managerId: 'mem-5', email: 'j.lee@lvc.co.uk', startDate: '2023-03-13' },
  
  { id: 'mem-28', name: 'Paul Martin', jobRoleId: 'role-qa-officer', departmentId: 'dept-quality', managerId: 'mem-10', email: 'p.martin@lvc.co.uk', startDate: '2021-08-09' },
  
  { id: 'mem-29', name: 'Nick Thomas', jobRoleId: 'role-it-tech', departmentId: 'dept-it', managerId: 'mem-6', email: 'n.thomas@lvc.co.uk', startDate: '2022-04-25' },
];

export function getDepartmentById(id: string): Department | undefined {
  return departments.find(d => d.id === id);
}

export function getJobRoleById(id: string): JobRole | undefined {
  return jobRoles.find(r => r.id === id);
}

export function getMemberById(id: string): OrgMember | undefined {
  return orgMembers.find(m => m.id === id);
}

export function getMembersByDepartment(departmentId: string): OrgMember[] {
  return orgMembers.filter(m => m.departmentId === departmentId);
}

export function getDirectReports(managerId: string): OrgMember[] {
  return orgMembers.filter(m => m.managerId === managerId);
}

export function getRolesForDepartment(departmentId: string): JobRole[] {
  return jobRoles.filter(r => r.departmentId === departmentId);
}

export function buildOrgTree() {
  const rootMembers = orgMembers.filter(m => !m.managerId);
  
  function buildNode(member: OrgMember): any {
    const role = getJobRoleById(member.jobRoleId);
    const dept = getDepartmentById(member.departmentId);
    const reports = getDirectReports(member.id);
    
    return {
      ...member,
      role,
      department: dept,
      children: reports.map(buildNode),
    };
  }
  
  return rootMembers.map(buildNode);
}

export function getDepartmentStats() {
  return departments.map(dept => ({
    ...dept,
    memberCount: getMembersByDepartment(dept.id).length,
    roleCount: getRolesForDepartment(dept.id).length,
  }));
}
