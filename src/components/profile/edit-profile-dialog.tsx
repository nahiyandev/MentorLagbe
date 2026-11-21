"use client";

import * as React from "react";
import {
  Camera,
  Link2,
  Loader2,
  Lock,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { UserRecord } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { isValidImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: UserRecord | null;
  onProfileUpdated: (updated: UserRecord) => void;
}

export function EditProfileDialog({
  open,
  onClose,
  currentUser,
  onProfileUpdated,
}: EditProfileDialogProps) {
  if (!open) return null;

  return (
    <EditProfileDialogContent
      open={open}
      onClose={onClose}
      currentUser={currentUser}
      onProfileUpdated={onProfileUpdated}
    />
  );
}

function EditProfileDialogContent({
  open,
  onClose,
  currentUser,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [name, setName] = React.useState(currentUser?.name || "");
  const [phone, setPhone] = React.useState(currentUser?.phone || "");
  const [bio, setBio] = React.useState(currentUser?.bio || "");
  const [image, setImage] = React.useState(currentUser?.image || "");

  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const url = await uploadImageToImgBB(file);
      setImage(url);
      toast.success("Profile photo uploaded to ImgBB successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload photo."
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
        onProfileUpdated(updated);
        toast.success("Profile updated successfully!");
        onClose();
      } else {
        throw new Error("Invalid response from server.");
      }
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
    <Dialog
      open={open}
      onClose={() => {
        if (!saving && !uploadingPhoto) onClose();
      }}
      title="Edit Profile"
      description="Update your display name, contact phone, avatar, and personal bio."
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Photo Section */}
        <div className="rounded-2xl border border-sage-border bg-sage-bg/30 dark:bg-[#141F18] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-forest dark:text-[#8EE0BA]">
              Profile Picture
            </Label>
            {isValidImageUrl(image) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImage("")}
                className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
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
              disabled={uploadingPhoto || saving}
              onClick={() => fileInputRef.current?.click()}
              className="bg-white dark:bg-[#1C2B22] shrink-0"
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-1.5 text-forest dark:text-[#8EE0BA]" />
                  Upload Photo (ImgBB)
                </>
              )}
            </Button>

            <div className="flex flex-1 items-center gap-2">
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted">
                <Link2 className="h-3.5 w-3.5" />
                URL:
              </span>
              <Input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="h-8.5 text-xs bg-white dark:bg-[#1C2B22]"
              />
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-name" className="text-sm font-semibold text-forest dark:text-[#8EE0BA]">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nahiyan Rahman"
            required
            disabled={saving}
          />
        </div>

        {/* Contact Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-phone" className="text-sm font-semibold text-forest dark:text-[#8EE0BA]">
            Contact Phone Number
          </Label>
          <Input
            id="edit-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +880 1711-000000"
            disabled={saving}
          />
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-bio" className="text-sm font-semibold text-forest dark:text-[#8EE0BA]">
            About / Bio
          </Label>
          <Textarea
            id="edit-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share your background, educational qualifications, subjects, or learning goals..."
            disabled={saving}
          />
        </div>

        {/* Read-only Security Notice */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 text-xs text-muted">
          <Lock className="h-4 w-4 shrink-0 text-slate-500" />
          <span>
            Primary email (<strong>{currentUser?.email}</strong>) and account role (<strong>{currentUser?.role}</strong>) are protected for security.
          </span>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-sage-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving || uploadingPhoto}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving || uploadingPhoto}
            className="min-w-32"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
