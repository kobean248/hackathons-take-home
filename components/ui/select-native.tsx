import type { ComponentProps } from "react";
import { cn } from "cn";

// A plain <select>, styled to match Input/Textarea, for the organizer
// filter bar — full shadcn Select is overkill for a couple of GET-form
// dropdowns with no client interactivity needed beyond native behavior.
function SelectNative({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      data-slot="select-native"
      className={cn(
        "h-9 rounded-chip border border-border bg-surface px-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        className
      )}
      {...props}
    />
  );
}

export { SelectNative };
