"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[MentorLagbe] Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-bg px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-sage-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-forest">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {error.message ||
            "An unexpected error occurred while loading this page."}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
