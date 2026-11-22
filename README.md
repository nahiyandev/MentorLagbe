# MentorLagbe — Smart Tuition & Mentorship Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript%205-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js%205-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)

**A modern, production-grade EdTech tuition discovery, class management, and 1-on-1 mentorship platform.**  
Built for **Programming Hero Batch 14 — Assignment 9 (Category 001)**.

[Live Demo](https://mentor-lagbe.vercel.app) • [Backend API](https://mentor-lagbe-server.vercel.app) • [Frontend Repo](https://github.com/Nahiyandev/MentorLagbe) • [Backend Repo](https://github.com/Nahiyandev/MentorLagbe-server)

</div>

---

## 📌 Table of Contents
1. [Live Links & Repositories](#-live-links--repositories)
2. [Tech Stack & NPM Packages Used](#-tech-stack--npm-packages-used)
3. [Demo Credentials & Test Accounts](#-demo-credentials--test-accounts)
4. [Key Features](#-key-features)
5. [Methods & Technical Architecture](#-methods--technical-architecture)
6. [Database Collections](#-database-collections)
7. [Design System — Sage Studio](#-design-system--sage-studio)
8. [Local Development Setup](#-local-development-setup)

---

## 🔗 Live Links & Repositories

| Component | URL |
| :--- | :--- |
| **Frontend Live Web App** | [https://mentor-lagbe.vercel.app](https://mentor-lagbe.vercel.app) |
| **Backend REST API** | [https://mentor-lagbe-server.vercel.app](https://mentor-lagbe-server.vercel.app) |
| **Client GitHub Repository** | [https://github.com/Nahiyandev/MentorLagbe](https://github.com/Nahiyandev/MentorLagbe) |
| **Server GitHub Repository** | [https://github.com/Nahiyandev/MentorLagbe-server](https://github.com/Nahiyandev/MentorLagbe-server) |

---

## 📦 Tech Stack & NPM Packages Used
- next, react, typescript
- tailwindcss, shadcn/ui, lucide-react
- better-auth, sonner

---

## 🔑 Demo Credentials & Test Accounts

> **For Evaluators:** To facilitate easy testing and grading across all role workflows, pre-configured test credentials for Admin, Tutor, and Student accounts are provided below. Sign-up with new accounts is also fully supported.

| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `nahiyanadmin@gmail.com` | `Rj612221` | Tuition approval/rejection, user role management, Stripe financial ledger, tutor payout approval, coupon lifecycle management |
| **Tutor** | `nahiyandev+mltutor@gmail.com` | `Mentor1234` | Tuition posting (Free/Pro limits), applicant review, weekly availability slot manager, class attendance marking (+1 / -1 Undo), bKash/Nagad payout requests |
| **Student** | `nahiyandev+mls01@gmail.com` | `Student1234` | Tuition browsing, slot-based applications, Google Meet class access, payment history & digital money receipts, Pro subscription upgrade, verified reviews |

---

## ✨ Key Features

### 1. 🎯 Find My Tutor (Smart Compatibility Matchmaker)
- **Multi-Parameter Matching Algorithm**: Based on the student's selected subject, class level, and maximum monthly budget, the algorithm scores candidates out of 100 points:
  - *Subject Alignment*: Up to 40 points
  - *Class Level Match*: Up to 30 points
  - *Budget Compatibility*: Up to 20 points (highlights cost savings)
  - *Rating & Quality Weight*: Up to 10 points
- **Instant Preview Synchronization**: Match results dynamically refresh upon parameter changes. If no exact match is found, alternative nearby batches are automatically recommended.
- **Hyphen & Dash Normalization**: Robust regex matching supporting both regular hyphens (`-`) and en-dashes (`–`) for uniform batch matching.

### 2. 🛡️ Batch Seat Limits & Full-Batch Capacity Guard
- **Per-Batch Seat Quota**: Tutors specify maximum class capacity (e.g., 5, 10, or 20 students) when publishing tuitions.
- **Real-Time Seat Badges**: Interactive badges display remaining seats (e.g., `2 seats left` or `Batch Full`).
- **Visual Capacity Bar**: Detailed progress bar on tuition details pages visualizing current enrollment versus total limit.
- **Server-Side Enforcement**: Once capacity is reached, frontend `Apply Now` buttons are disabled, and backend APIs reject further applications with `HTTP 400 - Batch is already full`.

### 3. 📅 Tutor Weekly Availability & Time Slot Booking
- **Weekly Slot Management (`/dashboard/tutor/availability`)**: Tutors can configure and toggle recurring weekly teaching slots by day and time window.
- **Live Interactive Calendar**: Students can view tutor availability directly on profiles and tuition detail pages.
- **Double-Booking Prevention**: When a student application is accepted for a specific slot, that slot is automatically reserved to prevent conflicting bookings.

### 4. 🎓 Class Session Tracking, Google Meet & Real Attendance
- **Real Attendance Marking**: Tutors mark classes with `Done (+1)`, accurately updating completed class counts in the database.
- **Instant Undo Action**: Tutors can quickly revert accidental clicks with a dedicated `Undo (-1)` action.
- **Google Meet Integration**: Approved students can access direct Google Meet links provided by their tutors directly from the dashboard.
- **Student Dashboard Tracker**: Students can track overall progress (`X classes completed`) and view upcoming class timetables.

### 5. 🧾 Student Payment History & Digital Money Receipts (My Payments)
- **Centralized Payments Hub (`/dashboard/student/payments`)**: Students can review all payment records across Stripe and mobile financial services (bKash, Nagad) in one place.
- **Summary Stat Cards**: Visual summaries of total spent, successful transactions, active subscriptions, and coupon savings.
- **Digital Money Receipt Modal**: Verifiable, printable digital receipts complete with one-click Transaction ID copying.

### 6. 🏦 Tutor Payouts & Multi-Channel Withdrawal Pipeline
- **Withdrawal Request Flow**: Tutors can request payouts of their earnings via bKash, Nagad, or direct bank transfer.
- **Admin Moderation Interface (`/dashboard/admin/transactions`)**: Administrators review pending payout requests, record reference IDs, add transaction notes, and approve or reject requests.

### 7. ⚡ Dynamic Tutor Response Time Analytics
- Computes genuine response times from historical applicant review logs instead of static placeholders.
- Dynamically generates badges based on tutor activity:
  - `Lightning Fast (⚡ ~15m)`
  - `Fast Responder (~1 hr)`
  - `Responsive (~2 hrs)`
  - `Priority Tutor (⚡ ~30m)`

### 8. ⭐ Verified Reviews & Single-Line Sweeping Carousel
- **Verified Student Reviews**: Review submissions are restricted exclusively to enrolled students whose applications were accepted.
- **Modern Touch-Enabled Carousel**: Single-line layout with touch-swipe gesture support, hover-to-pause auto-rotation, and pagination dots.
- **API Randomization**: Featured testimonials rotate randomly on each page refresh for a dynamic showcase.

### 9. 📍 Popular Tuition Hubs & Nationwide Filter
- Dedicated showcase on the homepage highlighting prime tuition areas (Dhanmondi, Banani, Uttara, Mirpur, Gulshan, Mohammadpur, Chattogram, and Nationwide Online).
- One-click filtering immediately opens the catalog filtered by location.

### 10. 💬 In-App Direct Inquiries & Admin Support Messaging
- Direct real-time messaging between students and tutors to inquire about syllabus details or class policies prior to enrollment.
- Dedicated support channel connecting users with platform administrators.

### 11. 🏷️ Coupon Codes & Instant Checkout Discounting
- Admin creation and lifecycle management of promotional discount codes.
- Instant validation and real-time discount calculation during Stripe checkout.

### 12. 🌐 Dual-Language Support (English & Bengali)
- Complete global language switcher enabling instant toggling between English and Bengali interfaces.

---

## 🛠️ Methods & Technical Architecture

The platform follows modern fullstack architectural best practices and production-ready design patterns:

### 1. Hybrid Authentication & Automated JWT Exchange
- **BetterAuth + Express JWT Synchronization**: Following BetterAuth session creation on the client, `src/lib/api.ts` automatically exchanges the session for a backend-signed JWT token via `POST /api/auth/jwt`.
- **LocalStorage Caching & Interceptors**: All protected API calls attach `Authorization: Bearer <token>`. Automatic token refresh handles expired sessions transparently.

### 2. Database Aggregation & Seat Calculation Methods
- **MongoDB Aggregation Pipelines (`$match`, `$group`, `$sum`)**: 
  - Batches calculate `enrolledCount` in a single query pass across `/api/tuitions` and `/api/tuitions/my-tuitions`.
  - Seat capacity logic (`remainingSeats = Math.max(0, seatLimit - enrolledCount)`) prevents race conditions and over-enrollment.

### 3. Security & Role-Based Access Control (RBAC)
- **`verifyToken`**: Validates JWT cryptographic signatures, expiration, and payload integrity.
- **`verifyStudent` / `verifyTutor` / `verifyAdmin`**: Granular route guards securing protected endpoints by role.
- **Self-Demotion Guard**: Protects against accidental removal of the sole system administrator.
- **Serverless Crash Prevention**: Avoids `process.exit()` in serverless environments, returning structured JSON errors.

### 4. Stripe Checkout & Cryptographic Webhook Validation
- **Stripe Checkout Sessions**: Secure hosted checkout flow for subscription upgrades and student payments.
- **Raw Body Signature Verification**: Validates incoming Stripe webhooks using `express.raw({ type: "application/json" })` and `stripe.webhooks.constructEvent()` against `stripe-signature` headers.

### 5. Responsive UI Engineering & Performance Optimizations
- **Next.js 16 App Router & Turbopack**: High-speed server rendering (SSR), optimized bundle splitting, and zero client-side layout shift.
- **Tailwind CSS v4 Design Tokens**: Canonical utility classes (`bg-linear-to-*`), custom theme tokens, and complete dark mode compatibility.
- **Optimistic Skeleton Loaders**: Skeleton states preventing layout shifts while fetching data asynchronously.

---

## 🗄️ Database Collections

Hosted on **MongoDB Atlas** in the `mentorlagbe` database:

1. **`users`**: User records, hashed passwords, roles (`student` | `tutor` | `admin`), profile data, availability slots, response time metrics, and membership tier (`free` | `pro`).
2. **`tuitions`**: Tuition postings, subject, class level, mode, monthly fee, weekly frequency, banner image, seat quota (`seatLimit`), approval status (`pending` | `approved` | `rejected`), and active state (`isActive`).
3. **`applications`**: Enrollment requests, selected time slot, schedule, applicant notes, approval state (`pending` | `accepted` | `rejected`), completed sessions counter (`completedClasses`), attendance log (`attendanceHistory`), and Google Meet link (`meetLink`).
4. **`payments`**: Transaction records for Stripe and manual payments (amount, provider, transaction ID, status, date).
5. **`payoutrequests`**: Tutor withdrawal requests, payment method (bKash / Nagad / Bank), recipient account, admin approval state, and transaction reference.
6. **`reviews`**: Verified tuition reviews (1–5 stars) and detailed written feedback from enrolled students.
7. **`messages`**: Inquiries between students and tutors, and platform admin support message threads.
8. **`notifications`**: System notifications for application status updates, payments, classes, and payouts.
9. **`coupons`**: Promotional discount codes, percentage, expiry dates, and usage counters.
10. **`bookmarks`**: Saved tuition listings bookmarked by students.

---

## 🎨 Design System — Sage Studio

The UI follows the custom **Sage Studio** design language, crafted for clarity, elegance, and visual comfort:

| Token | Color Code | Usage |
| :--- | :--- | :--- |
| **Forest (Primary)** | `#1E3A2F` | Headings, brand logo, primary action buttons, card borders |
| **Warm Clay (Accent)** | `#C2703D` | Call-to-action (CTA), pricing/fees, highlights, prominent badges |
| **Light Sage (Surface)** | `#EFF3EC` | Background canvas, subtle card backgrounds, alternating rows |
| **Emerald (Success)** | `#10B981` | Approved status badges, payment successes, Google Meet action buttons |
| **Ink (Typography)** | `#1C2B23` | High-contrast body text, table content |
| **Dark Theme Slate** | `#0E1712` | Deep contrast background surfaces in dark mode |

---

## 💻 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/nahiyandev/MentorLagbe.git
cd MentorLagbe
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mentorlagbe?retryWrites=true&w=majority

# Authentication
BETTER_AUTH_SECRET=your-secure-jwt-secret-key-32-chars-minimum
BETTER_AUTH_URL=http://localhost:3000

# Backend Integration
NEXT_PUBLIC_SERVER_URL=https://mentor-lagbe-server.vercel.app

# Image Upload (ImgBB)
NEXT_PUBLIC_IMGBB_API_KEY=your-imgbb-api-key

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build Verification
```bash
npm run build
npm run start
```

---

<div align="center">
Made with ❤️ by <strong>Nahiyan</strong> for Programming Hero Assignment 9.
</div>
