"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Crown,
  ExternalLink,
  Lock,
  LogOut,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
  UserPen,
} from "lucide-react";
import type { UserRecord, UserRole } from "@/types";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  formatDate,
  getInitials,
  isValidImageUrl,
  normalizeRole,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TutorAvailabilityManager } from "@/components/dashboard/tutor-availability-manager";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { LogoutConfirmDialog } from "@/components/auth/logout-confirm-dialog";

const ROLE_THEME_CONFIG: Record<
  UserRole,
  {
    roleLabel: string;
    subLabel: string;
    bannerGradient: string;
    cardBorder: string;
    badgeClass: string;
    avatarRing: string;
    accentText: string;
  }
> = {
  student: {
    roleLabel: "Student",
    subLabel: "Student & Mentee Profile",
    bannerGradient: "bg-linear-to-r from-teal-500/15 via-emerald-500/10 to-transparent",
    cardBorder: "border-teal-200/80 dark:border-teal-900/60",
    badgeClass:
      "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800",
    avatarRing: "ring-teal-500/40",
    accentText: "text-teal-700 dark:text-teal-400",
  },
  tutor: {
    roleLabel: "Tutor & Mentor",
    subLabel: "Instructor & Batch Mentor",
    bannerGradient: "bg-linear-to-r from-forest/15 via-emerald-600/10 to-transparent",
    cardBorder: "border-forest/20 dark:border-emerald-800/60",
    badgeClass:
      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    avatarRing: "ring-forest/40",
    accentText: "text-forest dark:text-[#8EE0BA]",
  },
  admin: {
    roleLabel: "Administrator",
    subLabel: "Platform Oversight & Control",
    bannerGradient: "bg-linear-to-r from-purple-500/15 via-indigo-500/10 to-transparent",
    cardBorder: "border-purple-200/80 dark:border-purple-900/60",
    badgeClass:
      "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
    avatarRing: "ring-purple-500/40",
    accentText: "text-purple-700 dark:text-purple-400",
  },
};

export default function ProfilePage() {
  const { data: session, refetch } = useSession();

  const [profileData, setProfileData] = React.useState<UserRecord | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const sessionUser = session?.user as
    | {
        name?: string;
        email?: string;
        image?: string | null;
        role?: string;
        phone?: string;
        bio?: string;
        plan?: string;
        createdAt?: string | Date;
      }
    | undefined;

  React.useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const res = await apiFetch<
          UserRecord | { user?: UserRecord; data?: UserRecord }
        >("/api/profile");
        const profile =
          res && typeof res === "object" && "email" in res
            ? (res as UserRecord)
            : (res as { user?: UserRecord; data?: UserRecord })?.user ||
              (res as { user?: UserRecord; data?: UserRecord })?.data ||
              null;

        if (active && profile) {
          setProfileData(profile);
        }
      } catch {
        // Fall back gracefully to session
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleProfileUpdated = (updated: UserRecord) => {
    setProfileData(updated);
    void refetch();
  };

  const name = profileData?.name || sessionUser?.name || "User";
  const email = profileData?.email || sessionUser?.email || "";
  const phone = profileData?.phone || sessionUser?.phone || "";
  const bio = profileData?.bio || sessionUser?.bio || "";
  const image = profileData?.image || sessionUser?.image || "";
  const rawRole = profileData?.role || sessionUser?.role;
  const role: UserRole = normalizeRole(rawRole);
  const rawPlan = profileData?.plan || sessionUser?.plan || "free";
  const isPro = rawPlan === "pro";
  const createdAt = profileData?.createdAt || sessionUser?.createdAt;

  const theme = ROLE_THEME_CONFIG[role];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-forest dark:text-[#8EE0BA] sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
            View your personal details, role privileges, and account settings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            onClick={() => setEditDialogOpen(true)}
            className="shadow-xs"
          >
            <UserPen className="h-4 w-4 mr-1.5" />
            Edit Profile
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setLogoutDialogOpen(true)}
            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-950/60 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      ) : (
        <>
          {/* Main Profile Hero Card (Clean UI & Role-Themed) */}
          <Card
            className={`relative overflow-hidden border shadow-xs transition-colors ${theme.cardBorder} bg-white dark:bg-[#141F18]`}
          >
            {/* Top Role-Themed Banner Accent */}
            <div className={`h-24 w-full ${theme.bannerGradient}`} />

            <CardContent className="relative px-6 pb-6 pt-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12 sm:-mt-14">
                {/* User Avatar */}
                <div className="relative group shrink-0">
                  {isValidImageUrl(image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={name}
                      className={`h-28 w-28 rounded-full object-cover ring-4 ring-white dark:ring-[#141F18] shadow-md border ${theme.avatarRing}`}
                    />
                  ) : (
                    <div
                      className={`flex h-28 w-28 items-center justify-center rounded-full bg-forest text-3xl font-black text-white ring-4 ring-white dark:ring-[#141F18] shadow-md ${theme.avatarRing}`}
                    >
                      {getInitials(name)}
                    </div>
                  )}
                </div>

                {/* Name, Badges & Role Summary */}
                <div className="min-w-0 flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-forest dark:text-[#8EE0BA] truncate">
                        {name}
                      </h2>
                      <p className="text-xs font-semibold text-muted dark:text-[#9DB3A6]">
                        {theme.subLabel}
                      </p>
                    </div>

                    {/* Pro & Role Badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                      {/* Role Badge */}
                      <Badge className={`font-bold px-2.5 py-1 ${theme.badgeClass}`}>
                        <User className="h-3.5 w-3.5 mr-1" />
                        {theme.roleLabel}
                      </Badge>

                      {/* Pro vs Free Badge */}
                      {isPro ? (
                        <Badge className="bg-linear-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-black px-2.5 py-1 shadow-2xs">
                          <Crown className="h-3.5 w-3.5 mr-1 text-amber-600 fill-amber-500" />
                          PRO MEMBER
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 font-semibold px-2.5 py-1"
                        >
                          <Shield className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          FREE TIER
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bio statement */}
                  <p className="text-sm text-ink/80 dark:text-[#EFF5F0]/80 pt-1 leading-relaxed">
                    {bio ? (
                      bio
                    ) : (
                      <span className="italic text-muted dark:text-[#9DB3A6]">
                        No bio provided yet. Click &quot;Edit Profile&quot; to add your summary.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Card 1: Contact & Identification */}
            <Card className="border-sage-border dark:border-[#23352B] bg-white dark:bg-[#141F18] shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-forest dark:text-[#8EE0BA] flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-forest dark:text-[#8EE0BA]" />
                  Contact &amp; Account Info
                </CardTitle>
                <CardDescription>
                  Your verified contact and profile identification credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3 rounded-xl border border-sage-border/80 dark:border-[#1E3025] bg-sage-bg/30 dark:bg-[#18261E] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest/10 dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA]">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                      Email Address
                    </p>
                    <p className="text-sm font-semibold text-forest dark:text-[#8EE0BA] truncate">
                      {email}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted dark:text-[#9DB3A6] mt-0.5">
                      <Lock className="h-2.5 w-2.5" /> Primary login email
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 rounded-xl border border-sage-border/80 dark:border-[#1E3025] bg-sage-bg/30 dark:bg-[#18261E] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-clay/10 dark:bg-[#34241B] text-clay dark:text-[#E58E58]">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                      Contact Phone
                    </p>
                    <p className="text-sm font-semibold text-forest dark:text-[#8EE0BA]">
                      {phone || (
                        <span className="italic text-muted font-normal">
                          Not set
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-start gap-3 rounded-xl border border-sage-border/80 dark:border-[#1E3025] bg-sage-bg/30 dark:bg-[#18261E] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest/10 dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA]">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                      Member Since
                    </p>
                    <p className="text-sm font-semibold text-forest dark:text-[#8EE0BA]">
                      {createdAt ? formatDate(createdAt) : "Recently"}
                    </p>
                  </div>
                </div>

                {/* Tutor Public Profile Link */}
                {role === "tutor" && email && (
                  <Link
                    href={`/tutors/${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-[#8EE0BA] hover:text-clay dark:hover:text-[#E58E58] transition-colors pt-1"
                  >
                    <span>View My Public Tutor Profile</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Card 2: Membership & Subscription Plan */}
            <Card className="border-sage-border dark:border-[#23352B] bg-white dark:bg-[#141F18] shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-forest dark:text-[#8EE0BA] flex items-center gap-2">
                  <CreditCard className="h-4.5 w-4.5 text-clay dark:text-[#E58E58]" />
                  Subscription &amp; Privileges
                </CardTitle>
                <CardDescription>
                  Manage your plan tier and discover member benefits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-sage-border bg-sage-bg/30 dark:bg-[#18261E] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Current Tier
                      </p>
                      <p className="text-lg font-extrabold text-forest dark:text-[#8EE0BA] mt-0.5">
                        {isPro ? "Pro Membership" : "Free Tier"}
                      </p>
                    </div>

                    {isPro ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <Crown className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                        Active
                      </span>
                    ) : (
                      <Link href="/pricing">
                        <Button size="sm" variant="accent" className="h-8 text-xs">
                          <Sparkles className="h-3.5 w-3.5 mr-1" />
                          Upgrade to Pro
                        </Button>
                      </Link>
                    )}
                  </div>

                  <p className="text-xs text-muted dark:text-[#9DB3A6] leading-relaxed">
                    {isPro
                      ? "You enjoy unlimited tuition listings, top search placement, instant bKash/Nagad pro features, and premium applicant analytics."
                      : "Free accounts can post up to 2 active tuition listings. Upgrade to Pro for unlimited posts and priority verification."}
                  </p>
                </div>

                {/* Plan Highlights */}
                <div className="space-y-2 pt-1 text-xs text-muted dark:text-[#9DB3A6]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Direct messaging and inquiry inbox</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Application timeline tracking and status updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Local bKash, Nagad, and Stripe payment support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tutor Availability Schedule Manager */}
          {role === "tutor" && (
            <div className="pt-2">
              <TutorAvailabilityManager
                initialAvailability={profileData?.availability}
                onSaved={(updated) => {
                  setProfileData((prev) =>
                    prev ? { ...prev, availability: updated } : null
                  );
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentUser={profileData}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      />
    </div>
  );
}
