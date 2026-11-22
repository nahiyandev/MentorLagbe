"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Crown,
  FileCheck2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Receipt,
  Shield,
  ShieldAlert,
  TicketPercent,
  UserPen,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";
import { useSession } from "@/lib/auth-client";
import {
  apiFetch,
  exchangeSessionForJwt,
  getStoredJwt,
} from "@/lib/api";
import {
  cn,
  getDashboardPath,
  getInitials,
  isValidImageUrl,
  normalizeRole,
} from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoutConfirmDialog } from "@/components/auth/logout-confirm-dialog";
import { useLanguage } from "@/context/language-context";
import { useAccountStatus } from "@/context/account-status-context";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ROLE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  student: [
    { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/student/my-applications",
      label: "My Applications",
      icon: ClipboardList,
    },
    {
      href: "/dashboard/student/sessions",
      label: "Class Sessions",
      icon: CalendarCheck,
    },
    {
      href: "/dashboard/student/payments",
      label: "My Payments",
      icon: Receipt,
    },
    {
      href: "/dashboard/student/bookmarks",
      label: "Saved Tuitions",
      icon: Bookmark,
    },
    { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
    { href: "/tuitions", label: "Browse Tuitions", icon: BookOpen },
    { href: "/pricing", label: "Upgrade to Pro", icon: CreditCard },
    { href: "/dashboard/profile", label: "Update Profile", icon: UserPen },
  ],
  tutor: [
    { href: "/dashboard/tutor", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/tutor/post-tuition",
      label: "Post a Tuition",
      icon: PlusCircle,
    },
    {
      href: "/dashboard/tutor/my-tuitions",
      label: "My Tuitions",
      icon: BookOpen,
    },
    {
      href: "/dashboard/tutor/applicants",
      label: "Manage Applicants",
      icon: Users,
    },
    {
      href: "/dashboard/tutor/availability",
      label: "My Availability",
      icon: CalendarDays,
    },
    {
      href: "/dashboard/tutor/earnings",
      label: "Earnings & Revenue",
      icon: Wallet,
    },
    { href: "/dashboard/messages", label: "Inquiries & Chat", icon: MessageCircle },
    { href: "/tuitions", label: "Browse Tuitions", icon: BookOpen },
    { href: "/pricing", label: "Upgrade to Pro", icon: CreditCard },
    { href: "/dashboard/profile", label: "Update Profile", icon: UserPen },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "User Management", icon: Users },
    {
      href: "/dashboard/admin/tuitions",
      label: "Tuition Approvals",
      icon: FileCheck2,
    },
    {
      href: "/dashboard/admin/transactions",
      label: "Transactions",
      icon: Receipt,
    },
    {
      href: "/dashboard/admin/reports",
      label: "Listing Reports",
      icon: ShieldAlert,
    },
    {
      href: "/dashboard/admin/coupons",
      label: "Coupons & Discounts",
      icon: TicketPercent,
    },
    { href: "/dashboard/messages", label: "Inquiries & Chat", icon: MessageCircle },
    { href: "/tuitions", label: "Browse Tuitions", icon: BookOpen },
    { href: "/dashboard/profile", label: "Update Profile", icon: UserPen },
  ],
};

function getRequiredRoleForPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/tutor")) return "tutor";
  if (pathname.startsWith("/dashboard/student")) return "student";
  return null;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { t, language } = useLanguage();

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const getTranslatedLabel = React.useCallback(
    (item: NavItem) => {
      switch (item.href) {
        case "/dashboard/student":
        case "/dashboard/tutor":
        case "/dashboard/admin":
          return t("db_overview", item.label);
        case "/dashboard/student/my-applications":
          return t("db_my_applications", item.label);
        case "/dashboard/student/bookmarks":
          return t("db_saved_tuitions", item.label);
        case "/dashboard/messages":
          return t("db_messages", item.label);
        case "/tuitions":
          return t("db_browse_tuitions", item.label);
        case "/pricing":
          return t("nav_upgrade", item.label);
        case "/dashboard/profile":
          return t("db_update_profile", item.label);
        case "/dashboard/tutor/post-tuition":
          return t("db_post_tuition", item.label);
        case "/dashboard/tutor/my-tuitions":
          return t("db_my_tuitions", item.label);
        case "/dashboard/tutor/applicants":
          return t("db_manage_applicants", item.label);
        case "/dashboard/tutor/earnings":
          return t("db_earnings", item.label);
        case "/dashboard/student/sessions":
          return t("db_class_sessions", item.label);
        case "/dashboard/student/payments":
          return t("db_student_payments", item.label);
        case "/dashboard/admin/users":
          return t("db_user_management", item.label);
        case "/dashboard/admin/tuitions":
          return t("db_tuition_approvals", item.label);
        case "/dashboard/admin/transactions":
          return t("db_transactions", item.label);
        case "/dashboard/admin/reports":
          return t("db_listing_reports", item.label);
        case "/dashboard/admin/coupons":
          return t("db_coupons", item.label);
        default:
          return item.label;
      }
    },
    [t]
  );

  const user = session?.user as
    | {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        role?: string;
        plan?: string;
      }
    | undefined;

  const role: UserRole = normalizeRole(user?.role);
  const requiredRole = getRequiredRoleForPath(pathname);
  const { isBlocked, blockedReason } = useAccountStatus();

  React.useEffect(() => {
    let active = true;

    async function fetchUnreadCount() {
      if (!session?.user?.email) return;
      try {
        const res = await apiFetch<{ unreadCount?: number }>(
          "/api/messages/unread-count"
        );
        if (active && typeof res?.unreadCount === "number") {
          setUnreadMessages(res.unreadCount);
        }
      } catch {
        // Non-blocking
      }
    }

    void fetchUnreadCount();

    const interval = setInterval(() => {
      void fetchUnreadCount();
    }, 5000);

    const handleMessagesRead = () => {
      void fetchUnreadCount();
    };

    window.addEventListener("messagesRead", handleMessagesRead);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("messagesRead", handleMessagesRead);
    };
  }, [session?.user?.email, pathname]);

  React.useEffect(() => {
    const token = session?.session?.token;
    if (token && !getStoredJwt()) {
      void exchangeSessionForJwt(token);
    }
  }, [session?.session?.token]);

  // Auth & Role Guard — NEVER runs while session is still loading (reload-safe)
  React.useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requiredRole && requiredRole !== role) {
      router.replace(getDashboardPath(role));
    }
  }, [isPending, user, role, requiredRole, pathname, router]);

  if (isPending || !user || (requiredRole && requiredRole !== role)) {
    return (
      <div className="flex min-h-screen bg-sage-bg">
        <div className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sage-border bg-white p-5 space-y-6">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6 sm:p-8 space-y-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const navItems = ROLE_NAV_ITEMS[role];
  const roleLabel =
    role === "admin" ? "Admin" : role === "tutor" ? "Tutor" : "Student";

  const roleTheme = {
    student: {
      accentText: "text-teal-700 dark:text-teal-400",
      badgeClass:
        "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800",
      cardBorder: "border-teal-200/80 dark:border-teal-900/40",
      avatarRing: "ring-teal-500/40",
    },
    tutor: {
      accentText: "text-forest dark:text-[#8EE0BA]",
      badgeClass:
        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      cardBorder: "border-forest/20 dark:border-emerald-800/40",
      avatarRing: "ring-forest/40",
    },
    admin: {
      accentText: "text-purple-700 dark:text-purple-400",
      badgeClass:
        "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
      cardBorder: "border-purple-200/80 dark:border-purple-900/40",
      avatarRing: "ring-purple-500/40",
    },
  }[role];

  const sidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col">
      {/* Sidebar Header */}
      <div
        className={cn(
          "flex h-16.5 items-center border-b border-sage-border px-4",
          collapsed && !isMobile ? "justify-center" : "justify-between"
        )}
      >
        {(!collapsed || isMobile) && <BrandLogo />}
        {isMobile ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-muted hover:bg-sage-subtle hover:text-forest cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-lg p-1.5 text-muted hover:bg-sage-subtle hover:text-forest cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* User Profile Summary */}
      <div className={cn("p-3.5 border-b border-sage-border", collapsed && !isMobile && "px-2")}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-sage-bg/80 dark:bg-[#1C2B22] p-2.5 transition-colors",
            roleTheme.cardBorder,
            collapsed && !isMobile && "justify-center p-2"
          )}
        >
          {isValidImageUrl(user.image) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image!}
              alt={user.name}
              className={cn(
                "h-10 w-10 shrink-0 rounded-full object-cover ring-2",
                roleTheme.avatarRing
              )}
            />
          ) : (
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-bold text-white ring-2",
                roleTheme.avatarRing
              )}
            >
              {getInitials(user.name)}
            </span>
          )}
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-forest dark:text-[#8EE0BA]">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted dark:text-[#9DB3A6]">{user.email}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                {/* Role Badge */}
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold border",
                    roleTheme.badgeClass
                  )}
                >
                  {roleLabel}
                </span>

                {/* Pro vs Free Badge */}
                {user.plan === "pro" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-linear-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-300 dark:border-amber-700 px-1.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300 shadow-2xs">
                    <Crown className="h-2.5 w-2.5 text-amber-600 fill-amber-500" /> Pro
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    <Shield className="h-2.5 w-2.5 text-slate-500" /> Free
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isOverview =
            item.href === `/dashboard/${role}`;
          const isActive = isOverview
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isMessages = item.href === "/dashboard/messages";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              title={collapsed && !isMobile ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                collapsed && !isMobile && "justify-center px-2",
                isActive
                  ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-xs"
                  : "text-muted hover:bg-sage-subtle/80 dark:hover:bg-[#1C2B22] hover:text-forest dark:hover:text-[#8EE0BA]"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {isMessages && unreadMessages > 0 && collapsed && !isMobile && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </div>
              {(!collapsed || isMobile) && (
                <>
                  <span className="truncate flex-1">{getTranslatedLabel(item)}</span>
                  {isMessages && unreadMessages > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white shadow-xs">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-sage-border p-3 space-y-1">
        <Link
          href="/"
          title={collapsed && !isMobile ? (language === "bn" ? "হোম পেজে ফিরে যান" : "Back to Home") : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-sage-subtle/80 dark:hover:bg-[#1C2B22] hover:text-forest dark:hover:text-[#8EE0BA] transition-colors",
            collapsed && !isMobile && "justify-center px-2"
          )}
        >
          <Home className="h-4.5 w-4.5 shrink-0" />
          {(!collapsed || isMobile) && (
            <span>{language === "bn" ? "হোম পেজে ফিরে যান" : "Back to Home"}</span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setLogoutDialogOpen(true)}
          title={collapsed && !isMobile ? t("nav_sign_out", "Sign Out") : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer",
            collapsed && !isMobile && "justify-center px-2"
          )}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {(!collapsed || isMobile) && <span>{t("nav_sign_out", "Sign Out")}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-sage-bg dark:bg-[#0C130F]">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex shrink-0 flex-col border-r border-sage-border bg-white dark:bg-[#141F18] transition-all duration-200 sticky top-0 h-screen",
          collapsed ? "w-20" : "w-68"
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-forest/35 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white dark:bg-[#141F18] shadow-xl">
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16.5 items-center justify-between gap-4 border-b border-sage-border bg-white/95 dark:bg-[#141F18]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-xl border border-sage-border p-2 text-forest hover:bg-sage-subtle cursor-pointer"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    roleTheme.accentText
                  )}
                >
                  {roleLabel} {language === "bn" ? "ওয়ার্কস্পেস" : "Workspace"}
                </span>
                {user.plan === "pro" ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-linear-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-300 dark:border-amber-700 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
                    <Crown className="h-2.5 w-2.5 text-amber-600 fill-amber-500" /> PRO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-forest dark:text-[#8EE0BA] leading-tight">
                {language === "bn" ? `স্বাগতম, ${user.name}` : `Welcome, ${user.name}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <NotificationBell />
            <ThemeToggle />
            <LanguageToggle />
            <Link href="/dashboard/profile">
              <Button variant="secondary" size="sm">
                <UserPen className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav_profile", "Profile")}</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Blocked Account Banner */}
        {isBlocked && (
          <div className="border-b border-red-200 bg-red-50/95 dark:border-red-900/50 dark:bg-red-950/40 px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                    Your account is blocked{blockedReason ? `: ${blockedReason}` : "."}
                  </h3>
                  <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">
                    You can still browse, but posting, applying, reviewing and payments are disabled until an Admin unblocks you.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/messages?admin=true" className="shrink-0">
                <Button
                  size="sm"
                  className="bg-red-700 hover:bg-red-800 text-white dark:bg-red-600 dark:hover:bg-red-700 w-full sm:w-auto font-medium"
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  Message Support
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      />
    </div>
  );
}
