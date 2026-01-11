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
  { id: 'dept-ops', name: 'Operations', parentId: 'dept-exec', color: 'bg-emerald-600' },
  { id: 'dept-eng', name: 'Engineering', parentId: 'dept-ops', color: 'bg-blue-600' },
  { id: 'dept-service', name: 'Service Administration', parentId: 'dept-ops', color: 'bg-amber-600' },
  { id: 'dept-warehouse', name: 'Warehouse & Logistics', parentId: 'dept-ops', color: 'bg-orange-600' },
  { id: 'dept-quality', name: 'Quality & Compliance', parentId: 'dept-ops', color: 'bg-red-600' },
  { id: 'dept-hire', name: 'Hire Department', parentId: 'dept-ops', color: 'bg-teal-600' },
  { id: 'dept-sales', name: 'Sales', parentId: 'dept-exec', color: 'bg-purple-600' },
  { id: 'dept-finance', name: 'Finance', parentId: 'dept-exec', color: 'bg-cyan-600' },
  { id: 'dept-hr', name: 'Human Resources', parentId: 'dept-exec', color: 'bg-pink-600' },
  { id: 'dept-it', name: 'IT & Systems', parentId: 'dept-exec', color: 'bg-indigo-600' },
];

export const jobRoles: JobRole[] = [
  { id: 'role-md', title: 'Managing Director', departmentId: 'dept-exec', level: 'director' },
  { id: 'role-gm', title: 'General Manager', departmentId: 'dept-exec', level: 'director', reportsToRoleId: 'role-md' },
  
  { id: 'role-ops-mgr', title: 'Operations Manager', departmentId: 'dept-ops', level: 'manager', reportsToRoleId: 'role-gm' },
  
  { id: 'role-sales-dir', title: 'Sales Director', departmentId: 'dept-sales', level: 'director', reportsToRoleId: 'role-md' },
  { id: 'role-sales-consultant', title: 'Sales Consultant', departmentId: 'dept-sales', level: 'mid', reportsToRoleId: 'role-sales-dir' },
  { id: 'role-sales-order-coord', title: 'Sales Order Coordinator', departmentId: 'dept-sales', level: 'mid', reportsToRoleId: 'role-sales-dir' },
  
  { id: 'role-accounts-mgr', title: 'Accounts Manager', departmentId: 'dept-finance', level: 'manager', reportsToRoleId: 'role-md' },
  { id: 'role-accounts-admin', title: 'Accounts Administrator', departmentId: 'dept-finance', level: 'entry', reportsToRoleId: 'role-accounts-mgr' },
  { id: 'role-purchase-ledger', title: 'Purchase Ledger Administrator', departmentId: 'dept-finance', level: 'entry', reportsToRoleId: 'role-accounts-mgr' },
  
  { id: 'role-workshop-mgr', title: 'Workshop Manager / Senior Service Engineer', departmentId: 'dept-eng', level: 'manager', reportsToRoleId: 'role-ops-mgr' },
  { id: 'role-senior-eng', title: 'Senior Service Engineer', departmentId: 'dept-eng', level: 'senior', reportsToRoleId: 'role-workshop-mgr' },
  { id: 'role-field-eng', title: 'Field Service Engineer', departmentId: 'dept-eng', level: 'mid', reportsToRoleId: 'role-workshop-mgr' },
  { id: 'role-workshop-eng', title: 'Workshop Service Engineer', departmentId: 'dept-eng', level: 'mid', reportsToRoleId: 'role-workshop-mgr' },
  
  { id: 'role-service-coord', title: 'Service Co-Ordinator', departmentId: 'dept-service', level: 'senior', reportsToRoleId: 'role-ops-mgr' },
  { id: 'role-service-admin', title: 'Service Administrator', departmentId: 'dept-service', level: 'mid', reportsToRoleId: 'role-service-coord' },
  
  { id: 'role-wh-mgr', title: 'Warehouse Manager', departmentId: 'dept-warehouse', level: 'manager', reportsToRoleId: 'role-ops-mgr' },
  { id: 'role-wh-sales-asst', title: 'Warehouse and Sales Assistant', departmentId: 'dept-warehouse', level: 'mid', reportsToRoleId: 'role-wh-mgr' },
  { id: 'role-wh-asst', title: 'Warehouse Assistant', departmentId: 'dept-warehouse', level: 'entry', reportsToRoleId: 'role-wh-mgr' },
  { id: 'role-driver', title: 'Delivery Driver', departmentId: 'dept-warehouse', level: 'mid', reportsToRoleId: 'role-wh-mgr' },
  
  { id: 'role-hs-quality', title: 'H&S & Quality Coordinator', departmentId: 'dept-quality', level: 'manager', reportsToRoleId: 'role-gm' },
  
  { id: 'role-hire-mgr', title: 'Hire Department Manager', departmentId: 'dept-hire', level: 'manager', reportsToRoleId: 'role-ops-mgr' },
  
  { id: 'role-it-proc-mgr', title: 'IT & Procurement Manager', departmentId: 'dept-it', level: 'manager', reportsToRoleId: 'role-gm' },
];

export const orgMembers: OrgMember[] = [
  { id: 'mem-1', name: '[MD - TBC]', jobRoleId: 'role-md', departmentId: 'dept-exec', email: 'md@lvc.co.uk', startDate: '2010-01-01' },
  { id: 'mem-2', name: '[General Manager - TBC]', jobRoleId: 'role-gm', departmentId: 'dept-exec', managerId: 'mem-1', email: 'gm@lvc.co.uk', startDate: '2012-01-01' },
  
  { id: 'mem-3', name: '[Operations Manager - TBC]', jobRoleId: 'role-ops-mgr', departmentId: 'dept-ops', managerId: 'mem-2', email: 'ops.manager@lvc.co.uk', startDate: '2015-01-01' },
  
  { id: 'mem-4', name: '[Sales Director - TBC]', jobRoleId: 'role-sales-dir', departmentId: 'dept-sales', managerId: 'mem-1', email: 'sales.director@lvc.co.uk', startDate: '2014-01-01' },
  { id: 'mem-5', name: '[Sales Consultant 1 - TBC]', jobRoleId: 'role-sales-consultant', departmentId: 'dept-sales', managerId: 'mem-4', email: 'sales1@lvc.co.uk', startDate: '2018-01-01' },
  { id: 'mem-6', name: '[Sales Consultant 2 - TBC]', jobRoleId: 'role-sales-consultant', departmentId: 'dept-sales', managerId: 'mem-4', email: 'sales2@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-7', name: '[Sales Order Coordinator - TBC]', jobRoleId: 'role-sales-order-coord', departmentId: 'dept-sales', managerId: 'mem-4', email: 'sales.orders@lvc.co.uk', startDate: '2020-01-01' },
  
  { id: 'mem-8', name: '[Accounts Manager - TBC]', jobRoleId: 'role-accounts-mgr', departmentId: 'dept-finance', managerId: 'mem-1', email: 'accounts.manager@lvc.co.uk', startDate: '2013-01-01' },
  { id: 'mem-9', name: '[Accounts Administrator - TBC]', jobRoleId: 'role-accounts-admin', departmentId: 'dept-finance', managerId: 'mem-8', email: 'accounts.admin@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-10', name: '[Purchase Ledger Admin - TBC]', jobRoleId: 'role-purchase-ledger', departmentId: 'dept-finance', managerId: 'mem-8', email: 'purchase.ledger@lvc.co.uk', startDate: '2020-01-01' },
  
  { id: 'mem-11', name: '[Workshop Manager - TBC]', jobRoleId: 'role-workshop-mgr', departmentId: 'dept-eng', managerId: 'mem-3', email: 'workshop.manager@lvc.co.uk', startDate: '2016-01-01' },
  { id: 'mem-12', name: '[Senior Service Engineer 1 - TBC]', jobRoleId: 'role-senior-eng', departmentId: 'dept-eng', managerId: 'mem-11', email: 'senior.eng1@lvc.co.uk', startDate: '2017-01-01' },
  { id: 'mem-13', name: '[Senior Service Engineer 2 - TBC]', jobRoleId: 'role-senior-eng', departmentId: 'dept-eng', managerId: 'mem-11', email: 'senior.eng2@lvc.co.uk', startDate: '2018-01-01' },
  { id: 'mem-14', name: '[Field Service Engineer 1 - TBC]', jobRoleId: 'role-field-eng', departmentId: 'dept-eng', managerId: 'mem-11', email: 'field.eng1@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-15', name: '[Field Service Engineer 2 - TBC]', jobRoleId: 'role-field-eng', departmentId: 'dept-eng', managerId: 'mem-11', email: 'field.eng2@lvc.co.uk', startDate: '2020-01-01' },
  { id: 'mem-16', name: '[Field Service Engineer 3 - TBC]', jobRoleId: 'role-field-eng', departmentId: 'dept-eng', managerId: 'mem-11', email: 'field.eng3@lvc.co.uk', startDate: '2021-01-01' },
  { id: 'mem-17', name: '[Workshop Service Engineer 1 - TBC]', jobRoleId: 'role-workshop-eng', departmentId: 'dept-eng', managerId: 'mem-11', email: 'workshop.eng1@lvc.co.uk', startDate: '2020-01-01' },
  { id: 'mem-18', name: '[Workshop Service Engineer 2 - TBC]', jobRoleId: 'role-workshop-eng', departmentId: 'dept-eng', managerId: 'mem-11', email: 'workshop.eng2@lvc.co.uk', startDate: '2022-01-01' },
  
  { id: 'mem-19', name: '[Service Co-Ordinator - TBC]', jobRoleId: 'role-service-coord', departmentId: 'dept-service', managerId: 'mem-3', email: 'service.coord@lvc.co.uk', startDate: '2017-01-01' },
  { id: 'mem-20', name: '[Service Administrator 1 - TBC]', jobRoleId: 'role-service-admin', departmentId: 'dept-service', managerId: 'mem-19', email: 'service.admin1@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-21', name: '[Service Administrator 2 - TBC]', jobRoleId: 'role-service-admin', departmentId: 'dept-service', managerId: 'mem-19', email: 'service.admin2@lvc.co.uk', startDate: '2021-01-01' },
  
  { id: 'mem-22', name: '[Warehouse Manager - TBC]', jobRoleId: 'role-wh-mgr', departmentId: 'dept-warehouse', managerId: 'mem-3', email: 'warehouse.manager@lvc.co.uk', startDate: '2016-01-01' },
  { id: 'mem-23', name: '[Warehouse & Sales Assistant - TBC]', jobRoleId: 'role-wh-sales-asst', departmentId: 'dept-warehouse', managerId: 'mem-22', email: 'warehouse.sales@lvc.co.uk', startDate: '2020-01-01' },
  { id: 'mem-24', name: '[Warehouse Assistant 1 - TBC]', jobRoleId: 'role-wh-asst', departmentId: 'dept-warehouse', managerId: 'mem-22', email: 'warehouse.asst1@lvc.co.uk', startDate: '2021-01-01' },
  { id: 'mem-25', name: '[Warehouse Assistant 2 - TBC]', jobRoleId: 'role-wh-asst', departmentId: 'dept-warehouse', managerId: 'mem-22', email: 'warehouse.asst2@lvc.co.uk', startDate: '2022-01-01' },
  { id: 'mem-26', name: '[Delivery Driver 1 - TBC]', jobRoleId: 'role-driver', departmentId: 'dept-warehouse', managerId: 'mem-22', email: 'driver1@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-27', name: '[Delivery Driver 2 - TBC]', jobRoleId: 'role-driver', departmentId: 'dept-warehouse', managerId: 'mem-22', email: 'driver2@lvc.co.uk', startDate: '2021-01-01' },
  
  { id: 'mem-28', name: '[H&S & Quality Coordinator - TBC]', jobRoleId: 'role-hs-quality', departmentId: 'dept-quality', managerId: 'mem-2', email: 'quality@lvc.co.uk', startDate: '2018-01-01' },
  
  { id: 'mem-29', name: '[Hire Dept Manager - TBC]', jobRoleId: 'role-hire-mgr', departmentId: 'dept-hire', managerId: 'mem-3', email: 'hire.manager@lvc.co.uk', startDate: '2017-01-01' },
  
  { id: 'mem-30', name: '[IT & Procurement Manager - TBC]', jobRoleId: 'role-it-proc-mgr', departmentId: 'dept-it', managerId: 'mem-2', email: 'it.manager@lvc.co.uk', startDate: '2019-01-01' },
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

export function getRolesByDepartment(departmentId: string): JobRole[] {
  return jobRoles.filter(r => r.departmentId === departmentId);
}

export function getDirectReports(managerId: string): OrgMember[] {
  return orgMembers.filter(m => m.managerId === managerId);
}

export function getOrgTree() {
  const rootMembers = orgMembers.filter(m => !m.managerId);
  
  const buildTree = (member: OrgMember): any => {
    const reports = getDirectReports(member.id);
    const role = getJobRoleById(member.jobRoleId);
    const dept = getDepartmentById(member.departmentId);
    
    return {
      ...member,
      role,
      department: dept,
      children: reports.map(buildTree),
    };
  };
  
  return rootMembers.map(buildTree);
}

export function getAllJobRoleTitles(): string[] {
  return jobRoles.map(r => r.title);
}

export function getDepartmentStats() {
  return departments.map(dept => ({
    ...dept,
    memberCount: getMembersByDepartment(dept.id).length,
    roleCount: getRolesByDepartment(dept.id).length,
  }));
}
