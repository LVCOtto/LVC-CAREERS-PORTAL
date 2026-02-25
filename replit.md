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
- `users` - Colleagues, managers, admins (varchar IDs like 'colleague-1')
- `induction_template_items` - Template checklist items
- `induction_instances` - Per-user induction instances
- `induction_item_completions` - Completion tracking per item
- `competency_categories` - Training matrix categories (engineering/admin)
- `competency_items` - Individual competency items
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
- **Training matrix**: Self-assessment with 0-4 rating scale, submit for review, manager approval
- **Standards survey**: Role-specific task standards
- **Certificates**: Definition + assignment system
- **Career map**: Career nodes with progression paths
- **CSV exports**: /api/export/users, /api/export/training-records, /api/export/certificates
- **Admin pages**: Users, Templates, Roles, Resources, Certificates, Organisation

## Commands
- `npm run dev` - Start dev server (port 5000)
- `npm run db:push` - Push schema changes to DB
- `npx tsx server/seed.ts` - Seed database
