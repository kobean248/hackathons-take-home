import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuestionIcon } from "@/components/icons";
import { BearSleeping, CloudShape } from "@/components/illustrations";

// Empty state with layered depth: sleeping bear + low-opacity cloud
// bleeding behind the copy — not a flat white index card.
export function EmptyApplicationState() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8">
      <CloudShape
        variant={5}
        cream="var(--color-sky)"
        primary="var(--color-sunset)"
        className="pointer-events-none absolute -bottom-6 -right-4 w-48 opacity-[0.12] sm:w-64"
      />
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
        <BearSleeping className="w-28 shrink-0 sm:w-36" />
        <div className="flex max-w-md flex-col gap-3">
          <div className="flex items-center gap-2 text-sky">
            <QuestionIcon className="size-5" />
            <span className="text-2xs font-medium">Empty hangar</span>
          </div>
          <h2 className="font-display text-h3 font-semibold text-ink">
            No application yet? The hangar on Telegraph is empty.
          </h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            You haven&apos;t started an application. Pick a role and fill out
            the form — you can save a draft and come back anytime.
          </p>
          <Button
            render={<Link href="/apply" />}
            nativeButton={false}
            size="lg"
            className="mt-1 w-fit"
          >
            Start an application
          </Button>
        </div>
      </div>
    </div>
  );
}
