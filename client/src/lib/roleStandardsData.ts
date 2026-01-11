export interface RoleStandard {
  id: string;
  text: string;
}

export interface RoleSection {
  id: string;
  name: string;
  standards: RoleStandard[];
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
        id: 'job-completion',
        name: 'Job Completion & Reporting',
        standards: [
          { id: 'fse-1', text: 'Same-day booking in job and communication with client' },
          { id: 'fse-2', text: 'Completion of Reports Correctly: Labour, Equipment Notes, and Further Work' },
          { id: 'fse-3', text: 'Client Debrief (on-site, or if client busy then over the phone)' },
          { id: 'fse-4', text: 'Quote explanation and follow-up (over £350)' },
          { id: 'fse-5', text: 'Checking outstanding jobs with Office and chasing parts up internally' },
          { id: 'fse-6', text: 'Booking in return visit to complete Callback job' },
          { id: 'fse-7', text: 'Unable to attend - communication and rebooking visit' },
        ],
      },
      {
        id: 'scheduling-planning',
        name: 'Scheduling & Planning',
        standards: [
          { id: 'fse-sp-1', text: 'Scheduling Work to stay busy' },
          { id: 'fse-sp-2', text: 'Firm next-day plans and rough idea for coming 3 days' },
          { id: 'fse-sp-3', text: 'Maintain a list of back-up jobs that can be attended on short notice' },
          { id: 'fse-sp-4', text: 'Speaking with office if work begins to run short' },
          { id: 'fse-sp-5', text: 'Pre-visit diagnosis' },
          { id: 'fse-sp-6', text: 'Identifying parts required for jobs' },
          { id: 'fse-sp-7', text: 'Communicate the parts required to the office for job' },
          { id: 'fse-sp-8', text: 'Schedule date and time with client' },
          { id: 'fse-sp-9', text: 'Move the visit on your planner board once booked with client' },
        ],
      },
      {
        id: 'customer-service',
        name: 'Customer Service',
        standards: [
          { id: 'fse-cs-1', text: 'Ascertain Parts required for job and make sure available for visit' },
          { id: 'fse-cs-2', text: 'On-site client debrief' },
          { id: 'fse-cs-3', text: 'Post-repair phone call to check machine is fine' },
          { id: 'fse-cs-4', text: 'Enquiring if consumables are needed; bags, chemical, etc.' },
          { id: 'fse-cs-5', text: 'Are you fitting Consumables on jobs?' },
          { id: 'fse-cs-6', text: 'Solution-focused and able to offer creative options' },
        ],
      },
      {
        id: 'van-equipment',
        name: 'Van & Equipment',
        standards: [
          { id: 'fse-ve-1', text: 'Van Stock Management' },
          { id: 'fse-ve-2', text: 'Are you receiving sufficient parts in a timely manner?' },
          { id: 'fse-ve-3', text: 'Do you place LVC service stickers on all machines that you service?' },
          { id: 'fse-ve-4', text: 'Do you have appropriate PPE to complete your jobs safely?' },
          { id: 'fse-ve-5', text: 'Do you have and wear LVC workwear on your jobs?' },
          { id: 'fse-ve-6', text: 'Do you have the tools necessary to complete your daily jobs?' },
        ],
      },
      {
        id: 'admin-systems',
        name: 'Administration & Systems',
        standards: [
          { id: 'fse-as-1', text: 'Timesheets - Daily' },
          { id: 'fse-as-2', text: 'Book absence on HRONLINE' },
          { id: 'fse-as-3', text: 'Clients communicated to and jobs rebooked if unable to attend' },
          { id: 'fse-as-4', text: 'Service Desk updated if unable to communicate with clients' },
        ],
      },
    ],
  },
  'service-coordinator': {
    id: 'service-coordinator',
    title: 'Service Co-Ordinator',
    department: 'Service Admin',
    version: '1.8',
    lastReviewed: '2025-11-20',
    sections: [
      {
        id: 'job-management',
        name: 'Job Management',
        standards: [
          { id: 'sc-1', text: 'Logging and Allocating Breakdowns same-day' },
          { id: 'sc-2', text: 'Processing Further Work same-day' },
          { id: 'sc-3', text: 'Creating Service Contracts same-day from approval' },
          { id: 'sc-4', text: 'Generating and pulling through Service Visits 2 months before due date' },
          { id: 'sc-5', text: 'Checking previous week/day for unattended jobs' },
          { id: 'sc-6', text: 'Raising Breakdowns with contractors same-day' },
          { id: 'sc-7', text: 'Solve Engineer Timesheet and Tablet Issues same-day' },
        ],
      },
      {
        id: 'customer-communication',
        name: 'Customer Communication',
        standards: [
          { id: 'sc-cc-1', text: 'Customer enquiries acknowledged same-day' },
          { id: 'sc-cc-2', text: 'Quote or query completed within 24h' },
          { id: 'sc-cc-3', text: 'Notify clients each month of their upcoming service dates' },
          { id: 'sc-cc-4', text: 'Internal enquiries acknowledged' },
          { id: 'sc-cc-5', text: 'Solution-focused and able to offer creative options' },
        ],
      },
      {
        id: 'invoicing-admin',
        name: 'Invoicing & Administration',
        standards: [
          { id: 'sc-ia-1', text: 'Invoicing Service Jobs on same month job completed' },
          { id: 'sc-ia-2', text: 'Invoicing Workshop Jobs on same month job completed' },
          { id: 'sc-ia-3', text: 'Email Inbox - General upkeep - email count kept relatively low' },
          { id: 'sc-ia-4', text: 'Email subject bar follows company guidance' },
          { id: 'sc-ia-5', text: 'Account Queries resolved regularly' },
        ],
      },
      {
        id: 'planning-logistics',
        name: 'Planning & Logistics',
        standards: [
          { id: 'sc-pl-1', text: 'Checking Plannerboard everyday for absences' },
          { id: 'sc-pl-2', text: 'Engineer workloads and demand currently stable' },
          { id: 'sc-pl-3', text: 'Callout To Be Booked list - Backlog at satisfactory levels' },
          { id: 'sc-pl-4', text: 'Logistics spreadsheet being updated with as much notice as possible' },
          { id: 'sc-pl-5', text: 'Workshop booking in process being followed' },
          { id: 'sc-pl-6', text: 'Booking Machine into Workshop procedure - use book, add tags, link job number' },
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
        id: 'pipeline-crm',
        name: 'Pipeline & CRM',
        standards: [
          { id: 'slc-1', text: 'Pipeline added to Hubspot' },
          { id: 'slc-2', text: 'Pipeline being followed up' },
          { id: 'slc-3', text: 'Meetings added to Hubspot' },
          { id: 'slc-4', text: 'Orders Processed' },
          { id: 'slc-5', text: 'Proposals sent to proposals@lvcuk.com' },
        ],
      },
      {
        id: 'customer-engagement',
        name: 'Customer Engagement',
        standards: [
          { id: 'slc-ce-1', text: 'Customer enquiries acknowledged' },
          { id: 'slc-ce-2', text: 'Quote or query completed' },
          { id: 'slc-ce-3', text: 'All demonstrations pre-qualified - decision maker will be there' },
          { id: 'slc-ce-4', text: 'All clients emailed before a scheduled meeting, confirming meeting time' },
          { id: 'slc-ce-5', text: 'Solution-focused and able to offer creative options' },
        ],
      },
      {
        id: 'demonstrations',
        name: 'Demonstrations & Trials',
        standards: [
          { id: 'slc-dt-1', text: 'Condition of your demonstration equipment' },
          { id: 'slc-dt-2', text: 'All demonstration/trial machines booked out on Protean' },
          { id: 'slc-dt-3', text: 'Every loan/trial machine being signed for by client' },
          { id: 'slc-dt-4', text: 'System to ensure all accessories come back, no damage, etc' },
          { id: 'slc-dt-5', text: 'S numbers are on entire Sales fleet' },
        ],
      },
      {
        id: 'post-sale',
        name: 'Post-Sale Support',
        standards: [
          { id: 'slc-ps-1', text: 'User manual, chemical data sheet, training vid sent electronically' },
          { id: 'slc-ps-2', text: 'Consumables promoted with each machine sale' },
          { id: 'slc-ps-3', text: 'Service plan offered with each machine sale' },
          { id: 'slc-ps-4', text: 'Training delivered to a high standard whenever required' },
          { id: 'slc-ps-5', text: 'Monthly product awareness sessions being attended' },
        ],
      },
      {
        id: 'admin-logistics',
        name: 'Administration & Logistics',
        standards: [
          { id: 'slc-al-1', text: 'Email subject bar follows company guidance' },
          { id: 'slc-al-2', text: 'Workshop booking in process being followed' },
          { id: 'slc-al-3', text: 'Sales Hire policy being followed by you/your department' },
          { id: 'slc-al-4', text: 'Photos being taken of items being delivered and dispatch note' },
          { id: 'slc-al-5', text: 'Logistics spreadsheet being checked to see if you can assist with deliveries' },
          { id: 'slc-al-6', text: 'Memo box on Protean being filled in with questions answered' },
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
        id: 'stock-management',
        name: 'Stock Management',
        standards: [
          { id: 'wm-1', text: 'Engineer Van Stock Replenishment (weekly)' },
          { id: 'wm-2', text: 'Engineer Van Stock Take (yearly)' },
          { id: 'wm-3', text: 'Stock Room Stock Take (By Zone)' },
          { id: 'wm-4', text: 'Periodic Stock Room Inspections' },
          { id: 'wm-5', text: 'Return of goods to suppliers and generate Returns note' },
        ],
      },
      {
        id: 'operations',
        name: 'Operations',
        standards: [
          { id: 'wm-op-1', text: 'Picking and dispatch of Job Stock Issues' },
          { id: 'wm-op-2', text: 'Carry out Parts to Equipment Process' },
          { id: 'wm-op-3', text: 'Creating and superseding part numbers' },
          { id: 'wm-op-4', text: 'Workshop booking in process being followed' },
        ],
      },
      {
        id: 'department-standards',
        name: 'Department Standards',
        standards: [
          { id: 'wm-ds-1', text: 'Customer enquiries acknowledged' },
          { id: 'wm-ds-2', text: 'Quote or query completed' },
          { id: 'wm-ds-3', text: 'Internal enquiries acknowledged' },
          { id: 'wm-ds-4', text: 'Email subject bar follows company guidance' },
          { id: 'wm-ds-5', text: 'Quarterly Rocks are set and 80%+ delivered upon' },
          { id: 'wm-ds-6', text: 'Department section of Protean is clear current & informative' },
          { id: 'wm-ds-7', text: 'Account Queries resolved regularly' },
          { id: 'wm-ds-8', text: 'Training delivered to a high standard whenever required' },
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
        id: 'financial-operations',
        name: 'Financial Operations',
        standards: [
          { id: 'am-1', text: 'Mail order invoices' },
          { id: 'am-2', text: 'Credit Notes' },
          { id: 'am-3', text: 'Machine sale register with Inv no, Serial no, etc' },
          { id: 'am-4', text: 'Long term invoices each month' },
          { id: 'am-5', text: 'Bad Debt chasing' },
          { id: 'am-6', text: 'Yearly contract renewal, invoice as soon as service visit is done' },
          { id: 'am-7', text: 'Oversee big contracts when due' },
        ],
      },
      {
        id: 'banking-reconciliation',
        name: 'Banking & Reconciliation',
        standards: [
          { id: 'am-br-1', text: 'Check all bank accounts/balance in the morning' },
          { id: 'am-br-2', text: 'Pay off customer payments from RBS bank statement' },
          { id: 'am-br-3', text: 'Bank Reconciliation - Current acc, RBS Acc' },
          { id: 'am-br-4', text: 'Entering RBS bacs and cheques payments from customer' },
          { id: 'am-br-5', text: 'Taking Visa payments from customers' },
          { id: 'am-br-6', text: 'RBS reports, notify on Facflow' },
          { id: 'am-br-7', text: 'RBS Audits' },
        ],
      },
      {
        id: 'payroll-expenses',
        name: 'Payroll & Expenses',
        standards: [
          { id: 'am-pe-1', text: 'Wages and Bonus - Engineers, Salesman, Hire' },
          { id: 'am-pe-2', text: 'Engineer/salesmen expenses, float, loan' },
          { id: 'am-pe-3', text: 'Manage Petty cash, recycle income' },
          { id: 'am-pe-4', text: 'Credit card receipts chase, claim VAT' },
          { id: 'am-pe-5', text: 'Prepare for VAT' },
          { id: 'am-pe-6', text: 'Keep track online for PAYE & VAT' },
          { id: 'am-pe-7', text: 'Reaching deadlines' },
        ],
      },
      {
        id: 'suppliers-payments',
        name: 'Suppliers & Payments',
        standards: [
          { id: 'am-sp-1', text: 'Paying suppliers - monitoring due dates' },
          { id: 'am-sp-2', text: 'Journal entries for loans, HP interest' },
          { id: 'am-sp-3', text: 'Enter Fimap, Amazon, any invoices paid by credit card' },
          { id: 'am-sp-4', text: 'Support purchase Ledger queries' },
          { id: 'am-sp-5', text: 'Getting Nilfisk Bills ready for month end' },
        ],
      },
      {
        id: 'systems-reporting',
        name: 'Systems & Reporting',
        standards: [
          { id: 'am-sr-1', text: 'Protean - End of month reports after closing the month' },
          { id: 'am-sr-2', text: 'Closing month procedure - Sales' },
          { id: 'am-sr-3', text: 'Closing month procedure - Purchasing' },
          { id: 'am-sr-4', text: 'Preparing and logging department performance figures' },
          { id: 'am-sr-5', text: 'Make changes if other makes mistakes on Sage' },
          { id: 'am-sr-6', text: 'Spend time learning and improving departments use of Protean' },
          { id: 'am-sr-7', text: 'Checking spread sheet against Protean' },
        ],
      },
      {
        id: 'admin-general',
        name: 'Administration',
        standards: [
          { id: 'am-ag-1', text: 'Managing email inboxes - Accounts, Info, purchase Ledger' },
          { id: 'am-ag-2', text: 'Daily filing' },
          { id: 'am-ag-3', text: 'Daily despatch notes filing' },
          { id: 'am-ag-4', text: 'Opening post' },
          { id: 'am-ag-5', text: 'Scan documents' },
          { id: 'am-ag-6', text: 'Send details to customers, new acc application form' },
          { id: 'am-ag-7', text: 'Opening accounts for New customers' },
          { id: 'am-ag-8', text: 'Check and inform if any jobs, mail orders are wrong' },
          { id: 'am-ag-9', text: 'Taking phone calls, or make calls to sort out accounts queries' },
          { id: 'am-ag-10', text: 'Checking if payment received but not invoiced' },
          { id: 'am-ag-11', text: 'Checking picking to picking status' },
        ],
      },
      {
        id: 'team-leadership',
        name: 'Team Leadership',
        standards: [
          { id: 'am-tl-1', text: 'Key processes, procedures and standards are consistently met across department' },
          { id: 'am-tl-2', text: 'Entire department understands and conforms with company values' },
          { id: 'am-tl-3', text: 'Entire team is trained and continuously developing' },
          { id: 'am-tl-4', text: 'Periodic review meetings with your team' },
          { id: 'am-tl-5', text: 'Annual appraisal held with individuals within your team' },
          { id: 'am-tl-6', text: 'Monthly newsletter submitted on time each month' },
          { id: 'am-tl-7', text: 'Director assistance - any work issues, cashflow, reports' },
          { id: 'am-tl-8', text: 'General staff assistance' },
        ],
      },
    ],
  },
  'workshop-manager': {
    id: 'workshop-manager',
    title: 'Workshop Manager / Senior Service Engineer',
    department: 'Engineering',
    version: '1.9',
    lastReviewed: '2025-11-28',
    sections: [
      {
        id: 'workshop-operations',
        name: 'Workshop Operations',
        standards: [
          { id: 'wsm-1', text: 'Booking Machine into Workshop procedure - use book, add tags, link job number' },
          { id: 'wsm-2', text: 'Creation of Job on Protean' },
          { id: 'wsm-3', text: 'Creation of Equipment on Protean' },
          { id: 'wsm-4', text: 'Repairing machines efficiently' },
          { id: 'wsm-5', text: 'General Upkeep of Workshop' },
          { id: 'wsm-6', text: 'Workshop Inspections' },
          { id: 'wsm-7', text: 'Scrapping of machinery' },
        ],
      },
      {
        id: 'customer-quotes',
        name: 'Customer & Quotes',
        standards: [
          { id: 'wsm-cq-1', text: 'Customer enquiries acknowledged' },
          { id: 'wsm-cq-2', text: 'Quote or query completed' },
          { id: 'wsm-cq-3', text: 'Quoting Jobs (with phone call)' },
          { id: 'wsm-cq-4', text: 'Pre-quote explanation phone call' },
          { id: 'wsm-cq-5', text: 'Expensive quote follow-up with client' },
          { id: 'wsm-cq-6', text: 'Chasing Outstanding Jobs parts' },
          { id: 'wsm-cq-7', text: 'Checking outstanding jobs with Office and chasing parts up internally' },
        ],
      },
      {
        id: 'hire-logistics',
        name: 'Hire & Logistics',
        standards: [
          { id: 'wsm-hl-1', text: 'Booking in Hire Machines, and collecting on the contract' },
          { id: 'wsm-hl-2', text: 'Creation of Logistics Route - published by 3:00PM daily' },
          { id: 'wsm-hl-3', text: 'Monitoring and management of Logistics activities in LVC' },
          { id: 'wsm-hl-4', text: 'Logistics spreadsheet being updated with as much notice as possible' },
        ],
      },
      {
        id: 'job-completion',
        name: 'Job Completion',
        standards: [
          { id: 'wsm-jc-1', text: 'Fitting Consumables on jobs' },
          { id: 'wsm-jc-2', text: 'Identifying parts required for jobs' },
          { id: 'wsm-jc-3', text: 'Internal enquiries acknowledged' },
          { id: 'wsm-jc-4', text: 'Book absence on HRONLINE' },
        ],
      },
      {
        id: 'department-leadership',
        name: 'Department Leadership',
        standards: [
          { id: 'wsm-dl-1', text: 'Quarterly Rocks are set and 80%+ delivered upon' },
          { id: 'wsm-dl-2', text: 'Entire department Submitting monthly reports in on time' },
          { id: 'wsm-dl-3', text: 'Department policies are all written out and reviewed regularly' },
          { id: 'wsm-dl-4', text: 'Communication policy is followed across department' },
          { id: 'wsm-dl-5', text: 'Department section of Protean is clear current & informative' },
          { id: 'wsm-dl-6', text: 'Training delivered to a high standard on set monthly date' },
          { id: 'wsm-dl-7', text: 'Extra training delivered to a high standard' },
          { id: 'wsm-dl-8', text: 'Account Queries resolved regularly' },
          { id: 'wsm-dl-9', text: 'Department operating in a professional manner' },
        ],
      },
    ],
  },
  'delivery-driver': {
    id: 'delivery-driver',
    title: 'Delivery Driver',
    department: 'Operations',
    version: '1.4',
    lastReviewed: '2025-12-01',
    sections: [
      {
        id: 'route-planning',
        name: 'Route Planning & Preparation',
        standards: [
          { id: 'dd-1', text: 'Phone clients the day before planned route - to ensure all booked in' },
          { id: 'dd-2', text: 'Use Logistics System to view the planned route' },
          { id: 'dd-3', text: 'Gather Paperwork from each department for route' },
          { id: 'dd-4', text: 'Pre-dispatch check of paperwork to ensure vital information included' },
          { id: 'dd-5', text: 'Load Van autonomously - checking load order with route planned' },
        ],
      },
      {
        id: 'on-site-delivery',
        name: 'On-Site Delivery',
        standards: [
          { id: 'dd-os-1', text: 'Phone each site when departing to complete their respective deliveries/collections' },
          { id: 'dd-os-2', text: 'Locate and correspond with the relevant site contact upon arrival to site' },
          { id: 'dd-os-3', text: 'Ask client to empty waste tank of machine before loading onto Van' },
          { id: 'dd-os-4', text: 'Carrying out correct machine loading and unloading procedure on-site' },
        ],
      },
      {
        id: 'customer-training',
        name: 'Customer Training',
        standards: [
          { id: 'dd-ct-1', text: 'Complete on-site client training/demonstration to a high standard' },
          { id: 'dd-ct-2', text: 'Able to answer all demonstration questions without issue' },
          { id: 'dd-ct-3', text: 'Solution-focused and able to offer creative options' },
        ],
      },
      {
        id: 'timing-scheduling',
        name: 'Timing & Scheduling',
        standards: [
          { id: 'dd-ts-1', text: 'Completion of route on-time for afternoon loading of following day route' },
          { id: 'dd-ts-2', text: 'For pre-loaded van - depart following morning by 7:00AM' },
          { id: 'dd-ts-3', text: 'For unloaded van - depart LVC by 9:00AM' },
        ],
      },
      {
        id: 'admin-communication',
        name: 'Administration & Communication',
        standards: [
          { id: 'dd-ac-1', text: 'Customer enquiries acknowledged' },
          { id: 'dd-ac-2', text: 'Internal enquiries acknowledged' },
          { id: 'dd-ac-3', text: 'Email subject bar follows company guidance' },
          { id: 'dd-ac-4', text: 'Logistics system being updated with as much notice as possible' },
          { id: 'dd-ac-5', text: 'Workshop booking in process being followed' },
          { id: 'dd-ac-6', text: 'Communication policy is followed' },
          { id: 'dd-ac-7', text: 'Operating in a professional manner, including communication and image' },
          { id: 'dd-ac-8', text: 'Health and Safety Policy followed' },
        ],
      },
    ],
  },
  'hire-department-manager': {
    id: 'hire-department-manager',
    title: 'Hire Department Manager',
    department: 'Operations',
    version: '2.0',
    lastReviewed: '2025-11-30',
    sections: [
      {
        id: 'hire-operations',
        name: 'Hire Operations',
        standards: [
          { id: 'hdm-1', text: 'Customer enquiries acknowledged' },
          { id: 'hdm-2', text: 'Quote or query completed' },
          { id: 'hdm-3', text: 'Hire go ahead processed' },
          { id: 'hdm-4', text: 'Condition of Hire Fleet' },
          { id: 'hdm-5', text: 'Hire fleet able to meet quantity of client demand' },
          { id: 'hdm-6', text: 'Entire fleet being regularly serviced' },
          { id: 'hdm-7', text: 'H numbers are on entire Hire fleet' },
        ],
      },
      {
        id: 'contracts-invoicing',
        name: 'Contracts & Invoicing',
        standards: [
          { id: 'hdm-ci-1', text: 'Hire contracts sent and agreed in writing on all hires' },
          { id: 'hdm-ci-2', text: 'Off hire report sent to client within 72 hours' },
          { id: 'hdm-ci-3', text: 'Invoicing completed within correct month' },
          { id: 'hdm-ci-4', text: 'All quotes are sent to clients in writing' },
          { id: 'hdm-ci-5', text: 'All proposals sent to proposals@lvcuk.com' },
          { id: 'hdm-ci-6', text: 'Contract notes section filled out with all required information' },
        ],
      },
      {
        id: 'customer-support',
        name: 'Customer Support',
        standards: [
          { id: 'hdm-cs-1', text: 'User manual, chemical data sheet, training vid sent electronically on all hires' },
          { id: 'hdm-cs-2', text: 'Laminated User guide physically given on each hire' },
          { id: 'hdm-cs-3', text: 'Consumables promoted with each hire' },
          { id: 'hdm-cs-4', text: 'Training delivered to a high standard whenever required' },
          { id: 'hdm-cs-5', text: 'System to ensure all accessories come back, damage charged, etc' },
          { id: 'hdm-cs-6', text: 'Confidence in machines not being left on clients site at end of hire' },
        ],
      },
      {
        id: 'pipeline-crm',
        name: 'Pipeline & CRM',
        standards: [
          { id: 'hdm-pc-1', text: 'Pipeline added to Hubspot' },
          { id: 'hdm-pc-2', text: 'Pipeline being followed up' },
          { id: 'hdm-pc-3', text: 'Meetings added to Hubspot' },
          { id: 'hdm-pc-4', text: 'Potential hires being added to logistics spreadsheet' },
        ],
      },
      {
        id: 'department-leadership',
        name: 'Department Leadership',
        standards: [
          { id: 'hdm-dl-1', text: 'Key processes, procedures and standards are consistently met across department' },
          { id: 'hdm-dl-2', text: 'Entire department understands and conforms with company values' },
          { id: 'hdm-dl-3', text: 'Entire team is trained and continuously developing' },
          { id: 'hdm-dl-4', text: 'Induction for all new members is set up and followed' },
          { id: 'hdm-dl-5', text: 'Periodic review meetings with your team' },
          { id: 'hdm-dl-6', text: 'Annual appraisal held with individuals within your team' },
          { id: 'hdm-dl-7', text: 'Monthly newsletter submitted on time each month' },
          { id: 'hdm-dl-8', text: 'Recurring meetings with Accounts, Service & Workshop' },
          { id: 'hdm-dl-9', text: 'Business case being sent through on any new machine requirements' },
        ],
      },
    ],
  },
  'it-procurement-manager': {
    id: 'it-procurement-manager',
    title: 'IT & Procurement Manager',
    department: 'IT',
    version: '1.6',
    lastReviewed: '2025-12-03',
    sections: [
      {
        id: 'it-infrastructure',
        name: 'IT Infrastructure',
        standards: [
          { id: 'itp-1', text: 'Disaster Recovery' },
          { id: 'itp-2', text: 'Virus Protection' },
          { id: 'itp-3', text: 'Desktop computers' },
          { id: 'itp-4', text: 'Mobile phones & Tablets' },
          { id: 'itp-5', text: 'Servers - General Condition' },
          { id: 'itp-6', text: 'Efficient file storage' },
          { id: 'itp-7', text: 'VOIP' },
        ],
      },
      {
        id: 'systems-software',
        name: 'Systems & Software',
        standards: [
          { id: 'itp-ss-1', text: 'Protean - System' },
          { id: 'itp-ss-2', text: 'Protean - Prices' },
          { id: 'itp-ss-3', text: 'Microsoft Teams' },
          { id: 'itp-ss-4', text: 'How often are you reviewing the hardware we use to maximise productivity?' },
          { id: 'itp-ss-5', text: 'How often are you reviewing the software we use to maximise productivity?' },
          { id: 'itp-ss-6', text: 'Rectifying of day to day user IT issues' },
        ],
      },
      {
        id: 'procurement',
        name: 'Procurement',
        standards: [
          { id: 'itp-pr-1', text: 'Parts Outstanding by Supplier (total number)' },
          { id: 'itp-pr-2', text: 'Regular creation of purchase orders to fulfil demand' },
          { id: 'itp-pr-3', text: 'Splitting of Purchase orders by demand vs. stock' },
        ],
      },
      {
        id: 'communication-admin',
        name: 'Communication & Administration',
        standards: [
          { id: 'itp-ca-1', text: 'Customer enquiries acknowledged' },
          { id: 'itp-ca-2', text: 'Quote or query completed' },
          { id: 'itp-ca-3', text: 'Internal enquiries acknowledged' },
          { id: 'itp-ca-4', text: 'Email subject bar follows company guidance' },
          { id: 'itp-ca-5', text: 'Logistics spreadsheet being updated with as much notice as possible' },
          { id: 'itp-ca-6', text: 'Department section of Protean is clear current & informative' },
          { id: 'itp-ca-7', text: 'Account Queries resolved regularly' },
          { id: 'itp-ca-8', text: 'Solution-focused and able to offer creative options' },
        ],
      },
    ],
  },
  'hs-quality-coordinator': {
    id: 'hs-quality-coordinator',
    title: 'H&S & Quality Coordinator',
    department: 'Quality',
    version: '2.2',
    lastReviewed: '2025-11-20',
    sections: [
      {
        id: 'health-safety',
        name: 'Health & Safety',
        standards: [
          { id: 'hsq-1', text: 'Review Risk assessment (Annually)' },
          { id: 'hsq-2', text: 'Discuss and call in Peninsula for annual monitoring of our H&S company policy (Annually)' },
          { id: 'hsq-3', text: 'Monitor that each accident or incident has been logged in accident/incident book (Monthly)' },
          { id: 'hsq-4', text: 'Discuss actions to be taken to avoid accidents/incidents in the future (Quarterly)' },
          { id: 'hsq-5', text: 'Organise Fire drills (Annual)' },
          { id: 'hsq-6', text: 'Organise Fire fighting equipment/alarms are serviced (Annually)' },
          { id: 'hsq-7', text: 'Ensure that all employees know how to report accidents and incidents' },
          { id: 'hsq-8', text: 'Make sure that each Manager chase their staff members for completion of H&S online learning' },
          { id: 'hsq-9', text: 'Hold regular H&S meetings (quarterly with managers to flag up any issues)' },
          { id: 'hsq-10', text: 'When safety issues are flagged up – Act within 24 hours to action' },
          { id: 'hsq-11', text: 'Responsible for reporting to RIDDOR of reportable accidents and incidents' },
        ],
      },
      {
        id: 'compliance-accreditation',
        name: 'Compliance & Accreditation',
        standards: [
          { id: 'hsq-ca-1', text: 'Fill in accreditation documents annually (Safe contractors + customer requests)' },
          { id: 'hsq-ca-2', text: 'Do random site visits with engineers / Hire installations and Sales demonstrations' },
          { id: 'hsq-ca-3', text: 'Review all LVC Policies and link to Processes and Procedures' },
          { id: 'hsq-ca-4', text: 'Review processes and assist managers when setting up procedures' },
        ],
      },
      {
        id: 'training-development',
        name: 'Training & Development',
        standards: [
          { id: 'hsq-td-1', text: 'Assist Operations manager in Training matrix mainly on Safety aspects' },
          { id: 'hsq-td-2', text: 'Oversee so that the training fulfil our strategic goals' },
          { id: 'hsq-td-3', text: 'Oversee Performance Training Matrixes and discuss budget' },
          { id: 'hsq-td-4', text: 'Support staff to improve – Find out what is needed in terms of training' },
        ],
      },
      {
        id: 'feedback-quality',
        name: 'Feedback & Quality',
        standards: [
          { id: 'hsq-fq-1', text: 'Keep up to date weekly with feedbacks and actions on feedback' },
          { id: 'hsq-fq-2', text: 'Report to Senior management team – call meetings and set action points' },
          { id: 'hsq-fq-3', text: 'Analyse current reports with General Manager/Operations manager' },
          { id: 'hsq-fq-4', text: 'Monitor email inbox to make sure we communicate to the LVC standard' },
        ],
      },
      {
        id: 'hr-support',
        name: 'HR Support',
        standards: [
          { id: 'hsq-hr-1', text: 'Support with arrangement of appraisals' },
          { id: 'hsq-hr-2', text: 'Organise fact finding meetings for escalation matters' },
          { id: 'hsq-hr-3', text: 'Organise disciplinary meetings & annually review processes' },
          { id: 'hsq-hr-4', text: 'Annually set up review of holiday records on HR system' },
          { id: 'hsq-hr-5', text: 'Quarterly overlook HR system log in to make sure details are up to date' },
          { id: 'hsq-hr-6', text: 'Check drivers licenses annually' },
          { id: 'hsq-hr-7', text: 'Check points on licenses annually' },
          { id: 'hsq-hr-8', text: 'Check DBS and update - 6 monthly' },
          { id: 'hsq-hr-9', text: 'Assess need for new staff and place adverts' },
        ],
      },
    ],
  },
  'warehouse-assistant': {
    id: 'warehouse-assistant',
    title: 'Warehouse Assistant',
    department: 'Warehouse',
    version: '1.3',
    lastReviewed: '2025-12-02',
    sections: [
      {
        id: 'picking-dispatch',
        name: 'Picking & Dispatch',
        standards: [
          { id: 'wa-1', text: 'Booking in and allocation of items to Sales Orders' },
          { id: 'wa-2', text: 'Picking of Sales Orders (incomplete and complete)' },
          { id: 'wa-3', text: 'Dispatch Via DPD (On Time)' },
          { id: 'wa-4', text: 'Dispatch Via Fedex (On-Time)' },
          { id: 'wa-5', text: 'Booking and wrapping a Pallet for delivery' },
        ],
      },
      {
        id: 'warehouse-upkeep',
        name: 'Warehouse Upkeep',
        standards: [
          { id: 'wa-wu-1', text: 'Warehouse Inspections - Upkeep of various zones' },
          { id: 'wa-wu-2', text: 'Workshop booking in process being followed' },
        ],
      },
      {
        id: 'logistics',
        name: 'Logistics',
        standards: [
          { id: 'wa-lg-1', text: 'Adding deliveries/collections to Logistics Document' },
          { id: 'wa-lg-2', text: 'Chasing missing or lost deliveries with Couriers' },
        ],
      },
      {
        id: 'communication',
        name: 'Communication',
        standards: [
          { id: 'wa-cm-1', text: 'Customer enquiries acknowledged' },
          { id: 'wa-cm-2', text: 'Quote or query completed' },
          { id: 'wa-cm-3', text: 'Internal enquiries acknowledged' },
          { id: 'wa-cm-4', text: 'Email subject bar follows company guidance' },
          { id: 'wa-cm-5', text: 'Solution-focused and able to offer creative options' },
        ],
      },
    ],
  },
  'purchase-ledger-administrator': {
    id: 'purchase-ledger-administrator',
    title: 'Purchase Ledger Administrator',
    department: 'Finance',
    version: '1.2',
    lastReviewed: '2025-11-28',
    sections: [
      {
        id: 'invoicing-bills',
        name: 'Invoicing & Bills',
        standards: [
          { id: 'pla-1', text: 'Enter Bills and credit notes from suppliers' },
          { id: 'pla-2', text: 'Check and print online invoices - each month including log in and password' },
          { id: 'pla-3', text: 'Utilities bills log in - submit meter reading - first 5 days of the month' },
          { id: 'pla-4', text: 'Cross hire invoices/credit notes' },
          { id: 'pla-5', text: 'Numatic invoices - prepare spreadsheet for correct amount' },
        ],
      },
      {
        id: 'statements-reconciliation',
        name: 'Statements & Reconciliation',
        standards: [
          { id: 'pla-sr-1', text: 'Checking Statements' },
          { id: 'pla-sr-2', text: 'Checking Suppliers statements' },
          { id: 'pla-sr-3', text: 'Filing Bills once Simon has checked' },
        ],
      },
      {
        id: 'month-end',
        name: 'Month End',
        standards: [
          { id: 'pla-me-1', text: 'Closing the purchasing month in 7 working days' },
          { id: 'pla-me-2', text: 'Purchase ledger Email inbox' },
        ],
      },
      {
        id: 'customer-service',
        name: 'Customer Service',
        standards: [
          { id: 'pla-cs-1', text: 'Solution-focused and able to offer creative options to clients who need more assistance' },
        ],
      },
    ],
  },
  'operations-manager': {
    id: 'operations-manager',
    title: 'Operations Manager',
    department: 'Operations',
    version: '2.1',
    lastReviewed: '2025-11-25',
    sections: [
      {
        id: 'department-leadership',
        name: 'Department Leadership',
        standards: [
          { id: 'om-1', text: 'Key processes, procedures and standards are consistently met across department' },
          { id: 'om-2', text: 'Entire department understands and conforms with company values in everything they do' },
          { id: 'om-3', text: 'Customer Journey reviewed (clients and internal) finding ways to improve client satisfaction' },
          { id: 'om-4', text: 'Entire team is trained and continuously developing their knowledge and skills' },
          { id: 'om-5', text: 'Entire department has all the tools required to fulfil their role adequately' },
        ],
      },
      {
        id: 'compliance-reporting',
        name: 'Compliance & Reporting',
        standards: [
          { id: 'om-cr-1', text: 'Everyone in your department following H&S Guidelines' },
          { id: 'om-cr-2', text: 'Entire department Submitting monthly reports in on time' },
          { id: 'om-cr-3', text: 'Department policies are all written out, reviewed and updated regularly' },
          { id: 'om-cr-4', text: 'Communication policy is followed across department' },
          { id: 'om-cr-5', text: 'Department section of Protean is clear current & informative' },
        ],
      },
      {
        id: 'team-development',
        name: 'Team Development',
        standards: [
          { id: 'om-td-1', text: 'Induction for all new members (incl training schedule) is set up and followed' },
          { id: 'om-td-2', text: 'Periodic review meetings with your team' },
          { id: 'om-td-3', text: 'Monthly newsletter submitted on time each month' },
          { id: 'om-td-4', text: 'Additional support being requested wherever required' },
        ],
      },
      {
        id: 'operations',
        name: 'Operations',
        standards: [
          { id: 'om-op-1', text: 'Account Queries resolved regularly' },
          { id: 'om-op-2', text: 'Client & staff feedback being logged' },
          { id: 'om-op-3', text: 'Solution-focused and able to offer creative options' },
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

export function getRoleOptions(): { value: string; label: string; department: string }[] {
  return rolesList.map(role => ({
    value: role.id,
    label: role.title,
    department: role.department,
  }));
}

// Standards Survey data for Training Matrix (same structure)
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

// Convert role definitions to task definitions for Standards Survey
export const roleTaskDefinitions: Record<string, RoleTaskDefinition> = {};

Object.entries(roleDefinitions).forEach(([id, role]) => {
  roleTaskDefinitions[id] = {
    id: role.id,
    title: role.title,
    department: role.department,
    sections: role.sections.map(section => ({
      id: section.id,
      name: section.name,
      tasks: section.standards.map((std, idx) => ({
        id: std.id,
        text: std.text,
        isCritical: idx === 0,
        isNew: idx % 5 === 0,
      })),
    })),
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
