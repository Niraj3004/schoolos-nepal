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

### Phase 5 — Complete Integration & Testing (COMPLETED)

- [x] Test Auth -> Admin -> Teacher -> Student data flow.

### Phase 6 — UI/UX & Cleanup (COMPLETED)

---

## Status Update

**CURRENT PHASE:** Phase 8 (Notifications & Reminders)

**COMPLETED:**

- Phase 1 (Verification)
- Phase 2 (Backend Fixes)
- Phase 3 (Frontend Core Fixes)
- Phase 4 (Frontend Roles - Student & Parent)
- Phase 5 (Complete Integration & Testing)
- Phase 6 (UI/UX Redesign)
- Phase 7 (Analytics & Reporting)

**FIXED (Phase 5):**

- Reviewed Student and Parent endpoints to ensure inference of `classId` and `sectionId` is robust.
- Discovered and removed a crashing `mongoose.startSession()` call in `submitBulkMarks` (Teacher Exams API), which would have broken the Teacher grading workflow in standalone MongoDB mode.
- Verified that the full flow (Admin Setup -> Teacher Grades -> Student Views -> Parent Views) works.

**NEXT PHASE:** Phase 8

**NEXT TASK:**

- Phase 7 (Analytics & Reporting)
- Phase 8 (Notifications & Reminders)
- Phase 9 (Mobile Optimization)
- Phase 10 (Advanced UI/UX Redesign & Launch Prep)

---

### Future Phases (7-10)

**Phase 7 — Analytics & Reporting**

- Add advanced graphs and reporting features for Admins.

**Phase 8 — Notifications & Reminders**

- Implement SMS/Email notification system for fee dues and absences.

**Phase 9 — Mobile Optimization**

- Ensure all dashboards are fully responsive for mobile devices.

**Phase 10 — Advanced UI/UX Redesign**

- Final visual polish, performance optimization.
