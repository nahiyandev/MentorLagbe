"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  React.useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/sign-in?callbackUrl=/dashboard");
      return;
    }
    const role = (session.user as { role?: string }).role;
    router.replace(getDashboardPath(role));
  }, [isPending, session, router]);

  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
