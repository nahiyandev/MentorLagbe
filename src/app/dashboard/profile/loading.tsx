import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-[460px] w-full rounded-2xl" />
    </div>
  );
}
