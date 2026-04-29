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
  { id: 'dept-exec', name: 'Directors', color: 'bg-slate-600' },
  { id: 'dept-ops', name: 'Operations', parentId: 'dept-exec', color: 'bg-emerald-600' },
  { id: 'dept-eng', name: 'Service', parentId: 'dept-ops', color: 'bg-blue-600' },
  { id: 'dept-service', name: 'Service Coordination', parentId: 'dept-ops', color: 'bg-amber-600' },
  { id: 'dept-warehouse', name: 'Warehouse & Logistics', parentId: 'dept-ops', color: 'bg-orange-600' },
  { id: 'dept-hire', name: 'Hire Department', parentId: 'dept-ops', color: 'bg-teal-600' },
  { id: 'dept-workshop', name: 'Workshop', parentId: 'dept-ops', color: 'bg-sky-600' },
  { id: 'dept-sales', name: 'Sales & Product Support', parentId: 'dept-exec', color: 'bg-purple-600' },
  { id: 'dept-finance', name: 'Accounts', parentId: 'dept-exec', color: 'bg-cyan-600' },
  { id: 'dept-quality', name: 'H&S / HR / Quality', parentId: 'dept-exec', color: 'bg-red-600' },
  { id: 'dept-it', name: 'IT & Procurement', parentId: 'dept-exec', color: 'bg-indigo-600' },
];

export const jobRoles: JobRole[] = [
  // Directors
  { id: 'role-md', title: 'Managing Director', departmentId: 'dept-exec', level: 'director' },
  { id: 'role-gm', title: 'General Manager (Sales Key)', departmentId: 'dept-exec', level: 'director', reportsToRoleId: 'role-md' },
  { id: 'role-finance-dir', title: 'Finance Director', departmentId: 'dept-exec', level: 'director', reportsToRoleId: 'role-md' },
  { id: 'role-hs-hr-dir', title: 'H&S / HR / Quality Director', departmentId: 'dept-exec', level: 'director', reportsToRoleId: 'role-md' },
  
  // Operations
  { id: 'role-ops-mgr', title: 'Operations Manager', departmentId: 'dept-ops', level: 'manager', reportsToRoleId: 'role-gm' },
  
  // Service Coordination
  { id: 'role-service-coord', title: 'Service Co-Ordinator', departmentId: 'dept-service', level: 'senior', reportsToRoleId: 'role-ops-mgr' },
  { id: 'role-service-coord-asst', title: 'Service Coordinator Assistant', departmentId: 'dept-service', level: 'mid', reportsToRoleId: 'role-service-coord' },
  
  // Service Department Engineers
  { id: 'role-senior-eng', title: 'Senior Service Engineer', departmentId: 'dept-eng', level: 'senior', reportsToRoleId: 'role-ops-mgr' },
  { id: 'role-field-eng', title: 'Field Service Engineer', departmentId: 'dept-eng', level: 'mid', reportsToRoleId: 'role-senior-eng' },
  { id: 'role-service-eng', title: 'Service Engineer', departmentId: 'dept-eng', level: 'mid', reportsToRoleId: 'role-senior-eng' },
  
  // Workshop
  { id: 'role-workshop-mgr', title: 'Workshop Manager / Senior Service Engineer', departmentId: 'dept-workshop', level: 'manager', reportsToRoleId: 'role-ops-mgr' },
  { id: 'role-workshop-eng', title: 'Workshop Service Engineer', departmentId: 'dept-workshop', level: 'mid', reportsToRoleId: 'role-workshop-mgr' },
  
  // Sales & Product Support
  { id: 'role-it-product-mgr', title: 'Product & IT Support Manager', departmentId: 'dept-sales', level: 'manager', reportsToRoleId: 'role-gm' },
  { id: 'role-sales-mgr', title: 'Sales Manager', departmentId: 'dept-sales', level: 'manager', reportsToRoleId: 'role-gm' },
  { id: 'role-sales-consultant', title: 'Sales Consultant', departmentId: 'dept-sales', level: 'mid', reportsToRoleId: 'role-sales-mgr' },
  { id: 'role-marketing-asst', title: 'Sales Consultant & Marketing Assistant', departmentId: 'dept-sales', level: 'mid', reportsToRoleId: 'role-sales-mgr' },
  
  // Warehouse & Logistics (Goods In / Goods Out)
  { id: 'role-wh-mgr', title: 'Warehouse Manager', departmentId: 'dept-warehouse', level: 'manager', reportsToRoleId: 'role-ops-mgr' },
  { id: 'role-goods-in-coord', title: 'Goods In Department Coordinator', departmentId: 'dept-warehouse', level: 'senior', reportsToRoleId: 'role-wh-mgr' },
  { id: 'role-stock-coord', title: 'Stock Coordinator', departmentId: 'dept-warehouse', level: 'mid', reportsToRoleId: 'role-wh-mgr' },
  { id: 'role-wh-asst', title: 'Warehouse Assistant', departmentId: 'dept-warehouse', level: 'entry', reportsToRoleId: 'role-wh-mgr' },
  { id: 'role-goods-out', title: 'Goods Out Assistant', departmentId: 'dept-warehouse', level: 'entry', reportsToRoleId: 'role-wh-mgr' },
  { id: 'role-driver', title: 'Delivery Driver', departmentId: 'dept-warehouse', level: 'mid', reportsToRoleId: 'role-wh-mgr' },
  
  // Hire Department
  { id: 'role-hire-mgr', title: 'Hire Department Manager', departmentId: 'dept-hire', level: 'manager', reportsToRoleId: 'role-ops-mgr' },
  { id: 'role-hire-coord', title: 'Hire Coordinator', departmentId: 'dept-hire', level: 'mid', reportsToRoleId: 'role-hire-mgr' },
  
  // Accounts (Finance)
  { id: 'role-accounts-mgr', title: 'Accounts Manager', departmentId: 'dept-finance', level: 'manager', reportsToRoleId: 'role-finance-dir' },
  { id: 'role-accounts-admin', title: 'Accounts Administrator', departmentId: 'dept-finance', level: 'entry', reportsToRoleId: 'role-accounts-mgr' },
  { id: 'role-purchase-ledger', title: 'Purchase Ledger Administrator', departmentId: 'dept-finance', level: 'entry', reportsToRoleId: 'role-accounts-mgr' },
  
  // H&S / HR / Quality
  { id: 'role-hs-quality', title: 'H&S & Quality Coordinator', departmentId: 'dept-quality', level: 'manager', reportsToRoleId: 'role-hs-hr-dir' },
  
  // IT & Procurement
  { id: 'role-it-proc-mgr', title: 'IT & Procurement Manager', departmentId: 'dept-it', level: 'manager', reportsToRoleId: 'role-gm' },
];

export const orgMembers: OrgMember[] = [
  // Directors
  { id: 'mem-1', name: '[Managing Director - TBC]', jobRoleId: 'role-md', departmentId: 'dept-exec', email: 'md@lvc.co.uk', startDate: '2010-01-01' },
  { id: 'mem-2', name: '[General Manager - TBC]', jobRoleId: 'role-gm', departmentId: 'dept-exec', managerId: 'mem-1', email: 'gm@lvc.co.uk', startDate: '2012-01-01' },
  { id: 'mem-3', name: '[Finance Director - TBC]', jobRoleId: 'role-finance-dir', departmentId: 'dept-exec', managerId: 'mem-1', email: 'finance.director@lvc.co.uk', startDate: '2010-01-01' },
  { id: 'mem-4', name: '[H&S/HR/Quality Director - TBC]', jobRoleId: 'role-hs-hr-dir', departmentId: 'dept-exec', managerId: 'mem-1', email: 'hr.director@lvc.co.uk', startDate: '2010-01-01' },
  
  // Operations
  { id: 'mem-5', name: '[Operations Manager - TBC]', jobRoleId: 'role-ops-mgr', departmentId: 'dept-ops', managerId: 'mem-2', email: 'ops.manager@lvc.co.uk', startDate: '2015-01-01' },
  
  // Service Coordination
  { id: 'mem-6', name: '[Service Co-Ordinator - TBC]', jobRoleId: 'role-service-coord', departmentId: 'dept-service', managerId: 'mem-5', email: 'service.coord@lvc.co.uk', startDate: '2017-01-01' },
  { id: 'mem-7', name: '[Service Coordinator Assistant - TBC]', jobRoleId: 'role-service-coord-asst', departmentId: 'dept-service', managerId: 'mem-6', email: 'service.asst@lvc.co.uk', startDate: '2020-01-01' },
  
  // Service Department - Senior Engineers
  { id: 'mem-8', name: '[Senior Service Engineer 1 - TBC]', jobRoleId: 'role-senior-eng', departmentId: 'dept-eng', managerId: 'mem-5', email: 'senior.eng1@lvc.co.uk', startDate: '2016-01-01' },
  { id: 'mem-9', name: '[Senior Service Engineer 2 - TBC]', jobRoleId: 'role-senior-eng', departmentId: 'dept-eng', managerId: 'mem-5', email: 'senior.eng2@lvc.co.uk', startDate: '2017-01-01' },
  { id: 'mem-10', name: '[Senior Service Engineer 3 - TBC]', jobRoleId: 'role-senior-eng', departmentId: 'dept-eng', managerId: 'mem-5', email: 'senior.eng3@lvc.co.uk', startDate: '2018-01-01' },
  
  // Service Department - Service Engineers
  { id: 'mem-11', name: '[Service Engineer 1 - TBC]', jobRoleId: 'role-service-eng', departmentId: 'dept-eng', managerId: 'mem-8', email: 'service.eng1@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-12', name: '[Service Engineer 2 - TBC]', jobRoleId: 'role-service-eng', departmentId: 'dept-eng', managerId: 'mem-8', email: 'service.eng2@lvc.co.uk', startDate: '2020-01-01' },
  
  // Service Department - Field Engineers
  { id: 'mem-13', name: '[Field Service Engineer 1 - TBC]', jobRoleId: 'role-field-eng', departmentId: 'dept-eng', managerId: 'mem-8', email: 'field.eng1@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-14', name: '[Field Service Engineer 2 - TBC]', jobRoleId: 'role-field-eng', departmentId: 'dept-eng', managerId: 'mem-9', email: 'field.eng2@lvc.co.uk', startDate: '2020-01-01' },
  { id: 'mem-15', name: '[Field Service Engineer 3 - TBC]', jobRoleId: 'role-field-eng', departmentId: 'dept-eng', managerId: 'mem-10', email: 'field.eng3@lvc.co.uk', startDate: '2021-01-01' },
  
  // Workshop
  { id: 'mem-16', name: '[Workshop Manager - TBC]', jobRoleId: 'role-workshop-mgr', departmentId: 'dept-workshop', managerId: 'mem-5', email: 'workshop.manager@lvc.co.uk', startDate: '2016-01-01' },
  { id: 'mem-17', name: '[Workshop Engineer 1 - TBC]', jobRoleId: 'role-workshop-eng', departmentId: 'dept-workshop', managerId: 'mem-16', email: 'workshop.eng1@lvc.co.uk', startDate: '2020-01-01' },
  { id: 'mem-18', name: '[Workshop Engineer 2 - TBC]', jobRoleId: 'role-workshop-eng', departmentId: 'dept-workshop', managerId: 'mem-16', email: 'workshop.eng2@lvc.co.uk', startDate: '2022-01-01' },
  
  // Sales & Product Support
  { id: 'mem-19', name: '[Product & IT Support Manager - TBC]', jobRoleId: 'role-it-product-mgr', departmentId: 'dept-sales', managerId: 'mem-2', email: 'product.support@lvc.co.uk', startDate: '2015-01-01' },
  { id: 'mem-20', name: '[Sales Manager - TBC]', jobRoleId: 'role-sales-mgr', departmentId: 'dept-sales', managerId: 'mem-2', email: 'sales.manager@lvc.co.uk', startDate: '2014-01-01' },
  { id: 'mem-21', name: '[Sales Consultant 1 - TBC]', jobRoleId: 'role-sales-consultant', departmentId: 'dept-sales', managerId: 'mem-20', email: 'sales1@lvc.co.uk', startDate: '2018-01-01' },
  { id: 'mem-22', name: '[Sales Consultant 2 - TBC]', jobRoleId: 'role-sales-consultant', departmentId: 'dept-sales', managerId: 'mem-20', email: 'sales2@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-23', name: '[Marketing Assistant - TBC]', jobRoleId: 'role-marketing-asst', departmentId: 'dept-sales', managerId: 'mem-20', email: 'marketing@lvc.co.uk', startDate: '2021-01-01' },
  
  // Warehouse & Logistics
  { id: 'mem-24', name: '[Warehouse Manager - TBC]', jobRoleId: 'role-wh-mgr', departmentId: 'dept-warehouse', managerId: 'mem-5', email: 'warehouse.manager@lvc.co.uk', startDate: '2016-01-01' },
  { id: 'mem-25', name: '[Goods In Coordinator - TBC]', jobRoleId: 'role-goods-in-coord', departmentId: 'dept-warehouse', managerId: 'mem-24', email: 'goods.in@lvc.co.uk', startDate: '2018-01-01' },
  { id: 'mem-26', name: '[Stock Coordinator - TBC]', jobRoleId: 'role-stock-coord', departmentId: 'dept-warehouse', managerId: 'mem-24', email: 'stock.coord@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-27', name: '[Warehouse Assistant 1 - TBC]', jobRoleId: 'role-wh-asst', departmentId: 'dept-warehouse', managerId: 'mem-24', email: 'warehouse.asst1@lvc.co.uk', startDate: '2021-01-01' },
  { id: 'mem-28', name: '[Goods Out Assistant - TBC]', jobRoleId: 'role-goods-out', departmentId: 'dept-warehouse', managerId: 'mem-24', email: 'goods.out@lvc.co.uk', startDate: '2020-01-01' },
  { id: 'mem-29', name: '[Delivery Driver 1 - TBC]', jobRoleId: 'role-driver', departmentId: 'dept-warehouse', managerId: 'mem-24', email: 'driver1@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-30', name: '[Delivery Driver 2 - TBC]', jobRoleId: 'role-driver', departmentId: 'dept-warehouse', managerId: 'mem-24', email: 'driver2@lvc.co.uk', startDate: '2021-01-01' },
  
  // Hire Department
  { id: 'mem-31', name: '[Hire Dept Manager - TBC]', jobRoleId: 'role-hire-mgr', departmentId: 'dept-hire', managerId: 'mem-5', email: 'hire.manager@lvc.co.uk', startDate: '2017-01-01' },
  { id: 'mem-32', name: '[Hire Coordinator - TBC]', jobRoleId: 'role-hire-coord', departmentId: 'dept-hire', managerId: 'mem-31', email: 'hire.coord@lvc.co.uk', startDate: '2020-01-01' },
  
  // Accounts
  { id: 'mem-33', name: '[Accounts Manager - TBC]', jobRoleId: 'role-accounts-mgr', departmentId: 'dept-finance', managerId: 'mem-3', email: 'accounts.manager@lvc.co.uk', startDate: '2013-01-01' },
  { id: 'mem-34', name: '[Accounts Administrator - TBC]', jobRoleId: 'role-accounts-admin', departmentId: 'dept-finance', managerId: 'mem-33', email: 'accounts.admin@lvc.co.uk', startDate: '2019-01-01' },
  { id: 'mem-35', name: '[Purchase Ledger Admin - TBC]', jobRoleId: 'role-purchase-ledger', departmentId: 'dept-finance', managerId: 'mem-33', email: 'purchase.ledger@lvc.co.uk', startDate: '2020-01-01' },
  
  // H&S / Quality
  { id: 'mem-36', name: '[H&S & Quality Coordinator - TBC]', jobRoleId: 'role-hs-quality', departmentId: 'dept-quality', managerId: 'mem-4', email: 'quality@lvc.co.uk', startDate: '2018-01-01' },
  
  // IT & Procurement
  { id: 'mem-37', name: '[IT & Procurement Manager - TBC]', jobRoleId: 'role-it-proc-mgr', departmentId: 'dept-it', managerId: 'mem-2', email: 'it.manager@lvc.co.uk', startDate: '2019-01-01' },
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

export const getRolesForDepartment = getRolesByDepartment;

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
