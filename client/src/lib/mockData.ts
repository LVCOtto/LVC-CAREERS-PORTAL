export type UserRole = 'colleague' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jobRole: string;
  department: string;
  managerId?: string;
  avatar?: string;
  startDate: string;
}

export interface ChecklistItem {
  id: string;
  section: string;
  title: string;
  description?: string;
  requiresEvidence: boolean;
  completed: boolean;
  completedDate?: string;
  signedOffBy?: string;
  signedOffDate?: string;
  dueDate?: string;
}

export interface InductionInstance {
  id: string;
  userId: string;
  templateName: string;
  status: 'not_started' | 'in_progress' | 'awaiting_signoff' | 'complete';
  items: ChecklistItem[];
  createdDate: string;
}

export interface TrainingRequirement {
  id: string;
  category: string;
  name: string;
  renewalPeriodDays?: number;
  requiresEvidence: boolean;
}

export interface TrainingRecord {
  id: string;
  userId: string;
  requirementId: string;
  requirementName: string;
  category: string;
  completedDate?: string;
  expiresDate?: string;
  status: 'compliant' | 'due_soon' | 'overdue' | 'missing';
  certificateFile?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  icon: string;
}

export interface CareerMilestone {
  id: string;
  userId: string;
  title: string;
  date: string;
  description: string;
}

export interface Certificate {
  id: string;
  userId: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  category: 'safety' | 'technical' | 'professional' | 'compliance';
  status: 'valid' | 'expiring_soon' | 'expired';
}

export const users: User[] = [
  {
    id: 'admin-1',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@lvc.com',
    role: 'admin',
    jobRole: 'HR Director',
    department: 'Human Resources',
    startDate: '2019-03-15',
  },
  {
    id: 'manager-1',
    name: 'James Wilson',
    email: 'james.wilson@lvc.com',
    role: 'manager',
    jobRole: 'Operations Manager',
    department: 'Operations',
    startDate: '2020-06-01',
  },
  {
    id: 'manager-2',
    name: 'Emma Thompson',
    email: 'emma.thompson@lvc.com',
    role: 'manager',
    jobRole: 'Engineering Lead',
    department: 'Engineering',
    startDate: '2020-09-14',
  },
  {
    id: 'colleague-1',
    name: 'Michael Chen',
    email: 'michael.chen@lvc.com',
    role: 'colleague',
    jobRole: 'Engineer',
    department: 'Engineering',
    managerId: 'manager-2',
    startDate: '2024-11-01',
  },
  {
    id: 'colleague-2',
    name: 'Sophie Williams',
    email: 'sophie.williams@lvc.com',
    role: 'colleague',
    jobRole: 'Engineer',
    department: 'Engineering',
    managerId: 'manager-2',
    startDate: '2024-08-15',
  },
  {
    id: 'colleague-3',
    name: 'David Brown',
    email: 'david.brown@lvc.com',
    role: 'colleague',
    jobRole: 'Operations Coordinator',
    department: 'Operations',
    managerId: 'manager-1',
    startDate: '2024-10-01',
  },
  {
    id: 'colleague-4',
    name: 'Lisa Martinez',
    email: 'lisa.martinez@lvc.com',
    role: 'colleague',
    jobRole: 'Operations Coordinator',
    department: 'Operations',
    managerId: 'manager-1',
    startDate: '2023-05-20',
  },
  {
    id: 'colleague-5',
    name: 'Tom Harris',
    email: 'tom.harris@lvc.com',
    role: 'colleague',
    jobRole: 'Engineer',
    department: 'Engineering',
    managerId: 'manager-2',
    startDate: '2024-01-08',
  },
  {
    id: 'colleague-6',
    name: 'Rachel Green',
    email: 'rachel.green@lvc.com',
    role: 'colleague',
    jobRole: 'Operations Coordinator',
    department: 'Operations',
    managerId: 'manager-1',
    startDate: '2024-12-02',
  },
];

export const inductionItems: ChecklistItem[] = [
  // 1. Pre-Start Setup (Before Day 1)
  {
    id: 'ind-1',
    section: '1. Pre-Start Setup',
    title: 'Contract issued and signed',
    description: 'Employment contract and job description issued and signed',
    requiresEvidence: true,
    completed: true,
    completedDate: '2024-10-28',
    signedOffBy: 'manager-2',
    signedOffDate: '2024-10-28',
  },
  {
    id: 'ind-2',
    section: '1. Pre-Start Setup',
    title: 'Right to Work and payroll setup',
    description: 'Right to Work check, NI number, bank details, emergency contact collected and payroll confirmed',
    requiresEvidence: true,
    completed: true,
    completedDate: '2024-10-30',
    signedOffBy: 'manager-2',
    signedOffDate: '2024-10-30',
  },
  {
    id: 'ind-3',
    section: '1. Pre-Start Setup',
    title: 'IT & systems access configured',
    description: 'LVC email, Protean login, CRM access set up',
    requiresEvidence: false,
    completed: true,
    completedDate: '2024-10-31',
  },
  {
    id: 'ind-4',
    section: '1. Pre-Start Setup',
    title: 'Equipment issued',
    description: 'Phone/laptop/tablet, uniform, PPE, ID badge issued as required for role',
    requiresEvidence: false,
    completed: true,
    completedDate: '2024-11-01',
  },
  {
    id: 'ind-5',
    section: '1. Pre-Start Setup',
    title: 'Line manager and buddy assigned',
    description: 'Line manager confirmed and buddy/mentor allocated',
    requiresEvidence: false,
    completed: true,
    completedDate: '2024-10-31',
  },

  // 2. Day 1 – Welcome to LVC
  {
    id: 'ind-6',
    section: '2. Day 1 – Welcome',
    title: 'Welcome from line manager',
    description: 'Introductions to team members and initial role overview',
    requiresEvidence: false,
    completed: true,
    completedDate: '2024-11-01',
    signedOffBy: 'manager-2',
    signedOffDate: '2024-11-01',
  },
  {
    id: 'ind-7',
    section: '2. Day 1 – Welcome',
    title: 'Site tour completed',
    description: 'Tour of offices, workshop, warehouse and all facilities',
    requiresEvidence: false,
    completed: true,
    completedDate: '2024-11-01',
  },
  {
    id: 'ind-8',
    section: '2. Day 1 – Welcome',
    title: 'LVC company overview',
    description: 'LVC history, what we do (sales, hire, service, spares, training), key customer sectors, service-led approach',
    requiresEvidence: false,
    completed: true,
    completedDate: '2024-11-01',
  },
  {
    id: 'ind-9',
    section: '2. Day 1 – Welcome',
    title: 'Working hours and breaks explained',
    description: 'Working hours, break times and scheduling expectations confirmed',
    requiresEvidence: false,
    completed: true,
    completedDate: '2024-11-01',
  },

  // 3. Health, Safety & Compliance
  {
    id: 'ind-10',
    section: '3. Health, Safety & Compliance',
    title: 'Health & Safety policy briefing',
    description: 'H&S policy explained, fire exits, alarms and muster points shown',
    requiresEvidence: true,
    completed: true,
    completedDate: '2024-11-01',
    signedOffBy: 'manager-2',
    signedOffDate: '2024-11-01',
  },
  {
    id: 'ind-11',
    section: '3. Health, Safety & Compliance',
    title: 'First aiders and accident reporting',
    description: 'First aiders identified, accident and near-miss reporting process explained',
    requiresEvidence: false,
    completed: true,
    completedDate: '2024-11-01',
  },
  {
    id: 'ind-12',
    section: '3. Health, Safety & Compliance',
    title: 'Manual handling training',
    description: 'Manual handling training completed',
    requiresEvidence: true,
    completed: false,
    dueDate: '2024-11-08',
  },
  {
    id: 'ind-13',
    section: '3. Health, Safety & Compliance',
    title: 'PPE and COSHH awareness',
    description: 'PPE expectations and COSHH awareness (chemicals, detergents) explained',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-08',
  },
  {
    id: 'ind-14',
    section: '3. Health, Safety & Compliance',
    title: 'Role-specific safety (if applicable)',
    description: 'Lone working policy, driving policy, vehicle checks, NHS site expectations',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-08',
  },

  // 4. Systems & Processes
  {
    id: 'ind-15',
    section: '4. Systems & Processes',
    title: 'Protean system overview',
    description: 'Asset numbers, CEAL, job sheets, service reports, parts fitted and reporting accuracy',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-08',
  },
  {
    id: 'ind-16',
    section: '4. Systems & Processes',
    title: 'CRM and admin systems training',
    description: 'CRM overview, customer records, logging calls/visits/follow-ups',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-12',
  },
  {
    id: 'ind-17',
    section: '4. Systems & Processes',
    title: 'Expenses and timesheets',
    description: 'Expenses process and timesheet submission explained',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-08',
  },

  // 5. Role-Specific Induction
  {
    id: 'ind-18',
    section: '5. Role-Specific Induction',
    title: 'Role responsibilities explained',
    description: 'What "good" looks like at LVC, first 30-60-90 day expectations discussed',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-08',
  },
  {
    id: 'ind-19',
    section: '5. Role-Specific Induction',
    title: 'KPIs and performance measures',
    description: 'Key performance indicators and success measures for the role',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-15',
  },
  {
    id: 'ind-20',
    section: '5. Role-Specific Induction',
    title: 'Department processes',
    description: 'How your department interacts with others, escalation routes, documentation expectations',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-15',
  },

  // 6. Product & Market Knowledge
  {
    id: 'ind-21',
    section: '6. Product & Market Knowledge',
    title: 'Key manufacturers and product categories',
    description: 'Overview of key partners, scrubbers, sweepers, pressure washers, steam equipment etc.',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-15',
  },
  {
    id: 'ind-22',
    section: '6. Product & Market Knowledge',
    title: 'Sales, hire and service models',
    description: 'Understanding the differences between sales, hire and service offerings',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-15',
  },
  {
    id: 'ind-23',
    section: '6. Product & Market Knowledge',
    title: 'LVC differentiators',
    description: 'Typical customer challenges, our solutions, and how we differ from competitors',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-22',
  },

  // 7. Practical Training & Shadowing
  {
    id: 'ind-24',
    section: '7. Practical Training & Shadowing',
    title: 'Shadow experienced team member',
    description: 'Observe customer interactions and day-to-day work',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-15',
  },
  {
    id: 'ind-25',
    section: '7. Practical Training & Shadowing',
    title: 'Equipment demonstrations observed',
    description: 'Attend equipment demonstrations and workshop/site visits',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-22',
  },
  {
    id: 'ind-26',
    section: '7. Practical Training & Shadowing',
    title: 'Ride-along completed (if applicable)',
    description: 'Ride-along with sales/service staff to observe customer visits',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-22',
  },

  // 8. Culture & Ways of Working
  {
    id: 'ind-27',
    section: '8. Culture & Ways of Working',
    title: 'LVC values understood',
    description: 'LVC values in practice, teamwork, ownership and accountability',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-15',
  },
  {
    id: 'ind-28',
    section: '8. Culture & Ways of Working',
    title: 'Continuous improvement mindset',
    description: 'Marginal gains philosophy, customer-first thinking, professionalism on sites',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-22',
  },

  // 9. Probation & Development
  {
    id: 'ind-29',
    section: '9. Probation & Development',
    title: 'Probation period explained',
    description: 'Probation terms, review dates set, feedback process explained',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-08',
  },
  {
    id: 'ind-30',
    section: '9. Probation & Development',
    title: 'Training plan agreed',
    description: 'Initial training plan and development goals documented',
    requiresEvidence: true,
    completed: false,
    dueDate: '2024-11-15',
  },

  // 10. Check-Ins & Reviews
  {
    id: 'ind-31',
    section: '10. Check-Ins & Reviews',
    title: 'End of Week 1 check-in',
    description: 'Informal check-in completed, questions answered, training gaps identified',
    requiresEvidence: false,
    completed: false,
    dueDate: '2024-11-08',
  },
  {
    id: 'ind-32',
    section: '10. Check-Ins & Reviews',
    title: 'End of Month 1 review',
    description: 'Performance feedback, role understanding confirmed, culture fit check',
    requiresEvidence: true,
    completed: false,
    dueDate: '2024-12-01',
  },
  {
    id: 'ind-33',
    section: '10. Check-Ins & Reviews',
    title: 'Probation review meeting',
    description: 'Formal review of probation period progress and next steps agreed',
    requiresEvidence: true,
    completed: false,
    dueDate: '2025-02-01',
  },
];

export const trainingRecords: TrainingRecord[] = [
  {
    id: 'tr-1',
    userId: 'colleague-1',
    requirementId: 'req-1',
    requirementName: 'Health & Safety Fundamentals',
    category: 'Mandatory',
    completedDate: '2024-11-01',
    expiresDate: '2025-11-01',
    status: 'compliant',
  },
  {
    id: 'tr-2',
    userId: 'colleague-1',
    requirementId: 'req-2',
    requirementName: 'Data Protection & GDPR',
    category: 'Mandatory',
    completedDate: '2024-11-05',
    expiresDate: '2025-11-05',
    status: 'compliant',
  },
  {
    id: 'tr-3',
    userId: 'colleague-1',
    requirementId: 'req-3',
    requirementName: 'Fire Safety Awareness',
    category: 'Mandatory',
    completedDate: '2024-06-15',
    expiresDate: '2025-01-15',
    status: 'due_soon',
  },
  {
    id: 'tr-4',
    userId: 'colleague-1',
    requirementId: 'req-4',
    requirementName: 'Manual Handling',
    category: 'Mandatory',
    completedDate: '2023-10-20',
    expiresDate: '2024-10-20',
    status: 'overdue',
  },
  {
    id: 'tr-5',
    userId: 'colleague-1',
    requirementId: 'req-5',
    requirementName: 'First Aid at Work',
    category: 'Role-Specific',
    status: 'missing',
  },
  {
    id: 'tr-6',
    userId: 'colleague-1',
    requirementId: 'req-6',
    requirementName: 'Technical Equipment Training',
    category: 'Role-Specific',
    completedDate: '2024-11-10',
    status: 'compliant',
  },
  {
    id: 'tr-7',
    userId: 'colleague-1',
    requirementId: 'req-7',
    requirementName: 'Quality Assurance Procedures',
    category: 'Role-Specific',
    completedDate: '2024-11-08',
    status: 'compliant',
  },
  {
    id: 'tr-8',
    userId: 'colleague-1',
    requirementId: 'req-8',
    requirementName: 'Environmental Awareness',
    category: 'Optional',
    status: 'missing',
  },
  {
    id: 'tr-9',
    userId: 'colleague-1',
    requirementId: 'req-9',
    requirementName: 'Leadership Fundamentals',
    category: 'Development',
    status: 'missing',
  },
  {
    id: 'tr-10',
    userId: 'colleague-1',
    requirementId: 'req-10',
    requirementName: 'Project Management Basics',
    category: 'Development',
    completedDate: '2024-09-15',
    status: 'compliant',
  },
];

export const resources: Resource[] = [
  {
    id: 'res-1',
    title: 'Employee Handbook',
    description: 'Complete guide to company policies and procedures',
    category: 'Policies',
    url: '#',
    icon: 'book-open',
  },
  {
    id: 'res-2',
    title: 'Health & Safety Policy',
    description: 'Workplace safety guidelines and procedures',
    category: 'Policies',
    url: '#',
    icon: 'shield-check',
  },
  {
    id: 'res-3',
    title: 'IT Security Guidelines',
    description: 'Information security and acceptable use policy',
    category: 'Policies',
    url: '#',
    icon: 'lock',
  },
  {
    id: 'res-4',
    title: 'Benefits Portal',
    description: 'Access your employee benefits and pension information',
    category: 'HR',
    url: '#',
    icon: 'gift',
  },
  {
    id: 'res-5',
    title: 'Leave Request System',
    description: 'Book annual leave and view team calendar',
    category: 'HR',
    url: '#',
    icon: 'calendar',
  },
  {
    id: 'res-6',
    title: 'Expenses Claim Form',
    description: 'Submit and track expense claims',
    category: 'HR',
    url: '#',
    icon: 'receipt',
  },
  {
    id: 'res-7',
    title: 'Training Catalog',
    description: 'Browse available training courses and certifications',
    category: 'Learning',
    url: '#',
    icon: 'graduation-cap',
  },
  {
    id: 'res-8',
    title: 'Company Intranet',
    description: 'Latest news, announcements, and team updates',
    category: 'Company',
    url: '#',
    icon: 'globe',
  },
  {
    id: 'res-9',
    title: 'Organisation Chart',
    description: 'View company structure and reporting lines',
    category: 'Company',
    url: '#',
    icon: 'network',
  },
  {
    id: 'res-10',
    title: 'IT Support Desk',
    description: 'Log tickets and get technical support',
    category: 'Support',
    url: '#',
    icon: 'headphones',
  },
];

export const careerMilestones: CareerMilestone[] = [
  {
    id: 'cm-1',
    userId: 'colleague-1',
    title: 'Joined LVC',
    date: '2024-11-01',
    description: 'Started as Engineer in the Engineering department',
  },
  {
    id: 'cm-2',
    userId: 'colleague-1',
    title: 'Completed Induction',
    date: '2024-11-15',
    description: 'Successfully completed initial onboarding program',
  },
];

export const certificates: Certificate[] = [
  {
    id: 'cert-1',
    userId: 'colleague-1',
    name: 'Scrubber Dryer Technician - Level 2',
    issuer: 'LVC Training Academy',
    issueDate: '2025-01-05',
    credentialId: 'LVC-SD2-2025-0012',
    category: 'technical',
    status: 'valid',
  },
  {
    id: 'cert-2',
    userId: 'colleague-1',
    name: 'Customer Service Excellence',
    issuer: 'LVC Training Academy',
    issueDate: '2024-12-10',
    credentialId: 'LVC-CSE-2024-0089',
    category: 'professional',
    status: 'valid',
  },
  {
    id: 'cert-3',
    userId: 'colleague-1',
    name: 'Industrial Floor Care Specialist',
    issuer: 'British Institute of Cleaning Science',
    issueDate: '2024-11-15',
    credentialId: 'BICS-IFC-2024-2281',
    category: 'technical',
    status: 'valid',
  },
  {
    id: 'cert-4',
    userId: 'colleague-1',
    name: 'Equipment Diagnostics Fundamentals',
    issuer: 'LVC Training Academy',
    issueDate: '2024-10-20',
    credentialId: 'LVC-EDF-2024-0044',
    category: 'technical',
    status: 'valid',
  },
  {
    id: 'cert-5',
    userId: 'colleague-1',
    name: 'Pressure Washer Operations',
    issuer: 'LVC Training Academy',
    issueDate: '2024-06-15',
    expiryDate: '2025-01-15',
    credentialId: 'LVC-PWO-2024-0021',
    category: 'technical',
    status: 'expiring_soon',
  },
  {
    id: 'cert-6',
    userId: 'manager-1',
    name: 'ILM Level 3 Team Leadership',
    issuer: 'Institute of Leadership & Management',
    issueDate: '2022-09-01',
    credentialId: 'ILM-TL3-2022-1155',
    category: 'professional',
    status: 'valid',
  },
  {
    id: 'cert-7',
    userId: 'manager-1',
    name: 'Coaching & Mentoring Skills',
    issuer: 'LVC Training Academy',
    issueDate: '2023-03-15',
    credentialId: 'LVC-CMS-2023-0112',
    category: 'professional',
    status: 'valid',
  },
  {
    id: 'cert-8',
    userId: 'manager-1',
    name: 'Advanced Equipment Diagnostics',
    issuer: 'LVC Training Academy',
    issueDate: '2023-06-20',
    credentialId: 'LVC-AED-2023-0088',
    category: 'technical',
    status: 'valid',
  },
  {
    id: 'cert-9',
    userId: 'manager-1',
    name: 'Performance Management',
    issuer: 'CIPD',
    issueDate: '2024-02-10',
    credentialId: 'CIPD-PM-2024-4412',
    category: 'professional',
    status: 'valid',
  },
];

export const jobRoles = [
  {
    id: 'jr-1',
    title: 'Engineer',
    department: 'Engineering',
    summary: 'Responsible for technical operations and equipment maintenance',
    responsibilities: [
      'Maintain and repair technical equipment',
      'Follow safety protocols and procedures',
      'Document work completed and issues identified',
      'Collaborate with team members on complex projects',
      'Participate in continuous improvement initiatives',
    ],
  },
  {
    id: 'jr-2',
    title: 'Operations Coordinator',
    department: 'Operations',
    summary: 'Coordinates daily operations and supports team efficiency',
    responsibilities: [
      'Schedule and coordinate team activities',
      'Monitor operational metrics and KPIs',
      'Liaise with internal stakeholders',
      'Prepare reports and documentation',
      'Support process improvement initiatives',
    ],
  },
  {
    id: 'jr-3',
    title: 'Engineering Lead',
    department: 'Engineering',
    summary: 'Leads the engineering team and manages technical projects',
    responsibilities: [
      'Lead and mentor engineering team members',
      'Plan and oversee technical projects',
      'Ensure quality standards are maintained',
      'Manage team training and development',
      'Report to senior management on team performance',
    ],
  },
  {
    id: 'jr-4',
    title: 'Operations Manager',
    department: 'Operations',
    summary: 'Manages operations team and optimizes processes',
    responsibilities: [
      'Manage and develop operations team',
      'Optimize operational processes',
      'Ensure compliance with policies and regulations',
      'Manage budgets and resources',
      'Drive continuous improvement',
    ],
  },
];

export function getTeamMembers(managerId: string): User[] {
  return users.filter(u => u.managerId === managerId);
}

export function getUserById(userId: string): User | undefined {
  return users.find(u => u.id === userId);
}

export function getTrainingRecordsForUser(userId: string): TrainingRecord[] {
  return trainingRecords.filter(tr => tr.userId === userId);
}

export function getInductionForUser(userId: string): InductionInstance {
  return {
    id: `ind-instance-${userId}`,
    userId,
    templateName: 'Standard Induction Checklist',
    status: 'in_progress',
    items: inductionItems,
    createdDate: '2024-11-01',
  };
}

export function getComplianceStats(records: TrainingRecord[]) {
  const compliant = records.filter(r => r.status === 'compliant').length;
  const dueSoon = records.filter(r => r.status === 'due_soon').length;
  const overdue = records.filter(r => r.status === 'overdue').length;
  const missing = records.filter(r => r.status === 'missing').length;
  
  return {
    compliant,
    dueSoon,
    overdue,
    missing,
    total: records.length,
    complianceRate: Math.round((compliant / records.length) * 100),
  };
}

export function getInductionProgress(items: ChecklistItem[]) {
  const completed = items.filter(i => i.completed).length;
  const signedOff = items.filter(i => i.signedOffBy).length;
  
  return {
    completed,
    signedOff,
    total: items.length,
    progressPercent: Math.round((completed / items.length) * 100),
    signOffPercent: Math.round((signedOff / items.length) * 100),
  };
}
