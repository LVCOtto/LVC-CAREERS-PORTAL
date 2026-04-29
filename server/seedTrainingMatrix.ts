/**
 * Seeds training matrix competency categories and items for each job role,
 * derived from the uploaded training matrix XLSX templates.
 *
 * Run with: npx tsx server/seedTrainingMatrix.ts
 */

import { db } from "./db";
import * as schema from "@shared/schema";
import { inArray, eq } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[&+]/g, "-and-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

async function upsertCategory(
  name: string,
  departmentType: string,
  sortOrder: number
): Promise<number> {
  const s = slug(name) + "-" + slug(departmentType);
  const existing = await db
    .select()
    .from(schema.competencyCategories)
    .where(eq(schema.competencyCategories.slug, s));
  if (existing.length > 0) return existing[0].id;
  const [created] = await db
    .insert(schema.competencyCategories)
    .values({ slug: s, name, departmentType, sortOrder })
    .returning();
  return created.id;
}

async function upsertItem(
  categoryId: number,
  name: string,
  sortOrder: number,
  description?: string
): Promise<void> {
  const s = slug(name).slice(0, 95);
  const existing = await db
    .select()
    .from(schema.competencyItems)
    .where(eq(schema.competencyItems.slug, s));
  if (existing.length > 0) {
    // update categoryId in case we're re-assigning
    await db
      .update(schema.competencyItems)
      .set({ categoryId, sortOrder })
      .where(eq(schema.competencyItems.slug, s));
    return;
  }
  await db
    .insert(schema.competencyItems)
    .values({ categoryId, slug: s, name, sortOrder, description });
}

async function linkRoleToCategories(
  roleTitle: string,
  categoryIds: number[]
): Promise<void> {
  const roles = await db.select().from(schema.jobRoles);
  const role = roles.find(
    (r) => r.title.toLowerCase().trim() === roleTitle.toLowerCase().trim()
  );
  if (!role) {
    console.warn(`  ⚠  Job role not found: "${roleTitle}" — skipping`);
    return;
  }
  // Remove old links then re-insert
  await db
    .delete(schema.jobRoleCategories)
    .where(eq(schema.jobRoleCategories.jobRoleId, role.id));
  for (const catId of categoryIds) {
    await db
      .insert(schema.jobRoleCategories)
      .values({ jobRoleId: role.id, categoryId: catId })
      .onConflictDoNothing();
  }
  console.log(
    `  ✓  Linked "${roleTitle}" → ${categoryIds.length} categories`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CATEGORY BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

async function buildOshEngineering(dt: string): Promise<number> {
  const id = await upsertCategory(
    "Occupational Safety & Health",
    dt,
    0
  );
  const items = [
    "Manual Handling",
    "Safe securing of loads",
    "Lone working",
    "Noise",
    "Dust - mask protection",
    "Use of Hand tools",
    "Chemical COSHH training",
    "Transport - Van safety, Van checklist and Vehicle Upkeep",
    "Driving spatial awareness - Safe driving and highway code",
    "Slips, trips and falls",
    "Accident & Hazard reporting",
    "Electrical Safety",
    "Battery Safety",
    "Following LVC RAMS procedure (Risk assessment and Method statement)",
    "Stress",
    "PPE - use of",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildOpsProcessesEngineering(dt: string): Promise<number> {
  const id = await upsertCategory(
    "Operational Processes & Communication",
    dt,
    1
  );
  const items = [
    "Use of Protean - Completing Jobs and Adding Parts Fitted",
    "Prepare quote (Further Work Required)",
    "Plan workload (View Jobs + Book in)",
    "Process before/after finishing each job",
    "Adhering to Method statement - Safe method of work",
    "Order of parts/consumables",
    "Protean Timesheet",
    "Booking in at workshop - return & communication",
    "Communication Policy",
    "Microsoft Teams",
    "Fault Finding",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildMiscEngineering(dt: string): Promise<number> {
  const id = await upsertCategory("Misc", dt, 10);
  const items = [
    "Correct use/dosage of chemicals",
    "Correct use of consumables (Pads, Brushes, twister pads etc.)",
    "Running operator training sessions",
    "Customer Service",
    "FFM (Fimap Technology)",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildMachineKnowledge(dt: string): Promise<number> {
  const id = await upsertCategory("Technical - Machine Knowledge", dt, 5);
  const items = [
    "Tub vacuum/backpack - electrical - KNOWLEDGE",
    "Upright vacuum cleaners - electrical - KNOWLEDGE",
    "Battery operated tub vacs/backpack and uprights - KNOWLEDGE",
    "Rotary Scrubbers/Buffers - KNOWLEDGE",
    "Carpet cleaner smaller (eg Rug Doctor) - KNOWLEDGE",
    "Carpet cleaner larger walk behind (eg AX410) - KNOWLEDGE",
    "Carpet Sweeper large Ride on - KNOWLEDGE",
    "Scrubber dryer small walk behind (eg Imop) - KNOWLEDGE",
    "Scrubber dryer medium walk behind - KNOWLEDGE",
    "Scrubber dryer Ride on - KNOWLEDGE",
    "Duplex steam and Multiwash/Rotowash - KNOWLEDGE",
    "Steam Machines - KNOWLEDGE",
    "Battery Knowledge Testing and Safety - KNOWLEDGE",
    "Small domestic pressure washers - KNOWLEDGE",
    "Medium Range cold pressure washers - KNOWLEDGE",
    "Medium Range Hot pressure washers - KNOWLEDGE",
    "Large Hot pressure washers - KNOWLEDGE",
    "Ozone machines - KNOWLEDGE",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildMachineSafeOperation(dt: string): Promise<number> {
  const id = await upsertCategory(
    "Technical - Safe Operation",
    dt,
    6
  );
  const items = [
    "Tub vacuum/backpack - SAFE OPERATION",
    "Upright vacuum cleaners - SAFE OPERATION",
    "Battery operated tub vacs/backpack and uprights - SAFE OPERATION",
    "Rotary Scrubbers/Buffers - SAFE OPERATION",
    "Carpet cleaner smaller (eg Rug Doctor) - SAFE OPERATION",
    "Carpet cleaner larger walk behind (eg AX410) - SAFE OPERATION",
    "Carpet Sweeper large Ride on - SAFE OPERATION",
    "Scrubber dryer small walk behind (eg Imop) - SAFE OPERATION",
    "Scrubber dryer medium walk behind - SAFE OPERATION",
    "Scrubber dryer Ride on - SAFE OPERATION",
    "Duplex steam and Multiwash/Rotowash - SAFE OPERATION",
    "Steam Machines - SAFE OPERATION",
    "Battery Knowledge Testing and Safety - SAFE OPERATION",
    "Small domestic pressure washers - SAFE OPERATION",
    "Medium Range cold pressure washers - SAFE OPERATION",
    "Medium Range Hot pressure washers - SAFE OPERATION",
    "Large Hot pressure washers - SAFE OPERATION",
    "Ozone machines - SAFE OPERATION",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildMachineRepairMaintenance(dt: string): Promise<number> {
  const id = await upsertCategory(
    "Technical - Repair & Maintenance",
    dt,
    7
  );
  const items = [
    "Tub vacuum/backpack - electrical - REPAIR AND MAINTENANCE",
    "Upright vacuum cleaners - electrical - REPAIR AND MAINTENANCE",
    "Battery operated tub vacs/backpack and uprights - REPAIR AND MAINTENANCE",
    "Rotary Scrubbers/Buffers - REPAIR AND MAINTENANCE",
    "Carpet cleaner smaller (eg Rug Doctor) - REPAIR AND MAINTENANCE",
    "Carpet cleaner larger walk behind (eg AX410) - REPAIR AND MAINTENANCE",
    "Carpet Sweeper large Ride on - REPAIR AND MAINTENANCE",
    "Scrubber dryer small walk behind (eg Imop) - REPAIR AND MAINTENANCE",
    "Scrubber dryer medium walk behind - REPAIR AND MAINTENANCE",
    "Scrubber dryer Ride on - REPAIR AND MAINTENANCE",
    "Duplex steam and Multiwash/Rotowash - REPAIR AND MAINTENANCE",
    "Steam Machines - REPAIR AND MAINTENANCE",
    "Battery Knowledge Testing and Safety - REPAIR AND MAINTENANCE",
    "Small domestic pressure washers - REPAIR AND MAINTENANCE",
    "Medium Range cold pressure washers - REPAIR AND MAINTENANCE",
    "Medium Range Hot pressure washers - REPAIR AND MAINTENANCE",
    "Large Hot pressure washers - REPAIR AND MAINTENANCE",
    "Ozone machines - REPAIR AND MAINTENANCE",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildManagementCore(dt: string): Promise<number> {
  const id = await upsertCategory("Management Responsibilities", dt, 0);
  const items = [
    "Overall responsible for all activities that take place in department",
    "Hitting turnover / KPI targets",
    "Training Matrix for your department",
    "Regularly explore Customer Journey - find ways to improve client satisfaction",
    "Ensure everyone in your department follows H&S Guidelines",
    "Ensure Quarterly Rocks are set and 80%+ delivered upon",
    "Send department reports to General Manager",
    "Write & review processes to follow company policies - maximising efficiencies",
    "Monitor department workloads, request additional support when needed",
    "Ensure communication policy is followed",
    "Ensure department section of Protean is clear, current & informative",
    "Department Induction for all new members (incl. training schedule)",
    "Resolve account queries - amend procedures to minimise re-occurrence",
    "Log client & staff feedback - use to praise/improve service",
    "Hold periodic review meetings with your team",
    "Hold annual appraisal with individuals within your team",
    "Input to monthly newsletter",
    "Ensure the department operates in a professional manner",
    "Ensure team is trained and continuously developing their knowledge and skills",
    "Ensure department has all tools required to fulfil their role adequately",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE-SPECIFIC CATEGORY BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

async function buildWorkshopAdminProcesses(dt: string): Promise<number> {
  const id = await upsertCategory("Workshop Admin Processes", dt, 3);
  const items = [
    "Greet customers bringing machines in for repair",
    "Use booking-in form to book machine in",
    "Manually add sheet into folder then tag machine",
    "Create Job on Protean - add job number on tag",
    "Allocate engineer to machine to work on and quote",
    "Take report form from engineer to enter onto Protean",
    "Send quote from Protean to customer",
    "Chase customer for decision on whether to go ahead with quote",
    "Request parts via Protean (if customer goes ahead with quote)",
    "Inform customer once machine has been repaired",
    "Print delivery note for customer when they collect - get signed",
    "Complete job on Protean and invoice",
    "Use spreadsheet to keep track of old jobs",
    "Logging new machine sales orders",
    "Hire - Machine collection forms",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildServiceAdminProcesses(dt: string): Promise<number> {
  const id = await upsertCategory("Service Admin - Breakdown Handling", dt, 3);
  const items = [
    "Take call or email with breakdown details",
    "Send new account application form if new customer - wait until approved",
    "Check service contract before raising job",
    "Must have site details confirmed",
    "Depending on area/machine type - check plannerboard for free days/gaps",
    "Contact customer by email to confirm engineer visit",
    "Creating new job on Protean",
    "Introduction to Protean - Job types, Plannerboard, Customers, Suppliers, Equipment, Stock",
    "Arranged Visits - generate via contract tab each month",
    "Field Service Visits - schedule at same time as Arranged Visits",
    "Answering phone calls and general phone manner",
    "Managing Service Mailbox",
    "3rd Party Repairs - Raise PO for job with job sheet (C-Rate process)",
    "Invoicing - Check job status (Awaiting Complete, Site Attended, etc.)",
    "Creating & renewing contracts",
    "Further Work Required / Callback - raise new job or no further action",
    "Customer bringing machine in - workshop booking-in process",
    "Create Job on Protean for walk-in repairs",
    "Quote sent to customer - boomerang to chase",
    "Request parts and notify customer when parts arrive",
    "Ensuring PAT testing at end of repair",
    "Automated invoicing process",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildAccountsOsh(dt: string): Promise<number> {
  const id = await upsertCategory("Health & Safety", dt, 0);
  const items = [
    "Fire Awareness",
    "Display Screen Equipment - Desk Height",
    "Breaks - DSE compliance",
    "COSHH (chemicals)",
    "Manual Handling",
    "Slips, Trips & Falls",
    "Log incidents, hazards & accidents",
    "Stress Awareness",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildAccountsCore(dt: string): Promise<number> {
  const id = await upsertCategory("Core Accounts Skills", dt, 1);
  const items = [
    "Telephone manner",
    "IT - Office applications",
    "IT - Accounts packages (Sage, Credit Hound, Experian)",
    "Client Platform",
    "Online Banking Systems",
    "Bank RBS",
    "Reconcile",
    "VAT Return",
    "HR Online",
    "PAYE - Wages, Liability, Bonuses, Hours, Overtime, Private Mileage",
    "Sales Figures",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildAccountsAdmin(dt: string): Promise<number> {
  const id = await upsertCategory("Accounts Administration", dt, 2);
  const items = [
    "Sending new account application form then process once received",
    "Generate invoice / Statement as per request",
    "Knowing Top Customers & Suppliers",
    "Filling out new supplier forms",
    "Bad debt chasing",
    "Enter supplier invoices, utilities, van bills, telephone invoices",
    "Produce customer statements",
    "Filing invoices on Platform",
    "Updating customer record",
    "Paying customer payments via BACS",
    "RBS BACS",
    "Sagepay",
    "Van Project - Services, MOT, Tax, Insurance Claims",
    "Engineers hours",
    "Customer payments - cheques, BACS, Visa etc.",
    "Supplier payments",
    "Full access to all online bank systems",
    "Reconcile - LloydsTSB, RBS, Credit cards",
    "Directors bank cards",
    "Paypal",
    "Journal entries (staff loans, bank loan, hire purchase etc.)",
    "Direct debits, standing orders",
    "Generating reports for management - P&L, Balance Sheet, Month end",
    "Problem solving",
    "Statements and invoicing to customers",
    "Expenses for all staff",
    "Machine sales spreadsheet - invoice numbers, serial numbers, SO numbers",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildAccountsProtean(dt: string): Promise<number> {
  const id = await upsertCategory("Protean - Accounts", dt, 3);
  const items = [
    "Protean - mail order invoices",
    "Protean - Correcting errors made",
    "Protean - Update customers record",
    "Protean - Customers credit notes (hire, jobs, mail order, workshop)",
    "Protean - Suppliers bills",
    "Protean - Month end reports, closing month process",
    "Protean - Maintenance contracts",
    "Protean - Renewal of yearly and monthly contracts",
    "Protean - Hire contract",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildAccountsManagerSpecific(dt: string): Promise<number> {
  const id = await upsertCategory(
    "Accounts Management Responsibilities",
    dt,
    4
  );
  const items = [
    "Bad Debt communication with customers",
    "Cashflow reporting",
    "Credit policy - Implementation & Maintaining",
    "General accounting duties oversight",
    "Holiday records - Overseeing",
    "Invoicing - Sales orders/Maintenance contracts/Workshop jobs",
    "Oversee cleaning duties of unit - implement schedule",
    "Oversee invoicing across all departments",
    "Reconciliation & Bank / Notification / RBS correspondence & meetings",
    "Renewal of contracts",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildGeneralManagerSpecific(dt: string): Promise<number> {
  const id = await upsertCategory("General Manager Responsibilities", dt, 1);
  const items = [
    "Ensure each department manager fulfils their duties & responsibilities",
    "Managing overheads & Budgets",
    "Hitting levels of profit agreed on board meetings",
    "Implementing targets for company & departments (from board meetings)",
    "Analysis of profitable sectors, customers, products - Sales Strategy",
    "Reports of company performance - presentation to board meetings",
    "Premises safety & repair",
    "Recruitment Strategy",
    "Calling regular company meetings",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildOperationsManagerSpecific(dt: string): Promise<number> {
  const id = await upsertCategory(
    "Operations Manager Responsibilities",
    dt,
    1
  );
  const items = [
    "Ensure each department is operating efficiently and to/above standards set by LVC",
    "Ensure team of managers/team leaders are adequately carrying out all duties",
    "Ensuring key Operations tasks are consistently being carried out and regularly optimised",
    "Make sure LVC has a culture that encapsulates the core values of the company",
    "Oversee LVC stock levels - min/max levels data driven and in line with target values",
    "Particular focus on KPIs across Operations team - monitored and consistently met",
    "Ensuring department managers are holding regular meetings - Quarterly rocks discussed, set and achieved",
    "Ensure inter-departmental communication is clear and constructive (Sales, Service, Hire, Accounts)",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildOperationsKpis(dt: string): Promise<number> {
  const id = await upsertCategory("Operations KPIs", dt, 2);
  const items = [
    "80% of Operations Rocks achieved quarterly",
    "80% of Operations KPIs achieved",
    "75% of positive client feedback",
    "5% per quarter training matrix improvement across entire Operations team",
    "90% of employees happy working at LVC",
    "Value of stock within LVC within target",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildWorkshopManagerSpecific(dt: string): Promise<number> {
  const id = await upsertCategory("Workshop Manager Responsibilities", dt, 1);
  const items = [
    "System for maximising getting go-aheads to quotes - Implementation and monitoring",
    "Service & Checks on LVC fleet of machines - Make sure they are charged and ready",
    "Prepare and PDI sold machines",
    "Oversee Logistics within LVC - maximising efficiency",
    "Set up system to monitor return of signed transport return notes for workshop machines",
    "Oversee having one of each variety of used machine ready to sell - incl. accessory",
    "Monitor tools purchase, care and return of (when no longer in use or when staff member finishes)",
    "Van - MOT/Service/Repair",
    "Marketing - Make sure LVC stickers are put on all customers' machines",
    "Oversee technical aspects of engineering across entire company",
    "Ensure all engineers are equipped adequately with tools - logged and maintained correctly",
    "Overseeing vehicle fleet within LVC - serviced, MOT'd and fit for purpose",
    "Oversee standards of all machines leaving LVC workshop (post repair, sale/hire/dem prep)",
    "Hitting workshop turnover target",
    "Average time from machine arriving to job invoiced",
    "5% per quarter training matrix improvement across Engineering team",
    "Workshop job count target",
    "Logistics days logged to delivery completion",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildSalesOsh(dt: string): Promise<number> {
  const id = await upsertCategory("Health & Safety - Sales", dt, 0);
  const items = ["Manual Handling - Lifting & Moving"];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildSalesProcess(dt: string): Promise<number> {
  const id = await upsertCategory("Sales Process", dt, 1);
  const items = [
    "Planning",
    "Making appointments - Existing Customers",
    "Making appointments - New/prospect customers",
    "Communication - Email & Phone calls",
    "Site Survey",
    "Demonstrations",
    "Quoting - incl. pricing",
    "Closing",
    "Installation & Training",
    "Ongoing account management",
    "Pipeline - Sales Force",
    "Create Quotes / Send won quotes to Orders",
    "HubSpot",
    "Protean - General",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildSalesProductKnowledge(dt: string): Promise<number> {
  const id = await upsertCategory("Product Knowledge - Machines", dt, 2);
  const items = [
    "Tub Vacs - Mains & Battery",
    "Upright - Mains & Battery",
    "Backvac - Mains & Battery",
    "Wetvac",
    "Industrial Vacs",
    "Rotary Single Disc Scrubbers, Polishers & Burnishers",
    "Carpet Cleaner - Self Contained",
    "Carpet Cleaner - Spray Extraction",
    "Carpet Cleaner - Low Moisture",
    "Scrubber Dryer - Pedestrian",
    "Scrubber Dryer Ride On",
    "Sweeper Pedestrian",
    "Sweeper Ride On",
    "Duplex, Multiwash & Rotowash",
    "Steam Cleaning",
    "Pressure Washers - Cold",
    "Pressure Washer - Hot",
    "Ozone machines",
    "Robotics",
    "Combination/Utility Machines",
    "Gum Removal",
    "Edge/Compact Cleaning",
    "Battery types & battery care",
    "Power Types - EG LPG, Diesel, Battery",
    "Benefits of LVC",
    "Selling Service Contracts",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildSalesFloorCare(dt: string): Promise<number> {
  const id = await upsertCategory("Product Knowledge - Floor Care", dt, 3);
  const items = [
    "Stonecare",
    "Vinyl/Lino",
    "Carpet Care",
    "Upholstery",
    "Vanity worktops",
    "Odour Removal",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildSalesAccessories(dt: string): Promise<number> {
  const id = await upsertCategory("Accessories & Consumables", dt, 4);
  const items = [
    "Brush Types",
    "Pads",
    "Chemicals",
    "Chemical free cleaning",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildSalesManagerSpecific(dt: string): Promise<number> {
  const id = await upsertCategory("Sales Management Responsibilities", dt, 4);
  const items = [
    "Implementation of Sales strategy (following board meeting)",
    "Ensure the full sales team are using Pipeline (HubSpot)",
    "Ensure all machines are booked out correctly on Protean",
    "Marketing of department - liaise with other departments and Sales Support",
    "Keep Stock and Demonstration machines within allocated budget",
    "Ensure Sales/Hire policy is followed",
    "Drive the sale of correct machines for the correct environment",
    "Follow Environmental and Quality policy",
    "Oversee expenses within department including maximising margins",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildHrHsSpecific(dt: string): Promise<number> {
  const id = await upsertCategory("HR & H&S Responsibilities", dt, 1);
  const items = [
    "HR - Organise yearly appraisals (start with Managers)",
    "H&S - A safe work environment for all - IHASCO - liaise with Dean",
    "Quality Control",
    "Policies across company - as discussed on board meetings",
    "RAMS - overall (Train individual departments)",
    "Advancing in becoming approved supplier - documentation",
    "Accreditation work",
    "Credit policy",
    "Recruiting",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildHireManagerSpecific(dt: string): Promise<number> {
  const id = await upsertCategory("Hire Management Responsibilities", dt, 1);
  const items = [
    "System for maximising getting go-aheads to quotes - Implementation and monitoring",
    "Service & Checks on LVC fleet of hire machines - charged and ready to go",
    "Prepare and PDI sold machines",
    "Oversee Logistics within LVC - coordinate with team for pickups and deliveries",
    "Set up system to monitor return of signed transport return notes for workshop machines",
    "Oversee having one of each variety of used machine ready to sell - incl. accessory",
    "Monitor tools purchase, care and return of",
    "Van - MOT/Service/Repair",
    "Marketing - Make sure LVC stickers are put on all customers' machines",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildWarehouseManagerSpecific(dt: string): Promise<number> {
  const id = await upsertCategory(
    "Stock & Warehouse Management Responsibilities",
    dt,
    1
  );
  const items = [
    "Keeping stock levels accurate (including Van and unit stocktake)",
    "Keep stock safe & secure",
    "Complete Job stock Issues in shortest possible time",
    "GRN in to LVC in shortest possible time",
    "Review and report on missing stock",
    "Engineer replenishments to meet business needs",
    "Carry out 'parts to equipment process' including adding L-numbers",
    "Manage incorrectly received items - ensure appropriate return with credit or keep",
    "Moving stock to fast moving and slow moving areas",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

async function buildProductSupportManagerSpecific(dt: string): Promise<number> {
  const id = await upsertCategory(
    "Product Support & IT Management Responsibilities",
    dt,
    1
  );
  const items = [
    "Technical development of LVC - incl. implementation and overseeing training matrix across LVC",
    "Quarterly meetings with Dept Managers (minimum) on technical development",
    "Increasing margins by sourcing smarter - overseeing maximum use of quality pattern parts",
    "Driving Mail-order revenue across all departments - direct contact with clients",
    "Developing automated systems for mail-order",
    "New pricelists on system within agreed (one week) timeframe",
    "Ensuring CCS are meeting company requirements",
  ];
  for (let i = 0; i < items.length; i++) await upsertItem(id, items[i], i);
  return id;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Training Matrix Seed ===\n");

  // ── 1. Field Service Engineer / Senior Field Engineer ──────────────────────
  console.log("→ Field Service Engineer / Senior Field Engineer");
  {
    const dt = "field-engineer";
    const catIds = [
      await buildOshEngineering(dt),
      await buildOpsProcessesEngineering(dt),
      await buildMachineSafeOperation(dt),
      await buildMachineRepairMaintenance(dt),
      await buildMiscEngineering(dt),
    ];
    await linkRoleToCategories("Field Service Engineer", catIds);
    await linkRoleToCategories("Senior Field Engineer", catIds);
  }

  // ── 2. Workshop Service Engineer ──────────────────────────────────────────
  console.log("→ Workshop Service Engineer");
  {
    const dt = "workshop-engineer";
    const catIds = [
      await buildOshEngineering(dt),
      await buildOpsProcessesEngineering(dt),
      await buildWorkshopAdminProcesses(dt),
      await buildMachineKnowledge(dt),
      await buildMiscEngineering(dt),
    ];
    await linkRoleToCategories("Workshop Service engineer", catIds);
  }

  // ── 3. Service Administrator / Service Co-Ordinator ───────────────────────
  console.log("→ Service Administrator / Service Co-Ordinator");
  {
    const dt = "service-admin";
    const catIds = [
      await buildOshEngineering(dt),
      await buildOpsProcessesEngineering(dt),
      await buildMachineKnowledge(dt),
      await buildServiceAdminProcesses(dt),
      await buildMiscEngineering(dt),
    ];
    await linkRoleToCategories("Service Administrator", catIds);
    await linkRoleToCategories("Service Administrator ", catIds);
    await linkRoleToCategories("Service  Administrator", catIds);
    await linkRoleToCategories("Service Co-Ordinator", catIds);
  }

  // ── 4. Accounts Administrator / Purchase Ledger / Accounts Assistant ──────
  console.log("→ Accounts team (non-manager)");
  {
    const dt = "accounts";
    const catIds = [
      await buildAccountsOsh(dt),
      await buildAccountsCore(dt),
      await buildAccountsAdmin(dt),
      await buildAccountsProtean(dt),
    ];
    await linkRoleToCategories("Accounts Administrator ", catIds);
    await linkRoleToCategories("Accounts Administrator", catIds);
    await linkRoleToCategories("Purchase Ledger Administrator ", catIds);
    await linkRoleToCategories("Purchase Ledger Administrator", catIds);
    await linkRoleToCategories("Accounts Assistant", catIds);
  }

  // ── 5. Accounts Manager ───────────────────────────────────────────────────
  console.log("→ Accounts Manager");
  {
    const dt = "accounts-manager";
    const catIds = [
      await buildManagementCore(dt),
      await buildAccountsCore(dt),
      await buildAccountsAdmin(dt),
      await buildAccountsProtean(dt),
      await buildAccountsManagerSpecific(dt),
    ];
    await linkRoleToCategories("Accounts Manager", catIds);
  }

  // ── 6. General Manager ────────────────────────────────────────────────────
  console.log("→ General Manager");
  {
    const dt = "general-manager";
    const catIds = [
      await buildManagementCore(dt),
      await buildGeneralManagerSpecific(dt),
    ];
    await linkRoleToCategories("General Manager", catIds);
  }

  // ── 7. Operations Manager ─────────────────────────────────────────────────
  console.log("→ Operations Manager");
  {
    const dt = "operations-manager";
    const catIds = [
      await buildManagementCore(dt),
      await buildOperationsManagerSpecific(dt),
      await buildOperationsKpis(dt),
    ];
    await linkRoleToCategories("Operations Manager", catIds);
  }

  // ── 8. Workshop Manager ───────────────────────────────────────────────────
  console.log("→ Workshop Manager");
  {
    const dt = "workshop-manager";
    const catIds = [
      await buildManagementCore(dt),
      await buildWorkshopManagerSpecific(dt),
    ];
    await linkRoleToCategories("Workshop Manager", catIds);
  }

  // ── 9. Sales Consultant ───────────────────────────────────────────────────
  console.log("→ Sales Consultant");
  {
    const dt = "sales";
    const catIds = [
      await buildSalesOsh(dt),
      await buildSalesProcess(dt),
      await buildSalesProductKnowledge(dt),
      await buildSalesFloorCare(dt),
      await buildSalesAccessories(dt),
    ];
    await linkRoleToCategories("Sales Consultant", catIds);
  }

  // ── 10. Sales Director ────────────────────────────────────────────────────
  console.log("→ Sales Director");
  {
    const dt = "sales-manager";
    const catIds = [
      await buildManagementCore(dt),
      await buildSalesProcess(dt),
      await buildSalesProductKnowledge(dt),
      await buildSalesFloorCare(dt),
      await buildSalesManagerSpecific(dt),
    ];
    await linkRoleToCategories("Sales Director", catIds);
  }

  // ── 11. H&S & Quality Coordinator/Director ────────────────────────────────
  console.log("→ H&S & Quality Coordinator/Director");
  {
    const dt = "hr-hs-manager";
    const catIds = [
      await buildManagementCore(dt),
      await buildHrHsSpecific(dt),
    ];
    await linkRoleToCategories("H&S & Quality Coordinator/Director ", catIds);
    await linkRoleToCategories("H&S & Quality Coordinator/Director", catIds);
  }

  // ── 12. Hire Dept. Manager ────────────────────────────────────────────────
  console.log("→ Hire Dept. Manager");
  {
    const dt = "hire-manager";
    const catIds = [
      await buildManagementCore(dt),
      await buildHireManagerSpecific(dt),
    ];
    await linkRoleToCategories("Hire dept. Manager", catIds);
    await linkRoleToCategories("Hire Dept. Manager", catIds);
  }

  // ── 13. Warehouse Manager ─────────────────────────────────────────────────
  console.log("→ Warehouse Manager");
  {
    const dt = "warehouse-manager";
    const catIds = [
      await buildManagementCore(dt),
      await buildWarehouseManagerSpecific(dt),
    ];
    await linkRoleToCategories("Warehouse Manager", catIds);
  }

  // ── 14. IT & Procurement Manager (Product Support) ────────────────────────
  console.log("→ IT & Procurement Manager");
  {
    const dt = "product-support-manager";
    const catIds = [
      await buildManagementCore(dt),
      await buildProductSupportManagerSpecific(dt),
    ];
    await linkRoleToCategories("IT & Procurement Manager", catIds);
  }

  // ── 15. Sales Order Coordinator ───────────────────────────────────────────
  // Orders BLANK TEMPLATE was empty — apply management core with orders focus
  console.log("→ Sales Order Coordinator");
  {
    const dt = "orders-coordinator";
    const ordersId = await upsertCategory("Orders & Dispatch Responsibilities", dt, 0);
    const ordersItems = [
      "Orders dispatched within shortest possible time - look for constant improvements",
      "Parts ordered and received in shortest possible time",
      "Implement and put in place purchasing processes - Order numbers for all orders",
      "Ensure all items sent out can be invoiced - keep log and chase paperwork",
      "Create system for maximising go-ahead to quotes",
      "Sale order processes - put in place and implement",
      "Keeping Unit 1 clean & tidy",
      "Maintaining first aid box stock levels including eye rinse",
      "Make sure stock PPE is up to date (speak to department managers)",
    ];
    for (let i = 0; i < ordersItems.length; i++) {
      await upsertItem(ordersId, ordersItems[i], i);
    }
    await linkRoleToCategories("Sales Order Coordinator", [ordersId]);
  }

  console.log("\n=== Done ===");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
