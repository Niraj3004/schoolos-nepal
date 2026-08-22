# SchoolOS - Project Verification & Roadmap (IDEA.md)

## Current Phase
Phase 1 — Full Project Verification

## Project Overview
SchoolOS is a multi-tenant school management SaaS platform built with:
- **Backend**: Node.js, Express, MongoDB (Mongoose), Zod validation, JWT authentication.
- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, Zustand, React Query, Lucide Icons.

## Backend Architecture

### Core Modules
1. **Auth** (`/auth`): Login, Registration, JWT management.
2. **SaaS / SuperAdmin** (`/saas`): Multi-tenant registration, SaaS plans, Platform QR settings.
3. **Tenant** (`/tenant`): School-specific settings, Academic Years, Terms, Houses.
4. **Academic** (`/academic`): Classes, Sections, Subjects, Teacher Allocations.
5. **Users** (`/students`, `/parents`, `/staff`): Role-based CRUD.
6. **Attendance** (`/attendance`): Daily and subject-wise attendance tracking.
7. **Exams** (`/exams`): Master exams, Marks entry, Report cards.
8. **Homework** (`/homework`): Assignments, Submissions.
9. **Finance** (`/finance`): Fee structures, Invoices, Payments.
10. **Communication** (`/communication`): Notices and messaging.
11. **Analytics** (`/analytics`): Dashboard metrics.

### Authentication & Middleware Flow
1. **Authenticate**: Verifies JWT.
2. **RequireTenant**: Ensures request belongs to a valid school slug/header.
3. **RequireActiveTenant**: Checks if school subscription is active.
4. **RequireRole**: Validates user role (`SUPERADMIN`, `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`).
5. **Validate**: Zod schema body parsing.
6. **AsyncErrorHandler**: Wraps controllers.

## Frontend Architecture

### Role-Based Dashboards
- `/superadmin`: SaaS management (Schools, Plans, Settings).
- `/admin`: School operations (Academics, Students, Teachers, Attendance, Finance, Exams).
- `/teacher`: Class management (Attendance, Exams, Homework).
- `/student`: View-only (Attendance, Results, Homework).
- `/parent`: View-only for linked children (Fees, Results).

## Missing Features / Broken Flows Identified (To be fixed in subsequent phases)

### Backend
- Missing API endpoints for Teacher to view specific students' homework submissions.
- Need to verify if `Finance` invoice generation works correctly with the current academic year.

### Frontend
- **Student Dashboard**: The `/student` and `/parent` directories exist but need to be fully fleshed out to connect to the backend APIs (`/attendance/student/:id`, `/exams/report-card/:examId/:id`).
- **Teacher Dashboard**: `teacher/homework/page.tsx` needs full UI testing to ensure grading works.
- **Admin Dashboard**: Need to verify if Finance UI connects properly to the backend.

---
## Roadmap

### Phase 1 — Full Project Verification
- [x] Inspect backend modules
- [x] Inspect frontend roles
- [x] Create IDEA.md

### Phase 2 — Backend Fixes (COMPLETED)
- [x] Fix missing `getSubmissionsForHomework` API so Teachers can view submissions.
- [x] Fix `generateMonthlyInvoices` transaction crash in standalone MongoDB mode.
- [x] Ensure Finance controllers match UI expectations (removed hardcoded year).

### Phase 3 — Frontend Core Fixes (COMPLETED)
- [x] Ensure Teacher grading workflows (Exams & Homework) are seamless.
- [x] Ensure Admin Finance (Fee collection) works end-to-end.

### Phase 4 — Frontend Roles (Student & Parent) (CURRENT)
- [ ] Complete `/student` dashboard (View attendance, grades, homework).
- [ ] Complete `/parent` dashboard (View children, pay fees).

### Phase 5 — Complete Integration & Testing
- [ ] Test Auth -> Admin -> Teacher -> Student data flow.


---
## Status Update (Phase 3 Completed)

**CURRENT PHASE:** Phase 4 (Frontend Roles - Student & Parent)

**COMPLETED:** 
- Phase 1 (Verification)
- Phase 2 (Backend Fixes)
- Phase 3 (Frontend Core Fixes)

**FIXED (Phase 3):**
- Built `SubmissionsModal.tsx` for Teachers to view, download, and evaluate student homework.
- Wired the "View Submissions" button into the Teacher Homework dashboard.
- Built `GenerateInvoiceModal.tsx` for Admins to trigger monthly fee generation.
- Wired the Admin Finance dashboard to the correct generation API endpoints.

**FRONTEND:**
- Teacher Homework grading UI is fully operational.
- Admin Finance UI is fully operational for generating invoices.

**APIS TESTED:**
- `GET /api/v1/homework/:id/submissions`
- `POST /api/v1/finance/invoices/generate-monthly`

**NEXT PHASE:** Phase 4 — Frontend Roles (Student & Parent)

**NEXT TASK:**
- Complete the Student Dashboard (View attendance, grades, homework).
- Complete the Parent Dashboard (View children, pay fees).
