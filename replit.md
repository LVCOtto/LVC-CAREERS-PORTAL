# LVC Career Portal - Training & Development Management System

## Overview
Employee training management system for LVC (cleaning equipment company) supporting four roles: **colleague**, **manager**, **admin**, and **architect**. Covers induction tracking, training matrix/competency assessments, career journey visualization, certificates, standards surveys, resources, and portal customisation via Architect Studio.

## Architecture
- **Frontend**: React + TypeScript + Vite, wouter routing, shadcn/ui, Tailwind CSS
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Data fetching**: TanStack React Query with custom hooks

## Key Files

### Backend
- `server/index.ts` - Express server setup
- `server/routes.ts` - All API routes (prefixed /api)
- `server/storage.ts` - Database CRUD operations via Drizzle
- `server/db.ts` - Database connection
- `server/seed.ts` - Database seed script
- `shared/schema.ts` - Drizzle schema definitions + Zod insert schemas

### Frontend
- `client/src/App.tsx` - Router and providers (AuthProvider, PortalSettingsProvider)
- `client/src/lib/authContext.tsx` - Auth context (login as colleague/manager/admin/architect)
- `client/src/lib/portalSettingsContext.tsx` - Portal settings context — fetches settings from API, provides `getSetting(key, defaultValue)` to all components
- `client/src/lib/hooks.ts` - React Query hooks for all API endpoints
- `client/src/lib/api.ts` - API client wrapper
- `client/src/pages/` - All page components
- `client/src/pages/ArchitectStudio.tsx` - Architect Studio for portal customisation

### Database Tables
- `users` - Colleagues, managers, admins, architects (varchar IDs like 'colleague-1'). Includes `requiresInduction` boolean flag — when false, Induction page/nav is hidden for that user
- `induction_template_items` - Template checklist items
- `induction_instances` - Per-user induction instances
- `induction_item_completions` - Completion tracking per item
- `competency_categories` - Training matrix categories (engineering/admin)
- `competency_items` - Individual competency items
- `job_role_categories` - Join table linking job roles to specific skill categories (role-specific training matrices)
- `training_matrix_submissions` - User matrix submissions with ratings (JSONB), `nextReviewDate` for scheduling follow-up assessments
- `standards_survey_roles` - Survey templates per job role
- `standards_survey_items` - Individual survey items
- `resources` - Learning resources
- `certificate_definitions` - Certificate types
- `user_certificates` - Certificates assigned to users
- `career_milestones` - User career history
- `career_nodes` - Career path structure
- `training_records` - Compliance training records
- `job_roles` - Job role definitions with `reportsTo` (self-referencing hierarchy), `sortOrder`, and `department` (string matching departments.name). Admin Roles page groups roles by department with collapsible sections and per-department hierarchy trees.
- `job_role_induction_sections` - Join table linking job roles to induction section names (role-specific induction)
- `induction_section_settings` - Per-section settings with isUniversal flag (universal sections appear for all roles)
- `departments` - Organisation departments with name (unique), parentId (self-referencing hierarchy), color (Tailwind class), sortOrder
- `portal_settings` - Key-value settings for portal customisation (branding, navigation labels, page visibility, wording, rating labels). Categories: branding, navigation, pages, wording, ratings

## Mock Users (for login)
- `colleague1` / `colleague` - Michael Chen (Engineer)
- `manager1` / `manager` - James Wilson (Operations Manager)
- `admin` / `admin` - Sarah Mitchell (HR Director)
- `architect` / `architect` - Portal Architect (Portal customisation role)

## Architect Role
The architect role is a non-employee user type for customising the portal. Architects:
- See ONLY the "Portal Studio" link in the sidebar (no My Career, Company, Team, or Admin sections)
- Are automatically redirected to Architect Studio when logging in (/dashboard redirects to /architect-studio)
- Can customise: portal title, login headings, sidebar title, primary colour (HSL), navigation labels, page visibility toggles, page headings/descriptions, self-assessment instructions, and rating scale labels (0-4)
- Settings are stored in `portal_settings` table and read via `PortalSettingsContext`
- Changes take effect portal-wide after saving (other users see updated labels/text on refresh)

### Portal Settings Keys
- `portal.title`, `portal.loginHeading`, `portal.loginSubheading`, `portal.sidebarTitle`
- `branding.primaryColor` (HSL format, e.g. "222 47% 20%")
- `nav.dashboard`, `nav.induction`, `nav.training`, `nav.career`, `nav.playbook`, `nav.milestones`, `nav.resources`, `nav.organisation`, `nav.team`
- `pages.induction.visible`, `pages.career.visible`, `pages.playbook.visible`, `pages.milestones.visible`, `pages.resources.visible`, `pages.organisation.visible`
- `page.training.heading`, `page.training.description`, `page.training.assessmentInstructions`
- `page.dashboard.welcomePrefix`, `page.induction.heading`, `page.induction.description`
- `rating.0` through `rating.4`

## Key Features
- **Induction tracking**: Section-by-section checklist with manager sign-off. Flow: Not Started → In Progress → Completed → Signed Off. `inProgress` boolean on `induction_item_completions`. Modular induction system — sections can be marked "Universal" (applies to all roles) or assigned per job role via the Job Roles page. If no sections are configured, users see all sections (backwards compatible). Uses `induction_section_settings` table (universal toggles) and `job_role_induction_sections` join table (role-specific assignments). Managers/admins can fully manage team induction from Team page: start items, mark complete, sign off, undo any step, assign a person, and edit completed date inline. `assignedTo` and `inProgress` fields on `induction_item_completions`.
- **Training matrix**: Interactive self-assessment with 0-4 rating scale via dialog, submit for review, manager approval. Supports role-specific skill assignments — admins can assign specific skill categories to each job role via the Job Roles page. Users see only skills relevant to their role; falls back to department-type filtering if no role-specific assignments exist.
- **Shareable training matrix**: Colleagues can generate a unique link (`/training-matrix/shared/:token`) for anyone to fill in their self-assessment without logging in
- **Next review date**: Managers set a next review date (default 6 months) when approving a training matrix. Shown with overdue/due-soon indicators on both manager (Team) and colleague (Training) pages. Managers can edit the date post-approval. Date carries forward when colleague starts a new self-assessment. `approvedBy` and `approvedDate` are now correctly recorded on approval.
- **Shareable induction progress**: Managers can generate a read-only share link (`/induction/shared/:token`) for a colleague's induction. Shows colleague name, job role, section-grouped progress with color-coded cards. Uses `shareToken` on `induction_instances` table. Route ordering: `/api/induction/shared/:token` must come before `/api/induction/:userId`.
- **Standards survey**: Role-specific task standards
- **Certificates**: Definition + assignment system
- **Career map**: Career nodes with progression paths. Career Map page pulls real data from database (competency scores from training matrix, certificates from user certificates, development focus from career node requirements, milestones from career_milestones table). No hardcoded/mock data — new users see proper empty states.
- **Departments**: Database-driven department management (departments table with name, parentId hierarchy, color, sortOrder). Admins can add/edit/rename/delete departments from the Organisation page's "Manage Departments" tab. Department dropdown in User Management replaces free-text input. Deletion prevented if users assigned or child departments exist.
- **Organisation page**: Hierarchical department tree using parentId relationships from database departments, department detail views with team structure and reporting lines, org chart driven by managerId
- **CSV import/export**: Full import and export support across all admin areas
- **Full backup/restore**: ZIP-based export of all 21 database tables as CSVs, with restore capability. Backend modules: `server/backup.ts` (export) and `server/restore.ts` (import). Routes: `GET /api/export/full-backup` and `POST /api/import/full-backup`. UI on Templates page "Data Backup" tab.
- **Admin pages**: Full CRUD for Users, Templates (induction items, training matrix competencies, standards survey items), Job Roles, Resources, Certificates, Organisation
- **Architect Studio**: Portal customisation for branding, navigation, pages, wording, and rating scale

## Commands
- `npm run dev` - Start dev server (port 5000)
- `npm run db:push` - Push schema changes to DB
- `npx tsx server/seed.ts` - Seed database
