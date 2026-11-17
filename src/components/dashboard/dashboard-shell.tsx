"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  FileCheck2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Receipt,
  UserPen,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";
import { authClient, useSession } from "@/lib/auth-client";
import {
  clearStoredJwt,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

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

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      clearStoredJwt();
      toast.success("Signed out successfully.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out.");
    }
  };

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
  const planLabel = user.plan === "pro" ? "Pro Plan" : "Free Plan";

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
            "flex items-center gap-3 rounded-xl bg-sage-bg/80 p-2.5",
            collapsed && !isMobile && "justify-center p-2"
          )}
        >
          {isValidImageUrl(user.image) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image!}
              alt={user.name}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-sage-border"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
              {getInitials(user.name)}
            </span>
          )}
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-forest">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted">{user.email}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                <Badge variant={role === "admin" ? "clay" : "sage"}>
                  {roleLabel}
                </Badge>
                <Badge variant={user.plan === "pro" ? "clay" : "outline"}>
                  {planLabel}
                </Badge>
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

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed && !isMobile ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                collapsed && !isMobile && "justify-center px-2",
                isActive
                  ? "bg-forest text-white shadow-xs"
                  : "text-muted hover:bg-sage-subtle/80 hover:text-forest"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {(!collapsed || isMobile) && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-sage-border p-3 space-y-1">
        <Link
          href="/"
          title={collapsed && !isMobile ? "Back to Home" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-sage-subtle/80 hover:text-forest transition-colors",
            collapsed && !isMobile && "justify-center px-2"
          )}
        >
          <Home className="h-4.5 w-4.5 shrink-0" />
          {(!collapsed || isMobile) && <span>Back to Home</span>}
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          title={collapsed && !isMobile ? "Sign Out" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer",
            collapsed && !isMobile && "justify-center px-2"
          )}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-sage-bg">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex shrink-0 flex-col border-r border-sage-border bg-white transition-all duration-200 sticky top-0 h-screen",
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
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16.5 items-center justify-between gap-4 border-b border-sage-border bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
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
              <p className="text-xs font-bold uppercase tracking-wider text-clay">
                {roleLabel} Workspace
              </p>
              <p className="text-sm font-bold text-forest leading-tight">
                Welcome, {user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/tuitions" className="hidden sm:inline-block">
              <Button variant="outline" size="sm">
                Browse Tuitions
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="secondary" size="sm">
                <UserPen className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
