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

## 📌 সূচিপত্র (Table of Contents)
1. [Live Links & Repositories](#-live-links--repositories)
2. [Demo Credentials](#-demo-credentials--test-accounts)
3. [Key Features (প্রধান ফিচারসমূহ)](#-key-features-প্রধান-ফিচারসমূহ)
4. [Methods & Technical Architecture (ব্যবহৃত মেথড ও আর্কিটেকচার)](#-methods--technical-architecture-ব্যবহৃত-মেথড-ও-আর্কিটেকচার)
5. [Database Collections](#-database-collections)
6. [Design System — Sage Studio](#-design-system--sage-studio)
7. [Local Setup Guide](#-local-development-setup)

---

## 🔗 Live Links & Repositories

| Component | URL |
| :--- | :--- |
| **Frontend Live Web App** | [https://mentor-lagbe.vercel.app](https://mentor-lagbe.vercel.app) |
| **Backend REST API** | [https://mentor-lagbe-server.vercel.app](https://mentor-lagbe-server.vercel.app) |
| **Client GitHub Repository** | [https://github.com/Nahiyandev/MentorLagbe](https://github.com/Nahiyandev/MentorLagbe) |
| **Server GitHub Repository** | [https://github.com/Nahiyandev/MentorLagbe-server](https://github.com/Nahiyandev/MentorLagbe-server) |

---

## 🔑 Demo Credentials & Test Accounts

> **পরীক্ষকদের জন্য:** প্ল্যাটফর্মটি যাচাই করার সুবিধার্থে নিচে অ্যাডমিন, টিউটর ও স্টুডেন্ট রোল-ভিত্তিক টেস্ট অ্যাকাউন্ট দেওয়া হলো। নতুন অ্যাকাউন্ট খুলে সাইন-আপ করার সুবিধাও রয়েছে।

| Role | Email | Password | অ্যাক্সেস এবং ফিচারসমূহ |
| :--- | :--- | :--- | :--- |
| **Admin** | `nahiyanadmin@gmail.com` | `Rj612221` | টিউশন অনুমোদন/বাতিল, ইউজার রোল ম্যানেজমেন্ট, স্ট্রাইপ ট্রানজেকশন খতিয়ান, টিউটর উইথড্র রিকোয়েস্ট অনুমোদন, কুপন ম্যানেজমেন্ট |
| **Tutor** | `nahiyandev+mltutor@gmail.com` | `Mentor1234` | টিউশন পোস্ট (ফ্রি/প্রো লিমিট), আবেদন গ্রহণ/বাতিল, সাপ্তাহিক টাইম স্লট ম্যানেজমেন্ট, ক্লাস অ্যাটেনডেন্স (+1/-1 Undo), বিকাশ/নগদ টাকা তোলার রিকোয়েস্ট |
| **Student** | `fahim@gmail.com` | `12345678` | টিউশন ব্রাউজিং, স্লট সিলেকশন সহ আবেদন, গুগল মিট ক্লাসে জয়েন, পেমেন্ট হিস্ট্রি ও ডিজিটাল মানি রিসিট, প্রো আপগ্রেড, রিভিউ প্রদান |

---

## ✨ Key Features (প্রধান ফিচারসমূহ)

### ১. 🎯 Find My Tutor (স্মার্ট কম্প্যাটিবিলিটি ম্যাচমেকার)
- **মাল্টি-প্যারামিটার অ্যালগরিদম**: বিষয় (Subject), ক্লাস (Class Level), এবং মাসিক বাজেট (Budget) দিলে অ্যালগরিদম তাৎক্ষণিকভাবে ১০০ পয়েন্টের ওপর ভিত্তি করে সেরা টিউটর সাজেস্ট করে:
  - *বিষয় সামঞ্জস্য*: সর্বোচ্চ ৪০ পয়েন্ট
  - *ক্লাস লেভেল*: সর্বোচ্চ ৩০ পয়েন্ট
  - *বাজেট ফিটিং*: সর্বোচ্চ ২০ পয়েন্ট (বাজেট সাশ্রয় হাইলাইট)
  - *রেটিং ও কোয়ালিটি*: সর্বোচ্চ ১০ পয়েন্ট
- **ইন্সট্যান্ট প্রিভিউ সিঙ্ক**: ড্রপডাউন সিলেক্ট করার সাথে সাথে ফলাফল রিফ্রেশ হয়। এক্সাক্ট ম্যাচ না থাকলে স্বয়ংক্রিয়ভাবে নিকটবর্তী অল্টারনেটিভ ব্যাচ সাজেস্ট করে।
- **রেজেক্স ভ্যারিয়েন্ট ম্যাচিং**: ক্লাস লেভেলে হাইফেন (`-`) ও এন-ড্যাশ (`–`) উভয় ফরম্যাটই সঠিকভাবে হ্যান্ডল করে।

### ২. 🛡️ ব্যাচ সিট ক্যাপাসিটি ও ফুল ব্যাচ লক (Seat Limits & Guard)
- **প্রতি ব্যাচে সিট লিমিট**: টিউটর টিউশন পোস্ট করার সময় ব্যাচের আসন সংখ্যা (যেমন: ৫, ১০ বা ২০ জন) নির্ধারণ করতে পারে।
- **রিয়েল-টাইম সিট ব্যাজ**: টিউশন কার্ডে `৩টি সিট বাকি` বা `ভর্তি পূর্ণ` ব্যাজ দেখা যায়।
- **ভিজ্যুয়াল প্রগ্রেস বার**: টিউশন ডিটেইলস পেজে কতজন ভর্তি হয়েছে এবং কয়টি আসন অবশিষ্ট আছে তার ক্যাপাসিটি বার দেখা যায়।
- **সার্ভার সিকিউরিটি গার্ড**: আসন পূর্ণ হয়ে গেলে ফ্রন্টএন্ডে `Apply Now` ডিসেবল হয়ে যায় এবং সার্ভার লেভেলে কোনো অতিরিক্ত আবেদন গ্রহণ বা অনুমোদন নিষিদ্ধ করা হয় (HTTP 400 Protection)।

### ৩. 📅 টিউটর সাপ্তাহিক সময়সূচি ও স্লট বুকিং (Tutor Availability)
- **সাপ্তাহিক স্লট ম্যানেজার (`/dashboard/tutor/availability`)**: টিউটর সপ্তাহের কোন কোন দিন ও কোন কোন সময়ে ক্লাস নিতে পারবেন তা সেট ও সেভ করতে পারেন।
- **লাইভ ক্যালেন্ডার প্রিভিউ**: শিক্ষার্থীরা টিউটরের প্রোফাইল ও টিউশন পেজে টিউটরের ফ্রি স্লটগুলো ক্যালেন্ডার আকারে দেখতে পায়।
- **ডাবল-বুকিং প্রতিরোধ**: কোনো নির্দিষ্ট টাইম-স্লটে একবার একজন শিক্ষার্থী অনুমোদিত হলে, সেই স্লটটি স্বয়ংক্রিয়ভাবে লক হয়ে যায় যাতে অন্য কেউ একই সময়ে বুকিং দিতে না পারে।

### ৪. 🎓 ক্লাস সেশন ট্র্যাকার, গুগল মিট ও অ্যাটেনডেন্স (Attendance & Meet)
- **রিয়েল ক্লাস অ্যাটেনডেন্স**: টিউটর প্রতি ক্লাস শেষে `Done (+1)` বাটন চাপলে ডেটাবেজে সম্পূর্ণ হওয়া ক্লাসের সঠিক সংখ্যা বৃদ্ধি পায়।
- **ইন্সট্যান্ট Undo বোতাম**: ভুলবশত ক্লিক পড়ে গেলে টিউটর মুহূর্তেই `Undo` বোতাম চেপে ক্লাস সংখ্যা সংশোধন করতে পারেন।
- **গুগল মিট লিংক ইন্টিগ্রেশন**: আবেদন অনুমোদিত হওয়ার পর টিউটর সরাসরি ক্লাসের Google Meet লিংক প্রদান করতে পারেন, শিক্ষার্থী সেখান থেকেই সরাসরি ক্লাসে যুক্ত হতে পারে।
- **স্টুডেন্ট ড্যাশবোর্ড ট্র্যাকার**: শিক্ষার্থীর হোম ড্যাশবোর্ডে ক্লাসের অগ্রগতি (`X classes completed`) এবং পরবর্তী ক্লাসের শিডিউল প্রদর্শিত হয়।

### ৫. 🧾 স্টুডেন্ট পেমেন্ট হিস্ট্রি ও ডিজিটাল মানি রিসিট (My Payments)
- **পেমেন্ট ট্র্যাকিং পেজ (`/dashboard/student/payments`)**: শিক্ষার্থী তার সব লেনদেন (Stripe, bKash, Nagad) এক জায়গায় দেখতে পায়।
- **৪টি সামারি স্ট্যাটকার্ড**: মোট খরচ, সফল লেনদেন, অ্যাক্টিভ সাবস্ক্রিপশন ও কুপন ডিসকাউন্ট হিসেব।
- **ডিজিটাল রিসিট মোডাল**: যেকোনো পেমেন্টের জন্য প্রিন্ট ও ডাউনলোডযোগ্য ভেরিফাইড মানি রিসিট এবং ট্রানজেকশন আইডি কপি করার সুবিধা।

### ৬. 🏦 টিউটর পে-আউট ও উইথড্র রিকোয়েস্ট (Tutor Payout Flow)
- **উইথড্র রিকোয়েস্ট মোডাল**: টিউটর তার জমানো আয় থেকে বিকাশ, নগদ কিংবা ব্যাংক অ্যাকাউন্টে টাকা তোলার রিকোয়েস্ট পাঠাতে পারেন।
- **অ্যাডমিন রিভিউ প্যানেল (`/dashboard/admin/transactions`)**: অ্যাডমিনের কাছে পে-আউট রিকোয়েস্ট যায়; অ্যাডমিন ট্রানজেকশন রেফারেন্স আইডি এবং নোট দিয়ে রিকোয়েস্ট Approve বা Reject করতে পারেন।

### ৭. ⚡ ডাইনামিক রেসপন্স টাইম অ্যানালিটিক্স (Response Badge)
- হার্ডকোডেড সময়ের বদলে টিউটরের আবেদন রিভিউয়ের আসল সময়ের ওপর ভিত্তি করে স্বয়ংক্রিয়ভাবে রেসপন্স টাইম ক্যালকুলেট করা হয়।
- প্রোফাইল ও টিউশনে ডায়নামিক ব্যাজ প্রদর্শিত হয়:
  - `Lightning Fast (⚡ ~15m)`
  - `Fast Responder (~1 hr)`
  - `Responsive (~2 hrs)`
  - `Priority Tutor (⚡ ~30m)`

### ৮. ⭐ ভেরিফাইড রিভিউ ও রেন্ডম সুইপ ক্যারোজেল (Students Reviews)
- **ভেরিফাইড রেটিং**: শুধুমাত্র ব্যাচে অ্যাকসেপ্টেড হওয়া শিক্ষার্থীরাই রিভিউ দেওয়ার সুযোগ পায়।
- **স্মার্ট সিঙ্গেল-লাইন ক্যারোজেল**: টাচ-সোয়াইপ জেসচার সাপোর্ট, হোভার করলে অটো-প্লে পজ হওয়া, এবং নিচে ক্লিন ডট ইন্ডিকেটর।
- **এপিআই রেন্ডমাইজেশন**: প্রতি পেজ রিফ্রেশে ভিন্ন ভিন্ন শিক্ষার্থীর রিভিউ রেন্ডমলি ভেসে ওঠে।

### ৯. 📍 জনপ্রিয় এলাকা ও সারাদেশব্যাপী অনলাইন হাব (Popular Areas)
- হোমপেজে ধানমন্ডি, বনানী, উত্তরা, মিরপুর, গুলশান, মোহাম্মদপুর, চট্টগ্রাম এবং সারাদেশ (অনলাইন) হাবগুলোর আলাদা শোকেস।
- এক ক্লিকেই ফিল্টারসহ সংশ্লিষ্ট এলাকার টিউশন তালিকা পাওয়া যায়।

### ১০. 💬 ইন-অ্যাপ ডিরেক্ট ইনকোয়ারি ও অ্যাডমিন সাপোর্ট চ্যাট
- টিউশন কার্ড বা ডিটেইলস পেজ থেকে আবেদন করার আগেই টিউটরের সাথে সরাসরি মেসেজিংয়ের মাধ্যমে সিলেবাস বা ফি নিয়ে আলোচনার সুবিধা।
- প্ল্যাটফর্ম ব্যবহারকারীদের জন্য ডেডিকেটেড অ্যাডমিন সাপোর্ট মেসেজ চ্যানেল।

### ১১. 🏷️ কুপন ও ডিসকাউন্ট ভ্যালিডেশন
- অ্যাডমিন প্যানেল থেকে প্রো সাবস্ক্রিপশনের জন্য স্পেশাল প্রোমো কোড/কুপন তৈরি করা যায়।
- স্ট্রাইপ চেকআউটে তাৎক্ষণিকভাবে কুপন যাচাই ও ডিসকাউন্ট কার্যকর হয়।

### ১২. 🌐 দ্বিভাষিক সাপোর্ট (English & বাংলা)
- এক ক্লিকেই পুরো প্ল্যাটফর্ম ইংরেজি অথবা বাংলায় রূপান্তর করার জন্য গ্লোবাল ল্যাঙ্গুয়েজ কনটেক্সট প্রোভাইডার।

---

## 🛠️ Methods & Technical Architecture (ব্যবহৃত মেথড ও আর্কিটেকচার)

প্ল্যাটফর্মটিতে আধুনিক ফুলস্ট্যাক আর্কিটেকচার ও ইন্ডাস্ট্রির বেস্ট প্র্যাকটিস মেথডগুলো অনুসরণ করা হয়েছে:

### ১. হাইব্রিড অথেন্টিকেশন ও অটোমেটিক জেডব্লিউটি এক্সচেঞ্জ মেথড
- **BetterAuth + Express JWT সিঙ্ক**: ক্লায়েন্টে BetterAuth সেশন তৈরি হওয়ার পর `src/lib/api.ts` স্বয়ংক্রিয়ভাবে `POST /api/auth/jwt` এর মাধ্যমে ব্যাকএন্ড সিক্রেট সাইন্ড JWT টোকেন এক্সচেঞ্জ করে।
- **লোকালস্টোরেজ ক্যাশিং ও ইন্টারসেপ্টর**: প্রতিটি প্রোটেক্টেড রিকোয়েস্টে `Authorization: Bearer <token>` যুক্ত করা হয়। টোকেন এক্সপায়ার হলে সেশন থেকে পুনরায় রিফ্রেশ মেথড চালানো হয়।

### ২. ডেটাবেজ অ্যাগ্রিগেশন ও সিট ক্যালকুলেশন মেথড
- **MongoDB Aggregation Pipeline (`$match`, `$group`, `$sum`)**: 
  - `GET /api/tuitions` এবং `GET /api/tuitions/my-tuitions` এন্ডপয়েন্টে একাধিক কুয়েরির বদলে অ্যাগ্রিগেশনের মাধ্যমে একবারে সমস্ত ব্যাচের `enrolledCount` হিসেব করা হয়।
  - `remainingSeats = Math.max(0, seatLimit - enrolledCount)` সূত্রের মাধ্যমে মেমরিতে ফিল্টার ও ওভার-এনরোলমেন্ট গার্ড তৈরি করা হয়।

### ৩. সিকিউরিটি ও রোল-বেসড এক্সেস কন্ট্রোল (RBAC Middleware)
- **`verifyToken`**: ইনকামিং JWT টোকেনের বৈধতা ও সিগনেচার যাচাই করে।
- **`verifyStudent` / `verifyTutor` / `verifyAdmin`**: রোল অনুযায়ী নির্দিষ্ট এন্ডপয়েন্টের এক্সেস নিয়ন্ত্রণ করে।
- **সেলফ-ডিমোশন গার্ড**: অ্যাডমিন নিজের রোল পরিবর্তন করে প্ল্যাটফর্মকে অ্যাডমিনহীন করা থেকে সুরক্ষিত।
- **সার্ভারলেস আইসোলেশন ও এক্সিট প্রিভেনশন**: Vercel Serverless পরিবেশে আনহ্যান্ডেল্ড এক্সেপশনে `process.exit()` বাদ দিয়ে রেসপন্স রিটার্ন নিশ্চিত করা হয়েছে।

### ৪. স্ট্রাইপ চেকআউট ও ওয়েবহুক ভেরিফিকেশন মেথড
- **Stripe Checkout Sessions**: ক্লায়েন্ট সরাসরি স্ট্রাইপের সিকিউর চেকআউট পেজে রিডিরেক্ট হয়।
- **Raw Body Signature Validation**: `express.raw({ type: "application/json" })` ব্যবহার করে স্ট্রাইপ ওয়েবহুকের ক্রিপ্টোগ্রাফিক সিগনেচার (`stripe-signature`) ভেরিফাই করা হয় যাতে কোনো ফেক পেমেন্ট রিকোয়েস্ট সিস্টেমে ঢুকতে না পারে।

### ৫. রেসপন্সিভ ইউজার ইন্টারফেস ও পারফরম্যান্স অপ্টিমাইজেশন
- **Next.js 16 App Router & Turbopack**: দ্রুত পেজ লোড ও এসএসআর (SSR) সুবিধা।
- **Tailwind CSS v4 ক্যানোনিক্যাল গ্রাফিক্স**: আধুনিক `bg-linear-to-*` গ্রেডিয়েন্ট ও ডিজাইন টোকেন।
- **অপটিমিস্টিক লোডার ও স্কেলিটন**: ডাটা ফেচিংয়ের সময়ে কনটেন্ট বাউন্সিং এড়াতে স্কেলিটন লোডার ব্যবহার করা হয়েছে।
- **টাচ-সোয়াইপ লিসেনার**: মোবাইল ব্যবহারকারীদের জন্য ন্যাচারাল টাচ জেসচার হ্যান্ডলিং।

---

## 🗄️ Database Collections

MongoDB Atlas ক্লাস্টারের `mentorlagbe` ডেটাবেজে ব্যবহৃত প্রধান কালেকশনসমূহ:

1. **`users`**: ব্যবহারকারীর নাম, ইমেইল, পাসওয়ার্ড হ্যাশ, ছবি, ভূমিকা (`student` | `tutor` | `admin`), ফোন, বায়ো, সাপ্তাহিক প্রাপ্যতা (`availability`), রেসপন্স টাইম ও মেম্বারশিপ প্ল্যান (`free` | `pro`)।
2. **`tuitions`**: টিউটরের টিউশন পোস্ট, সাবজেক্ট, ক্লাস, মোড, ফি, দিন, ব্যানার, আসন সংখ্যা (`seatLimit`), স্ট্যাটাস (`pending` | `approved` | `rejected`), এবং সক্রিয়তা (`isActive`)।
3. **`applications`**: ব্যাচে আবেদন, নির্বাচিত টাইম-স্লট, শিডিউল, স্টুডেন্ট নোট, অনুমোদন অবস্থা (`pending` | `accepted` | `rejected`), সম্পূর্ণ ক্লাসের সংখ্যা (`completedClasses`), ক্লাসের ইতিহাস (`attendanceHistory`), এবং গুগল মিট লিংক (`meetLink`)।
4. **`payments`**: স্ট্রাইপ ও ম্যানুয়াল সাবস্ক্রিপশন লেনদেনের তথ্য (অ্যামাউন্ট, ট্রানজেকশন আইডি, স্ট্যাটাস, তারিখ)।
5. **`payoutrequests`**: টিউটরের টাকা তোলার রিকোয়েস্ট, মাধ্যম (বিকাশ/নগদ/ব্যাংক), অ্যাকাউন্ট নম্বর, অ্যাডমিন অনুমোদন স্ট্যাটাস ও রেফারেন্স।
6. **`reviews`**: শুধুমাত্র ব্যাচে ভর্তি হওয়া শিক্ষার্থীদের দেওয়া টিউশন রেটিং (১-৫ স্টার) ও লিখিত ফিডব্যাক।
7. **`messages`**: শিক্ষার্থী ও টিউটরদের মধ্যকার ইনকোয়ারি এবং অ্যাডমিন সাপোর্ট চ্যাট হিস্ট্রি।
8. **`notifications`**: আবেদন গ্রহণ, বাতিল, পে-আউট ও ক্লাসের নোটিফিকেশন লগ।
9. **`coupons`**: ডিসকাউন্ট কোড, শতাংশ, মেয়াদ ও ব্যবহারের পরিসংখ্যান।
10. **`bookmarks`**: শিক্ষার্থীদের সেভ করে রাখা টিউশন বুকমার্কস।

---

## 🎨 Design System — Sage Studio

প্ল্যাটফর্মের ইউজার ইন্টারফেসে একটি রুচিশীল ও চোখের জন্য আরামদায়ক **Sage Studio** প্যালেট অনুসরণ করা হয়েছে:

| Token | Color Code | ব্যবহার |
| :--- | :--- | :--- |
| **Forest (Primary)** | `#1E3A2F` | প্রধান হেডিং, ব্র্যান্ড লোগো, প্রাইমারি বাটন, কার্ড বর্ডার |
| **Warm Clay (Accent)** | `#C2703D` | কল-টু-অ্যাকশন (CTA), মূল্যমান/ফি, প্রমিনেন্ট ব্যাজ, হাইলাইট |
| **Light Sage (Surface)** | `#EFF3EC` | ব্যাকগ্রাউন্ড সারফেস, সাবটেল কার্ড, অল্টারনেট রো |
| **Emerald (Success)** | `#10B981` | এপ্রুভড স্ট্যাটাস, পেমেন্ট সাকসেস, গুগল মিট বাটন |
| **Ink (Typography)** | `#1C2B23` | মূল বডি টেক্সট, টেবিল কনটেন্ট |
| **Dark Theme Slate** | `#0E1712` | ডার্ক মোডের ডিপ ব্যাকগ্রাউন্ড ও কনট্রাস্ট সারফেস |

---

## 💻 Local Development Setup

### ১. রিপোজিটরি ক্লোন করুন
```bash
git clone https://github.com/nahiyandev/MentorLagbe.git
cd MentorLagbe
```

### ২. ডিপেন্ডেন্সি ইনস্টল করুন
```bash
npm install
```

### ৩. এনভায়রনমেন্ট ভ্যারিয়েবল কনফিগারেশন
রুট ডিরেক্টরিতে একটি `.env.local` ফাইল তৈরি করুন:
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

### ৪. ডেভেলপমেন্ট সার্ভার চালু করুন
```bash
npm run dev
```
ব্রাউজারে [http://localhost:3000](http://localhost:3000) ওপেন করুন।

### ৫. প্রডাকশন বিল্ড যাচাই
```bash
npm run build
npm run start
```

---

<div align="center">
Made with ❤️ by <strong>Nahiyan</strong> for Programming Hero Assignment 9.
</div>
