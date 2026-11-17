"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { authClient, getSession } from "@/lib/auth-client";
import { exchangeSessionForJwt } from "@/lib/api";
import { cn, getDashboardPath } from "@/lib/utils";
import { SiteShell } from "@/components/layout/site-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole =
    searchParams.get("role") === "tutor" ? "tutor" : "student";

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"student" | "tutor">(initialRole);
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = "Please enter your full name (at least 2 characters).";
    }
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters long.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted form errors.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      } as Parameters<typeof authClient.signUp.email>[0] & {
        role: "student" | "tutor";
      });

      if (error) {
        toast.error(error.message || "Could not create account.");
        setSubmitting(false);
        return;
      }

      const sessionRes = await getSession();
      const sessionToken =
        sessionRes?.data?.session?.token ||
        (data as { token?: string } | null)?.token;
      await exchangeSessionForJwt(sessionToken);

      toast.success(
        `Welcome to MentorLagbe! Your ${role} account is ready (Free Plan).`
      );
      router.push(getDashboardPath(role));
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign up failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-white shadow-sm">
          <GraduationCap className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-extrabold text-forest">
          Create your MentorLagbe account
        </CardTitle>
        <CardDescription>
          Choose whether you are learning as a student or teaching as a tutor.
          All new accounts start on the Free Plan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Role Selection */}
          <div className="space-y-2">
            <Label>I want to join as</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                  role === "student"
                    ? "border-forest bg-sage-subtle/70 ring-2 ring-forest/20"
                    : "border-sage-border bg-white hover:bg-sage-bg/60"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <BookOpen className="h-5 w-5 text-forest" />
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full border-2",
                      role === "student"
                        ? "border-forest bg-forest"
                        : "border-sage-border"
                    )}
                  />
                </div>
                <span className="text-sm font-bold text-forest">Student</span>
                <span className="text-xs text-muted">
                  Find tutors &amp; apply to batches
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("tutor")}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                  role === "tutor"
                    ? "border-forest bg-sage-subtle/70 ring-2 ring-forest/20"
                    : "border-sage-border bg-white hover:bg-sage-bg/60"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <UserCheck className="h-5 w-5 text-clay" />
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full border-2",
                      role === "tutor"
                        ? "border-forest bg-forest"
                        : "border-sage-border"
                    )}
                  />
                </div>
                <span className="text-sm font-bold text-forest">Tutor</span>
                <span className="text-xs text-muted">
                  Post tuitions &amp; mentor students
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Tanvir Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            {errors.email && (
              <p className="text-xs font-medium text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-forest cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              `Create ${role === "tutor" ? "Tutor" : "Student"} Account`
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-bold text-forest hover:text-clay transition-colors"
          >
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <SiteShell>
      <section className="mx-auto flex max-w-7xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <React.Suspense
          fallback={
            <div className="h-[520px] w-full max-w-lg animate-pulse rounded-2xl border border-sage-border bg-white" />
          }
        >
          <SignUpForm />
        </React.Suspense>
      </section>
    </SiteShell>
  );
}
