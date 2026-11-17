"use client";

import * as React from "react";
import Link from "next/link";
import {
  ImagePlus,
  Loader2,
  Pencil,
  PlusCircle,
  Power,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  CLASS_LEVEL_OPTIONS,
  MODE_OPTIONS,
  SUBJECT_OPTIONS,
  type Tuition,
  type TuitionMode,
} from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { formatFee, isValidImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function TutorMyTuitionsPage() {
  const [tuitions, setTuitions] = React.useState<Tuition[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Tuition | null>(null);
  const [savingEdit, setSavingEdit] = React.useState(false);
  const [uploadingBanner, setUploadingBanner] = React.useState(false);
  const editFileRef = React.useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = React.useState({
    title: "",
    subject: SUBJECT_OPTIONS[0] as string,
    classLevel: CLASS_LEVEL_OPTIONS[0] as string,
    mode: "Online" as TuitionMode,
    location: "",
    monthlyFee: "",
    daysPerWeek: "3",
    description: "",
    bannerImage: "",
  });

  const loadTuitions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<unknown>("/api/tuitions/my-tuitions");
      setTuitions(extractList<Tuition>(res, "tuitions"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(
          "Backend JWT token is missing or expired. Once POST /api/auth/jwt is live on the server, sign in again to manage your tuitions."
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load your tuitions."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTuitions();
  }, [loadTuitions]);

  const openEditModal = (t: Tuition) => {
    setEditing(t);
    setEditForm({
      title: t.title,
      subject: t.subject,
      classLevel: t.classLevel,
      mode: t.mode,
      location: t.location || "",
      monthlyFee: String(t.monthlyFee),
      daysPerWeek: String(t.daysPerWeek || 3),
      description: t.description || "",
      bannerImage: t.bannerImage || "",
    });
  };

  const handleReplaceBanner = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await uploadImageToImgBB(file);
      setEditForm((prev) => ({ ...prev, bannerImage: url }));
      toast.success("Banner image updated.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image."
      );
    } finally {
      setUploadingBanner(false);
      if (editFileRef.current) editFileRef.current.value = "";
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const fee = Number(editForm.monthlyFee);
    const days = Number(editForm.daysPerWeek);
    if (!editForm.title.trim() || !Number.isFinite(fee) || fee <= 0) {
      toast.error("Please provide a valid title and monthly fee.");
      return;
    }

    setSavingEdit(true);
    try {
      const updated = await apiFetch<Tuition | { tuition?: Tuition; data?: Tuition }>(
        `/api/tuitions/${encodeURIComponent(editing._id)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: editForm.title.trim(),
            subject: editForm.subject,
            classLevel: editForm.classLevel,
            mode: editForm.mode,
            location: editForm.location.trim(),
            monthlyFee: fee,
            daysPerWeek: Number.isFinite(days) ? days : 3,
            description: editForm.description.trim(),
            bannerImage: editForm.bannerImage,
          }),
        }
      );

      const nextDoc =
        updated && typeof updated === "object" && "_id" in updated
          ? (updated as Tuition)
          : (updated as { tuition?: Tuition; data?: Tuition })?.tuition ||
            (updated as { tuition?: Tuition; data?: Tuition })?.data || {
              ...editing,
              title: editForm.title.trim(),
              subject: editForm.subject,
              classLevel: editForm.classLevel,
              mode: editForm.mode,
              location: editForm.location.trim(),
              monthlyFee: fee,
              daysPerWeek: Number.isFinite(days) ? days : 3,
              description: editForm.description.trim(),
              bannerImage: editForm.bannerImage,
            };

      setTuitions((prev) =>
        prev.map((item) => (item._id === editing._id ? nextDoc : item))
      );
      toast.success("Tuition updated successfully.");
      setEditing(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update tuition."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleActive = async (t: Tuition) => {
    setBusyId(t._id);
    try {
      await apiFetch(`/api/tuitions/${encodeURIComponent(t._id)}/toggle`, {
        method: "PATCH",
      });
      setTuitions((prev) =>
        prev.map((item) =>
          item._id === t._id ? { ...item, isActive: !item.isActive } : item
        )
      );
      toast.success(
        t.isActive
          ? "Tuition marked as Closed."
          : "Tuition marked as Active."
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not toggle status."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (t: Tuition) => {
    setBusyId(t._id);
    try {
      await apiFetch(`/api/tuitions/${encodeURIComponent(t._id)}`, {
        method: "DELETE",
      });
      setTuitions((prev) => prev.filter((item) => item._id !== t._id));
      toast.success("Tuition deleted.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete tuition."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
            My Created Tuitions
          </h1>
          <p className="mt-1 text-sm text-muted">
            Edit details, toggle Active/Closed availability, or delete your
            tuition posts.
          </p>
        </div>
        <Link href="/dashboard/tutor/post-tuition">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Post New Tuition
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            All Listings ({loading ? "…" : tuitions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : tuitions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 p-10 text-center">
              <p className="text-base font-bold text-forest">
                You haven&apos;t posted any tuitions yet
              </p>
              <p className="mt-1 text-sm text-muted">
                Publish your first batch to connect with students.
              </p>
              <Link
                href="/dashboard/tutor/post-tuition"
                className="mt-5 inline-block"
              >
                <Button size="sm">Post a Tuition</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tuitions.map((t) => {
                const isBusy = busyId === t._id;
                return (
                  <div
                    key={t._id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-sage-border bg-sage-bg/35 p-4 sm:p-5 lg:flex-row lg:items-center"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {isValidImageUrl(t.bannerImage) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.bannerImage!}
                          alt={t.title}
                          className="hidden sm:block h-18 w-26 shrink-0 rounded-xl object-cover border border-sage-border"
                        />
                      ) : (
                        <div className="hidden sm:flex h-18 w-26 shrink-0 items-center justify-center rounded-xl bg-forest text-xs font-bold text-white">
                          {t.subject}
                        </div>
                      )}

                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant={
                              t.approvalStatus === "approved"
                                ? "success"
                                : t.approvalStatus === "rejected"
                                  ? "danger"
                                  : "warning"
                            }
                            className="capitalize"
                          >
                            {t.approvalStatus}
                          </Badge>
                          <Badge variant={t.isActive ? "sage" : "outline"}>
                            {t.isActive ? "Active" : "Closed"}
                          </Badge>
                          <Badge variant="outline">{t.mode}</Badge>
                        </div>

                        <h3 className="truncate text-base font-bold text-forest">
                          {t.title}
                        </h3>
                        <p className="text-xs text-muted">
                          {t.subject} &bull; {t.classLevel} &bull;{" "}
                          {t.daysPerWeek} days/wk &bull;{" "}
                          <span className="font-bold text-clay">
                            {formatFee(t.monthlyFee)}/mo
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => openEditModal(t)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleToggleActive(t)}
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Power className="h-3.5 w-3.5" />
                        )}
                        {t.isActive ? "Set Closed" : "Set Active"}
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleDelete(t)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Tuition Modal */}
      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Tuition"
        description="Update your tuition details below."
        className="max-w-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-subject">Subject</Label>
              <Select
                id="edit-subject"
                value={editForm.subject}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, subject: e.target.value }))
                }
              >
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-level">Class Level</Label>
              <Select
                id="edit-level"
                value={editForm.classLevel}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    classLevel: e.target.value,
                  }))
                }
              >
                {CLASS_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-mode">Mode</Label>
              <Select
                id="edit-mode"
                value={editForm.mode}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    mode: e.target.value as TuitionMode,
                  }))
                }
              >
                {MODE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-fee">Monthly Fee (BDT)</Label>
              <Input
                id="edit-fee"
                type="number"
                min={100}
                value={editForm.monthlyFee}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    monthlyFee: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-days">Days / Week</Label>
              <Input
                id="edit-days"
                type="number"
                min={1}
                max={7}
                value={editForm.daysPerWeek}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    daysPerWeek: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={editForm.location}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Banner Image (ImgBB Upload)</Label>
            <input
              ref={editFileRef}
              type="file"
              accept="image/*"
              onChange={handleReplaceBanner}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              {isValidImageUrl(editForm.bannerImage) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={editForm.bannerImage}
                  alt="Banner preview"
                  className="h-14 w-24 rounded-lg object-cover border border-sage-border"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingBanner}
                onClick={() => editFileRef.current?.click()}
              >
                {uploadingBanner ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {editForm.bannerImage ? "Replace Banner" : "Upload Banner"}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              rows={4}
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={savingEdit || uploadingBanner}>
              {savingEdit ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
