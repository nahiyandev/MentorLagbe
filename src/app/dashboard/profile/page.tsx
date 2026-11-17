"use client";

import * as React from "react";
import { Camera, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { UserRecord } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { useSession } from "@/lib/auth-client";
import { getInitials, isValidImageUrl, normalizeRole } from "@/lib/utils";
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
      }
    | undefined;

  const [draftName, setDraftName] = React.useState<string | null>(null);
  const [draftPhone, setDraftPhone] = React.useState<string | null>(null);
  const [draftBio, setDraftBio] = React.useState<string | null>(null);
  const [draftImage, setDraftImage] = React.useState<string | null>(null);

  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const name = draftName ?? sessionUser?.name ?? "";
  const phone = draftPhone ?? sessionUser?.phone ?? "";
  const bio = draftBio ?? sessionUser?.bio ?? "";
  const image = draftImage ?? sessionUser?.image ?? "";

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
          setDraftName(profile.name || "");
          setDraftPhone(profile.phone || "");
          setDraftBio(profile.bio || "");
          setDraftImage(profile.image || "");
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 404) {
            toast.info(
              "Server profile endpoint (GET /api/profile) is not live yet. Showing your current session details."
            );
          } else if (err instanceof ApiError && err.status === 401) {
            // Keep session values visible quietly
          }
        }
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
      toast.success("Profile picture uploaded to ImgBB. Click Save Changes to apply.");
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
      toast.error("Please enter your full name.");
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          image: image || undefined,
        }),
      });
      await refetch();
      toast.success("Profile updated successfully.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        toast.info(
          "Profile update endpoint (PATCH /api/profile) is not live yet on the server."
        );
      } else if (err instanceof ApiError && err.status === 401) {
        toast.error(
          "Backend JWT token is missing or expired. Please sign in again."
        );
      } else {
        toast.error(
          err instanceof Error ? err.message : "Failed to save profile changes."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const role = normalizeRole(sessionUser?.role);
  const plan = sessionUser?.plan === "pro" ? "Pro Plan" : "Free Plan";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
          Update Profile
        </h1>
        <p className="mt-1 text-sm text-muted">
          Keep your personal information, bio, and profile picture up to date.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>{sessionUser?.email}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={role === "admin" ? "clay" : "sage"} className="capitalize">
                {role}
              </Badge>
              <Badge variant={sessionUser?.plan === "pro" ? "clay" : "outline"}>
                {plan}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Direct ImgBB Upload */}
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-sage-border bg-sage-bg/50 p-4 sm:flex-row sm:items-center">
              {isValidImageUrl(image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={name || "Profile picture"}
                  className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-forest text-xl font-bold text-white shadow-sm">
                  {getInitials(name || sessionUser?.name)}
                </span>
              )}

              <div className="space-y-2">
                <p className="text-sm font-bold text-forest">
                  Profile Picture
                </p>
                <p className="text-xs text-muted">
                  Upload a PNG, JPG, or WebP photo (max 5MB) directly via ImgBB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Upload New Photo
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Your full name"
                disabled={loadingProfile && !name}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Phone Number</Label>
              <Input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setDraftPhone(e.target.value)}
                placeholder="e.g., +880 1711-000000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-bio">Short Bio</Label>
              <Textarea
                id="profile-bio"
                rows={4}
                value={bio}
                onChange={(e) => setDraftBio(e.target.value)}
                placeholder="Tell students or tutors about your academic background, subjects of interest, or teaching experience..."
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={saving || uploadingPhoto}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
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
        </CardContent>
      </Card>
    </div>
  );
}
