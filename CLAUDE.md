# Architecture & System Design for SchoolOS Nepal

## 1. Core Stack
- **Runtime Environment:** Node.js
- **Web Framework:** Express
- **Language:** TypeScript
- **Database:** MongoDB (using Mongoose ODM)
- **File Storage:** Cloudinary (for all file uploads)
- **Validation:** Zod

## 2. User Roles
The platform operates with 5 distinct user roles:
- **SUPERADMIN:** Platform owner (Tenant Management, QR Approvals, BI)
- **ADMIN:** School Principal/Management (Ops)
- **TEACHER:** Grading, Subject Attendance
- **STUDENT:** Learning, Attendance Viewing
- **PARENT:** Fees payment, Guardian links

## 3. Multi-Tenancy Enforcement
- **Strict Multi-Tenant Isolation:** Every operational collection MUST contain `schoolId: mongoose.Schema.Types.ObjectId`.
- **Query Scoping:** Every database query (find, update, delete) MUST explicitly filter by `schoolId`. A tenant must never read or mutate another tenant's records.
- **Indexes:** Enforce `{ schoolId: 1 }` index on every collection (except platform-level `PlatformTenant` and `SuperAdmin`).

## 4. Manual QR Payment Verification System
Financial approvals must implement deterministic state transitions. No invoice or subscription can transition directly to `PAID` without an auditable verification record.
- **Tier 1 (B2B):** School Admin uploads platform payment receipt slip -> SuperAdmin verifies -> SaaS subscription activated.
- **Tier 2 (B2C):** Parent uploads school fee payment slip -> School Admin verifies -> Student invoice cleared.
- **State Machine:** `PENDING -> (Approve) -> VERIFIED/PAID` or `PENDING -> (Reject) -> REJECTED`.

## 5. Nepal Context Requirements
- **Dual Date Engine:** All academic records must preserve both Bikram Sambat (BS) and Anno Domini (AD) dates. Bidirectional conversion must be supported.
- **GPA Calculation Engine:** Must support terminal exams, internal assessments (theory + practical), and strictly follow official Nepal National Examination Board (NEB) rules (e.g., 90% - 100% = A+, 3.6 - 4.0).

## 6. Layered Architecture Convention
Every request flows through strict, isolated layers:
`HTTP Request -> Middlewares -> Thin Controller -> Service Logic -> Mongoose Model`

1. **Route Middleware:** Validates JWT, extracts tenant (`schoolId`), enforces RBAC (`requireRole`), validates payload schemas (Zod).
2. **Controller (Thin):** Extracts `req.body`, `req.params`, `req.user`, `req.tenant`; delegates immediately to the service; returns `response.success()`.
3. **Service (Pure Logic):** Contains all domain calculations (Nepali GPA, fee ledger balances, receipt verification states). Controllers and services never call raw database drivers directly.
4. **Mongoose Model:** Multi-tenant schemas enforcing `schoolId`.

## 7. Non-Negotiable Engineering Rules
- **Zero Direct File Storage:** Local filesystem uploads are strictly forbidden. All receipts, avatars, and homework PDFs must stream directly to Cloudinary and store the returned secure HTTPS URL and `public_id`.
- **Fail-Safe Envelope Pattern:** All HTTP responses must use a standardized JSON envelope.
  - Success: `{ "success": true, "data": { ... }, "message": "Optional feedback" }`
  - Error: `{ "success": false, "error": { "code": "ERR_CODE", "message": "...", "details": ... } }`
- **Error Codes:** Standardize on specific error types (`NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `TENANT_SUSPENDED`, `CONFLICT`).
