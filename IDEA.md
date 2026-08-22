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

### Phase 4 — Frontend Roles (Student & Parent) (COMPLETED)
- [x] Complete `/student` dashboard (View attendance, grades, homework).
- [x] Complete `/parent` dashboard (View children, pay fees).

### Phase 5 — Complete Integration & Testing (CURRENT)
- [ ] Test Auth -> Admin -> Teacher -> Student data flow.


---
## Status Update (Phase 4 Completed)

**CURRENT PHASE:** Phase 5 (Complete Integration & Testing)

**COMPLETED:** 
- Phase 1 (Verification)
- Phase 2 (Backend Fixes)
- Phase 3 (Frontend Core Fixes)
- Phase 4 (Frontend Roles - Student & Parent)

**FIXED (Phase 4):**
- Built `/student/page.tsx` home dashboard.
- Built `/student/attendance/page.tsx` showing present/absent stats.
- Built `/student/exams/page.tsx` with dynamic Report Card generation logic matching backend.
- Fixed `FormData` payload mapping bug in Student Homework submission.
- Built `/parent/page.tsx` to list all linked children.
- Built `/parent/children/[id]` showing detailed child attendance and exams.
- Built `/parent/children/[id]/report-card/[examId]` for parent viewing of report cards.
- Verified Parent Fee slips dashboard payload matching backend expectations.

**NEXT PHASE:** Phase 5 — Complete Integration & Testing

**NEXT TASK:**
- Perform end-to-end testing of Auth -> Admin -> Teacher -> Student data flow to ensure there are no breaking bugs across the ecosystem.
