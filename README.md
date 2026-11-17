# MentorLagbe — Smart Tuition & Mentorship Platform

MentorLagbe is a full-stack, role-based EdTech tuition and 1-on-1 mentorship platform built for **Programming Hero Batch 14 — Assignment 9 (Category 001)**. It connects Students searching for subject-wise academic guidance with Tutors offering Online or Offline tuition batches, backed by Admin moderation and Stripe Pro subscriptions.

## Live Links

- **Frontend (Live Site):** _[Add your deployed Vercel client URL here]_
- **Backend API:** https://mentor-lagbe-server.vercel.app

## Admin & Test Credentials

> Replace the placeholders below with your verified test accounts before submission.

- **Admin Email:** _[Add Admin email]_
- **Admin Password:** _[Add Admin password]_
- **Tutor Test Account:** _[Add Tutor email & password]_

## Key Features

- **Role-Based Authentication (BetterAuth + MongoDB + JWT):**
  - Email/password sign-up with Student or Tutor role selection (`plan: "free"` by default) writing directly to the shared `users` collection in `mentorlagbe`.
  - Session persistence across route reloads and JWT token sync (`POST /api/auth/jwt`) for protected Express API endpoints.
- **Public Discovery & Search:**
  - Landing page with Hero section, 6 latest Admin-approved active Featured Tuitions, Pricing overview, 4-step How It Works workflow, and Popular Subject categories.
  - Browse Tuitions (`/tuitions`) with server-side Search (by title/subject) and Filter dropdowns (Subject, Class Level, Online/Offline Mode).
  - Tuition Details (`/tuitions/[id]`) with complete schedule, fee, tutor profile summary, and a **Student-only** application modal (duplicate applications blocked).
- **Student Dashboard (`/dashboard/student`):**
  - Real-time stats cards (Total Applied, Accepted, Pending, Current Plan).
  - My Applications table with status badges and Cancel/Delete support for pending applications.
- **Tutor Dashboard (`/dashboard/tutor`):**
  - Overview metrics (Total Posted, Active/Approved, Total Applicants, Current Plan).
  - Post a Tuition form with **direct ImgBB image upload** (Free plan limited to 2 posts; Pro plan unlimited).
  - Full CRUD on My Created Tuitions (Edit modal, Delete, Toggle Active/Closed).
  - Manage Applicants view to Accept or Reject incoming student requests.
- **Admin Dashboard (`/dashboard/admin`):**
  - Platform overview (Total Users, Total Tutors, Pending vs. Approved Tuitions, Total Stripe Revenue).
  - User Management to update roles (`student` | `tutor` | `admin`).
  - Tuition Approval moderation queue (Approve / Reject).
  - Stripe Transactions log from the `payments` collection.
- **Shared Profile & Stripe Pro Plans:**
  - Update Profile (`/dashboard/profile`) for all roles with direct ImgBB profile photo upload.
  - Stripe Checkout trigger on `/pricing` (Pro Student \$10, Pro Tutor \$15) plus `/payment/success` and `/payment/cancel` landing pages.
- **Polished UX:**
  - Sage Studio design system (`#EFF3EC` background, `#1E3A2F` deep forest, `#C2703D` clay accent) with Plus Jakarta Sans typography.
  - Custom skeleton loaders (`loading.tsx`), 404 page (`not-found.tsx`), Error Boundary (`error.tsx`), and `sonner` toast notifications.

## Tech Stack & npm Packages

- **Framework:** `next` (v16 App Router), `react` (v19), `react-dom`, `typescript`
- **Styling & UI:** `tailwindcss` (v4), `@tailwindcss/turbopack`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`
- **Authentication & Database:** `better-auth`, `mongodb`
- **Notifications:** `sonner`
- **External Services:** Express/MongoDB Backend API, ImgBB Image Upload API, Stripe Checkout

## Local Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root (never commit this file):

   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/mentorlagbe?retryWrites=true&w=majority
   BETTER_AUTH_SECRET=<same-secret-as-server-jwt-secret>
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_SERVER_URL=https://mentor-lagbe-server.vercel.app
   NEXT_PUBLIC_IMGBB_API_KEY=<your-imgbb-api-key>
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```
