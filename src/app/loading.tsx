import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-sage-bg">
      <div className="h-16.5 border-b border-sage-border bg-white px-6 flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="hidden md:flex gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3 max-w-2xl">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-sage-border bg-white p-5 space-y-4"
            >
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
