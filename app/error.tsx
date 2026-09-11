"use client";

import { Button } from "@/components/ui/button";

// Route-segment error boundaries must be Client Components.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="font-display text-h3 font-semibold">
        Something went wrong.
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        That&apos;s on us — try again, and if it keeps happening let an
        organizer know.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
