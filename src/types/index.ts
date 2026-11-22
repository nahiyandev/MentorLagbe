export type UserRole = "student" | "tutor" | "admin";
export type UserPlan = "free" | "pro";
export type TuitionMode = "Online" | "Offline";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface TutorAvailabilitySlot {
  day: string;
  isAvailable: boolean;
  slots: string[];
}

export interface UserRecord {
  _id: string;
  id?: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  phone?: string;
  bio?: string;
  plan: UserPlan;
  availability?: TutorAvailabilitySlot[];
  responseTime?: string;
  responseBadge?: string;
  createdAt?: string;
}

export interface Tuition {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: TuitionMode;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage?: string;
  description: string;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  createdAt?: string;
  averageRating?: number;
  totalReviews?: number;
  tutorAvailability?: TutorAvailabilitySlot[];
  tutorPhone?: string;
  bookedSlots?: string[];
  seatLimit?: number;
  enrolledCount?: number;
  remainingSeats?: number;
  isFull?: boolean;
  responseTime?: string;
  responseBadge?: string;
}

export interface Application {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorName?: string;
  tutorEmail: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  selectedSlots?: string[];
  meetLink?: string;
  studentNote: string;
  completedClasses?: number;
  lastClassDate?: string;
  attendanceHistory?: { date: string; topic?: string; note?: string }[];
  status: ApplicationStatus;
  appliedAt?: string;
  decidedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  _id: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  planName: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  senderNumber?: string;
  transactionId: string;
  stripeSessionId?: string;
  couponCode?: string;
  paymentStatus: string;
  paidAt?: string;
  createdAt?: string;
}

export interface PayoutRequest {
  _id: string;
  tutorEmail: string;
  tutorName: string;
  amount: number;
  paymentMethod: "bkash" | "nagad" | "bank";
  accountNumber: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  transactionReference?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTutors: number;
  pendingTuitions: number;
  approvedTuitions: number;
  totalRevenue: number;
  totalReviews?: number;
  stripeRevenueUsd?: number;
  localRevenueBdt?: number;
  pendingReports?: number;
}

export interface ReportRecord {
  _id: string;
  tuitionId: {
    _id: string;
    title: string;
    subject: string;
    tutorName: string;
    tutorEmail: string;
    monthlyFee: number;
  } | null;
  reporterEmail: string;
  reporterName: string;
  reason:
    | "inaccurate_info"
    | "fake_fee"
    | "unresponsive_tutor"
    | "inappropriate_content"
    | "other";
  details: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  createdAt: string;
  updatedAt?: string;
}

export const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Programming",
  "English",
  "IELTS",
  "ICT",
  "Accounting",
  "Economics",
] as const;

export const CLASS_LEVEL_OPTIONS = [
  "Class 6–8",
  "SSC / Class 9–10",
  "HSC / Class 11–12",
  "O Level",
  "A Level",
  "University / Admission",
  "Professional / Skill",
] as const;

export const MODE_OPTIONS: TuitionMode[] = ["Online", "Offline"];

export const POPULAR_LOCATIONS = [
  "Banani",
  "Dhanmondi",
  "Gulshan",
  "Mirpur",
  "Mohammadpur",
  "Uttara",
] as const;

export const BANGLADESH_DISTRICTS = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Barisal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Gazipur",
  "Narayanganj",
  "Bogra",
  "Cox's Bazar",
  "Jessore",
  "Dinajpur",
  "Pabna",
  "Kushtia",
  "Tangail",
  "Faridpur",
  "Brahmanbaria",
  "Noakhali",
  "Feni",
] as const;

export interface Review {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  tutorEmail: string;
  studentName: string;
  studentEmail: string;
  studentImage?: string;
  rating: number;
  feedback: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookmarkItem {
  bookmarkId: string;
  savedAt: string;
  tuition: Tuition;
}

export interface NotificationItem {
  _id: string;
  recipientEmail: string;
  recipientRole: UserRole;
  title: string;
  message: string;
  type:
    | "application_received"
    | "application_accepted"
    | "application_rejected"
    | "tuition_approved"
    | "system";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TutorProfileData {
  tutor: {
    _id?: string | null;
    name: string;
    email: string;
    image?: string | null;
    bio?: string;
    phone?: string;
    role: UserRole;
    plan: UserPlan;
    availability?: TutorAvailabilitySlot[];
    responseTime?: string;
    responseBadge?: string;
    createdAt?: string;
  };
  tuitions: Tuition[];
  reviews: Review[];
  stats: {
    totalBatches: number;
    subjects: string[];
    averageRating: number;
    totalReviews: number;
  };
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  tuitionId?: string | null;
  tuitionTitle?: string;
  senderEmail: string;
  senderName: string;
  senderRole: UserRole;
  recipientEmail: string;
  recipientName: string;
  recipientRole: UserRole;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatConversation {
  conversationId: string;
  tuitionId?: string | null;
  tuitionTitle?: string;
  otherParty: {
    email: string;
    name: string;
    role: UserRole;
  };
  lastMessage: {
    text: string;
    senderEmail: string;
    senderName: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export interface CouponRecord {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
