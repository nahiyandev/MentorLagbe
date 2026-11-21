// src/lib/translations.ts
export type Language = "en" | "bn";

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    nav_home: "Home",
    nav_tuitions: "Browse Tuitions",
    nav_pricing: "Pricing",
    nav_how_it_works: "How It Works",
    nav_dashboard: "Dashboard",
    nav_profile: "Profile",
    nav_sign_in: "Sign In",
    nav_sign_up: "Sign Up",
    nav_sign_out: "Sign Out",
    nav_upgrade: "Upgrade to Pro",

    // Common
    common_search: "Search",
    common_filter: "Filter",
    common_sort: "Sort",
    common_all: "All",
    common_loading: "Loading...",
    common_save: "Save",
    common_cancel: "Cancel",
    common_view_details: "View Details",
    common_apply_now: "Apply Now",
    common_apply: "Apply",
    common_new: "New",
    common_online: "Online",
    common_offline: "Offline",
    common_monthly_fee: "Monthly Fee",
    common_days_wk: "days/wk",

    // Roles
    role_student: "Student",
    role_tutor: "Tutor",
    role_admin: "Admin",

    // Home / Hero
    hero_badge: "Verified Tuitions & Expert Mentors Across Bangladesh",
    hero_title_1: "Find the Perfect",
    hero_title_highlight: "Tuition & Mentor",
    hero_title_2: "for Academic Success",
    hero_subtitle:
      "Connect with certified educators for structured tuition batches, 1-on-1 mentorship, and exam preparation — online across Bangladesh and offline in your local area.",
    hero_cta_browse: "Browse Available Tuitions",
    hero_cta_tutor: "Apply as a Tutor",

    // Stats
    stat_tuitions: "Active Tuitions",
    stat_tutors: "Verified Mentors",
    stat_students: "Enrolled Students",
    stat_rating: "Average Rating",

    // Tuitions
    tuition_search_placeholder: "Search by subject, class, location, or tutor...",
    tuition_sort_newest: "Newest Listed",
    tuition_sort_fee_asc: "Fee: Low to High",
    tuition_sort_fee_desc: "Fee: High to Low",
    tuition_sort_rating_desc: "Highest Rated",
    tuition_filter_district: "District (জেলা)",
    tuition_filter_budget: "Budget Range",
    tuition_filter_mode: "Tuition Mode",
    tuition_filter_class: "Class Level",
    tuition_filter_subject: "Subject",
    tuition_reset_filters: "Reset Filters",

    // Single Tuition
    tuition_about_title: "About This Tuition",
    tuition_schedule_title: "Weekly Schedule",
    tuition_reviews_title: "Student Reviews & Ratings",
    tuition_save_bookmark: "Save / Bookmark Tuition",
    tuition_saved: "Saved in Bookmarks",
    tuition_chat_tutor: "Chat with Tutor / Ask Question",

    // Dashboard Items
    db_overview: "Overview",
    db_my_applications: "My Applications",
    db_saved_tuitions: "Saved Tuitions",
    db_messages: "Inquiries & Chat",
    db_post_tuition: "Post a Tuition",
    db_my_tuitions: "My Tuitions",
    db_manage_applicants: "Manage Applicants",
    db_user_management: "User Management",
    db_tuition_approvals: "Tuition Approvals",
    db_transactions: "Transactions",
    db_listing_reports: "Listing Reports",
    db_coupons: "Coupons & Discounts",
    db_update_profile: "Update Profile",
    db_browse_tuitions: "Browse Tuitions",
  },
  bn: {
    // Nav
    nav_home: "হোম",
    nav_tuitions: "টিউশন খুঁজুন",
    nav_pricing: "প্রাইসিং",
    nav_how_it_works: "যেভাবে কাজ করে",
    nav_dashboard: "ড্যাশবোর্ড",
    nav_profile: "প্রোফাইল",
    nav_sign_in: "লগইন",
    nav_sign_up: "রেজিস্টার",
    nav_sign_out: "লগআউট",
    nav_upgrade: "প্রো আপগ্রেড",

    // Common
    common_search: "খুঁজুন",
    common_filter: "ফিল্টার",
    common_sort: "সর্ট করুন",
    common_all: "সকল",
    common_loading: "লোড হচ্ছে...",
    common_save: "সংরক্ষণ",
    common_cancel: "বাতিল",
    common_view_details: "বিস্তারিত দেখুন",
    common_apply_now: "আবেদন করুন",
    common_apply: "আবেদন",
    common_new: "নতুন",
    common_online: "অনলাইন",
    common_offline: "অফলাইন",
    common_monthly_fee: "মাসিক ফি",
    common_days_wk: "দিন/সপ্তাহ",

    // Roles
    role_student: "শিক্ষার্থী",
    role_tutor: "টিউটর",
    role_admin: "অ্যাডমিন",

    // Home / Hero
    hero_badge: "সারা বাংলাদেশে যাচাইকৃত টিউশন ও অভিজ্ঞ মেন্টর",
    hero_title_1: "পড়াশোনায় সাফল্যের জন্য",
    hero_title_highlight: "সেরা টিউটর ও মেন্টর",
    hero_title_2: "খুঁজে নিন সহজে",
    hero_subtitle:
      "সার্টিফাইড শিক্ষকদের সাথে সরাসরি যুক্ত হোন। অনলাইন অথবা আপনার এলাকায় অফলাইন ব্যাচ ও ওয়ান-অন-ওয়ান মেন্টরশিপের সেরা সুযোগ।",
    hero_cta_browse: "সকল টিউশন দেখুন",
    hero_cta_tutor: "টিউটর হিসেবে যুক্ত হন",

    // Stats
    stat_tuitions: "সক্রিয় টিউশন",
    stat_tutors: "যাচাইকৃত মেন্টর",
    stat_students: "নিবন্ধিত শিক্ষার্থী",
    stat_rating: "গড় রেটিং",

    // Tuitions
    tuition_search_placeholder: "বিষয়, ক্লাস, এলাকা বা টিউটরের নাম দিয়ে খুঁজুন...",
    tuition_sort_newest: "সর্বশেষ প্রকাশিত",
    tuition_sort_fee_asc: "ফি: কম থেকে বেশি",
    tuition_sort_fee_desc: "ফি: বেশি থেকে কম",
    tuition_sort_rating_desc: "সর্বোচ্চ রেটিংপ্রাপ্ত",
    tuition_filter_district: "জেলা নির্বাচন",
    tuition_filter_budget: "বাজেট রেঞ্জ",
    tuition_filter_mode: "টিউশনের ধরন",
    tuition_filter_class: "শ্রেণি / লেভেল",
    tuition_filter_subject: "বিষয়",
    tuition_reset_filters: "ফিল্টার রিসেট",

    // Single Tuition
    tuition_about_title: "এই টিউশন সম্পর্কে",
    tuition_schedule_title: "সাপ্তাহিক রুটিন",
    tuition_reviews_title: "শিক্ষার্থীদের রিভিউ ও রেটিং",
    tuition_save_bookmark: "বুকমার্ক / সংরক্ষণ করুন",
    tuition_saved: "বুকমার্কে সংরক্ষিত",
    tuition_chat_tutor: "টিউটরকে প্রশ্ন করুন / চ্যাট",

    // Dashboard Items
    db_overview: "ওভারভিউ",
    db_my_applications: "আমার আবেদন",
    db_saved_tuitions: "সংরক্ষিত টিউশন",
    db_messages: "মেসেজ ও চ্যাট",
    db_post_tuition: "টিউশন পোস্ট করুন",
    db_my_tuitions: "আমার টিউশন",
    db_manage_applicants: "আবেদনকারী পরিচালনা",
    db_user_management: "ইউজার ম্যানেজমেন্ট",
    db_tuition_approvals: "টিউশন অনুমোদন",
    db_transactions: "লেনদেনসমূহ",
    db_listing_reports: "লিস্টিং রিপোর্টস",
    db_coupons: "কুপন ও ছাড়",
    db_update_profile: "প্রোফাইল আপডেট",
    db_browse_tuitions: "টিউশন খুঁজুন",
  },
};
