export interface Responsibility {
  id: string;
  title: string;
  description: string;
  procedures?: string[];
}

export interface ResponsibilitySection {
  id: string;
  name: string;
  responsibilities: Responsibility[];
}

export interface RoleDefinition {
  id: string;
  title: string;
  department: string;
  reportsTo: string;
  overview: string;
  sections: ResponsibilitySection[];
  acknowledgedDate?: string;
  acknowledgedBy?: string;
}

export const engineerRoleDefinition: RoleDefinition = {
  id: 'role-engineer',
  title: 'Service Engineer',
  department: 'Engineering',
  reportsTo: 'Operations Manager',
  overview: 'As a Service Engineer at LVC, you are responsible for the repair, maintenance, and servicing of industrial cleaning machines. You represent LVC to our customers and are expected to deliver high-quality workmanship while adhering to all safety protocols and company procedures.',
  sections: [
    {
      id: 'core-duties',
      name: 'Core Duties',
      responsibilities: [
        {
          id: 'r1',
          title: 'Machine Servicing & Repair',
          description: 'Diagnose faults, carry out repairs, and perform scheduled maintenance on all types of cleaning equipment.',
          procedures: ['Follow manufacturer service schedules', 'Complete job cards accurately', 'Document all parts used'],
        },
        {
          id: 'r2',
          title: 'Customer Interaction',
          description: 'Represent LVC professionally when on customer sites. Explain work completed and provide usage guidance.',
          procedures: ['Wear LVC uniform and PPE', 'Communicate clearly with site contacts', 'Leave work area clean and tidy'],
        },
        {
          id: 'r3',
          title: 'Vehicle & Tool Management',
          description: 'Maintain your service vehicle and tools in good working order. Complete daily van checks.',
          procedures: ['Daily van checklist', 'Report defects immediately', 'Keep van stocked with common parts'],
        },
      ],
    },
    {
      id: 'safety',
      name: 'Health & Safety',
      responsibilities: [
        {
          id: 'r4',
          title: 'Risk Assessments',
          description: 'Complete dynamic risk assessments before starting work. Follow LVC RAMS procedures.',
          procedures: ['Review site-specific hazards', 'Use appropriate PPE', 'Report unsafe conditions'],
        },
        {
          id: 'r5',
          title: 'Safe Working Practices',
          description: 'Follow all health and safety guidelines including manual handling, electrical safety, and COSHH.',
          procedures: ['Attend required safety training', 'Use correct lifting techniques', 'Handle chemicals per COSHH data sheets'],
        },
        {
          id: 'r6',
          title: 'Incident Reporting',
          description: 'Report all accidents, near-misses, and hazards promptly using the company reporting system.',
          procedures: ['Report within 24 hours', 'Complete incident forms fully', 'Cooperate with investigations'],
        },
      ],
    },
    {
      id: 'admin',
      name: 'Administrative Duties',
      responsibilities: [
        {
          id: 'r7',
          title: 'Job Documentation',
          description: 'Complete all Protean job records accurately and promptly, including time, parts, and work descriptions.',
          procedures: ['Update jobs same day', 'Add photos where helpful', 'Flag further work required'],
        },
        {
          id: 'r8',
          title: 'Timesheets',
          description: 'Submit accurate timesheets via Protean by end of each day.',
          procedures: ['Record start/finish times', 'Log travel time correctly', 'Submit before leaving'],
        },
        {
          id: 'r9',
          title: 'Communication',
          description: 'Check and respond to Teams messages and emails. Communicate schedule changes promptly.',
          procedures: ['Check Teams regularly', 'Respond within 4 hours', 'Call office for urgent matters'],
        },
      ],
    },
    {
      id: 'development',
      name: 'Professional Development',
      responsibilities: [
        {
          id: 'r10',
          title: 'Training Participation',
          description: 'Attend scheduled training sessions and complete required e-learning modules.',
          procedures: ['Complete training on time', 'Apply learning on the job', 'Share knowledge with colleagues'],
        },
        {
          id: 'r11',
          title: 'Skills Development',
          description: 'Actively work to improve competency levels as identified in your Training Matrix.',
          procedures: ['Review matrix quarterly', 'Request training for gaps', 'Seek mentoring from senior engineers'],
        },
      ],
    },
  ],
};

export const adminRoleDefinition: RoleDefinition = {
  id: 'role-admin',
  title: 'Service Administrator',
  department: 'Service Admin',
  reportsTo: 'Service Manager',
  overview: 'As a Service Administrator at LVC, you are the vital link between our customers, engineers, and management. You ensure smooth day-to-day operations by managing job scheduling, customer communications, and administrative processes.',
  sections: [
    {
      id: 'core-duties',
      name: 'Core Duties',
      responsibilities: [
        {
          id: 'a1',
          title: 'Job Scheduling',
          description: 'Schedule engineer visits efficiently, balancing customer needs with resource availability.',
          procedures: ['Use Protean scheduling', 'Confirm appointments with customers', 'Notify engineers of changes'],
        },
        {
          id: 'a2',
          title: 'Customer Communication',
          description: 'Handle inbound calls and emails professionally. Resolve queries or escalate appropriately.',
          procedures: ['Answer within 3 rings', 'Log all interactions', 'Follow up on outstanding items'],
        },
        {
          id: 'a3',
          title: 'Invoicing & Quotes',
          description: 'Process invoices accurately and prepare customer quotes as required.',
          procedures: ['Check job completion before invoicing', 'Apply correct pricing', 'Send within agreed timeframes'],
        },
      ],
    },
    {
      id: 'systems',
      name: 'Systems & Processes',
      responsibilities: [
        {
          id: 'a4',
          title: 'Protean Management',
          description: 'Maintain accurate data in Protean including customer records, job history, and engineer availability.',
          procedures: ['Update records promptly', 'Verify data accuracy', 'Report system issues'],
        },
        {
          id: 'a5',
          title: 'Parts Ordering',
          description: 'Process parts orders for engineers and maintain stock levels for common items.',
          procedures: ['Verify part numbers', 'Track delivery status', 'Update job records'],
        },
      ],
    },
  ],
};

export function getRoleForDepartment(department: string): RoleDefinition {
  if (department === 'Engineering') {
    return engineerRoleDefinition;
  }
  return adminRoleDefinition;
}
