# MentorLagbe — Smart Tuition & Mentorship Platform

MentorLagbe is a modern, recruiter-grade, role-based EdTech tuition discovery and 1-on-1 mentorship platform built for **Programming Hero Batch 14 — Assignment 9 (Category 001)**. It bridges the gap between students seeking targeted academic mentorship and qualified tutors organizing online/offline batches, reinforced by an administrative moderation pipeline and Stripe-powered Pro subscriptions.

---

## Live Links & Repository

- **Frontend Live Deployment:** [https://mentor-lagbe.vercel.app](https://mentor-lagbe.vercel.app)
- **Backend API Base URL:** [https://mentor-lagbe-server.vercel.app](https://mentor-lagbe-server.vercel.app)
- **Client GitHub Repository:** [https://github.com/nahiyandev/MentorLagbe](https://github.com/nahiyandev/MentorLagbe)
- **Server GitHub Repository:** [https://github.com/nahiyandev/MentorLagbe-server](https://github.com/nahiyandev/MentorLagbe-server)

---

## Admin & Test Credentials

> **Notice for evaluators:** You may use the pre-configured accounts below or register a new user on the platform.

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `nahiyanadmin@gmail.com` | `12345678` | User roles, Tuition approval queue, Stripe transaction ledger, platform metrics |
| **Tutor** | `nahiyan@gmail.com` | `12345678` | Post tuitions, CRUD on created batches, applicant accept/reject, Pro upgrade |
| **Student** | `fahim@gmail.com` | `12345678` | Browse & apply for tuitions, track application status, cancel pending requests |

---

## Key Features

### 1. Role-Based Authentication & Session Architecture
- **BetterAuth + MongoDB Driver:** Shared database integration connecting to the `mentorlagbe` database and the central `users` collection.
- **Role Scoping:** Seamless registration as either **Student** or **Tutor** with automatic `plan: "free"` assignment.
- **Proactive JWT Synchronization:** Client automatically exchanges active BetterAuth session tokens for signed backend JWTs (`POST /api/auth/jwt`), attaching `Authorization: Bearer <token>` to protected API requests with auto-refresh on token expiry.

### 2. Public Discovery & Catalog
- **Recruiter-Grade Landing Page:** Hero section, real-time platform statistics, 6 latest Admin-approved & active Featured Tuitions, 4-step How It Works workflow, Top Subjects, and responsive Pricing preview.
- **Interactive Browse Tuitions (`/tuitions`):** Live search by title or subject combined with multi-parameter filter dropdowns (Subject, Class Level, Teaching Mode: Online / Offline).
- **Tuition Details (`/tuitions/[id]`):** Comprehensive batch breakdown (monthly fee, weekly frequency, curriculum description, tutor info) with a **Student-Only** application modal. Duplicate applications are blocked with clear feedback.

### 3. Student Workspace (`/dashboard/student`)
- **Metrics Overview:** Live counters for Total Applied Tuitions, Accepted Applications, Pending Applications, and current Subscription Plan.
- **My Applications (`/dashboard/student/my-applications`):** Detailed card/table view displaying tuition title, tutor contact, fee, application date, and real-time status badges.
- **Application Cancellation:** Immediate cancellation support for `pending` applications with confirmation toasts.

### 4. Tutor Workspace (`/dashboard/tutor`)
- **Tutor Overview:** Key performance metrics including Total Tuitions Posted, Active Listings, Total Applicants Received, and Membership Tier.
- **Post a Tuition (`/dashboard/tutor/post-tuition`):** Comprehensive listing form with **direct ImgBB image upload** and fallback URL input. Server-enforced quota: Free tutors are capped at 2 listings; Pro tutors enjoy unlimited posts.
- **My Created Tuitions (`/dashboard/tutor/my-tuitions`):** Full CRUD capability — edit tuition details, delete listings, and toggle Active/Closed status without administrative re-review.
- **Applicant Management (`/dashboard/tutor/applicants`):** Review incoming student submissions (phone, preferred schedule, learning goals) with 1-click **Accept** or **Reject** actions.

### 5. Administrator Control Center (`/dashboard/admin`)
- **Platform Analytics:** Real-time summary of Total Registered Users, Total Tutors, Pending vs. Approved Tuitions, and Total Stripe Revenue aggregated from the `payments` collection.
- **User Role Management (`/dashboard/admin/users`):** Change user permissions between `student`, `tutor`, and `admin` with self-demotion guards.
- **Tuition Moderation Queue (`/dashboard/admin/tuitions`):** Review pending tuition listings submitted by tutors and **Approve** (making them public) or **Reject** them.
- **Financial Transactions Log (`/dashboard/admin/transactions`):** Complete ledger of Stripe subscriptions, including customer name, email, plan tier, amount, transaction ID, and timestamp.

### 6. Profile Management (`/dashboard/profile`)
- **Unified Profile Suite:** Consistent across all roles with instant BetterAuth session syncing.
- **Editable Information:** Full Name, Contact Phone, Bio description, and Profile Picture (direct ImgBB file upload + direct URL support).
- **Protected / Read-Only Fields:**
  - **Email Address:** Permanently locked to prevent identity spoofing.
  - **Account Role:** Locked with guidance that only Administrators can change roles.
  - **Membership Plan:** Locked with automatic upgrade upon completing Stripe checkout.

### 7. Stripe Checkout & Webhook Integration
- **Subscription Tiers (`/pricing`):**
  - **Student Pro (\$10):** Priority tutor matching, unlimited applications, verified student badge.
  - **Tutor Pro (\$15):** Unlimited tuition batch listings (lifts 2-post free limit), Pro tutor badge, priority listing.
- **Automated Webhook & Verification:** Handles Stripe Checkout sessions and confirms transactions via Stripe Webhook (`POST /api/payments/webhook`) and return-page verification (`/payment/success?session_id=...`), writing to the `payments` collection and upgrading the user to `pro` instantly.

---

## Database Architecture & Collections

The application uses MongoDB Atlas with the `mentorlagbe` database shared between Next.js client authentication and Express backend services:

1. **`users`:** User identity, profile metadata, role (`student` \| `tutor` \| `admin`), phone, bio, and plan (`free` \| `pro`).
2. **`tuitions`:** Tuition listings created by tutors, moderated by admins (`pending` \| `approved` \| `rejected`), with availability toggles (`isActive`).
3. **`applications`:** Student mentorship applications linked to tuition batches with status tracking (`pending` \| `accepted` \| `rejected`).
4. **`payments`:** Transaction records generated via Stripe Checkout & Webhook (`userEmail`, `userName`, `userRole`, `planName`, `amount`, `currency`, `transactionId`, `stripeSessionId`, `paymentStatus`, `paidAt`).
5. **`session` & `account`:** BetterAuth session tokens and credential verification records.

---

## Design System — Sage Studio

- **Background:** `#EFF3EC` (Light Sage)
- **Primary / Headings / Buttons:** `#1E3A2F` (Deep Forest)
- **Accent / Badges / CTA Highlights:** `#C2703D` (Warm Clay)
- **Text:** `#1C2B23` (Ink)
- **Muted Text:** `#5C6B60`
- **Borders & Dividers:** `#DCE5DB`
- **Typography:** Plus Jakarta Sans via `next/font/google`
- **Theme Standard:** Configured with Tailwind CSS v4 `@theme` design tokens.

---

## Tech Stack & Dependencies

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, `@tailwindcss/turbopack`, Class Variance Authority |
| **Icons** | Lucide React |
| **Authentication** | BetterAuth, BetterAuth MongoDB Adapter, Client Session Plugins |
| **Database** | MongoDB Atlas, Native Node.js MongoDB Driver |
| **Feedback & Notifications** | Sonner Toasts |
| **Backend Integration** | Express.js, Mongoose, JSON Web Tokens (JWT), Stripe Node SDK |
| **Cloud Services** | Vercel (Frontend & Serverless Backend), ImgBB API (Direct Image Upload), Stripe Checkout |

---

## Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/nahiyandev/MentorLagbe.git
cd MentorLagbe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mentorlagbe?retryWrites=true&w=majority
BETTER_AUTH_SECRET=<your-shared-jwt-secret>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=https://mentor-lagbe-server.vercel.app
NEXT_PUBLIC_IMGBB_API_KEY=<your-imgbb-api-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm run start
```
