# LVC Career Portal - Training & Development Management System

## Overview
Employee training management system for LVC (cleaning equipment company) supporting three roles: **colleague**, **manager**, and **admin**. Covers induction tracking, training matrix/competency assessments, career journey visualization, certificates, standards surveys, and resources.

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
- `client/src/App.tsx` - Router and providers
- `client/src/lib/authContext.tsx` - Auth context (login as colleague/manager/admin)
- `client/src/lib/hooks.ts` - React Query hooks for all API endpoints
- `client/src/lib/api.ts` - API client wrapper
- `client/src/pages/` - All page components

### Database Tables
- `users` - Colleagues, managers, admins (varchar IDs like 'colleague-1'). Includes `requiresInduction` boolean flag — when false, Induction page/nav is hidden for that user
- `induction_template_items` - Template checklist items
- `induction_instances` - Per-user induction instances
- `induction_item_completions` - Completion tracking per item
- `competency_categories` - Training matrix categories (engineering/admin)
- `competency_items` - Individual competency items
- `job_role_categories` - Join table linking job roles to specific skill categories (role-specific training matrices)
- `training_matrix_submissions` - User matrix submissions with ratings (JSONB)
- `standards_survey_roles` - Survey templates per job role
- `standards_survey_items` - Individual survey items
- `resources` - Learning resources
- `certificate_definitions` - Certificate types
- `user_certificates` - Certificates assigned to users
- `career_milestones` - User career history
- `career_nodes` - Career path structure
- `training_records` - Compliance training records
- `job_roles` - Job role definitions

## Mock Users (for login)
- `colleague1` / `colleague` - Michael Chen (Engineer)
- `manager1` / `manager` - James Wilson (Operations Manager)
- `admin` / `admin` - Sarah Mitchell (HR Director)

## Key Features
- **Induction tracking**: Section-by-section checklist with manager sign-off
- **Training matrix**: Interactive self-assessment with 0-4 rating scale via dialog, submit for review, manager approval. Supports role-specific skill assignments — admins can assign specific skill categories to each job role via the Job Roles page. Users see only skills relevant to their role; falls back to department-type filtering if no role-specific assignments exist.
- **Shareable training matrix**: Colleagues can generate a unique link (`/training-matrix/shared/:token`) for anyone to fill in their self-assessment without logging in
- **Standards survey**: Role-specific task standards
- **Certificates**: Definition + assignment system
- **Career map**: Career nodes with progression paths. Career Map page pulls real data from database (competency scores from training matrix, certificates from user certificates, development focus from career node requirements, milestones from career_milestones table). No hardcoded/mock data — new users see proper empty states.
- **Organisation page**: Hierarchical department tree using parentId relationships from departmentData.ts, department detail views with team structure and reporting lines, org chart driven by managerId
- **CSV import/export**: Full import and export support across all admin areas:
  - Users: /api/export/users, /api/import/users
  - Job Roles: /api/export/job-roles, /api/import/job-roles
  - Training Records: /api/export/training-records
  - Certificates: /api/export/certificates
  - Competencies (Training Matrix): /api/export/competencies, /api/import/competencies
  - Induction Templates: /api/export/induction-templates, /api/import/induction-templates
  - Certificate Definitions: /api/export/certificate-definitions, /api/import/certificate-definitions
  - Resources: /api/export/resources, /api/import/resources
  - Standards Surveys: /api/export/standards-surveys, /api/import/standards-surveys
- **Admin pages**: Full CRUD for Users, Templates (induction items, training matrix competencies, standards survey items), Job Roles, Resources, Certificates, Organisation

## Commands
- `npm run dev` - Start dev server (port 5000)
- `npm run db:push` - Push schema changes to DB
- `npx tsx server/seed.ts` - Seed database
