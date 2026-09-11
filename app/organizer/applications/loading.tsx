import { Skeleton } from "@/components/ui/skeleton";

// Route-level loading state for the densest page in the app — mirrors the
// real table's shape (filter bar + rows with an avatar) instead of a blank
// flash or the generic global PlaneLoader.
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-40" />
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="overflow-hidden rounded-xl border border-line">
        <div className="border-b border-line bg-paper px-4 py-2.5">
          <Skeleton className="h-3 w-16" />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-t border-line px-4 py-3 first:border-t-0"
          >
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-20 rounded-chip" />
            <Skeleton className="hidden h-3 w-16 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
