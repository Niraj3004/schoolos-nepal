# 🏫 SchoolOS Nepal

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

SchoolOS is a localized, multi-tenant SaaS operating system designed specifically for schools in Nepal. It solves real-world administrative, financial, and academic challenges by providing an isolated workspace for every school under a single platform.

Instead of relying on expensive payment gateways, SchoolOS introduces a highly practical **Manual QR Verification** workflow for fee collection and SaaS subscriptions, making it 100% accessible to local schools and parents.

## ✨ Key Features

*   **Multi-Tenant SaaS Architecture:** True data isolation. Every school gets its own environment and dynamic subdomain (e.g., `bmss.schoolos.np`).
*   **Nepal-Specific Academic Engine:** 
    *   Bidirectional Bikram Sambat (BS) and Anno Domini (AD) calendar support.
    *   National Examination Board (NEB) compliant GPA calculation (Theory + Practical splits, 'NG' handling).
*   **Manual QR Payment Workflows:**
    *   *Tier 1:* Schools upload SaaS subscription receipts for SuperAdmin approval.
    *   *Tier 2:* Parents upload fee payment screenshots for School Admin verification.
*   **Smart Attendance:** Daily and subject-wise attendance tracking with absence alerts.
*   **Role-Based Access Control (RBAC):** Distinct portals for SuperAdmin, Admin, Teacher, Student, and Parent.
*   **Cloud-Native Storage:** Direct-to-Cloudinary streaming for avatars, homework PDFs, and payment slips.

## 🛠️ Tech Stack

**Frontend:**
*   Next.js (App Router)
*   TypeScript & Tailwind CSS
*   Zustand (Auth/Tenant State) & TanStack Query (Server State)
*   React Hook Form + Zod (Validation)

**Backend:**
*   Node.js & Express.js
*   TypeScript
*   MongoDB & Mongoose (Multi-tenant indexes)
*   Cloudinary (Media Storage)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Cloudinary Account (Free Tier)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/schoolos-nepal.git](https://github.com/yourusername/schoolos-nepal.git)
cd schoolos-nepal

2. Backend Setup
Bash
cd apps/api
npm install
Create a .env file in apps/api:
