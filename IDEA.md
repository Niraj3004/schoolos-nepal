# SchoolOS Nepal — Project Memory (IDEA.md)

_Last updated after full inspection — Phase 11 continuation_

---

## Project Overview

SchoolOS Nepal is a multi-tenant School Management SaaS platform.

- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose) + Zod validation + JWT
- **Frontend**: Next.js 16 (App Router) + React + Tailwind CSS + Zustand + TanStack Query + Lucide Icons + Recharts + Framer Motion

---

## Backend Architecture

### Modules & Routes

| Module       | Route Prefix      | Status    |
|--------------|-------------------|-----------|
| Auth         | `/auth`           | ✅ Done    |
| SaaS         | `/saas`           | ✅ Done    |
| Tenant       | `/tenant`         | ✅ Done    |
| Academic     | `/academic`       | ✅ Done    |
| Students     | `/students`       | ✅ Done    |
| Parents      | `/parents`        | ✅ Done    |
| Staff        | `/staff`          | ✅ Done    |
| Attendance   | `/attendance`     | ✅ Done    |
| Exams        | `/exams`          | ✅ Done    |
| Homework     | `/homework`       | ✅ Done    |
| Finance      | `/finance`        | ✅ Done    |
| Communication| `/communication`  | ✅ Done    |
| Analytics    | `/analytics`      | ✅ Done    |
| Search       | `/search`         | ✅ Done    |

### Auth Flow
1. `POST /auth/login` → Returns `{ user, accessToken }`
2. JWT stored in Zustand + localStorage
3. Middleware chain: `authenticate` → `requireTenant` → `requireActiveTenant` → `requireRole` → `validate` → Controller

### Credential System (Auto-generated)
- **Students**: Login = `{admissionNumber}@{subdomain}.schoolos.com`, Password = `dobBS` or `Password123!`
- **Teachers**: Login = `{employeeId}@{subdomain}.schoolos.com`, Password = phone or `Teacher123!`
- **Parents**: Login = `{primaryPhone}@{subdomain}.schoolos.com`, Password = `Password123!`

---

## Frontend Architecture

### Role-Based Pages

| Role        | Root Path     | Status      |
|-------------|---------------|-------------|
| SuperAdmin  | `/superadmin` | ⚠️ Minimal  |
| Admin       | `/admin`      | ✅ Good      |
| Teacher     | `/teacher`    | ⚠️ Stub only |
| Student     | `/student`    | ⚠️ Minimal  |
| Parent      | `/parent`     | ⚠️ Minimal  |

### Existing Pages (Verified)

#### SuperAdmin
- `/superadmin` — Shows pending subscriptions, active schools count, revenue. Only review/approve requests.
- `/superadmin/schools` — School list
- `/superadmin/plans` — SaaS plans
- `/superadmin/settings` — Platform settings

#### Admin
- `/admin` — Full dashboard with analytics, charts, calendar, attendance overview ✅
- `/admin/students` — Full CRUD (create, list, search, filter, pagination) ✅
- `/admin/teachers` — Full CRUD (create, list, search, filter, pagination) ✅
- `/admin/attendance` — Mark attendance with grid UI ✅
- `/admin/academic` — Classes, Sections, Subjects, Allocations ✅
- `/admin/exams` — Create exam, list exams (basic) ✅
- `/admin/finance` — Fee management ✅

#### Teacher
- `/teacher` — **STUB** (only shows a fake hardcoded card "Total Activity: 12") ❌
- `/teacher/attendance` — Full working attendance taking UI ✅
- `/teacher/exams` — Marks entry ✅
- `/teacher/homework` — Assignment management ✅

#### Student
- `/student` — Minimal (shows class, roll number, gender — no attendance %, no exams, no real data) ⚠️
- `/student/attendance` — Exists (needs check)
- `/student/exams` — Exists
- `/student/homework` — Exists
- `/student/report-card/[id]` — Exists

#### Parent
- `/parent` — Lists children with View Details link ✅ (basic)
- `/parent/children` — Children list
- `/parent/children/[id]` — Child detail
- `/parent/fees` — Fee viewing

---

## GAPS FOUND (What needs to be built/fixed)

### 🔴 CRITICAL GAPS

1. **Teacher Dashboard** (`/teacher/page.tsx`) — Complete stub. Shows fake hardcoded number. No real API data, no stats, no upcoming classes, no pending tasks.

2. **Student Dashboard** (`/student/page.tsx`) — Very minimal. Shows class/roll number/gender/DOB only. Missing:
   - Attendance percentage stat
   - Pending homework count
   - Upcoming exam count
   - Recent announcements (hardcoded empty state)
   - Upcoming exams (hardcoded empty state)

3. **Parent Dashboard** (`/parent/page.tsx`) — Only shows children cards, no stats. Missing:
   - Per-child attendance summary
   - Pending fees summary
   - Recent notices

4. **SuperAdmin Dashboard** (`/superadmin/page.tsx`) — Only shows subscription approval workflow. Missing:
   - Total schools chart
   - Revenue analytics
   - Recent signups

### 🟡 MISSING FEATURES

5. **Login Page** — Functional but plain. No show/hide password toggle. No branding on left side.

6. **Admin Exams Page** — No edit/delete buttons on exam rows. No marks entry link from here.

7. **Admin Finance Page** — Needs verification that fee collection flow works end-to-end.

8. **Notices Page** (`/notices`) — Shared page for all roles. Needs verification.

---

## Progress

```
Current Phase: Phase 11 — Complete Dashboard Upgrade

Completed:
- Phase 1: Full Project Verification
- Phase 2: Backend Fixes (finance, submissions API)
- Phase 3: Frontend Core Fixes (teacher grading, finance)
- Phase 4: Student & Parent Frontend
- Phase 5: Integration Testing
- Phase 6: UI/UX Cleanup
- Phase 7: Analytics & Reporting (Admin dashboard charts)
- Phase 8: WebSocket notifications system
- Phase 9: Mobile optimization (responsive layout)
- Phase 10: Landing page redesign (Nepal Vibe)

In Progress:
- Phase 11: Teacher Dashboard + Student Dashboard upgrade

Remaining:
- Phase 11A: Teacher Dashboard (real data from API)
- Phase 11B: Student Dashboard (attendance %, homework, exams)
- Phase 12: SuperAdmin, Parent, and Admin Polish
  - Parent portal children view with detailed attendance and progress
  - SuperAdmin platform analytics and subscription request management
  - Admin exam management with CRUD and publish controls
  - Login page visual improvements (show/hide password)
  - Status: ✅ COMPLETED

- Phase 13: Landing Page Aesthetics (Nepal Vibe)
  - Enhanced landing page with hero.avif transparent image
  - Added Nepal-specific visuals (Mountain backdrop, SVG decor)
  - Removed outdated hero placeholders
  - Status: ✅ COMPLETED

Problems Found:
- Teacher dashboard is a complete stub with fake hardcoded data
- Student dashboard lacks attendance %, homework count, upcoming exams
- Parent dashboard has no per-child stats summary
- SuperAdmin dashboard lacks any platform analytics charts

Problems Fixed:
- teachers.map() bug in AllocationModal (was paginated object, fixed to .data.teachers)
- Finance invoice generation transaction crash
- Teacher grading (submitBulkMarks) session bug

Next Phase: Phase 11
Next Task: Build Teacher Dashboard with real API data
```

---

## API Reference (Key Endpoints Used in Frontend)

```
GET  /analytics/admin-dashboard   → Admin stats (students, teachers, attendance, fees)
GET  /analytics/teacher-workload  → Teacher class workload
GET  /students/me                 → Current student profile
GET  /parents/my-children         → Parent's linked children
GET  /academic/allocations/my-classes  → Teacher's allocated classes/subjects
GET  /attendance/student/:studentId    → Student attendance records
GET  /exams/my-results            → Student exam results
GET  /homework/my-assignments     → Student homework list
GET  /communication/notices       → Notices list
```

---

## Design System

- **Colors**: Primary blue (`#3b82f6`), Red accent (`#ef4444`), Slate dark sidebar
- **Font**: System sans-serif
- **Cards**: Rounded-xl, soft shadows
- **Layout**: Fixed sidebar (dark slate) + sticky topbar (glassmorphic white)
- **Theme**: Light mode with white backgrounds, nepal vibe on landing only
