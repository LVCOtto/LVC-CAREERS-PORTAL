import { db } from "./db";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const existingUsers = await db.select().from(schema.users);
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  await db.insert(schema.users).values([
    { id: "admin-1", username: "admin", password: "admin", name: "Sarah Mitchell", email: "sarah.mitchell@lvc.com", role: "admin", jobRole: "HR Director", department: "Human Resources", startDate: "2019-03-15" },
    { id: "manager-1", username: "manager1", password: "manager", name: "James Wilson", email: "james.wilson@lvc.com", role: "manager", jobRole: "Operations Manager", department: "Operations", startDate: "2020-06-01" },
    { id: "manager-2", username: "manager2", password: "manager", name: "Emma Thompson", email: "emma.thompson@lvc.com", role: "manager", jobRole: "Engineering Lead", department: "Engineering", startDate: "2020-09-14" },
    { id: "colleague-1", username: "colleague1", password: "colleague", name: "Michael Chen", email: "michael.chen@lvc.com", role: "colleague", jobRole: "Engineer", department: "Engineering", managerId: "manager-2", startDate: "2024-11-01" },
    { id: "colleague-2", username: "colleague2", password: "colleague", name: "Sophie Williams", email: "sophie.williams@lvc.com", role: "colleague", jobRole: "Engineer", department: "Engineering", managerId: "manager-2", startDate: "2024-08-15" },
    { id: "colleague-3", username: "colleague3", password: "colleague", name: "David Brown", email: "david.brown@lvc.com", role: "colleague", jobRole: "Operations Coordinator", department: "Operations", managerId: "manager-1", startDate: "2024-10-01" },
    { id: "colleague-4", username: "colleague4", password: "colleague", name: "Lisa Martinez", email: "lisa.martinez@lvc.com", role: "colleague", jobRole: "Operations Coordinator", department: "Operations", managerId: "manager-1", startDate: "2023-05-20" },
    { id: "colleague-5", username: "colleague5", password: "colleague", name: "Tom Harris", email: "tom.harris@lvc.com", role: "colleague", jobRole: "Engineer", department: "Engineering", managerId: "manager-2", startDate: "2024-01-08" },
    { id: "colleague-6", username: "colleague6", password: "colleague", name: "Rachel Green", email: "rachel.green@lvc.com", role: "colleague", jobRole: "Operations Coordinator", department: "Operations", managerId: "manager-1", startDate: "2024-12-02" },
    { id: "architect-1", username: "architect", password: "architect", name: "Portal Architect", email: "architect@lvc.com", role: "architect", jobRole: "Portal Architect", department: "IT", startDate: "2024-01-01", requiresInduction: false },
  ]);
  console.log("Users seeded");

  const inductionData = [
    { slug: "ind-1", section: "1. Pre-Start Setup", title: "Contract issued and signed", description: "Employment contract and job description issued and signed", requiresEvidence: true, sortOrder: 1 },
    { slug: "ind-2", section: "1. Pre-Start Setup", title: "Right to Work and payroll setup", description: "Right to Work check, NI number, bank details, emergency contact collected and payroll confirmed", requiresEvidence: true, sortOrder: 2 },
    { slug: "ind-3", section: "1. Pre-Start Setup", title: "IT & systems access configured", description: "LVC email, Protean login, CRM access set up", requiresEvidence: false, sortOrder: 3 },
    { slug: "ind-4", section: "1. Pre-Start Setup", title: "Equipment issued", description: "Phone/laptop/tablet, uniform, PPE, ID badge issued as required for role", requiresEvidence: false, sortOrder: 4 },
    { slug: "ind-5", section: "1. Pre-Start Setup", title: "Line manager and buddy assigned", description: "Line manager confirmed and buddy/mentor allocated", requiresEvidence: false, sortOrder: 5 },
    { slug: "ind-6", section: "2. Day 1 – Welcome", title: "Welcome from line manager", description: "Introductions to team members and initial role overview", requiresEvidence: false, sortOrder: 6 },
    { slug: "ind-7", section: "2. Day 1 – Welcome", title: "Site tour completed", description: "Tour of offices, workshop, warehouse and all facilities", requiresEvidence: false, sortOrder: 7 },
    { slug: "ind-8", section: "2. Day 1 – Welcome", title: "LVC company overview", description: "LVC history, what we do (sales, hire, service, spares, training), key customer sectors, service-led approach", requiresEvidence: false, sortOrder: 8 },
    { slug: "ind-9", section: "2. Day 1 – Welcome", title: "Working hours and breaks explained", description: "Working hours, break times and scheduling expectations confirmed", requiresEvidence: false, sortOrder: 9 },
    { slug: "ind-10", section: "3. Health, Safety & Compliance", title: "Health & Safety policy briefing", description: "H&S policy explained, fire exits, alarms and muster points shown", requiresEvidence: true, sortOrder: 10 },
    { slug: "ind-11", section: "3. Health, Safety & Compliance", title: "First aiders and accident reporting", description: "First aiders identified, accident and near-miss reporting process explained", requiresEvidence: false, sortOrder: 11 },
    { slug: "ind-12", section: "3. Health, Safety & Compliance", title: "Manual handling training", description: "Manual handling training completed", requiresEvidence: true, sortOrder: 12 },
    { slug: "ind-13", section: "3. Health, Safety & Compliance", title: "PPE and COSHH awareness", description: "PPE expectations and COSHH awareness (chemicals, detergents) explained", requiresEvidence: false, sortOrder: 13 },
    { slug: "ind-14", section: "3. Health, Safety & Compliance", title: "Role-specific safety (if applicable)", description: "Lone working policy, driving policy, vehicle checks, NHS site expectations", requiresEvidence: false, sortOrder: 14 },
    { slug: "ind-15", section: "4. Systems & Processes", title: "Protean system overview", description: "Asset numbers, CEAL, job sheets, service reports, parts fitted and reporting accuracy", requiresEvidence: false, sortOrder: 15 },
    { slug: "ind-16", section: "4. Systems & Processes", title: "CRM and admin systems training", description: "CRM overview, customer records, logging calls/visits/follow-ups", requiresEvidence: false, sortOrder: 16 },
    { slug: "ind-17", section: "4. Systems & Processes", title: "Expenses and timesheets", description: "Expenses process and timesheet submission explained", requiresEvidence: false, sortOrder: 17 },
    { slug: "ind-18", section: "5. Role-Specific Induction", title: "Role responsibilities explained", description: "What 'good' looks like at LVC, first 30-60-90 day expectations discussed", requiresEvidence: false, sortOrder: 18 },
    { slug: "ind-19", section: "5. Role-Specific Induction", title: "KPIs and performance measures", description: "Key performance indicators and success measures for the role", requiresEvidence: false, sortOrder: 19 },
    { slug: "ind-20", section: "5. Role-Specific Induction", title: "Department processes", description: "How your department interacts with others, escalation routes, documentation expectations", requiresEvidence: false, sortOrder: 20 },
    { slug: "ind-21", section: "6. Product & Market Knowledge", title: "Key manufacturers and product categories", description: "Overview of key partners, scrubbers, sweepers, pressure washers, steam equipment etc.", requiresEvidence: false, sortOrder: 21 },
    { slug: "ind-22", section: "6. Product & Market Knowledge", title: "Sales, hire and service models", description: "Understanding the differences between sales, hire and service offerings", requiresEvidence: false, sortOrder: 22 },
    { slug: "ind-23", section: "6. Product & Market Knowledge", title: "LVC differentiators", description: "Typical customer challenges, our solutions, and how we differ from competitors", requiresEvidence: false, sortOrder: 23 },
    { slug: "ind-24", section: "7. Practical Training & Shadowing", title: "Shadow experienced team member", description: "Observe customer interactions and day-to-day work", requiresEvidence: false, sortOrder: 24 },
    { slug: "ind-25", section: "7. Practical Training & Shadowing", title: "Equipment demonstrations observed", description: "Attend equipment demonstrations and workshop/site visits", requiresEvidence: false, sortOrder: 25 },
    { slug: "ind-26", section: "7. Practical Training & Shadowing", title: "Ride-along completed (if applicable)", description: "Ride-along with sales/service staff to observe customer visits", requiresEvidence: false, sortOrder: 26 },
    { slug: "ind-27", section: "8. Culture & Ways of Working", title: "LVC values understood", description: "LVC values in practice, teamwork, ownership and accountability", requiresEvidence: false, sortOrder: 27 },
    { slug: "ind-28", section: "8. Culture & Ways of Working", title: "Continuous improvement mindset", description: "Marginal gains philosophy, customer-first thinking, professionalism on sites", requiresEvidence: false, sortOrder: 28 },
    { slug: "ind-29", section: "9. Probation & Development", title: "Probation period explained", description: "Probation terms, review dates set, feedback process explained", requiresEvidence: false, sortOrder: 29 },
    { slug: "ind-30", section: "9. Probation & Development", title: "Training plan agreed", description: "Initial training plan and development goals documented", requiresEvidence: true, sortOrder: 30 },
    { slug: "ind-31", section: "10. Check-Ins & Reviews", title: "End of Week 1 check-in", description: "Informal check-in completed, questions answered, training gaps identified", requiresEvidence: false, sortOrder: 31 },
    { slug: "ind-32", section: "10. Check-Ins & Reviews", title: "End of Month 1 review", description: "Performance feedback, role understanding confirmed, culture fit check", requiresEvidence: true, sortOrder: 32 },
    { slug: "ind-33", section: "10. Check-Ins & Reviews", title: "Probation review meeting", description: "Formal review of probation period progress and next steps agreed", requiresEvidence: true, sortOrder: 33 },
  ];
  await db.insert(schema.inductionTemplateItems).values(inductionData);
  console.log("Induction templates seeded");

  const templateItems = await db.select().from(schema.inductionTemplateItems);

  const [instance1] = await db.insert(schema.inductionInstances).values({
    userId: "colleague-1",
    templateName: "Standard Induction",
    status: "in_progress",
    createdDate: "2024-11-01",
  }).returning();

  const completedSlugs = ["ind-1","ind-2","ind-3","ind-4","ind-5","ind-6","ind-7","ind-8","ind-9","ind-10","ind-11"];
  const completionDates: Record<string, { date: string; signedOffBy?: string; signedOffDate?: string }> = {
    "ind-1": { date: "2024-10-28", signedOffBy: "manager-2", signedOffDate: "2024-10-28" },
    "ind-2": { date: "2024-10-30", signedOffBy: "manager-2", signedOffDate: "2024-10-30" },
    "ind-3": { date: "2024-10-31" },
    "ind-4": { date: "2024-11-01" },
    "ind-5": { date: "2024-10-31" },
    "ind-6": { date: "2024-11-01", signedOffBy: "manager-2", signedOffDate: "2024-11-01" },
    "ind-7": { date: "2024-11-01" },
    "ind-8": { date: "2024-11-01" },
    "ind-9": { date: "2024-11-01" },
    "ind-10": { date: "2024-11-01", signedOffBy: "manager-2", signedOffDate: "2024-11-01" },
    "ind-11": { date: "2024-11-01" },
  };

  for (const tmpl of templateItems) {
    if (completedSlugs.includes(tmpl.slug)) {
      const cd = completionDates[tmpl.slug];
      await db.insert(schema.inductionItemCompletions).values({
        instanceId: instance1.id,
        templateItemId: tmpl.id,
        completed: true,
        completedDate: cd.date,
        signedOffBy: cd.signedOffBy || null,
        signedOffDate: cd.signedOffDate || null,
      });
    }
  }
  console.log("Induction instance + completions seeded");

  const engineeringCategories = [
    { slug: "safety", name: "Occupational Safety and Health", departmentType: "engineering", sortOrder: 1,
      items: [
        { slug: "manual-handling", name: "Manual Handling" }, { slug: "safe-loads", name: "Safe securing of loads" },
        { slug: "lone-working", name: "Lone working" }, { slug: "noise", name: "Noise" },
        { slug: "dust-protection", name: "Dust - mask protection" }, { slug: "hand-tools", name: "Use of Hand tools" },
        { slug: "coshh", name: "Chemical COSHH training" }, { slug: "van-safety", name: "Transport - Van safety, Van checklist" },
        { slug: "safe-driving", name: "Driving spatial awareness - Safe driving" }, { slug: "slips-trips", name: "Slips, trips and falls" },
        { slug: "accident-reporting", name: "Accident & Hazard reporting" }, { slug: "electrical-safety", name: "Electrical Safety" },
        { slug: "battery-safety", name: "Battery Safety (including transport and storage)" }, { slug: "rams", name: "Following LVC RAMS procedure" },
        { slug: "stress", name: "Stress" }, { slug: "ppe", name: "PPE - use of" }, { slug: "pat-testing", name: "PAT Testing" },
      ]},
    { slug: "operations", name: "Operational Processes and Communication", departmentType: "engineering", sortOrder: 2,
      items: [
        { slug: "protean-jobs", name: "Use of Protean - Completing Jobs and Adding Parts" },
        { slug: "prepare-quote", name: "Prepare quote (Further Work Required)" },
        { slug: "plan-workload", name: "Plan workload (View Jobs + Book in)" },
        { slug: "job-process", name: "Process before/after finishing each job" },
        { slug: "method-statement", name: "Adhering to Method statement - Safe method of work" },
        { slug: "order-parts", name: "Order of parts/consumables" },
        { slug: "timesheet", name: "Protean Timesheet" },
        { slug: "workshop-booking", name: "Booking in at workshop - return & communication" },
        { slug: "comms-policy", name: "Communication Policy" },
        { slug: "ms-teams", name: "Microsoft Teams" },
      ]},
    { slug: "vacuums", name: "Technical Expertise - Vacuums", departmentType: "engineering", sortOrder: 3,
      items: [
        { slug: "tub-vacuum-repair", name: "Tub vacuum/backpack - Repair and Service" },
        { slug: "tub-vacuum-operation", name: "Tub vacuum/backpack - Safe Operation" },
        { slug: "upright-vacuum-repair", name: "Upright Vacuum - Repair and Service" },
        { slug: "upright-vacuum-operation", name: "Upright Vacuum - Safe Operation" },
      ]},
    { slug: "buffers-carpet", name: "Technical Expertise - Buffers and Carpet", departmentType: "engineering", sortOrder: 4,
      items: [
        { slug: "rotary-repair", name: "Rotary Scrubbers/Buffers - Repair and Service" },
        { slug: "rotary-operation", name: "Rotary Scrubbers/Buffers - Safe Operation" },
        { slug: "carpet-small-repair", name: "Carpet Cleaner (Small) - Repair and Service" },
        { slug: "carpet-small-operation", name: "Carpet Cleaner (Small) - Safe Operation" },
        { slug: "carpet-large-repair", name: "Carpet Cleaner (Large) - Repair and Service" },
        { slug: "carpet-large-operation", name: "Carpet Cleaner (Large) - Safe Operation" },
        { slug: "carpet-sweeper-repair", name: "Carpet Sweeper (Ride On) - Repair and Service" },
        { slug: "carpet-sweeper-operation", name: "Carpet Sweeper (Ride On) - Safe Operation" },
      ]},
    { slug: "scrubbers-steam", name: "Technical Expertise - Scrubber Dryers and Steam", departmentType: "engineering", sortOrder: 5,
      items: [
        { slug: "scrubber-small-repair", name: "Scrubber Dryer (Small) - Repair and Service" },
        { slug: "scrubber-small-operation", name: "Scrubber Dryer (Small) - Safe Operation" },
        { slug: "scrubber-medium-repair", name: "Scrubber Dryer (Medium) - Repair and Service" },
        { slug: "scrubber-medium-operation", name: "Scrubber Dryer (Medium) - Safe Operation" },
        { slug: "scrubber-rideon-repair", name: "Scrubber Dryer (Ride On) - Repair and Service" },
        { slug: "scrubber-rideon-operation", name: "Scrubber Dryer (Ride On) - Safe Operation" },
        { slug: "steam-repair", name: "Steam Machines - Repair and Service" },
        { slug: "steam-operation", name: "Steam Machines - Safe Operation" },
      ]},
    { slug: "specialist", name: "Technical Expertise - Misc and Specialist", departmentType: "engineering", sortOrder: 6,
      items: [
        { slug: "batteries", name: "Batteries - Safety, testing and service" },
        { slug: "pressure-small-repair", name: "Pressure Washer (Small) - Repair and Service" },
        { slug: "pressure-small-operation", name: "Pressure Washer (Small) - Safe Operation" },
        { slug: "pressure-medium-repair", name: "Pressure Washer (Medium Hot) - Repair and Service" },
        { slug: "pressure-medium-operation", name: "Pressure Washer (Medium Hot) - Safe Operation" },
        { slug: "pressure-large-repair", name: "Pressure Washer (Large Hot) - Repair and Service" },
        { slug: "pressure-large-operation", name: "Pressure Washer (Large Hot) - Safe Operation" },
        { slug: "engine-repairs", name: "Engine Repairs" },
        { slug: "hydraulic-systems", name: "Hydraulic Systems" },
      ]},
    { slug: "misc", name: "Misc", departmentType: "engineering", sortOrder: 7,
      items: [
        { slug: "social-media", name: "Sharing/Posting work related media (LinkedIn etc.)" },
        { slug: "chemicals", name: "Correct use/dosage of chemicals" },
        { slug: "consumables", name: "Correct use of consumables (Pads, Brushes etc.)" },
        { slug: "operator-training", name: "Running operator training sessions" },
        { slug: "customer-service", name: "Customer Service" },
      ]},
  ];

  const adminCats = [
    { slug: "admin-core", name: "Core Administrative Skills", departmentType: "admin", sortOrder: 1,
      items: [
        { slug: "phone-handling", name: "Professional Phone Handling" },
        { slug: "email-comms", name: "Email Communications" },
        { slug: "filing-systems", name: "Filing Systems & Document Management" },
        { slug: "data-entry", name: "Data Entry & Accuracy" },
        { slug: "scheduling", name: "Scheduling & Calendar Management" },
      ]},
    { slug: "admin-systems", name: "Systems & Software", departmentType: "admin", sortOrder: 2,
      items: [
        { slug: "protean-admin", name: "Protean - Job Management" },
        { slug: "protean-invoicing", name: "Protean - Invoicing" },
        { slug: "ms-office", name: "Microsoft Office Suite" },
        { slug: "ms-teams-admin", name: "Microsoft Teams" },
        { slug: "smartsheet", name: "Smartsheet" },
      ]},
    { slug: "admin-service", name: "Service Administration", departmentType: "admin", sortOrder: 3,
      items: [
        { slug: "job-booking", name: "Job Booking & Allocation" },
        { slug: "parts-ordering", name: "Parts Ordering" },
        { slug: "warranty-claims", name: "Warranty Claims Processing" },
        { slug: "customer-queries", name: "Customer Query Resolution" },
        { slug: "report-generation", name: "Report Generation" },
      ]},
  ];

  const allCategories = [...engineeringCategories, ...adminCats];

  for (const cat of allCategories) {
    const [created] = await db.insert(schema.competencyCategories).values({
      slug: cat.slug, name: cat.name, departmentType: cat.departmentType, sortOrder: cat.sortOrder,
    }).returning();

    for (let i = 0; i < cat.items.length; i++) {
      await db.insert(schema.competencyItems).values({
        categoryId: created.id, slug: cat.items[i].slug, name: cat.items[i].name, sortOrder: i,
      });
    }
  }
  console.log("Competency categories + items seeded");

  function generateRatings(bias: "junior" | "mid" | "senior", slugs: string[]): Record<string, number> {
    const ratings: Record<string, number> = {};
    const ranges = { junior: { min: 0, max: 2, avg: 1 }, mid: { min: 1, max: 3, avg: 2 }, senior: { min: 2, max: 4, avg: 3 } };
    const r = ranges[bias];
    for (const s of slugs) {
      const rand = Math.random();
      let val = r.avg + (rand < 0.3 ? -1 : rand > 0.7 ? 1 : 0);
      ratings[s] = Math.max(r.min, Math.min(r.max, val));
    }
    return ratings;
  }

  const allEngItems = engineeringCategories.flatMap(c => c.items.map(i => i.slug));

  await db.insert(schema.trainingMatrixSubmissions).values([
    { userId: "manager-2", status: "approved", ratings: generateRatings("senior", allEngItems), lastAssessment: "2025-11-15" },
    { userId: "colleague-1", status: "draft", ratings: generateRatings("junior", allEngItems), lastAssessment: "2025-10-28" },
    { userId: "colleague-2", status: "approved", ratings: generateRatings("mid", allEngItems), lastAssessment: "2025-12-01" },
    { userId: "colleague-5", status: "approved", ratings: generateRatings("mid", allEngItems), lastAssessment: "2025-09-20" },
  ]);
  console.log("Training matrix submissions seeded");

  await db.insert(schema.trainingRecords).values([
    { userId: "colleague-1", requirementName: "Health & Safety Fundamentals", category: "Mandatory", completedDate: "2024-11-01", expiresDate: "2025-11-01", status: "compliant" },
    { userId: "colleague-1", requirementName: "Data Protection & GDPR", category: "Mandatory", completedDate: "2024-11-05", expiresDate: "2025-11-05", status: "compliant" },
    { userId: "colleague-1", requirementName: "Fire Safety Awareness", category: "Mandatory", completedDate: "2024-06-15", expiresDate: "2025-01-15", status: "due_soon" },
    { userId: "colleague-1", requirementName: "Manual Handling", category: "Mandatory", completedDate: "2023-10-20", expiresDate: "2024-10-20", status: "overdue" },
    { userId: "colleague-1", requirementName: "First Aid at Work", category: "Role-Specific", status: "missing" },
    { userId: "colleague-1", requirementName: "Technical Equipment Training", category: "Role-Specific", completedDate: "2024-11-10", status: "compliant" },
    { userId: "colleague-1", requirementName: "Quality Assurance Procedures", category: "Role-Specific", completedDate: "2024-11-08", status: "compliant" },
    { userId: "colleague-1", requirementName: "Environmental Awareness", category: "Optional", status: "missing" },
    { userId: "colleague-1", requirementName: "Leadership Fundamentals", category: "Development", status: "missing" },
    { userId: "colleague-1", requirementName: "Project Management Basics", category: "Development", completedDate: "2024-09-15", status: "compliant" },
  ]);
  console.log("Training records seeded");

  await db.insert(schema.resources).values([
    { title: "Employee Handbook", description: "Complete guide to company policies and procedures", category: "Policies", url: "#", icon: "book-open" },
    { title: "Health & Safety Policy", description: "Workplace safety guidelines and procedures", category: "Policies", url: "#", icon: "shield-check" },
    { title: "IT Security Guidelines", description: "Information security and acceptable use policy", category: "Policies", url: "#", icon: "lock" },
    { title: "Benefits Portal", description: "Access your employee benefits and pension information", category: "HR", url: "#", icon: "gift" },
    { title: "Leave Request System", description: "Book annual leave and view team calendar", category: "HR", url: "#", icon: "calendar" },
    { title: "Expenses Claim Form", description: "Submit and track expense claims", category: "HR", url: "#", icon: "receipt" },
    { title: "Training Catalog", description: "Browse available training courses and certifications", category: "Learning", url: "#", icon: "graduation-cap" },
    { title: "Company Intranet", description: "Latest news, announcements, and team updates", category: "Company", url: "#", icon: "globe" },
    { title: "Organisation Chart", description: "View company structure and reporting lines", category: "Company", url: "#", icon: "network" },
    { title: "IT Support Desk", description: "Log tickets and get technical support", category: "Support", url: "#", icon: "headphones" },
  ]);
  console.log("Resources seeded");

  const certDefs = await db.insert(schema.certificateDefinitions).values([
    { name: "Scrubber Dryer Technician", description: "Qualified to service and repair commercial scrubber dryers", category: "Technical", level: "Silver", icon: "wrench", provider: "LVC Training Academy", validityMonths: 12 },
    { name: "Customer Service Excellence", description: "Demonstrated exceptional customer handling skills", category: "Professional", level: "Gold", icon: "heart-handshake", provider: "LVC Training Academy" },
    { name: "Industrial Floor Care", description: "Specialist knowledge in industrial floor maintenance", category: "Technical", level: "Bronze", icon: "layers", provider: "British Institute of Cleaning Science" },
    { name: "Equipment Diagnostics", description: "Fundamental skills in diagnosing equipment faults", category: "Technical", level: "Standard", icon: "stethoscope", provider: "LVC Training Academy" },
    { name: "Pressure Washer Operations", description: "Safe operation and maintenance of pressure washers", category: "Technical", level: "Standard", icon: "droplets", provider: "LVC Training Academy", validityMonths: 12 },
    { name: "Team Leadership", description: "ILM Level 3 Award in Leadership and Management", category: "Leadership", level: "Silver", icon: "users", provider: "ILM" },
    { name: "Health & Safety First", description: "Advanced understanding of workplace safety protocols", category: "Safety", level: "Gold", icon: "shield-check", provider: "LVC Training Academy", validityMonths: 12 },
  ]).returning();

  await db.insert(schema.userCertificates).values([
    { definitionId: certDefs[0].id, userId: "colleague-1", issueDate: "2025-01-05", status: "valid", credentialId: "LVC-SD2-2025-0012" },
    { definitionId: certDefs[1].id, userId: "colleague-1", issueDate: "2024-12-10", status: "valid", credentialId: "LVC-CSE-2024-0089" },
    { definitionId: certDefs[2].id, userId: "colleague-1", issueDate: "2024-11-15", status: "valid", credentialId: "BICS-IFC-2024-2281" },
    { definitionId: certDefs[3].id, userId: "colleague-1", issueDate: "2024-10-20", status: "valid", credentialId: "LVC-EDF-2024-0044" },
    { definitionId: certDefs[4].id, userId: "colleague-1", issueDate: "2024-06-15", expiryDate: "2025-01-15", status: "expiring_soon", credentialId: "LVC-PWO-2024-0021" },
    { definitionId: certDefs[5].id, userId: "manager-1", issueDate: "2022-09-01", status: "valid" },
    { definitionId: certDefs[3].id, userId: "manager-1", issueDate: "2023-06-20", status: "valid" },
  ]);
  console.log("Certificates seeded");

  await db.insert(schema.careerMilestones).values([
    { userId: "colleague-1", title: "Joined LVC", date: "2024-11-01", description: "Started as Engineer in the Engineering department" },
    { userId: "colleague-1", title: "Completed Induction", date: "2024-11-15", description: "Successfully completed initial onboarding program" },
  ]);

  await db.insert(schema.careerNodes).values([
    { slug: "trainee-engineer", title: "Trainee Engineer", description: "Entry level role focusing on learning core equipment and safety.", department: "Engineering", level: 1, requirements: [], nextSteps: ["field-service-engineer"] },
    { slug: "field-service-engineer", title: "Field Service Engineer", description: "Independent role managing own van stock and customer visits.", department: "Engineering", level: 2, requirements: [{ description: "Pressure Washer Operations" }, { description: "Health & Safety First (Gold)" }], nextSteps: ["senior-engineer", "specialist-technician"] },
    { slug: "senior-engineer", title: "Senior Service Engineer", description: "Experienced engineer handling complex repairs and mentoring juniors.", department: "Engineering", level: 3, requirements: [{ description: "Scrubber Dryer Technician (Silver)" }, { description: "Equipment Diagnostics" }], nextSteps: ["workshop-manager", "engineering-lead"] },
    { slug: "specialist-technician", title: "Specialist Technician", description: "Subject matter expert in specific complex machinery types.", department: "Engineering", level: 3, requirements: [{ description: "Industrial Floor Care (Bronze)" }], nextSteps: ["engineering-lead"] },
    { slug: "engineering-lead", title: "Engineering Team Lead", description: "Leadership role managing a team of engineers and KPIs.", department: "Engineering", level: 4, requirements: [{ description: "Team Leadership (Silver)" }, { description: "Customer Service Excellence (Gold)" }], nextSteps: ["operations-manager"] },
    { slug: "workshop-manager", title: "Workshop Manager", description: "Responsible for workshop operations, logistics and safety.", department: "Engineering", level: 4, requirements: [{ description: "Team Leadership" }], nextSteps: ["operations-manager"] },
    { slug: "operations-manager", title: "Operations Manager", description: "Senior leadership role overseeing multiple departments.", department: "Operations", level: 5, requirements: [{ description: "5+ years experience" }], nextSteps: [] },
  ]);
  console.log("Career data seeded");

  await db.insert(schema.jobRoles).values([
    { title: "Engineer", department: "Engineering", summary: "Responsible for technical operations and equipment maintenance", responsibilities: ["Maintain and repair technical equipment", "Follow safety protocols and procedures", "Document work completed and issues identified", "Collaborate with team members on complex projects", "Participate in continuous improvement initiatives"] },
    { title: "Operations Coordinator", department: "Operations", summary: "Coordinates daily operations and supports team efficiency", responsibilities: ["Coordinate team schedules and assignments", "Manage inventory and supply ordering", "Process customer orders and service requests", "Prepare operational reports", "Support health and safety compliance"] },
    { title: "Engineering Lead", department: "Engineering", summary: "Leads the engineering team and oversees technical standards", responsibilities: ["Manage engineering team performance", "Set technical standards and procedures", "Oversee major projects and installations", "Mentor and train junior engineers", "Ensure compliance with all regulations"] },
  ]);
  console.log("Job roles seeded");

  const feedbackQuestions = [
    "Are you proud to work at LVC?",
    "Is there an individual or department that you would like to praise for their work recently?",
    "Do you have any comments or feedback you wish to provide?",
    "Do you have any comments/feedback you wish to make?"
  ];

  function isFeedback(text: string) {
    return feedbackQuestions.some(q => text.toLowerCase().includes(q.toLowerCase().substring(0, 30)));
  }

  function roleNameToSlug(name: string) {
    return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  const rawSurveyData: Record<string, string[]> = {
    "Field Service Engineer": [
      "Are you fitting Consumables on jobs?",
      "Same-day booking in job and communication with client",
      "Ascertain Parts required for job and make sure available for visit",
      "Client Debrief (on-site. If client busy then over the phone)",
      "Quote explanation and follow-up (over £350) 'Just want to make sure you have all the information you need'",
      "Checking outstanding jobs with Office and chasing parts up internally",
      "Booking in return visit to complete Callback job - respond to 'Parts in' email additionally",
      "Completion of Reports Correctly: Labour, Equipment Notes, and Further Work",
      "Solution-focused and able to offer creative options to clients who need more assistance.",
      "Are you proud to work at LVC?",
      "Is there an individual or department that you would like to praise for their work recently?",
      "Do you have any comments/feedback you wish to make?"
    ],
    "Service Coordinator": [
      "Customer enquiries acknowledged",
      "Quote or query completed",
      "Internal enquiries acknowledged",
      "Logging and Allocating Breakdowns same-day",
      "Processing Further Work same-day",
      "Creating Service Contracts same-day from approval",
      "Solution-focused and able to offer creative options to clients who need more assistance.",
      "Are you proud to work at LVC?",
      "Is there an individual or department that you would like to praise for their work recently?",
      "Do you have any comments/feedback you wish to make?"
    ],
    "Operations Manager": [
      "Key processes, procedures and standards are consistently met across department",
      "Entire department understands and conforms with company values",
      "Customer enquiries acknowledged same-day",
      "Quote or query completed within 24h",
      "Training delivered to a high standard whenever required",
      "Solution-focused and able to offer creative options to clients who need more assistance.",
      "Are you proud to work at LVC?",
      "Is there an individual or department that you would like to praise for their work recently?",
      "Do you have any comments or feedback you wish to provide?"
    ],
    "Workshop Manager": [
      "Customer enquiries acknowledged",
      "Workshop booking in process being followed",
      "Booking Machine into Workshop procedure",
      "Creation of Job on Protean",
      "Quoting Jobs (with phone call)",
      "Repairing machines efficiently",
      "Solution-focused and able to offer creative options to clients who need more assistance.",
      "Are you proud to work at LVC?",
      "Is there an individual or department that you would like to praise for their work recently?",
      "Do you have any comments or feedback you wish to provide?"
    ],
    "Sales Consultant": [
      "Pipeline Added",
      "Customer enquiries acknowledged",
      "Orders Processed",
      "Consumables promoted with each machine sale",
      "Service plan offered with each machine sale",
      "Solution-focused and able to offer creative options to clients who need more assistance.",
      "Are you proud to work at LVC?",
      "Is there an individual or department that you would like to praise for their work recently?",
      "Do you have any comments or feedback you wish to provide?"
    ],
    "Warehouse Manager": [
      "Customer enquiries acknowledged",
      "Engineer Van Stock Replenishment (weekly)",
      "Stock Room Stock Take (By Zone)",
      "Picking and dispatch of Job Stock Issues",
      "Solution-focused and able to offer creative options to clients who need more assistance.",
      "Are you proud to work at LVC?",
      "Is there an individual or department that you would like to praise for their work recently?",
      "Do you have any comments or feedback you wish to provide?"
    ],
  };

  for (const [roleName, tasks] of Object.entries(rawSurveyData)) {
    const slug = roleNameToSlug(roleName);
    const [role] = await db.insert(schema.standardsSurveyRoles).values({
      roleSlug: slug, roleTitle: roleName,
    }).returning();

    for (let i = 0; i < tasks.length; i++) {
      await db.insert(schema.standardsSurveyItems).values({
        surveyRoleId: role.id,
        text: tasks[i],
        isFeedback: isFeedback(tasks[i]),
        sortOrder: i,
      });
    }
  }
  console.log("Standards surveys seeded");

  const deptData = [
    { name: 'Directors', color: 'bg-slate-600', sortOrder: 0 },
    { name: 'Operations', color: 'bg-emerald-600', sortOrder: 1 },
    { name: 'Engineering', color: 'bg-blue-600', sortOrder: 2 },
    { name: 'Service Coordination', color: 'bg-amber-600', sortOrder: 3 },
    { name: 'Warehouse & Logistics', color: 'bg-orange-600', sortOrder: 4 },
    { name: 'Hire Department', color: 'bg-teal-600', sortOrder: 5 },
    { name: 'Workshop', color: 'bg-sky-600', sortOrder: 6 },
    { name: 'Sales & Product Support', color: 'bg-purple-600', sortOrder: 7 },
    { name: 'Accounts', color: 'bg-cyan-600', sortOrder: 8 },
    { name: 'H&S / HR / Quality', color: 'bg-red-600', sortOrder: 9 },
    { name: 'IT & Procurement', color: 'bg-indigo-600', sortOrder: 10 },
    { name: 'Human Resources', color: 'bg-pink-600', sortOrder: 11 },
  ];
  const insertedDepts: Record<string, number> = {};
  for (const d of deptData) {
    const [row] = await db.insert(schema.departmentsTable).values(d).returning();
    insertedDepts[d.name] = row.id;
  }
  const deptParents: Record<string, string> = {
    'Operations': 'Directors', 'Engineering': 'Operations', 'Service Coordination': 'Operations',
    'Warehouse & Logistics': 'Operations', 'Hire Department': 'Operations', 'Workshop': 'Operations',
    'Sales & Product Support': 'Directors', 'Accounts': 'Directors', 'H&S / HR / Quality': 'Directors',
    'IT & Procurement': 'Directors', 'Human Resources': 'Directors',
  };
  for (const [child, parent] of Object.entries(deptParents)) {
    if (insertedDepts[child] && insertedDepts[parent]) {
      await db.update(schema.departmentsTable)
        .set({ parentId: insertedDepts[parent] })
        .where(eq(schema.departmentsTable.id, insertedDepts[child]));
    }
  }
  console.log("Departments seeded");

  console.log("Seed complete!");
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
