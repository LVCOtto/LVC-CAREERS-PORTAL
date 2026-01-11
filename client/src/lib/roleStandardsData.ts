export interface RoleStandard {
  id: string;
  text: string;
  isCritical?: boolean;
  sopLink?: string;
  lastUpdated?: string;
  isNew?: boolean;
}

export interface RoleSection {
  id: string;
  name: string;
  standards: RoleStandard[];
  acknowledged?: boolean;
  acknowledgedDate?: string;
  hasUpdates?: boolean;
  updatesCount?: number;
}

export interface RoleDefinition {
  id: string;
  title: string;
  department: string;
  sections: RoleSection[];
  lastReviewed?: string;
  version?: string;
}

export const roleDefinitions: Record<string, RoleDefinition> = {
  'field-service-engineer': {
    id: 'field-service-engineer',
    title: 'Field Service Engineer',
    department: 'Engineering',
    version: '2.3',
    lastReviewed: '2025-12-01',
    sections: [
      {
        id: 'core-responsibilities',
        name: 'Core Responsibilities',
        acknowledged: true,
        acknowledgedDate: '2025-11-15',
        standards: [
          { id: 'fse-1', text: 'Carry out planned preventative maintenance and reactive repairs on industrial cleaning equipment', isCritical: true },
          { id: 'fse-2', text: 'Diagnose faults efficiently using technical knowledge and diagnostic tools' },
          { id: 'fse-3', text: 'Complete all job reports accurately and submit same-day via tablet', isCritical: true },
          { id: 'fse-4', text: 'Maintain van stock levels and report shortages promptly' },
          { id: 'fse-5', text: 'Communicate clearly with customers about work completed and any recommendations' },
        ],
      },
      {
        id: 'customer-service',
        name: 'Customer Service Standards',
        acknowledged: true,
        acknowledgedDate: '2025-11-15',
        standards: [
          { id: 'fse-cs-1', text: 'Arrive at site within scheduled time window and call ahead if delayed', isCritical: true },
          { id: 'fse-cs-2', text: 'Present professional appearance - clean uniform, ID badge visible' },
          { id: 'fse-cs-3', text: 'Explain work clearly to customer in non-technical terms' },
          { id: 'fse-cs-4', text: 'Leave work area clean and tidy after completing job' },
        ],
      },
      {
        id: 'health-safety',
        name: 'Health & Safety',
        acknowledged: false,
        hasUpdates: true,
        updatesCount: 2,
        standards: [
          { id: 'fse-hs-1', text: 'Complete dynamic risk assessment before starting any work', isCritical: true },
          { id: 'fse-hs-2', text: 'Use appropriate PPE for all tasks', isCritical: true },
          { id: 'fse-hs-3', text: 'Report all near-misses and incidents within 24 hours', isNew: true },
          { id: 'fse-hs-4', text: 'Follow LOTO procedures when working on electrical equipment', isNew: true },
        ],
      },
      {
        id: 'systems-admin',
        name: 'Systems & Administration',
        acknowledged: true,
        acknowledgedDate: '2025-12-01',
        standards: [
          { id: 'fse-sa-1', text: 'Submit timesheets daily via tablet' },
          { id: 'fse-sa-2', text: 'Update job status in Protean immediately after completion' },
          { id: 'fse-sa-3', text: 'Book absences through BrightHR system' },
        ],
      },
    ],
  },
  'service-coordinator': {
    id: 'service-coordinator',
    title: 'Service Co-Ordinator',
    department: 'Service Administration',
    version: '1.8',
    lastReviewed: '2025-11-20',
    sections: [
      {
        id: 'core-responsibilities',
        name: 'Core Responsibilities',
        acknowledged: true,
        acknowledgedDate: '2025-11-10',
        standards: [
          { id: 'sc-1', text: 'Log and allocate breakdowns same-day', isCritical: true },
          { id: 'sc-2', text: 'Process further work requests same-day', isCritical: true },
          { id: 'sc-3', text: 'Generate service visits 2 months before due date' },
          { id: 'sc-4', text: 'Maintain engineer workload balance' },
          { id: 'sc-5', text: 'Invoice service jobs within same month of completion' },
        ],
      },
      {
        id: 'customer-service',
        name: 'Customer Service Standards',
        acknowledged: true,
        acknowledgedDate: '2025-11-10',
        standards: [
          { id: 'sc-cs-1', text: 'Acknowledge all customer enquiries same-day', isCritical: true },
          { id: 'sc-cs-2', text: 'Complete quotes within 24 hours' },
          { id: 'sc-cs-3', text: 'Notify clients of upcoming service dates monthly' },
          { id: 'sc-cs-4', text: 'Provide ETAs for awaiting parts' },
        ],
      },
      {
        id: 'systems-admin',
        name: 'Systems & Administration',
        acknowledged: false,
        hasUpdates: true,
        updatesCount: 1,
        standards: [
          { id: 'sc-sa-1', text: 'Follow email subject line company guidance' },
          { id: 'sc-sa-2', text: 'Keep email inbox count manageable' },
          { id: 'sc-sa-3', text: 'Check planner board daily for absences', isNew: true },
          { id: 'sc-sa-4', text: 'Update Protean department section regularly' },
        ],
      },
    ],
  },
  'warehouse-manager': {
    id: 'warehouse-manager',
    title: 'Warehouse Manager',
    department: 'Warehouse',
    version: '2.1',
    lastReviewed: '2025-11-25',
    sections: [
      {
        id: 'core-responsibilities',
        name: 'Core Responsibilities',
        acknowledged: true,
        acknowledgedDate: '2025-11-20',
        standards: [
          { id: 'wm-1', text: 'Manage daily warehouse operations and staff allocation' },
          { id: 'wm-2', text: 'Ensure stock accuracy through regular stock takes' },
          { id: 'wm-3', text: 'Coordinate engineer van stock replenishment weekly' },
          { id: 'wm-4', text: 'Oversee picking, packing and dispatch processes' },
        ],
      },
      {
        id: 'team-management',
        name: 'Team Management',
        acknowledged: true,
        acknowledgedDate: '2025-11-20',
        standards: [
          { id: 'wm-tm-1', text: 'Deliver training to high standard when required' },
          { id: 'wm-tm-2', text: 'Submit monthly department reports on time', isCritical: true },
          { id: 'wm-tm-3', text: 'Ensure team follows communication policy' },
          { id: 'wm-tm-4', text: 'Conduct periodic stock room inspections' },
        ],
      },
      {
        id: 'systems-admin',
        name: 'Systems & Administration',
        acknowledged: false,
        hasUpdates: true,
        updatesCount: 1,
        standards: [
          { id: 'wm-sa-1', text: 'Maintain department section of Protean', isNew: true },
          { id: 'wm-sa-2', text: 'Process parts to equipment correctly' },
          { id: 'wm-sa-3', text: 'Create and supersede part numbers as needed' },
        ],
      },
    ],
  },
  'sales-consultant': {
    id: 'sales-consultant',
    title: 'Sales Consultant',
    department: 'Sales',
    version: '1.5',
    lastReviewed: '2025-12-05',
    sections: [
      {
        id: 'core-responsibilities',
        name: 'Core Responsibilities',
        acknowledged: true,
        acknowledgedDate: '2025-12-01',
        standards: [
          { id: 'slc-1', text: 'Add all opportunities to HubSpot pipeline', isCritical: true },
          { id: 'slc-2', text: 'Follow up pipeline opportunities regularly' },
          { id: 'slc-3', text: 'Process orders accurately and promptly' },
          { id: 'slc-4', text: 'Promote consumables and service plans with every sale' },
        ],
      },
      {
        id: 'customer-service',
        name: 'Customer Service Standards',
        acknowledged: true,
        acknowledgedDate: '2025-12-01',
        standards: [
          { id: 'slc-cs-1', text: 'Acknowledge customer enquiries same-day', isCritical: true },
          { id: 'slc-cs-2', text: 'Pre-qualify all demonstrations - ensure decision maker present' },
          { id: 'slc-cs-3', text: 'Email clients before scheduled meetings to confirm' },
          { id: 'slc-cs-4', text: 'Send user manuals and training videos electronically' },
        ],
      },
      {
        id: 'equipment-demos',
        name: 'Equipment & Demonstrations',
        acknowledged: false,
        hasUpdates: true,
        updatesCount: 2,
        standards: [
          { id: 'slc-eq-1', text: 'Maintain demonstration equipment in excellent condition', isCritical: true },
          { id: 'slc-eq-2', text: 'Book all demo/trial machines out on Protean', isNew: true },
          { id: 'slc-eq-3', text: 'Ensure all loan/trial machines are signed for by client', isNew: true },
          { id: 'slc-eq-4', text: 'Check all accessories returned after demos' },
        ],
      },
    ],
  },
  'accounts-manager': {
    id: 'accounts-manager',
    title: 'Accounts Manager',
    department: 'Finance',
    version: '2.0',
    lastReviewed: '2025-11-15',
    sections: [
      {
        id: 'core-responsibilities',
        name: 'Core Responsibilities',
        acknowledged: true,
        acknowledgedDate: '2025-11-10',
        standards: [
          { id: 'am-1', text: 'Manage aged debt and chase outstanding payments' },
          { id: 'am-2', text: 'Process payroll accurately and on time', isCritical: true },
          { id: 'am-3', text: 'Complete month-end closing procedures' },
          { id: 'am-4', text: 'Prepare VAT returns and meet deadlines', isCritical: true },
        ],
      },
      {
        id: 'team-management',
        name: 'Team Management',
        acknowledged: true,
        acknowledgedDate: '2025-11-10',
        standards: [
          { id: 'am-tm-1', text: 'Ensure department submits monthly reports on time' },
          { id: 'am-tm-2', text: 'Hold periodic review meetings with team' },
          { id: 'am-tm-3', text: 'Conduct annual appraisals for team members' },
        ],
      },
      {
        id: 'systems-admin',
        name: 'Systems & Administration',
        acknowledged: false,
        hasUpdates: true,
        updatesCount: 1,
        standards: [
          { id: 'am-sa-1', text: 'Reconcile bank accounts regularly' },
          { id: 'am-sa-2', text: 'Monitor Protean end-of-month reports', isNew: true },
          { id: 'am-sa-3', text: 'Maintain accurate records in Sage' },
        ],
      },
    ],
  },
};

export const rolesList = Object.values(roleDefinitions);

export function getRoleById(id: string): RoleDefinition | undefined {
  return roleDefinitions[id];
}

export function getRolesByDepartment(department: string): RoleDefinition[] {
  return rolesList.filter(role => role.department.toLowerCase() === department.toLowerCase());
}

export function getTotalUpdatesCount(role: RoleDefinition): number {
  return role.sections.reduce((sum, section) => sum + (section.updatesCount || 0), 0);
}

export function getAcknowledgedSectionsCount(role: RoleDefinition): number {
  return role.sections.filter(s => s.acknowledged).length;
}

export function getAllRefresherRequests(): { roleId: string; roleTitle: string; sectionId: string; sectionName: string; requestedBy: string; requestedDate: string }[] {
  return [
    { roleId: 'field-service-engineer', roleTitle: 'Field Service Engineer', sectionId: 'health-safety', sectionName: 'Health & Safety', requestedBy: 'David Thompson', requestedDate: '2026-01-08' },
    { roleId: 'warehouse-manager', roleTitle: 'Warehouse Manager', sectionId: 'systems-admin', sectionName: 'Systems & Administration', requestedBy: 'Tom Richards', requestedDate: '2026-01-05' },
  ];
}

export function getRoleOptions(): { value: string; label: string; department: string }[] {
  return rolesList.map(role => ({
    value: role.id,
    label: role.title,
    department: role.department,
  }));
}

export interface TaskStandard {
  id: string;
  text: string;
  isCritical?: boolean;
  isNew?: boolean;
}

export interface TaskSection {
  id: string;
  name: string;
  tasks: TaskStandard[];
}

export interface RoleTaskDefinition {
  id: string;
  title: string;
  department: string;
  sections: TaskSection[];
}

function generateId(text: string, index: number): string {
  return `task-${index}-${text.slice(0, 20).toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
}

function categorizeStandards(tasks: string[]): TaskSection[] {
  const coreDuties: TaskStandard[] = [];
  const systemsProcesses: TaskStandard[] = [];
  const customerStandards: TaskStandard[] = [];
  const qualityCompliance: TaskStandard[] = [];
  const managementLeadership: TaskStandard[] = [];
  
  const systemKeywords = ['protean', 'hubspot', 'brighthr', 'hronline', 'system', 'software', 'online', 'email', 'log in', 'spreadsheet', 'document', 'tablet', 'sage', 'voip', 'microsoft', 'server', 'desktop', 'mobile'];
  const customerKeywords = ['customer', 'client', 'enquir', 'quote', 'communication', 'phone call', 'acknowledged', 'pipeline', 'proposal', 'demonstration', 'demo'];
  const qualityKeywords = ['inspection', 'review', 'check', 'audit', 'compliance', 'policy', 'procedure', 'standard', 'report', 'h&s', 'safety', 'riddor', 'fire', 'ppe', 'risk'];
  const managementKeywords = ['department', 'team', 'staff', 'training', 'appraisal', 'induction', 'manager', 'director', 'leadership', 'newsletter', 'feedback', 'entire department'];
  
  tasks.forEach((task, idx) => {
    if (task.includes('proud to work') || task.includes('praise for their work') || task.includes('comments or feedback') || task.includes('comments/feedback')) {
      return;
    }
    
    const taskLower = task.toLowerCase();
    const standard: TaskStandard = {
      id: generateId(task, idx),
      text: task,
      isCritical: taskLower.includes('critical') || taskLower.includes('quarterly rocks') || taskLower.includes('monthly report') || taskLower.includes('on time') || taskLower.includes('same-day') || taskLower.includes('within 24'),
      isNew: idx % 7 === 0,
    };
    
    if (managementKeywords.some(kw => taskLower.includes(kw))) {
      managementLeadership.push(standard);
    } else if (systemKeywords.some(kw => taskLower.includes(kw))) {
      systemsProcesses.push(standard);
    } else if (customerKeywords.some(kw => taskLower.includes(kw))) {
      customerStandards.push(standard);
    } else if (qualityKeywords.some(kw => taskLower.includes(kw))) {
      qualityCompliance.push(standard);
    } else {
      coreDuties.push(standard);
    }
  });
  
  const sections: TaskSection[] = [];
  
  if (coreDuties.length > 0) {
    sections.push({ id: 'core-duties', name: 'Core Duties', tasks: coreDuties });
  }
  if (customerStandards.length > 0) {
    sections.push({ id: 'customer-standards', name: 'Customer Standards', tasks: customerStandards });
  }
  if (systemsProcesses.length > 0) {
    sections.push({ id: 'systems-processes', name: 'Systems & Processes', tasks: systemsProcesses });
  }
  if (qualityCompliance.length > 0) {
    sections.push({ id: 'quality-compliance', name: 'Quality & Compliance', tasks: qualityCompliance });
  }
  if (managementLeadership.length > 0) {
    sections.push({ id: 'management-leadership', name: 'Management & Leadership', tasks: managementLeadership });
  }
  
  return sections;
}

const rawRoleTaskData: Record<string, { tasks: string[]; department: string; title: string }> = {
  'purchase-ledger-administrator': {
    title: 'Purchase Ledger Administrator',
    department: 'Finance',
    tasks: [
      'Closing the purchasing month in 7 working days',
      'Solution-focused and able to offer creative options to clients who need more assistance',
      'Checking Statements',
      'Enter Bills and credit notes from suppliers',
      'Check and print online invoices - each month including log in and password',
      'Utilities bills log in - submit meter reading - first 5 days of the month',
      'Checking Suppliers statements',
      'Filing Bills once Simon has checked',
      'Cross hire invoices/credit notes',
      'Numatic invoices - prepare spreadsheet for correct amount',
      'Purchase ledger Email inbox',
    ],
  },
  'hs-quality-coordinator': {
    title: 'H&S & Quality Coordinator',
    department: 'Quality',
    tasks: [
      'Review Risk assessment (Annually)',
      'Discuss and call in Peninsula for annual monitoring of our H&S company policy (Annually)',
      'Monitor that each accident or incident has been logged in accident / incident book (Monthly)',
      'Discuss actions to be taken to avoid accidents / incidents in the future (Quarterly)',
      'Organise Fire drills (Annual)',
      'Organise Fire fighting equipment / alarms are serviced (Annually)',
      'Ensure that all employees know how to report accidents and incidents',
      'Make sure that each Manager chase their staff members for completion of H&S online learning',
      'Hold regular H&S meetings (quarterly with managers to flag up any issues)',
      'When safety issues are flagged up – Act within 24 hours to action',
      'Responsible for reporting to RIDDOR of reportable accidents and incidents',
      'Fill in accreditation documents annually (Safe contractors + customer requests)',
      'Keep up to date weekly with feedbacks and actions on feedback',
      'Report to Senior management team – call meetings and set action points',
      'Do random site visits with engineers / Hire installations and Sales demonstrations',
      'Assist Operations manager in Training matrix mainly on Safety aspects',
      'Oversee so that the training fulfil our strategic goals',
      'Oversee Performance Training Matrixes and discuss budget',
      'Analyse current reports with General Manager/Operations manager',
      'Monitor email inbox to make sure we communicate to the LVC standard',
      'Review all LVC Policies and link to Processes and Procedures',
      'Review processes and assist managers when setting up procedures',
      'Support staff to improve – Find out what is needed in terms of training',
      'Support with arrangement of appraisals',
      'Organise fact finding meetings for escalation matters',
      'Organise disciplinary meetings & annually review processes',
      'Annually set up review of holiday records on HR system',
      'Quarterly overlook HR system log in to make sure details are up to date',
      'Check drivers licenses annually',
      'Check points on licenses annually',
      'Check DBS and update - 6 monthly',
      'Assess need for new staff and place adverts',
    ],
  },
  'warehouse-assistant': {
    title: 'Warehouse Assistant',
    department: 'Warehouse',
    tasks: [
      'Customer enquiries acknowledged',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance. Eg: Customer name – ES300 Quotation 23568 - LVC',
      'Workshop booking in process being followed',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Submitting monthly reports in on time',
      'Department policies are all written out, reviewed and updated regularly',
      'Additional support being requested wherever required',
      'Communication policy is followed across department',
      'Department section of Protean is clear current & informative',
      'Account Queries resolved regularly - Procedures amended to minimise re-occurrence',
      'Department operating in a professional manner, including communication and image',
      'Dispatch Via DPD (On Time)',
      'Dispatch Via Fedex (On-Time)',
      'Solution-focused and able to offer creative options to clients',
      'Booking in and allocation of items to Sales Orders',
      'Picking of Sales Orders (incomplete and complete)',
      'Warehouse Inspections - Upkeep of various zones',
      'Adding deliveries/collections to Logistics Document',
      'Chasing missing or lost deliveries with Couriers',
      'Booking and wrapping a Pallet for delivery',
    ],
  },
  'field-service-engineer': {
    title: 'Field Service Engineer',
    department: 'Engineering',
    tasks: [
      'Are you fitting Consumables on jobs?',
      'Same-day booking in job and communication with client',
      'Ascertain Parts required for job and make sure available for visit',
      'Client Debrief (on-site. If client busy then over the phone)',
      'Quote explanation and follow-up (over £350)',
      'Checking outstanding jobs with Office and chasing parts up internally',
      'Booking in return visit to complete Callback job',
      'Completion of Reports Correctly: Labour, Equipment Notes, and Further Work',
      'Unable to attend - communication and rebooking visit',
      'Timesheets - Daily',
      'Van Stock Management',
      'Scheduling Work to stay busy',
      'Firm next-day plans and rough idea for coming 3 days',
      'Do you have a list of back-up jobs that can be attended on short notice',
      'Speaking with office if work begins to run short',
      'Pre-visit diagnosis',
      'Identifying parts required for jobs',
      'Enquiring if consumables are needed; bags, chemical, etc.',
      'Communicate the parts required to the office for job',
      'Schedule date and time with client',
      'Move the visit on your planner board once booked with client',
      'On-site client debrief',
      'Post-repair phone call to check machine is fine',
      'Book absence on HRONLINE',
      'Clients communicated to and jobs rebooked if unable to attend',
      'Service Desk updated if unable to communicate with clients',
      'Are you receiving sufficient parts in a timely manner?',
      'Do you place LVC service stickers on all machines that you service?',
      'Do you have appropriate PPE to complete your jobs safely?',
      'Do you have and wear LVC workwear on your jobs?',
      'Do you have the tools necessary to complete your daily jobs?',
      'Solution-focused and able to offer creative options',
    ],
  },
  'service-coordinator': {
    title: 'Service Co-Ordinator',
    department: 'Service Admin',
    tasks: [
      'Customer enquiries acknowledged',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance',
      'Workshop booking in process being followed',
      'Logistics spreadsheet being updated with as much notice as possible',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Entire department Submitting monthly reports in on time',
      'Department policies are all written out and reviewed regularly',
      'Additional support being requested wherever required',
      'Communication policy is followed across department',
      'Department section of Protean is clear current & informative',
      'Account Queries resolved regularly',
      'Department operating in a professional manner',
      'Training delivered to a high standard whenever required',
      'Logging and Allocating Breakdowns same-day',
      'Processing Further Work same-day',
      'Creating Service Contracts same-day from approval',
      'Generating and pulling through Service Visits 2 months before due date',
      'Email Inbox - General upkeep - email count kept relatively low',
      'Checking Plannerboard everyday for absences',
      'Checking previous week/day for unattended jobs',
      'Raising Breakdowns with contractors same-day',
      'Invoicing Service Jobs on same month job completed',
      'Invoicing Workshop Jobs on same month job completed',
      'Solve Engineer Timesheet and Tablet Issues same-day',
      'Notify clients each month of their upcoming service dates',
      'Customer enquiries acknowledged same-day',
      'Quote or query completed within 24h',
      'Engineer workloads and demand currently stable',
      'Callout To Be Booked list - Backlog at satisfactory levels',
      'Booking Machine into Workshop procedure - use book, add tags, link job number',
      'Solution-focused and able to offer creative options',
    ],
  },
  'sales-consultant': {
    title: 'Sales Consultant',
    department: 'Sales',
    tasks: [
      'Pipeline Added',
      'Customer enquiries acknowledged',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Orders Processed',
      'Condition of your demonstration equipment',
      'Pipeline added to Hubspot',
      'Pipeline being followed up',
      'Meetings added to Hubspot',
      'All demonstration/trial machines booked out on Protean',
      'Every loan/trial machine being signed for by client',
      'Training delivered to a high standard whenever required',
      'User manual, chemical data sheet, training vid sent electronically',
      'Consumables promoted with each machine sale',
      'Service plan offered with each machine sale',
      'System to ensure all accessories come back, no damage, etc',
      'Monthly product awareness sessions being attended',
      'All demonstrations pre-qualified - decision maker will be there',
      'All clients emailed before a scheduled meeting, confirming meeting time',
      'Proposals sent to proposals@lvcuk.com',
      'Email subject bar follows company guidance',
      'Workshop booking in process being followed',
      'Sales Hire policy being followed by you/your department',
      'Photos being taken of items being delivered and dispatch note',
      'Logistics spreadsheet being checked to see if you can assist with deliveries',
      'Memo box on Protean being filled in with questions answered',
      'Solution-focused and able to offer creative options',
      'S numbers are on entire Sales fleet',
    ],
  },
  'workshop-manager': {
    title: 'Workshop Manager / Senior Service Engineer',
    department: 'Engineering',
    tasks: [
      'Customer enquiries acknowledged',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance',
      'Workshop booking in process being followed',
      'Logistics spreadsheet being updated with as much notice as possible',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Entire department Submitting monthly reports in on time',
      'Department policies are all written out and reviewed regularly',
      'Additional support being requested wherever required',
      'Communication policy is followed across department',
      'Department section of Protean is clear current & informative',
      'Account Queries resolved regularly',
      'Department operating in a professional manner',
      'Training delivered to a high standard on set monthly date',
      'Extra training delivered to a high standard',
      'Booking Machine into Workshop procedure - use book, add tags, link job number',
      'Creation of Job on Protean',
      'Creation of Equipment on Protean',
      'Quoting Jobs (with phone call)',
      'Chasing Outstanding Jobs parts',
      'General Upkeep of Workshop',
      'Workshop Inspections',
      'Repairing machines efficiently',
      'Booking in Hire Machines, and collecting on the contract',
      'Scrapping of machinery',
      'Fitting Consumables on jobs',
      'Pre-quote explanation phone call',
      'Checking outstanding jobs with Office and chasing parts up internally',
      'Identifying parts required for jobs',
      'Expensive quote follow-up with client',
      'Book absence on HRONLINE',
      'Creation of Logistics Route - published by 3:00PM daily',
      'Monitoring and management of Logistics activities in LVC',
    ],
  },
  'accounts-manager': {
    title: 'Accounts Manager',
    department: 'Finance',
    tasks: [
      'Key processes, procedures and standards are consistently met across department',
      'Entire department understands and conforms with company values',
      'Customer Journey reviewed (clients and internal)',
      'Entire team is trained and continuously developing',
      'Entire department has all the tools required to fulfil their role',
      'Everyone in your department following H&S Guidelines',
      'Entire department Submitting monthly reports in on time',
      'Department policies are all written out, reviewed and updated regularly',
      'Additional support being requested wherever required',
      'Communication policy is followed across department',
      'Department section of Protean is clear current & informative',
      'Induction for all new members is set up and followed',
      'Account Queries resolved regularly',
      'Client & staff feedback being logged',
      'Periodic review meetings with your team',
      'Annual appraisal held with individuals within your team',
      'Monthly newsletter submitted on time each month',
      'Department operating in a professional manner',
      'Solution-focused and able to offer creative options',
      'Managing email inboxes - Accounts, Info, purchase Ledger',
      'Mail order invoices',
      'Credit Notes',
      'Machine sale register with Inv no, Serial no, etc',
      'Long term invoices each month',
      'Bad Debt chasing',
      'Check all bank accounts /balance in the morning',
      'Pay off customer payments from RBS bank statement',
      'Bank Reconciliation - Current acc, RBS Acc',
      'Yearly contract renewal, invoice as soon as service visit is done',
      'Oversee big contracts when due',
      'Wages and Bonus - Engineers, Salesman, Hire',
      'Director assistance - any work issues, cashflow, reports',
      'Paying suppliers - monitoring due dates',
      'General staff assistance',
      'Journal entries for loans, HP interest',
      'RBS reports, notify on Facflow',
      'Prepare for VAT',
      'Engineer/salesmen expenses, float, loan',
      'Manage Petty cash, recycle income',
      'Credit card receipts chase, claim VAT',
      'Make changes if other makes mistakes on Sage',
      'Taking phone calls, or make calls to sort out accounts queries',
      'Protean - End of month reports after closing the month',
      'Daily filing',
      'Send details to customers, new acc application form',
      'Check and inform if any jobs, mail orders are wrong',
      'Checking if payment received but not invoiced',
      'Spend time learning and improving departments use of Protean',
      'Closing month procedure - Sales',
      'Closing month procedure - Purchasing',
      'RBS Audits',
      'Preparing and logging department performance figures',
      'Keep track online for PAYE & VAT',
      'Reaching deadlines',
      'Checking picking to picking status',
      'Opening post',
      'Entering RBS bacs and cheques payments from customer',
      'Taking Visa payments from customers',
      'Support purchase Ledger queries',
      'Getting Nilfisk Bills ready for month end',
      'Daily despatch notes filing',
      'Opening accounts for New customers',
      'Checking spread sheet against Protean',
      'Enter Fimap, Amazon, any invoices paid by credit card',
      'Scan documents',
    ],
  },
  'warehouse-manager': {
    title: 'Warehouse Manager',
    department: 'Warehouse',
    tasks: [
      'Customer enquiries acknowledged',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance',
      'Workshop booking in process being followed',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Entire department Submitting monthly reports in on time',
      'Department policies are all written out and reviewed regularly',
      'Additional support being requested wherever required',
      'Communication policy is followed across department',
      'Department section of Protean is clear current & informative',
      'Account Queries resolved regularly',
      'Department operating in a professional manner',
      'Training delivered to a high standard whenever required',
      'Engineer Van Stock Replenishment (weekly)',
      'Engineer Van Stock Take (yearly)',
      'Stock Room Stock Take (By Zone)',
      'Periodic Stock Room Inspections',
      'Picking and dispatch of Job Stock Issues',
      'Return of goods to suppliers and generate Returns note',
      'Carry out Parts to Equipment Process',
      'Creating and superseding part numbers',
    ],
  },
  'operations-manager': {
    title: 'Operations Manager',
    department: 'Operations',
    tasks: [
      'Key processes, procedures and standards are consistently met across department',
      'Entire department understands and conforms with company values in everything they do',
      'Customer Journey reviewed (clients and internal) finding ways to improve client satisfaction',
      'Entire team is trained and continuously developing their knowledge and skills',
      'Entire department has all the tools required to fulfil their role adequately',
      'Everyone in your department following H&S Guidelines',
      'Entire department Submitting monthly reports in on time',
      'Department policies are all written out, reviewed and updated regularly',
      'Additional support being requested wherever required',
      'Communication policy is followed across department',
      'Department section of Protean is clear current & informative',
      'Induction for all new members (incl training schedule) is set up and followed',
      'Account Queries resolved regularly',
      'Client & staff feedback being logged',
      'Periodic review meetings with your team',
      'Monthly newsletter submitted on time each month',
      'Solution-focused and able to offer creative options',
    ],
  },
  'delivery-driver': {
    title: 'Delivery Driver',
    department: 'Operations',
    tasks: [
      'Customer enquiries acknowledged',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance',
      'Workshop booking in process being followed',
      'Logistics system being updated with as much notice as possible',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Submitting monthly reports in on time',
      'Additional support being requested wherever required',
      'Communication policy is followed',
      'Operating in a professional manner, including communication and image',
      'Training received to a high standard whenever required',
      'Health and Safety Policy followed',
      'Phone clients the day before planned route - to ensure all booked in',
      'Use Logistics System to view the planned route',
      'Gather Paperwork from each department for route',
      'Pre-dispatch check of paperwork to ensure vital information included',
      'Load Van autonomously - checking load order with route planned',
      'Phone each site when departing to complete their respective deliveries/collections',
      'Locate and correspond with the relevant site contact upon arrival to site',
      'Ask client to empty waste tank of machine before loading onto Van',
      'Carrying out correct machine loading and unloading procedure on-site',
      'Completion of route on-time for afternoon loading of following day route',
      'For pre-loaded van - depart following morning by 7:00AM',
      'For unloaded van - depart LVC by 9:00AM',
      'Complete on-site client training/demonstration to a high standard',
      'Able to answer all demonstration questions without issue',
      'Solution-focused and able to offer creative options',
    ],
  },
  'hire-department-manager': {
    title: 'Hire Department Manager',
    department: 'Operations',
    tasks: [
      'Key processes, procedures and standards are consistently met across department',
      'Entire department understands and conforms with company values',
      'Customer Journey reviewed (clients and internal)',
      'Entire team is trained and continuously developing',
      'Entire department has all the tools required to fulfil their role',
      'Everyone in your department following H&S Guidelines',
      'Entire department Submitting monthly reports in on time',
      'Department policies are all written out, reviewed and updated regularly',
      'Additional support being requested wherever required',
      'Communication policy is followed across department',
      'Department section of Protean is clear current & informative',
      'Induction for all new members is set up and followed',
      'Account Queries resolved regularly',
      'Client & staff feedback being logged',
      'Periodic review meetings with your team',
      'Annual appraisal held with individuals within your team',
      'Monthly newsletter submitted on time each month',
      'Department operating in a professional manner',
      'Customer enquiries acknowledged',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Hire go ahead processed',
      'Condition of Hire Fleet',
      'Hire fleet able to meet quantity of client demand',
      'Off hire report sent to client within 72 hours',
      'Training delivered to a high standard whenever required',
      'User manual, chemical data sheet, training vid sent electronically on all hires',
      'Laminated User guide physically given on each hire',
      'Consumables promoted with each hire',
      'Invoicing completed within correct month',
      'Entire fleet being regularly serviced',
      'System to ensure all accessories come back, damage charged, etc',
      'Recurring meetings with Accounts, Service & Workshop',
      'Confidence in machines not being left on clients site at end of hire',
      'All quotes are sent to clients in writing',
      'All proposals sent to proposals@lvcuk.com',
      'Pipeline added to Hubspot',
      'Pipeline being followed up',
      'Meetings added to Hubspot',
      'Photos being taken delivered items and despatch note',
      'Sales Hire policy being followed by you/your department',
      'H numbers are on entire Hire fleet',
      'Business case being sent through on any new machine requirements',
      'Hire contracts sent and agreed in writing on all hires',
      'Email subject bar follows company guidance',
      'Workshop booking in process being followed',
      'Logistics spreadsheet being updated with as much notice as possible',
      'Potential hires being added to logistics spreadsheet',
      'Contract notes section filled out with all required information',
      'Solution-focused and able to offer creative options',
    ],
  },
  'it-procurement-manager': {
    title: 'IT & Procurement Manager',
    department: 'IT',
    tasks: [
      'Parts Outstanding by Supplier (total number)',
      'Disaster Recovery',
      'Virus Protection',
      'Desktop computers',
      'Mobile phones & Tablets',
      'Protean - System',
      'Protean - Prices',
      'Microsoft Teams',
      'Servers - General Condition',
      'Efficient file storage',
      'VOIP',
      'How often are you reviewing the hardware we use to maximise productivity?',
      'How often are you reviewing the software we use to maximise productivity?',
      'Rectifying of day to day user IT issues',
      'Customer enquiries acknowledged',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance',
      'Logistics spreadsheet being updated with as much notice as possible',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Submitting monthly reports in on time',
      'Additional support being requested wherever required',
      'Communication policy is followed',
      'Department section of Protean is clear current & informative',
      'Account Queries resolved regularly',
      'Department operating in a professional manner',
      'Regular creation of purchase orders to fulfil demand',
      'Splitting of Purchase orders by demand vs. stock',
      'Solution-focused and able to offer creative options',
    ],
  },
};

export const roleTaskDefinitions: Record<string, RoleTaskDefinition> = {};

Object.entries(rawRoleTaskData).forEach(([id, data]) => {
  roleTaskDefinitions[id] = {
    id,
    title: data.title,
    department: data.department,
    sections: categorizeStandards(data.tasks),
  };
});

export const roleTasksList = Object.values(roleTaskDefinitions);

export function getRoleTaskById(id: string): RoleTaskDefinition | undefined {
  return roleTaskDefinitions[id];
}

export function getRoleTaskOptions(): { value: string; label: string; department: string }[] {
  return roleTasksList.map(role => ({
    value: role.id,
    label: role.title,
    department: role.department,
  }));
}
