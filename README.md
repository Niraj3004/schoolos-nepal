# 🏫 SchoolOS Nepal

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

SchoolOS is a localized, multi-tenant SaaS operating system designed specifically for schools in Nepal. It solves real-world administrative, financial, and academic challenges by providing an isolated, highly secure workspace for every school under a single platform.

Instead of relying on expensive payment gateways (which many schools and parents in Nepal do not use), SchoolOS introduces a highly practical **Manual QR Verification** workflow for fee collection and SaaS subscriptions, making it 100% accessible to local communities.

---

## 🌟 Why SchoolOS Nepal?

Most generic school management systems fail in Nepal because they don't support the local context. SchoolOS is built from the ground up to support:
1. **The Nepali Calendar:** Native bidirectional conversion between Bikram Sambat (BS) and Anno Domini (AD).
2. **NEB Grading System:** Accurate National Examination Board (NEB) GPA calculations (A+ to NG) separating Theory and Practical marks.
3. **Local Payment Culture:** Seamless integration of eSewa/Fonepay/Bank Transfer screenshot uploads for fee settlements.

---

## ✨ Comprehensive Feature List

### 🛡️ 1. Multi-Tenant SaaS & Platform Architecture
*   **Dynamic Wildcard Subdomains:** Every school gets its own branded URL out-of-the-box (e.g., `bmss.schoolos.np`, `apex.schoolos.np`).
*   **Strict Data Isolation:** Every database query is strictly scoped to the `schoolId`. A tenant can never access another tenant's data.
*   **SaaS Subscription Flow (Tier 1 QR):** Schools sign up, upload their subscription payment receipt to Cloudinary, and await SuperAdmin activation.

### 🏫 2. School Administration (Admin)
*   **Executive Dashboard:** Real-time analytics on attendance rates, fee collection liquidity, and student/teacher ratios.
*   **Academic Configuration:** Manage Academic Years (with BS/AD dates), Evaluation Terms, Class hierarchies, Sections, and House systems.
*   **User Management:** Bulk enroll students, assign Class Teachers, and link students to Guardian/Parent profiles.

### 💸 3. Financial Engine & Invoicing (Admin & Parent)
*   **Custom Fee Structures:** Define class-wise fees (Tuition, Computer Lab, Transport, Admission).
*   **Bulk Invoicing:** Generate monthly bills for an entire class with one click, automatically applying individual scholarships or fines.
*   **Parent QR Workflow (Tier 2 QR):** Parents view outstanding invoices, scan the school's bank QR, and upload a screenshot of the transaction.
*   **Ledger Verification:** Admins review pending uploaded slips and click "Verify" to automatically transition the invoice to `PAID`.

### 📚 4. Academic & Examination Engine (Teacher & Admin)
*   **Subject Allocation:** Assign specific teachers to subjects with defined Credit Hours, Theory Marks, and Practical Marks.
*   **Marks Entry:** Spreadsheet-like bulk entry for exam marks.
*   **NEB GPA Generator:** Automatically computes Letter Grades and Grade Points. Automatically assigns `NG` (Non-Graded) if a student scores below 35% in either theory or practical.
*   **Digital Report Cards:** Generates downloadable, print-ready NEB-standard marksheets.

### 👨‍🏫 5. Teacher & Classroom Workspace
*   **Smart Attendance:** Rapid daily and subject-wise attendance grids (Present, Absent, Late, Excused).
*   **Absence Alerts:** Automatically flags absent students for SMS/Push notification dispatch to parents.
*   **Homework & Materials:** Assign homework with PDF/Image attachments. Review and grade student file submissions.

### 👨‍👩‍👧 6. Parent & Student Portals
*   **Linked Accounts:** A single Parent account can track multiple children across different grades.
*   **Live Tracking:** View real-time attendance, upcoming exam schedules, and teacher feedback.
*   **Notice Board:** Role-scoped digital circulars (e.g., a notice sent only to "Grade 10 Parents").

---

## 🛠️ Tech Stack & Architecture

**Frontend (Next.js App Router):**
*   **Framework:** Next.js (React) + TypeScript
*   **Styling:** Tailwind CSS (Custom Navy Blue & Yellow SaaS Theme)
*   **State Management:** Zustand (Auth/Tenant State) & TanStack Query (Data Caching)
*   **Forms:** React Hook Form + Zod

**Backend (Node.js & Express):**
*   **Server:** Node.js, Express.js, TypeScript
*   **Database:** MongoDB with Mongoose (Compound indexing for multi-tenancy)
*   **File Storage:** Cloudinary (Direct streaming via Multer memory storage)
*   **Security:** Helmet, CORS (Wildcard Regex), Express Rate Limit, bcryptjs
*   **Authentication:** JWT (Short-lived Access Tokens + HTTP-Only Refresh Tokens)

### High-Level Architecture
```text
[Wildcard Subdomain: *.schoolos.np]
       │
       ▼
[Next.js Middleware: Extracts Slug]
       │
       ▼
[Express API: tenant.ts Middleware] ──► Looks up `Tenant.code` in MongoDB
       │
       ▼
[Scoped Controllers & Services] ──► { schoolId: ObjectId } applied to ALL queries
