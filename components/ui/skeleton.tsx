import type { ComponentProps } from "react";
import { cn } from "cn";

// One shimmer primitive reused wherever data is loading, instead of a
// blank-then-populated pop. Pass a shape via className (h-4 w-32,
// size-8 rounded-full, etc.) — this just supplies the shimmer + radius.
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("skeleton rounded-chip", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
