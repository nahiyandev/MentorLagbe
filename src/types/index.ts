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
  studentNote: string;
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
  transactionId: string;
  stripeSessionId?: string;
  paymentStatus: string;
  paidAt?: string;
  createdAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTutors: number;
  pendingTuitions: number;
  approvedTuitions: number;
  totalRevenue: number;
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
