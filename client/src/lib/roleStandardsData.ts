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
    department: 'Service',
    version: '2.3',
    lastReviewed: '2025-12-01',
    sections: [
      {
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'fse-p-1', text: 'Deliver exceptional on-site maintenance and repair services for industrial cleaning equipment, ensuring minimal downtime for customers and maintaining LVC\'s reputation for technical excellence.' },
        ],
      },
      {
        id: 'service-delivery',
        name: 'Service Delivery',
        standards: [
          { id: 'fse-sd-1', text: 'Carry out planned preventative maintenance and reactive breakdown repairs efficiently and to the highest standard.' },
          { id: 'fse-sd-2', text: 'Diagnose equipment faults accurately using technical knowledge, manufacturer documentation, and diagnostic tools.' },
          { id: 'fse-sd-3', text: 'Complete all job documentation on the same day, including accurate labour records, equipment notes, and recommendations for further work.' },
          { id: 'fse-sd-4', text: 'Fit appropriate consumables (bags, filters, chemicals) during service visits to maximise machine performance.' },
        ],
      },
      {
        id: 'planning-organisation',
        name: 'Planning & Organisation',
        standards: [
          { id: 'fse-po-1', text: 'Maintain firm plans for the following day and a working schedule for the coming week to ensure efficient route planning.' },
          { id: 'fse-po-2', text: 'Keep a list of backup jobs that can be attended at short notice to maximise productivity.' },
          { id: 'fse-po-3', text: 'Conduct pre-visit diagnosis to identify required parts and ensure they are available before attending site.' },
          { id: 'fse-po-4', text: 'Communicate proactively with the office when workload is running low or schedule changes are needed.' },
        ],
      },
      {
        id: 'customer-communication',
        name: 'Customer Communication',
        standards: [
          { id: 'fse-cc-1', text: 'Provide clear, professional debriefs to customers explaining work completed, parts used, and any recommendations.' },
          { id: 'fse-cc-2', text: 'Follow up on quotes exceeding £350 to explain costs and secure approval.' },
          { id: 'fse-cc-3', text: 'Make post-repair courtesy calls to confirm equipment is operating correctly and the customer is satisfied.' },
          { id: 'fse-cc-4', text: 'Notify customers promptly if unable to attend a scheduled visit, and arrange alternative appointments.' },
        ],
      },
      {
        id: 'equipment-presentation',
        name: 'Equipment & Professional Presentation',
        standards: [
          { id: 'fse-ep-1', text: 'Maintain van stock levels and report shortages promptly to ensure parts availability for jobs.' },
          { id: 'fse-ep-2', text: 'Wear LVC-branded workwear and carry appropriate PPE for all site visits.' },
          { id: 'fse-ep-3', text: 'Ensure all necessary tools are available and in good working condition.' },
          { id: 'fse-ep-4', text: 'Apply LVC service stickers to all machines serviced to reinforce brand visibility.' },
        ],
      },
      {
        id: 'administration',
        name: 'Administration',
        standards: [
          { id: 'fse-ad-1', text: 'Submit accurate timesheets daily via the tablet system.' },
          { id: 'fse-ad-2', text: 'Book all absences through HRONLINE with appropriate notice.' },
          { id: 'fse-ad-3', text: 'Update the Service Desk if unable to reach customers directly.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'sc-p-1', text: 'Coordinate all service operations to ensure engineers are efficiently deployed, customers receive timely communication, and service jobs are invoiced accurately within agreed timeframes.' },
        ],
      },
      {
        id: 'job-allocation',
        name: 'Job Allocation & Scheduling',
        standards: [
          { id: 'sc-ja-1', text: 'Log and allocate breakdown calls on the same day they are received, prioritising urgent customer needs.' },
          { id: 'sc-ja-2', text: 'Process further work requests on the same day to maintain service continuity.' },
          { id: 'sc-ja-3', text: 'Generate service visits at least two months before due date to allow adequate planning time.' },
          { id: 'sc-ja-4', text: 'Monitor engineer workloads daily to ensure balanced allocation and prevent bottlenecks.' },
          { id: 'sc-ja-5', text: 'Review the previous day\'s unattended jobs each morning to ensure nothing is missed.' },
        ],
      },
      {
        id: 'customer-service',
        name: 'Customer Service',
        standards: [
          { id: 'sc-cs-1', text: 'Acknowledge all customer enquiries on the same day of receipt.' },
          { id: 'sc-cs-2', text: 'Complete quotations within 24 hours of request.' },
          { id: 'sc-cs-3', text: 'Notify customers monthly of their upcoming scheduled service dates.' },
          { id: 'sc-cs-4', text: 'Provide estimated timeframes for parts on order and keep customers informed of progress.' },
        ],
      },
      {
        id: 'invoicing',
        name: 'Invoicing & Financial',
        standards: [
          { id: 'sc-inv-1', text: 'Invoice all completed service jobs within the same month of completion.' },
          { id: 'sc-inv-2', text: 'Invoice workshop jobs within the same month of completion.' },
          { id: 'sc-inv-3', text: 'Create service contracts on the same day as customer approval.' },
        ],
      },
      {
        id: 'administration',
        name: 'Administration & Systems',
        standards: [
          { id: 'sc-ad-1', text: 'Check the planner board daily to account for absences and adjust schedules accordingly.' },
          { id: 'sc-ad-2', text: 'Maintain email inbox at manageable levels with timely responses.' },
          { id: 'sc-ad-3', text: 'Follow company email subject line conventions for consistency and traceability.' },
          { id: 'sc-ad-4', text: 'Resolve engineer timesheet and tablet issues on the same day to prevent delays.' },
          { id: 'sc-ad-5', text: 'Maintain the department section of Protean with current, accurate information.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'slc-p-1', text: 'Drive revenue growth by identifying customer needs, presenting appropriate equipment solutions, and delivering exceptional pre- and post-sales support that builds lasting customer relationships.' },
        ],
      },
      {
        id: 'pipeline-management',
        name: 'Pipeline Management',
        standards: [
          { id: 'slc-pm-1', text: 'Add all sales opportunities to HubSpot with accurate information and realistic close dates.' },
          { id: 'slc-pm-2', text: 'Follow up on pipeline opportunities regularly to maintain momentum and close sales.' },
          { id: 'slc-pm-3', text: 'Log all meetings and customer interactions in HubSpot for visibility and reporting.' },
          { id: 'slc-pm-4', text: 'Send all formal proposals to proposals@lvcuk.com for record-keeping.' },
        ],
      },
      {
        id: 'customer-engagement',
        name: 'Customer Engagement',
        standards: [
          { id: 'slc-ce-1', text: 'Acknowledge all customer enquiries on the day of receipt.' },
          { id: 'slc-ce-2', text: 'Pre-qualify all demonstrations to ensure decision-makers will be present.' },
          { id: 'slc-ce-3', text: 'Send confirmation emails before all scheduled meetings to reduce no-shows.' },
          { id: 'slc-ce-4', text: 'Adopt a solution-focused approach, offering creative options to meet customer needs.' },
        ],
      },
      {
        id: 'demonstrations',
        name: 'Demonstrations & Equipment',
        standards: [
          { id: 'slc-dm-1', text: 'Maintain demonstration equipment in excellent condition to represent LVC\'s quality standards.' },
          { id: 'slc-dm-2', text: 'Book all demonstration and trial machines out on Protean before dispatch.' },
          { id: 'slc-dm-3', text: 'Ensure every loan or trial machine is signed for by the customer.' },
          { id: 'slc-dm-4', text: 'Operate a robust system to track accessories and identify any damage on return.' },
        ],
      },
      {
        id: 'post-sale',
        name: 'Post-Sale Support',
        standards: [
          { id: 'slc-ps-1', text: 'Provide user manuals, chemical data sheets, and training videos electronically with every sale.' },
          { id: 'slc-ps-2', text: 'Promote consumables (bags, chemicals, brushes) with every machine sale.' },
          { id: 'slc-ps-3', text: 'Offer service plans with every machine sale to ensure ongoing customer care.' },
          { id: 'slc-ps-4', text: 'Attend monthly product awareness sessions to maintain current product knowledge.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'wm-p-1', text: 'Manage all warehouse operations to ensure accurate stock control, efficient order fulfilment, and timely support for field engineers and other departments.' },
        ],
      },
      {
        id: 'stock-control',
        name: 'Stock Control',
        standards: [
          { id: 'wm-sc-1', text: 'Replenish engineer van stock on a weekly basis to ensure parts availability in the field.' },
          { id: 'wm-sc-2', text: 'Conduct annual engineer van stock takes to verify accuracy.' },
          { id: 'wm-sc-3', text: 'Complete regular stock room stock takes, organised by zone, to maintain inventory accuracy.' },
          { id: 'wm-sc-4', text: 'Perform periodic stock room inspections to ensure organisation and identify issues.' },
        ],
      },
      {
        id: 'operations',
        name: 'Operations',
        standards: [
          { id: 'wm-op-1', text: 'Manage the picking and dispatch of job stock issues efficiently and accurately.' },
          { id: 'wm-op-2', text: 'Process goods returns to suppliers and generate appropriate returns notes.' },
          { id: 'wm-op-3', text: 'Execute the parts-to-equipment process correctly in Protean.' },
          { id: 'wm-op-4', text: 'Create and supersede part numbers as required to maintain catalogue accuracy.' },
        ],
      },
      {
        id: 'department-standards',
        name: 'Department Standards',
        standards: [
          { id: 'wm-ds-1', text: 'Respond to internal and external enquiries promptly and professionally.' },
          { id: 'wm-ds-2', text: 'Set quarterly objectives (Rocks) and achieve at least 80% delivery.' },
          { id: 'wm-ds-3', text: 'Submit monthly department reports on time with accurate information.' },
          { id: 'wm-ds-4', text: 'Maintain the department section of Protean with clear, current information.' },
          { id: 'wm-ds-5', text: 'Deliver training to team members to a high standard when required.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'am-p-1', text: 'Oversee all financial operations including invoicing, credit control, payroll, and bank reconciliation, ensuring accurate records, timely payments, and compliance with statutory requirements.' },
        ],
      },
      {
        id: 'invoicing-credit',
        name: 'Invoicing & Credit Control',
        standards: [
          { id: 'am-ic-1', text: 'Process invoices and credit notes accurately and in a timely manner.' },
          { id: 'am-ic-2', text: 'Maintain the machine sale register with invoice numbers, serial numbers, and relevant details.' },
          { id: 'am-ic-3', text: 'Raise long-term contract invoices each month without delay.' },
          { id: 'am-ic-4', text: 'Manage aged debt proactively and chase outstanding payments systematically.' },
          { id: 'am-ic-5', text: 'Oversee major contract renewals and ensure timely invoicing upon service completion.' },
        ],
      },
      {
        id: 'banking',
        name: 'Banking & Reconciliation',
        standards: [
          { id: 'am-bk-1', text: 'Check all bank account balances each morning and report any concerns.' },
          { id: 'am-bk-2', text: 'Reconcile customer payments from bank statements daily.' },
          { id: 'am-bk-3', text: 'Complete bank reconciliations for all accounts regularly.' },
          { id: 'am-bk-4', text: 'Process BACS, cheque, and card payments accurately.' },
        ],
      },
      {
        id: 'payroll-statutory',
        name: 'Payroll & Statutory Compliance',
        standards: [
          { id: 'am-ps-1', text: 'Process wages and bonuses for engineers, sales staff, and hire department accurately and on time.' },
          { id: 'am-ps-2', text: 'Manage employee expenses, floats, and loans correctly.' },
          { id: 'am-ps-3', text: 'Prepare and submit VAT returns within statutory deadlines.' },
          { id: 'am-ps-4', text: 'Track and report PAYE obligations through the appropriate channels.' },
          { id: 'am-ps-5', text: 'Chase and process credit card receipts to ensure VAT recovery.' },
        ],
      },
      {
        id: 'team-leadership',
        name: 'Team Leadership',
        standards: [
          { id: 'am-tl-1', text: 'Ensure key processes and standards are consistently met across the finance department.' },
          { id: 'am-tl-2', text: 'Develop team members through regular training and performance discussions.' },
          { id: 'am-tl-3', text: 'Conduct periodic review meetings and annual appraisals with team members.' },
          { id: 'am-tl-4', text: 'Submit monthly department newsletters on time.' },
          { id: 'am-tl-5', text: 'Support directors with cashflow reports, work issues, and strategic financial information.' },
        ],
      },
    ],
  },
  'workshop-manager': {
    id: 'workshop-manager',
    title: 'Workshop Manager / Senior Service Engineer',
    department: 'Workshop',
    version: '1.9',
    lastReviewed: '2025-11-28',
    sections: [
      {
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'wsm-p-1', text: 'Lead workshop operations to deliver efficient machine repairs, maintain high-quality standards, and coordinate logistics activities while supporting the wider engineering team.' },
        ],
      },
      {
        id: 'workshop-operations',
        name: 'Workshop Operations',
        standards: [
          { id: 'wsm-wo-1', text: 'Manage the workshop booking-in process, including logging machines in the book, applying tags, and linking job numbers in Protean.' },
          { id: 'wsm-wo-2', text: 'Create jobs and equipment records on Protean accurately and promptly.' },
          { id: 'wsm-wo-3', text: 'Repair machines efficiently to minimise turnaround time while maintaining quality.' },
          { id: 'wsm-wo-4', text: 'Maintain the workshop to high standards of cleanliness and organisation.' },
          { id: 'wsm-wo-5', text: 'Conduct regular workshop inspections and address any issues identified.' },
        ],
      },
      {
        id: 'customer-quotes',
        name: 'Customer Communication & Quotations',
        standards: [
          { id: 'wsm-cq-1', text: 'Acknowledge customer enquiries promptly and provide professional responses.' },
          { id: 'wsm-cq-2', text: 'Prepare quotations with supporting phone calls to explain work required.' },
          { id: 'wsm-cq-3', text: 'Follow up on expensive quotes to answer questions and secure approval.' },
          { id: 'wsm-cq-4', text: 'Chase outstanding job parts internally to prevent delays.' },
        ],
      },
      {
        id: 'logistics',
        name: 'Logistics Coordination',
        standards: [
          { id: 'wsm-lg-1', text: 'Create and publish logistics routes by 3:00 PM daily.' },
          { id: 'wsm-lg-2', text: 'Monitor and manage logistics activities across LVC operations.' },
          { id: 'wsm-lg-3', text: 'Book in hire machines and collect on contract as required.' },
        ],
      },
      {
        id: 'department-leadership',
        name: 'Department Leadership',
        standards: [
          { id: 'wsm-dl-1', text: 'Set quarterly objectives (Rocks) and achieve at least 80% delivery.' },
          { id: 'wsm-dl-2', text: 'Ensure monthly department reports are submitted on time.' },
          { id: 'wsm-dl-3', text: 'Maintain written department policies and review them regularly.' },
          { id: 'wsm-dl-4', text: 'Deliver technical training to engineers on a set monthly schedule.' },
          { id: 'wsm-dl-5', text: 'Ensure the department section of Protean is current and informative.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'dd-p-1', text: 'Execute deliveries and collections efficiently and safely, while representing LVC professionally on customer sites and providing equipment training when required.' },
        ],
      },
      {
        id: 'route-preparation',
        name: 'Route Preparation',
        standards: [
          { id: 'dd-rp-1', text: 'Contact customers the day before scheduled deliveries to confirm appointments.' },
          { id: 'dd-rp-2', text: 'Review planned routes using the logistics system and plan efficient journeys.' },
          { id: 'dd-rp-3', text: 'Gather all required paperwork from relevant departments before departure.' },
          { id: 'dd-rp-4', text: 'Perform pre-dispatch checks to ensure all vital information is included.' },
          { id: 'dd-rp-5', text: 'Load the van in the correct order for the planned route.' },
        ],
      },
      {
        id: 'on-site',
        name: 'On-Site Delivery',
        standards: [
          { id: 'dd-os-1', text: 'Call each site when departing to provide accurate arrival estimates.' },
          { id: 'dd-os-2', text: 'Locate the designated site contact upon arrival and complete handover professionally.' },
          { id: 'dd-os-3', text: 'Request customers empty waste tanks before loading machines onto the van.' },
          { id: 'dd-os-4', text: 'Follow correct loading and unloading procedures to prevent damage.' },
        ],
      },
      {
        id: 'training',
        name: 'Customer Training',
        standards: [
          { id: 'dd-tr-1', text: 'Deliver on-site equipment training and demonstrations to a high standard.' },
          { id: 'dd-tr-2', text: 'Answer customer questions confidently and accurately.' },
          { id: 'dd-tr-3', text: 'Adopt a solution-focused approach to address customer concerns.' },
        ],
      },
      {
        id: 'timing',
        name: 'Timing & Scheduling',
        standards: [
          { id: 'dd-tm-1', text: 'Complete routes on time to allow afternoon loading for the following day.' },
          { id: 'dd-tm-2', text: 'Depart by 7:00 AM when the van is pre-loaded from the previous day.' },
          { id: 'dd-tm-3', text: 'Depart LVC by 9:00 AM when loading is required on the day.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'hdm-p-1', text: 'Lead the hire department to maximise fleet utilisation, deliver excellent customer service, and ensure all hire operations run smoothly from initial enquiry through to off-hire.' },
        ],
      },
      {
        id: 'hire-operations',
        name: 'Hire Operations',
        standards: [
          { id: 'hdm-ho-1', text: 'Process hire requests promptly and ensure all quotes are issued in writing.' },
          { id: 'hdm-ho-2', text: 'Maintain the hire fleet in excellent condition and ensure it meets customer demand.' },
          { id: 'hdm-ho-3', text: 'Ensure all hire machines are regularly serviced and carry correct H-number identification.' },
          { id: 'hdm-ho-4', text: 'Issue hire contracts in writing and obtain customer agreement before dispatch.' },
        ],
      },
      {
        id: 'customer-support',
        name: 'Customer Support',
        standards: [
          { id: 'hdm-cs-1', text: 'Provide user manuals, chemical data sheets, and training videos electronically with every hire.' },
          { id: 'hdm-cs-2', text: 'Supply laminated user guides physically with each machine.' },
          { id: 'hdm-cs-3', text: 'Promote consumables with every hire to enhance customer experience.' },
          { id: 'hdm-cs-4', text: 'Operate systems to track accessories and charge for any damage appropriately.' },
        ],
      },
      {
        id: 'invoicing',
        name: 'Invoicing & Off-Hire',
        standards: [
          { id: 'hdm-inv-1', text: 'Complete all invoicing within the correct month.' },
          { id: 'hdm-inv-2', text: 'Send off-hire reports to customers within 72 hours of machine return.' },
          { id: 'hdm-inv-3', text: 'Ensure machines are not left on customer sites beyond the agreed hire period.' },
        ],
      },
      {
        id: 'pipeline',
        name: 'Pipeline & CRM',
        standards: [
          { id: 'hdm-pl-1', text: 'Add all hire opportunities to HubSpot and follow up regularly.' },
          { id: 'hdm-pl-2', text: 'Log meetings and send proposals to proposals@lvcuk.com for record-keeping.' },
          { id: 'hdm-pl-3', text: 'Add potential hires to the logistics spreadsheet for planning purposes.' },
        ],
      },
      {
        id: 'team-leadership',
        name: 'Team Leadership',
        standards: [
          { id: 'hdm-tl-1', text: 'Ensure departmental processes and standards are consistently met.' },
          { id: 'hdm-tl-2', text: 'Develop team members through training and regular review meetings.' },
          { id: 'hdm-tl-3', text: 'Conduct annual appraisals and submit monthly newsletters on time.' },
          { id: 'hdm-tl-4', text: 'Hold recurring meetings with Accounts, Service, and Workshop departments.' },
          { id: 'hdm-tl-5', text: 'Submit business cases for new machine requirements with appropriate justification.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'itp-p-1', text: 'Maintain reliable IT infrastructure that supports business operations, while managing procurement activities to ensure timely availability of parts and equipment.' },
        ],
      },
      {
        id: 'infrastructure',
        name: 'IT Infrastructure',
        standards: [
          { id: 'itp-if-1', text: 'Maintain disaster recovery plans and ensure business continuity capability.' },
          { id: 'itp-if-2', text: 'Manage virus protection and security systems across the organisation.' },
          { id: 'itp-if-3', text: 'Maintain desktop computers, mobile phones, and tablets in good working order.' },
          { id: 'itp-if-4', text: 'Ensure servers are operating correctly and file storage is organised efficiently.' },
          { id: 'itp-if-5', text: 'Manage the VOIP telephone system and resolve issues promptly.' },
        ],
      },
      {
        id: 'systems',
        name: 'Business Systems',
        standards: [
          { id: 'itp-bs-1', text: 'Maintain Protean system functionality and keep pricing data current.' },
          { id: 'itp-bs-2', text: 'Support Microsoft Teams and other collaboration tools.' },
          { id: 'itp-bs-3', text: 'Review hardware and software regularly to identify productivity improvements.' },
          { id: 'itp-bs-4', text: 'Resolve day-to-day user IT issues efficiently to minimise disruption.' },
        ],
      },
      {
        id: 'procurement',
        name: 'Procurement',
        standards: [
          { id: 'itp-pr-1', text: 'Create purchase orders regularly to fulfil demand and maintain stock levels.' },
          { id: 'itp-pr-2', text: 'Split purchase orders appropriately between urgent demand and stock replenishment.' },
          { id: 'itp-pr-3', text: 'Monitor parts outstanding by supplier and chase overdue deliveries.' },
        ],
      },
      {
        id: 'administration',
        name: 'Administration',
        standards: [
          { id: 'itp-ad-1', text: 'Respond to internal and external enquiries promptly and professionally.' },
          { id: 'itp-ad-2', text: 'Follow company email conventions and maintain organised communications.' },
          { id: 'itp-ad-3', text: 'Keep the department section of Protean current and informative.' },
          { id: 'itp-ad-4', text: 'Resolve account queries in a timely manner.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'hsq-p-1', text: 'Champion health, safety, and quality standards across LVC, ensuring compliance with regulations, supporting continuous improvement, and maintaining a safe working environment for all employees.' },
        ],
      },
      {
        id: 'health-safety',
        name: 'Health & Safety Management',
        standards: [
          { id: 'hsq-hs-1', text: 'Review risk assessments annually and update as required.' },
          { id: 'hsq-hs-2', text: 'Liaise with Peninsula for annual monitoring of the company H&S policy.' },
          { id: 'hsq-hs-3', text: 'Monitor accident and incident logging monthly and ensure all events are recorded.' },
          { id: 'hsq-hs-4', text: 'Discuss preventive actions with management quarterly to reduce future incidents.' },
          { id: 'hsq-hs-5', text: 'Organise annual fire drills and ensure fire-fighting equipment is serviced.' },
          { id: 'hsq-hs-6', text: 'Report RIDDOR-notifiable incidents within statutory timeframes.' },
          { id: 'hsq-hs-7', text: 'Act on safety issues within 24 hours of being raised.' },
        ],
      },
      {
        id: 'compliance',
        name: 'Compliance & Accreditation',
        standards: [
          { id: 'hsq-ca-1', text: 'Complete accreditation documentation annually, including SafeContractor and customer requirements.' },
          { id: 'hsq-ca-2', text: 'Conduct random site visits with engineers, hire installations, and sales demonstrations.' },
          { id: 'hsq-ca-3', text: 'Review and link all LVC policies to processes and procedures.' },
          { id: 'hsq-ca-4', text: 'Support managers in developing and documenting departmental procedures.' },
        ],
      },
      {
        id: 'training',
        name: 'Training & Development',
        standards: [
          { id: 'hsq-td-1', text: 'Support the Operations Manager in maintaining the training matrix, particularly safety aspects.' },
          { id: 'hsq-td-2', text: 'Ensure training aligns with strategic business goals.' },
          { id: 'hsq-td-3', text: 'Oversee performance training matrices and contribute to budget discussions.' },
          { id: 'hsq-td-4', text: 'Identify and arrange training to address staff development needs.' },
        ],
      },
      {
        id: 'hr-support',
        name: 'HR Support',
        standards: [
          { id: 'hsq-hr-1', text: 'Support the arrangement of staff appraisals.' },
          { id: 'hsq-hr-2', text: 'Organise fact-finding and disciplinary meetings as required.' },
          { id: 'hsq-hr-3', text: 'Review holiday records annually on the HR system.' },
          { id: 'hsq-hr-4', text: 'Check driver licences and points annually.' },
          { id: 'hsq-hr-5', text: 'Update DBS checks every six months.' },
          { id: 'hsq-hr-6', text: 'Assess staffing needs and manage recruitment advertising.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'wa-p-1', text: 'Support warehouse operations by accurately picking, packing, and dispatching orders while maintaining high standards of organisation and customer service.' },
        ],
      },
      {
        id: 'order-fulfilment',
        name: 'Order Fulfilment',
        standards: [
          { id: 'wa-of-1', text: 'Book in deliveries and allocate items to sales orders accurately.' },
          { id: 'wa-of-2', text: 'Pick sales orders completely and accurately, whether partial or complete.' },
          { id: 'wa-of-3', text: 'Dispatch orders via DPD and FedEx on time and with correct documentation.' },
          { id: 'wa-of-4', text: 'Prepare and wrap pallets correctly for delivery.' },
        ],
      },
      {
        id: 'warehouse-maintenance',
        name: 'Warehouse Maintenance',
        standards: [
          { id: 'wa-wm-1', text: 'Maintain cleanliness and organisation across all warehouse zones.' },
          { id: 'wa-wm-2', text: 'Follow the workshop booking-in process correctly.' },
        ],
      },
      {
        id: 'logistics',
        name: 'Logistics Support',
        standards: [
          { id: 'wa-lg-1', text: 'Add deliveries and collections to the logistics document promptly.' },
          { id: 'wa-lg-2', text: 'Chase missing or lost deliveries with courier companies.' },
        ],
      },
      {
        id: 'communication',
        name: 'Communication',
        standards: [
          { id: 'wa-cm-1', text: 'Acknowledge customer and internal enquiries promptly.' },
          { id: 'wa-cm-2', text: 'Complete quotes and queries accurately.' },
          { id: 'wa-cm-3', text: 'Follow company email subject line conventions.' },
          { id: 'wa-cm-4', text: 'Adopt a solution-focused approach to resolving issues.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'pla-p-1', text: 'Manage the purchase ledger function accurately and efficiently, ensuring supplier invoices are processed correctly and the purchasing month is closed within agreed timeframes.' },
        ],
      },
      {
        id: 'invoice-processing',
        name: 'Invoice Processing',
        standards: [
          { id: 'pla-ip-1', text: 'Enter supplier bills and credit notes accurately into the system.' },
          { id: 'pla-ip-2', text: 'Check and print online invoices monthly, including logging in with correct credentials.' },
          { id: 'pla-ip-3', text: 'Submit utility meter readings within the first five working days of each month.' },
          { id: 'pla-ip-4', text: 'Process cross-hire invoices and credit notes correctly.' },
          { id: 'pla-ip-5', text: 'Prepare Numatic invoice spreadsheets with accurate amounts.' },
        ],
      },
      {
        id: 'reconciliation',
        name: 'Statement Reconciliation',
        standards: [
          { id: 'pla-sr-1', text: 'Check supplier statements regularly and investigate discrepancies.' },
          { id: 'pla-sr-2', text: 'File bills promptly once approved by the Accounts Manager.' },
        ],
      },
      {
        id: 'month-end',
        name: 'Month End',
        standards: [
          { id: 'pla-me-1', text: 'Close the purchasing month within seven working days of month end.' },
          { id: 'pla-me-2', text: 'Maintain the purchase ledger email inbox and respond to queries promptly.' },
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
        id: 'purpose',
        name: 'Role Purpose',
        standards: [
          { id: 'om-p-1', text: 'Lead operational departments to deliver excellent customer service, drive continuous improvement, and ensure staff are trained, equipped, and motivated to perform at their best.' },
        ],
      },
      {
        id: 'department-leadership',
        name: 'Department Leadership',
        standards: [
          { id: 'om-dl-1', text: 'Ensure key processes, procedures, and standards are consistently met across all operational departments.' },
          { id: 'om-dl-2', text: 'Foster a culture where company values are understood and demonstrated in all activities.' },
          { id: 'om-dl-3', text: 'Review the customer journey regularly to identify opportunities for improvement.' },
          { id: 'om-dl-4', text: 'Ensure all team members have the tools and equipment required to fulfil their roles effectively.' },
        ],
      },
      {
        id: 'people-development',
        name: 'People Development',
        standards: [
          { id: 'om-pd-1', text: 'Ensure all staff are trained and continuously developing their knowledge and skills.' },
          { id: 'om-pd-2', text: 'Establish and follow comprehensive induction programmes for new team members.' },
          { id: 'om-pd-3', text: 'Hold periodic review meetings to discuss performance and development.' },
          { id: 'om-pd-4', text: 'Submit monthly department newsletters on time.' },
        ],
      },
      {
        id: 'compliance',
        name: 'Compliance & Reporting',
        standards: [
          { id: 'om-cr-1', text: 'Ensure health and safety guidelines are followed throughout operations.' },
          { id: 'om-cr-2', text: 'Ensure monthly reports are submitted on time across all departments.' },
          { id: 'om-cr-3', text: 'Maintain written department policies and review them regularly.' },
          { id: 'om-cr-4', text: 'Keep the department section of Protean current and informative.' },
        ],
      },
      {
        id: 'customer-focus',
        name: 'Customer Focus',
        standards: [
          { id: 'om-cf-1', text: 'Resolve account queries promptly and professionally.' },
          { id: 'om-cf-2', text: 'Log and act on customer and staff feedback systematically.' },
          { id: 'om-cf-3', text: 'Encourage solution-focused approaches throughout the team.' },
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

// Standards Survey data for Training Matrix
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
