import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UserRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFee(amount: number, currency = "BDT"): string {
  if (!Number.isFinite(amount)) return "—";
  if (currency.toUpperCase() === "USD") {
    return `$${amount.toLocaleString("en-US")}`;
  }
  return `৳${amount.toLocaleString("en-US")}`;
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function normalizeRole(role?: string | null): UserRole {
  if (role === "tutor" || role === "admin" || role === "student") {
    return role;
  }
  return "student";
}

export function getDashboardPath(role?: string | null): string {
  const safe = normalizeRole(role);
  return `/dashboard/${safe}`;
}

export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("/")
  );
}

export function formatWhatsAppUrl(phone: string, tutorName = "Tutor"): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    digits = "88" + digits;
  }
  const message = `Hello ${tutorName}, I found your tutor profile on MentorLagbe and would like to ask about your tuition batches.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
