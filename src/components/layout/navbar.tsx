"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  UserPen,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
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
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#how-it-works", label: "How It Works" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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

  const role = normalizeRole(user?.role);
  const dashboardHref = getDashboardPath(role);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  React.useEffect(() => {
    const token = session?.session?.token;
    if (token && !getStoredJwt()) {
      void exchangeSessionForJwt(token);
    }
  }, [session?.session?.token]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      clearStoredJwt();
      toast.success("Signed out successfully.");
      setMenuOpen(false);
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const roleBadgeLabel =
    role === "admin" ? "Admin" : role === "tutor" ? "Tutor" : "Student";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sage-border bg-white/92 backdrop-blur-md">
      <div className="mx-auto flex h-16.5 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : !item.href.startsWith("/#") && pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-sage-subtle text-forest"
                    : "text-muted hover:bg-sage-subtle/60 hover:text-forest"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Area */}
        <div className="hidden md:flex items-center gap-2.5">
          <NotificationBell />
          <ThemeToggle />

          {isPending ? (
            <div className="h-9 w-36 animate-pulse rounded-xl bg-sage-subtle" />
          ) : user ? (
            <div className="flex items-center gap-2.5">
              <Link href={dashboardHref}>
                <Button variant="secondary" size="sm">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-xl border border-sage-border bg-white px-2.5 py-1.5 text-left transition-colors hover:bg-sage-subtle/50 cursor-pointer"
                  aria-expanded={menuOpen}
                >
                  {isValidImageUrl(user.image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image!}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-sage-border"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
                      {getInitials(user.name)}
                    </span>
                  )}
                  <div className="hidden lg:flex flex-col">
                    <span className="max-w-32.5 truncate text-xs font-bold text-forest leading-tight">
                      {user.name}
                    </span>
                    <Badge
                      variant={role === "admin" ? "clay" : "sage"}
                      className="mt-0.5 w-fit px-1.5 py-0 text-[10px]"
                    >
                      {roleBadgeLabel}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-sage-border bg-white p-2 shadow-lg">
                    <div className="border-b border-sage-border px-3 py-2.5">
                      <p className="truncate text-sm font-bold text-forest">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Badge variant={role === "admin" ? "clay" : "sage"}>
                          {roleBadgeLabel}
                        </Badge>
                        {user.plan === "pro" && (
                          <Badge variant="clay">Pro</Badge>
                        )}
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href={dashboardHref}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink hover:bg-sage-subtle/70"
                      >
                        <LayoutDashboard className="h-4 w-4 text-forest" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink hover:bg-sage-subtle/70"
                      >
                        <UserPen className="h-4 w-4 text-forest" />
                        Update Profile
                      </Link>
                    </div>
                    <div className="border-t border-sage-border pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle & Theme */}
        <div className="flex md:hidden items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-xl border border-sage-border p-2 text-forest hover:bg-sage-subtle cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-sage-border bg-white px-4 pb-5 pt-3 shadow-md">
          <nav className="flex flex-col gap-1">
            <ThemeToggle variant="button" className="mb-1" />
            {NAV_LINKS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : !item.href.startsWith("/#") &&
                    pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-xl px-3.5 py-2.5 text-sm font-semibold",
                    isActive
                      ? "bg-sage-subtle text-forest"
                      : "text-muted hover:bg-sage-subtle/50 hover:text-forest"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-sage-border pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-sage-bg p-3">
                  {isValidImageUrl(user.image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image!}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
                      {getInitials(user.name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-forest">
                      {user.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Badge variant={role === "admin" ? "clay" : "sage"}>
                        {roleBadgeLabel}
                      </Badge>
                      {user.plan === "pro" && <Badge variant="clay">Pro</Badge>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href={dashboardHref} className="w-full">
                    <Button variant="secondary" size="sm" className="w-full">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      <UserPen className="h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/sign-in" className="w-full">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" className="w-full">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
