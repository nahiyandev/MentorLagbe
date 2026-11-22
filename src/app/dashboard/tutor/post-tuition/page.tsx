"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ImagePlus,
  Link2,
  Loader2,
  PlusCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  CLASS_LEVEL_OPTIONS,
  MODE_OPTIONS,
  SUBJECT_OPTIONS,
  type TuitionMode,
} from "@/types";
import { ApiError, apiFetch } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { isValidImageUrl } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TutorPostTuitionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const user = session?.user as
    | { name?: string; email?: string; plan?: string }
    | undefined;
  const isPro = user?.plan === "pro";

  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState<string>(SUBJECT_OPTIONS[0]);
  const [classLevel, setClassLevel] = React.useState<string>(
    CLASS_LEVEL_OPTIONS[2]
  );
  const [mode, setMode] = React.useState<TuitionMode>("Online");
  const [location, setLocation] = React.useState("");
  const [monthlyFee, setMonthlyFee] = React.useState("");
  const [daysPerWeek, setDaysPerWeek] = React.useState("3");
  const [seatLimit, setSeatLimit] = React.useState("5");
  const [description, setDescription] = React.useState("");
  const [bannerImage, setBannerImage] = React.useState("");

  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [limitReached, setLimitReached] = React.useState(false);

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImageToImgBB(file);
      setBannerImage(url);
      toast.success("Banner image uploaded successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Banner image upload failed."
      );
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLimitReached(false);

    if (!title.trim() || title.trim().length < 5) {
      toast.error("Please enter a clear tuition title (at least 5 characters).");
      return;
    }
    if (!location.trim()) {
      toast.error(
        mode === "Online"
          ? "Please enter the online platform/location (e.g., Online via Zoom)."
          : "Please enter the offline teaching location."
      );
      return;
    }

    const parsedFee = Number(monthlyFee);
    if (!Number.isFinite(parsedFee) || parsedFee <= 0) {
      toast.error("Please enter a valid positive monthly fee.");
      return;
    }

    const parsedDays = Number(daysPerWeek);
    if (!Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 7) {
      toast.error("Days per week must be between 1 and 7.");
      return;
    }

    const parsedSeats = Number(seatLimit);
    if (!Number.isFinite(parsedSeats) || parsedSeats < 1 || parsedSeats > 100) {
      toast.error("Batch seat limit must be between 1 and 100 students.");
      return;
    }

    if (!description.trim() || description.trim().length < 20) {
      toast.error("Please provide a detailed description (at least 20 characters).");
      return;
    }

    if (bannerImage.trim() && !isValidImageUrl(bannerImage.trim())) {
      toast.error("Please provide a valid image link (e.g. https://...).");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/tuitions", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          subject,
          classLevel,
          mode,
          location: location.trim(),
          monthlyFee: parsedFee,
          daysPerWeek: parsedDays,
          seatLimit: parsedSeats,
          description: description.trim(),
          bannerImage: bannerImage.trim() || undefined,
          tutorName:
            user?.name?.trim() || session?.user?.name?.trim() || "Tutor",
        }),
      });

      toast.success(
        "Tuition posted! It is now pending admin approval before going public."
      );
      router.push("/dashboard/tutor/my-tuitions");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403 && /limit|free|pro|2/i.test(err.message)) {
          setLimitReached(true);
          toast.error(err.message);
        } else if (err.status === 401) {
          toast.error(
            "Backend JWT token is missing or expired. Please sign in again."
          );
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Could not post tuition. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
            Post a New Tuition
          </h1>
          <p className="mt-1 text-sm text-muted">
            Create a structured batch or 1-on-1 mentorship listing. All new
            posts require admin approval before appearing publicly.
          </p>
        </div>
        {!isPro && (
          <Link href="/pricing">
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 text-clay" />
              Free Plan: Max 2 Posts
            </Button>
          </Link>
        )}
      </div>

      {limitReached && (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-clay/40 bg-clay-soft p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold text-forest">
              Free Tutor posting limit reached (2 posts)
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Upgrade to the Pro Tutor Plan ($15) to publish unlimited tuition
              listings.
            </p>
          </div>
          <Link href="/pricing" className="shrink-0">
            <Button variant="accent" size="sm">
              Upgrade to Pro Tutor
            </Button>
          </Link>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tuition Details</CardTitle>
          <CardDescription>
            Provide accurate schedule, fee, and syllabus information so students
            can evaluate your batch easily.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Tuition Title</Label>
              <Input
                id="title"
                placeholder="e.g., HSC Higher Math Intensive Problem-Solving Batch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="classLevel">Class Level</Label>
                <Select
                  id="classLevel"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                >
                  {CLASS_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="mode">Teaching Mode</Label>
                <Select
                  id="mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as TuitionMode)}
                >
                  {MODE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="monthlyFee">Monthly Fee (BDT)</Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  min={100}
                  step={50}
                  placeholder="e.g., 3500"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="daysPerWeek">Days / Week</Label>
                <Input
                  id="daysPerWeek"
                  type="number"
                  min={1}
                  max={7}
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="seatLimit">Batch Seat Limit</Label>
                <Input
                  id="seatLimit"
                  type="number"
                  min={1}
                  max={100}
                  value={seatLimit}
                  onChange={(e) => setSeatLimit(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">
                {mode === "Online" ? "Online Platform / Region" : "Offline Area / Location"}
              </Label>
              <Input
                id="location"
                placeholder={
                  mode === "Online"
                    ? "e.g., Online (Zoom & Google Classroom)"
                    : "e.g., Dhanmondi, Dhaka"
                }
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Direct ImgBB Banner File Upload */}
            <div className="space-y-2">
              <Label htmlFor="bannerUpload">
                Tuition Banner Image (Optional)
              </Label>

              <input
                ref={fileInputRef}
                id="bannerUpload"
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />

              {isValidImageUrl(bannerImage) ? (
                <div className="overflow-hidden rounded-2xl border border-sage-border bg-sage-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerImage}
                    alt="Tuition banner preview"
                    className="h-52 w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 border-t border-sage-border">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Banner ready
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Replace Image
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setBannerImage("")}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sage-border bg-sage-bg/50 px-6 py-10 text-center transition-colors hover:border-forest/50 hover:bg-sage-subtle/40 cursor-pointer disabled:cursor-not-allowed"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-forest" />
                      <p className="mt-2.5 text-sm font-semibold text-forest">
                        Uploading banner image to ImgBB...
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-forest border border-sage-border shadow-xs">
                        <ImagePlus className="h-6 w-6" />
                      </span>
                      <p className="mt-3 text-sm font-bold text-forest">
                        Click to choose a banner image
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        PNG, JPG, or WebP up to 5MB — or leave empty to use our clean subject graphic
                      </p>
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted">
                  <Link2 className="h-3.5 w-3.5" />
                  Or image link:
                </span>
                <Input
                  id="bannerUrl"
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="h-8.5 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description &amp; Syllabus</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describe teaching methodology, syllabus coverage, weekly assessments, batch size, and student expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/dashboard/tutor/my-tuitions">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                size="lg"
                disabled={submitting || uploadingImage}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    Submit Tuition for Approval
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
