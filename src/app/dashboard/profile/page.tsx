"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Camera,
  CheckCircle2,
  CreditCard,
  Link2,
  Loader2,
  Lock,
  Save,
  Shield,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { UserRecord } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/imgbb";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function UpdateProfilePage() {
  const { data: session, refetch } = useSession();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const [profileData, setProfileData] = React.useState<UserRecord | null>(null);
  const [draftName, setDraftName] = React.useState<string | null>(null);
  const [draftPhone, setDraftPhone] = React.useState<string | null>(null);
  const [draftBio, setDraftBio] = React.useState<string | null>(null);
  const [draftImage, setDraftImage] = React.useState<string | null>(null);

  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const name = draftName ?? profileData?.name ?? sessionUser?.name ?? "";
  const phone = draftPhone ?? profileData?.phone ?? sessionUser?.phone ?? "";
  const bio = draftBio ?? profileData?.bio ?? sessionUser?.bio ?? "";
  const image = draftImage ?? profileData?.image ?? sessionUser?.image ?? "";

  const role = normalizeRole(profileData?.role || sessionUser?.role);
  const rawPlan = profileData?.plan || sessionUser?.plan || "free";
  const isPro = rawPlan === "pro";
  const email = profileData?.email || sessionUser?.email || "";
  const createdAt = profileData?.createdAt || sessionUser?.createdAt;

  React.useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const res = await apiFetch<UserRecord | { user?: UserRecord; data?: UserRecord }>(
          "/api/profile"
        );
        const profile =
          res && typeof res === "object" && "email" in res
            ? (res as UserRecord)
            : (res as { user?: UserRecord; data?: UserRecord })?.user ||
              (res as { user?: UserRecord; data?: UserRecord })?.data ||
              null;

        if (active && profile) {
          setProfileData(profile);
          setDraftName(profile.name || "");
          setDraftPhone(profile.phone || "");
          setDraftBio(profile.bio || "");
          setDraftImage(profile.image || "");
        }
      } catch {
        // Fall back gracefully to session details
      } finally {
        if (active) setLoadingProfile(false);
      }
    }
    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const url = await uploadImageToImgBB(file);
      setDraftImage(url);
      toast.success("Profile photo uploaded to ImgBB. Click Save Changes to apply.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload profile photo."
      );
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Please enter your full name (at least 2 characters).");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch<UserRecord | { user?: UserRecord }>(
        "/api/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            bio: bio.trim(),
            image: image || "",
          }),
        }
      );

      const updated =
        res && typeof res === "object" && "email" in res
          ? (res as UserRecord)
          : (res as { user?: UserRecord })?.user || null;

      if (updated) {
        setProfileData(updated);
        setDraftName(updated.name || "");
        setDraftPhone(updated.phone || "");
        setDraftBio(updated.bio || "");
        setDraftImage(updated.image || "");
      }

      await refetch();
      toast.success("Profile updated successfully!");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Session token expired. Please sign in again.");
      } else {
        toast.error(
          err instanceof Error ? err.message : "Failed to update profile."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header Overview */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your personal profile details, contact information, and view
            your account status.
          </p>
        </div>
        {!isPro && (
          <Link href="/pricing" className="shrink-0">
            <Button variant="accent" size="sm">
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </Link>
        )}
      </div>

      {/* Profile Summary Card (Always Visible Header) */}
      <Card className="overflow-hidden border-sage-border bg-gradient-to-r from-white via-white to-sage-bg/30 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            {/* Avatar Display with ImgBB upload trigger */}
            <div className="relative group shrink-0">
              {isValidImageUrl(image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={name || "Profile picture"}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md border border-sage-border"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-forest text-2xl font-black text-white ring-4 ring-white shadow-md">
                  {getInitials(name || sessionUser?.name)}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Change profile picture"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white ring-2 ring-white shadow-sm hover:bg-forest/90 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* User Core Identification */}
            <div className="min-w-0 flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="truncate text-xl font-extrabold text-forest sm:text-2xl">
                  {name || "User"}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <Badge
                    variant={
                      role === "admin"
                        ? "clay"
                        : role === "tutor"
                          ? "sage"
                          : "default"
                    }
                    className="capitalize font-bold px-2.5 py-0.5"
                  >
                    <User className="h-3 w-3 mr-1" />
                    {role}
                  </Badge>

                  <Badge
                    variant={isPro ? "clay" : "outline"}
                    className="font-bold px-2.5 py-0.5"
                  >
                    {isPro ? (
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Pro Plan
                      </span>
                    ) : (
                      "Free Plan"
                    )}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted font-medium break-all">
                {email || "—"}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-muted">
                {createdAt && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-forest/70" />
                    Member since {formatDate(createdAt)}
                  </span>
                )}
                {phone && (
                  <span className="inline-flex items-center gap-1 font-medium text-forest">
                    &bull; {phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Profile Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Update করা যাবে (Editable Fields) */}
        <Card className="border-sage-border shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-forest flex items-center gap-2">
                  <User className="h-5 w-5 text-forest" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Editable details: Update your name, contact phone, bio, and
                  profile picture.
                </CardDescription>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Editable
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Profile Picture Uploader */}
            <div className="rounded-2xl border border-sage-border bg-sage-bg/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold text-forest">
                    Profile Picture (Direct ImgBB / Image Link)
                  </Label>
                  <p className="text-xs text-muted mt-0.5">
                    Upload your picture directly via ImgBB or paste a direct image URL.
                  </p>
                </div>
                {isValidImageUrl(image) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDraftImage("")}
                    className="h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove photo
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-sage-bg shrink-0"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading to ImgBB...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 text-forest" />
                      Upload New Photo (ImgBB)
                    </>
                  )}
                </Button>

                <div className="flex flex-1 items-center gap-2">
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted">
                    <Link2 className="h-3.5 w-3.5" />
                    Or image link:
                  </span>
                  <Input
                    id="profile-image-url"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={image}
                    onChange={(e) => setDraftImage(e.target.value)}
                    className="h-8.5 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-sm font-semibold text-forest">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g., Nahiyan Rahman"
                disabled={loadingProfile && !name}
                required
              />
              <p className="text-xs text-muted">
                This name is displayed publicly on your tuition listings, applications, and reviews.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone" className="text-sm font-semibold text-forest">
                Contact Phone Number
              </Label>
              <Input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setDraftPhone(e.target.value)}
                placeholder="e.g., +880 1711-000000"
              />
              <p className="text-xs text-muted">
                Used by tutors or students to contact you once an application is accepted.
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-bio" className="text-sm font-semibold text-forest">
                About / Bio
              </Label>
              <Textarea
                id="profile-bio"
                rows={4}
                value={bio}
                onChange={(e) => setDraftBio(e.target.value)}
                placeholder="Share your educational background, qualifications, subjects of expertise, or learning goals..."
              />
              <p className="text-xs text-muted">
                Brief summary displayed to help students or mentors get to know your profile.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Update করা যাবে না (Read-only System Fields) */}
        <Card className="border-sage-border bg-sage-bg/25 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-forest flex items-center gap-2">
                  <Lock className="h-4.5 w-4.5 text-clay" />
                  Account Security &amp; Subscription (Read-Only)
                </CardTitle>
                <CardDescription>
                  These core account attributes are protected and cannot be edited directly from this form.
                </CardDescription>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email (Read-only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-email" className="text-xs font-bold uppercase tracking-wider text-muted">
                  Email Address
                </Label>
                <span className="text-xs text-muted inline-flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Cannot be changed
                </span>
              </div>
              <div className="relative">
                <Input
                  id="profile-email"
                  value={email}
                  readOnly
                  disabled
                  className="bg-white/80 cursor-not-allowed pr-10 text-muted font-medium"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60" />
              </div>
              <p className="text-xs text-muted">
                Your primary login email is permanently tied to your account credentials.
              </p>
            </div>

            {/* Grid for Role & Plan */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Role (Read-only) */}
              <div className="rounded-xl border border-sage-border bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-forest" />
                    Account Role
                  </span>
                  <Badge
                    variant={
                      role === "admin"
                        ? "clay"
                        : role === "tutor"
                          ? "sage"
                          : "default"
                    }
                    className="capitalize text-xs font-bold"
                  >
                    {role}
                  </Badge>
                </div>
                <p className="text-sm font-bold text-forest capitalize">
                  {role} Account
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  Role permissions can only be modified by an <strong>Admin</strong> from the Admin Panel.
                </p>
              </div>

              {/* Plan (Read-only with Upgrade Link) */}
              <div className="rounded-xl border border-sage-border bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5 text-clay" />
                    Subscription Plan
                  </span>
                  <Badge
                    variant={isPro ? "clay" : "outline"}
                    className="text-xs font-bold"
                  >
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-forest">
                    {isPro ? "Pro Tier (Active)" : "Free Tier"}
                  </p>
                  {!isPro && (
                    <Link href="/pricing">
                      <Button variant="accent" size="sm" className="h-7 text-xs px-2.5">
                        Upgrade
                      </Button>
                    </Link>
                  )}
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {isPro
                    ? "Your Pro subscription is active, granting unlimited tuition listings and priority support."
                    : "Plan only upgrades to Pro automatically when purchasing a subscription via Stripe."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={saving || uploadingPhoto}
            className="min-w-40"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
