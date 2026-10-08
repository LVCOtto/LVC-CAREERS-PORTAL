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
- `users` - Colleagues, managers, admins, architects (varchar IDs like 'colleague-1'). Includes `requiresInduction` boolean flag — when false, Induction page/nav is hidden for that user. `activated` boolean — accounts without username/email/password are inactive and cannot log in. `email`, `username`, `password` are nullable to support importing users with just a name.
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
- **Template filters**: Admin Templates has shared department and job-role filters across Induction Checklists, Training Matrix and Standards Survey, plus induction section and training category selectors. Department selection narrows the job-role options and resets the selected role. Induction department views combine the applicable sections for that department's roles, including universal sections and the existing unconfigured-role fallback. Training role views use assigned categories, falling back to the role's department categories when no assignments exist; department-only views include universal categories. Surveys match stable role IDs, or normalized titles for legacy templates. Clear filters restores the full lists. Section reordering is disabled while induction filters are active to avoid moving hidden sections. Filters affect the view only, not CSV exports or template assignments.
- **Induction tracking**: Section-by-section checklist with manager sign-off. Flow: Not Started → In Progress → Completed → Signed Off. `inProgress` boolean on `induction_item_completions`. Modular induction system — sections can be marked "Universal" (applies to all roles) or assigned per job role via the Job Roles page. If no sections are configured, users see all sections (backwards compatible). Uses `induction_section_settings` table (universal toggles) and `job_role_induction_sections` join table (role-specific assignments). Managers/admins can fully manage team induction from Team page: start items, mark complete, sign off, undo any step, assign a person, and edit completed date inline. `assignedTo` and `inProgress` fields on `induction_item_completions`.
- **Training matrix**: Interactive self-assessment with 0-4 rating scale via dialog, submit for review, manager approval. Supports role-specific skill assignments — admins can assign specific skill categories to each job role via the Job Roles page. Users see only skills relevant to their role; falls back to department-type filtering if no role-specific assignments exist.
- **Repeat self-assessments**: Explicit start/resume creates a persisted blank draft after approval, or resumes the latest existing draft. Portal and shared links use the same lifecycle; pending sign-off blocks another cycle. Submitted ratings and stale drafts are read-only, including through old shared links. A completed shared link offers an explicit start/continue action and opens the current draft's own token without changing the historical record. Copying an existing link and marking a request as sent do not reset answers; sharing for a colleague with no assessments creates their initial blank draft. Previous scores are neutral labelled reference text, not selected rating buttons, and never count toward new progress. Sections are complete only when their current answers are filled and remain editable until submission. All applicable skills must be rated before submission (0 is a valid answer); drafts can be partial. Changed skill lists retain applicable draft answers, visibly exclude removed skills and require ratings for new skills. The portal separates current draft progress from previous read-only results. Historical results are displayed against the current skill list; skills added later may have no saved score.
- **Assessment lifecycle/API**: `POST /api/training-matrix/start` with `{ userId }` creates/resumes a draft; `POST /api/training-matrix/shared/:token/start` does the same via an existing assessment link and returns the draft's token. Starting locks the colleague row in a transaction to prevent duplicate drafts. Assessment PATCH requests accept only `{ ratings, status: "draft" | "pending_review" }`; submission dates are set server-side. Managers/admins can approve pending assessments and edit review dates, but cannot overwrite submitted ratings. The old collection POST supports only creating/resuming a blank draft. No schema migration is required: the existing submission ID identifies each cycle, `lastAssessment` records a draft's start date, and the prior submitted record supplies reference scores. Legacy rows accidentally marked draft while retaining submission/approval metadata are treated as submitted/read-only without rewriting their stored answers. Previously overwritten answers cannot be reconstructed.
- **Manager assessment reset**: Managers can reset direct reports from the Team Training row actions or a colleague's Training tab; admins can reset any colleague. Confirmation starts a separate blank draft, retaining approved results and review dates. Existing drafts and pending assessments are marked `superseded` without deleting their ratings or dates; they remain read-only in history and old links open the current draft through the existing continue action. Superseded submitted results remain visible in history/timelines, while the compact overview deliberately retains the last submitted score/date. Reset does not send email, mark a request as sent or clear request tracking. `POST /api/training-matrix/reset` accepts `{ userId }`, requires manager/admin access and performs superseding and draft creation in one colleague-locked transaction. No database migration is required.
- **Team training overview**: Managers/admins have a compact Training page under Team Management at `/team/training`, scoped to the same direct reports as My Team. One row per member shows the latest submitted date and score, review due date, and latest unanswered request date. New drafts do not hide previous submissions; expired and never-completed names are highlighted and sorted first. Search, status filters, share-link copying and training-tab deep links are available. Mark as sent records a manually distributed request (no email is sent); a subsequent submission clears it, including submissions via shared links. Copying a link does not record a request or reset assessments. `training_matrix_requests` stores the latest request per user and is created automatically by the idempotent startup migration. Existing requests are not backfilled.
- **Shareable training matrix**: Colleagues/managers can generate an assessment-specific link (`/training-matrix/shared/:token`) for completion without logging in. Draft links support saving and submission; submitted links are read-only. After approval, an explicit start action creates/resumes a separate draft with its own link.
- **Next review date**: Managers set a next review date (default 6 months) when approving a training matrix. Shown with overdue/due-soon indicators on both manager (Team) and colleague (Training) pages. Managers can edit the date post-approval. Date carries forward when colleague starts a new self-assessment. `approvedBy` and `approvedDate` are now correctly recorded on approval.
- **Training matrix dates**: Submitted date and approved date (with approver name) displayed on both Team (manager) and Training (colleague) pages — in the status card, header bar, and inline with badges.
- **Training matrix PDF export**: "Download PDF" button on Team page generates a PDF with colleague details, competency categories with ratings, category averages, overall score, submitted/approved dates, approver name, and next review date. Uses same jsPDF/autotable pattern as induction export.
- **Assessment history**: All past matrix submissions are preserved in the database. Route `GET /api/training-matrix/history/:userId` returns all submissions ordered newest-first. "Assessment History" section on Team page shows past entries with status, dates, and overall score; each is expandable to view the full read-only ratings.
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
- `node --import tsx --test shared\trainingAssessment.test.ts client\src\components\TrainingMatrixWizard.test.ts` - Run assessment lifecycle and wizard presentation tests.
- Set `DATABASE_URL` to a dummy local URL (for example `postgresql://test:test@127.0.0.1:1/test`), then run `node --import tsx --test server\trainingAssessment.test.ts server\teamTraining.test.ts shared\teamTraining.test.ts` - Run mocked assessment API and team-status regression tests without connecting to a database.
- `npm run dev` - Start dev server (port 5000)
- `npm run db:push` - Push schema changes to DB
- `npx cross-env DATABASE_URL=postgresql://test:test@127.0.0.1:1/test tsx --test shared/teamTraining.test.ts server/teamTraining.test.ts` - Run training overview rules and API permission tests with mocked storage; no database connection is made
- `npx tsx server/seed.ts` - Seed database
