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

function generateId(text: string, index: number): string {
  return `std-${index}-${text.slice(0, 20).toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
}

function categorizeStandards(tasks: string[]): RoleSection[] {
  const coreDuties: RoleStandard[] = [];
  const systemsProcesses: RoleStandard[] = [];
  const customerStandards: RoleStandard[] = [];
  const qualityCompliance: RoleStandard[] = [];
  
  const systemKeywords = ['protean', 'hubspot', 'system', 'software', 'online', 'email', 'log in', 'spreadsheet', 'document'];
  const customerKeywords = ['customer', 'client', 'enquir', 'quote', 'communication', 'phone call', 'acknowledged'];
  const qualityKeywords = ['inspection', 'review', 'check', 'audit', 'compliance', 'policy', 'procedure', 'standard', 'report'];
  
  tasks.forEach((task, idx) => {
    if (task.includes('proud to work') || task.includes('praise for their work') || task.includes('comments or feedback')) {
      return;
    }
    
    const taskLower = task.toLowerCase();
    const standard: RoleStandard = {
      id: generateId(task, idx),
      text: task,
      isCritical: taskLower.includes('critical') || taskLower.includes('quarterly') || taskLower.includes('monthly report') || taskLower.includes('on time'),
    };
    
    if (systemKeywords.some(kw => taskLower.includes(kw))) {
      systemsProcesses.push(standard);
    } else if (customerKeywords.some(kw => taskLower.includes(kw))) {
      customerStandards.push(standard);
    } else if (qualityKeywords.some(kw => taskLower.includes(kw))) {
      qualityCompliance.push(standard);
    } else {
      coreDuties.push(standard);
    }
  });
  
  const sections: RoleSection[] = [];
  
  if (coreDuties.length > 0) {
    sections.push({
      id: 'core-duties',
      name: 'Core Duties',
      standards: coreDuties,
      acknowledged: true,
      acknowledgedDate: '2025-11-15',
    });
  }
  
  if (customerStandards.length > 0) {
    sections.push({
      id: 'customer-standards',
      name: 'Customer Standards',
      standards: customerStandards,
      acknowledged: true,
      acknowledgedDate: '2025-11-15',
    });
  }
  
  if (systemsProcesses.length > 0) {
    sections.push({
      id: 'systems-processes',
      name: 'Systems & Processes',
      standards: systemsProcesses,
      acknowledged: false,
      hasUpdates: true,
      updatesCount: 2,
    });
  }
  
  if (qualityCompliance.length > 0) {
    sections.push({
      id: 'quality-compliance',
      name: 'Quality & Compliance',
      standards: qualityCompliance,
      acknowledged: true,
      acknowledgedDate: '2025-12-01',
    });
  }
  
  return sections;
}

export const roleDefinitions: Record<string, RoleDefinition> = {
  'purchase-ledger-administrator': {
    id: 'purchase-ledger-administrator',
    title: 'Purchase Ledger Administrator',
    department: 'Finance',
    version: '2.1',
    lastReviewed: '2025-12-15',
    sections: categorizeStandards([
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
    ]),
  },
  'hs-quality-coordinator': {
    id: 'hs-quality-coordinator',
    title: 'H&S & Quality Coordinator',
    department: 'Quality',
    version: '3.0',
    lastReviewed: '2025-12-20',
    sections: categorizeStandards([
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
    ]),
  },
  'warehouse-assistant': {
    id: 'warehouse-assistant',
    title: 'Warehouse Assistant',
    department: 'Warehouse',
    version: '1.5',
    lastReviewed: '2025-11-30',
    sections: categorizeStandards([
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
    ]),
  },
  'warehouse-sales-assistant': {
    id: 'warehouse-sales-assistant',
    title: 'Warehouse and Sales Assistant',
    department: 'Warehouse',
    version: '1.3',
    lastReviewed: '2025-11-28',
    sections: categorizeStandards([
      'Customer enquiries acknowledged',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance',
      'Workshop booking in process being followed',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Submitting monthly reports in on time',
      'Department policies are all written out and reviewed regularly',
      'Additional support being requested wherever required',
      'Communication policy is followed across department',
      'Department section of Protean is clear current & informative',
      'Account Queries resolved regularly',
      'Department operating in a professional manner',
      'Dispatch Via DPD (On Time)',
      'Dispatch Via Fedex (On-Time)',
      'Solution-focused and able to offer creative options',
      'Booking in and allocation of items to Sales Orders',
      'Picking of Sales Orders (incomplete and complete)',
      'Warehouse Inspections - Upkeep of various zones',
      'Adding deliveries/collections to Logistics Sheet',
      'Chasing missing or lost deliveries with DPD',
      'Booking and wrapping a Pallet for delivery',
    ]),
  },
  'warehouse-manager': {
    id: 'warehouse-manager',
    title: 'Warehouse Manager',
    department: 'Warehouse',
    version: '2.2',
    lastReviewed: '2025-12-10',
    sections: categorizeStandards([
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
    ]),
  },
  'accounts-administrator': {
    id: 'accounts-administrator',
    title: 'Accounts Administrator',
    department: 'Finance',
    version: '1.8',
    lastReviewed: '2025-12-05',
    sections: categorizeStandards([
      'Aged Debt',
      'Filing invoices online - Eg Serco, Dwellant, ProcureWizard',
      'Vehicle Checklists',
      'Vehicle Servicing',
      'Vehicle MOTs',
      'Vehicle Tax',
      'Engineer Timesheets',
      'Private mileage',
      'Parking fines',
      'Solution-focused and able to offer creative options',
    ]),
  },
  'workshop-manager': {
    id: 'workshop-manager',
    title: 'Workshop Manager / Senior Service Engineer',
    department: 'Engineering',
    version: '2.5',
    lastReviewed: '2025-12-18',
    sections: categorizeStandards([
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
    ]),
  },
  'sales-consultant': {
    id: 'sales-consultant',
    title: 'Sales Consultant',
    department: 'Sales',
    version: '2.0',
    lastReviewed: '2025-12-12',
    sections: categorizeStandards([
      'Pipeline Added',
      'Customer enquiries acknowledged',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Orders Processed',
      'Condition of your demonstration equipment',
      'Pipeline added to Hubspot',
      'Pipeline being followed up',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Submitting monthly reports in on time',
      'Department policies are all written out and reviewed regularly',
      'Communication policy is followed across department',
      'Department section of Protean is clear current & informative',
      'Department operating in a professional manner',
      'Email subject bar follows company guidance',
      'Solution-focused and able to offer creative options',
      'Handling inbound sales enquiries promptly',
      'Conducting product demonstrations',
      'Preparing and sending quotations',
      'Following up on outstanding quotes',
      'Updating CRM with customer interactions',
      'Attending trade shows and events when required',
    ]),
  },
  'service-engineer': {
    id: 'service-engineer',
    title: 'Service Engineer',
    department: 'Engineering',
    version: '2.3',
    lastReviewed: '2025-12-15',
    sections: categorizeStandards([
      'Customer enquiries acknowledged',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance',
      'Job scheduling and route planning',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Submitting monthly reports in on time',
      'Communication policy is followed',
      'Department section of Protean is clear and informative',
      'Operating in a professional manner',
      'Pre-job preparation and parts check',
      'On-site fault diagnosis',
      'Equipment repair and maintenance',
      'Customer sign-off on completed work',
      'Accurate job reporting in Protean',
      'Van stock management and replenishment',
      'Health and safety compliance on site',
      'First-time fix rate targets',
      'Customer satisfaction follow-up',
      'Escalation of complex faults to senior engineers',
      'Tool and equipment maintenance',
      'Attending monthly training sessions',
    ]),
  },
  'service-administrator': {
    id: 'service-administrator',
    title: 'Service Administrator',
    department: 'Service Admin',
    version: '1.9',
    lastReviewed: '2025-12-08',
    sections: categorizeStandards([
      'Customer enquiries acknowledged within 4 hours',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance',
      'Job scheduling and allocation',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Submitting monthly reports in on time',
      'Department policies are reviewed regularly',
      'Communication policy is followed across department',
      'Department section of Protean is clear and informative',
      'Operating in a professional manner',
      'Processing service requests',
      'Scheduling engineer visits',
      'Coordinating parts requirements',
      'Updating job status in Protean',
      'Customer communication on job progress',
      'Invoicing completed service jobs',
      'Handling warranty claims',
      'Managing service contracts',
      'Producing service reports',
    ]),
  },
  'hire-coordinator': {
    id: 'hire-coordinator',
    title: 'Hire Coordinator',
    department: 'Operations',
    version: '1.6',
    lastReviewed: '2025-11-25',
    sections: categorizeStandards([
      'Customer enquiries acknowledged',
      'Quote or query completed',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Submitting monthly reports in on time',
      'Communication policy is followed',
      'Protean records are accurate and up to date',
      'Operating in a professional manner',
      'Processing hire requests',
      'Scheduling hire deliveries and collections',
      'Coordinating with logistics team',
      'Managing hire fleet availability',
      'Hire contract administration',
      'Customer onboarding for new hires',
      'Invoicing hire periods',
      'Damage assessment on returns',
      'Hire fleet maintenance scheduling',
    ]),
  },
  'finance-director': {
    id: 'finance-director',
    title: 'Finance Director',
    department: 'Executive',
    version: '3.1',
    lastReviewed: '2025-12-20',
    sections: categorizeStandards([
      'Monthly management accounts produced by 10th working day',
      'Annual budget preparation and monitoring',
      'Cash flow forecasting and management',
      'Board reporting and financial analysis',
      'Quarterly Rocks are set and delivered',
      'Department policies reviewed annually',
      'Communication policy upheld across finance team',
      'Protean financial modules maintained',
      'Leading the finance team professionally',
      'Strategic financial planning',
      'Banking and treasury management',
      'Audit preparation and liaison',
      'Tax compliance and planning',
      'Credit control oversight',
      'Investment appraisal',
      'Insurance management',
      'Payroll oversight',
      'Pension scheme administration',
    ]),
  },
  'operations-director': {
    id: 'operations-director',
    title: 'Operations Director',
    department: 'Executive',
    version: '2.8',
    lastReviewed: '2025-12-18',
    sections: categorizeStandards([
      'Quarterly strategic objectives achieved',
      'Department KPIs monitored and reported',
      'Customer satisfaction targets met',
      'Board reporting and operational analysis',
      'Quarterly Rocks are set and delivered',
      'All department policies reviewed annually',
      'Communication standards upheld',
      'Protean system governance',
      'Leading operations teams professionally',
      'Resource planning and allocation',
      'Process improvement initiatives',
      'Supplier relationship management',
      'Health and safety oversight',
      'Quality management system',
      'Training and development oversight',
      'Fleet management',
      'Facilities management',
      'Business continuity planning',
    ]),
  },
  'hr-administrator': {
    id: 'hr-administrator',
    title: 'HR Administrator',
    department: 'HR',
    version: '1.7',
    lastReviewed: '2025-12-01',
    sections: categorizeStandards([
      'Employee enquiries responded to within 24 hours',
      'Internal requests acknowledged promptly',
      'Email subject bar follows company guidance',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Submitting monthly reports in on time',
      'HR policies reviewed and communicated',
      'Communication policy followed',
      'HR system (BrightHR) maintained accurately',
      'Operating professionally and confidentially',
      'New starter onboarding administration',
      'Leaver processing and exit interviews',
      'Absence management and recording',
      'Holiday entitlement tracking',
      'Training records maintenance',
      'Recruitment administration',
      'Employee file management',
      'Payroll data preparation',
      'Benefits administration',
    ]),
  },
  'it-systems-administrator': {
    id: 'it-systems-administrator',
    title: 'IT & Systems Administrator',
    department: 'IT',
    version: '2.0',
    lastReviewed: '2025-12-10',
    sections: categorizeStandards([
      'IT support requests responded to within 2 hours',
      'Internal enquiries acknowledged',
      'Email subject bar follows company guidance',
      'Quarterly Rocks are set and 80%+ delivered upon',
      'Submitting monthly reports in on time',
      'IT policies maintained and enforced',
      'Communication policy followed',
      'All systems documented and maintained',
      'Operating professionally and securely',
      'User account management',
      'Hardware provisioning and maintenance',
      'Software licensing and updates',
      'Network monitoring and maintenance',
      'Backup and disaster recovery',
      'Security monitoring and response',
      'Protean system administration',
      'Telephone system management',
      'Printer and peripheral support',
    ]),
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
    { roleId: 'service-engineer', roleTitle: 'Service Engineer', sectionId: 'systems-processes', sectionName: 'Systems & Processes', requestedBy: 'David Thompson', requestedDate: '2026-01-08' },
    { roleId: 'warehouse-assistant', roleTitle: 'Warehouse Assistant', sectionId: 'core-duties', sectionName: 'Core Duties', requestedBy: 'Tom Richards', requestedDate: '2026-01-05' },
    { roleId: 'service-administrator', roleTitle: 'Service Administrator', sectionId: 'customer-standards', sectionName: 'Customer Standards', requestedBy: 'Emma Clarke', requestedDate: '2026-01-09' },
  ];
}
