import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * Shared portal page hero — frosted panel + campus pattern + optional
 * illustration. Text sits on a solid scrim so long headlines stay readable.
 */
export function PortalHero({
  eyebrow,
  title,
  description,
  scene,
  children,
  className,
  seal,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  scene?: ReactNode;
  children?: ReactNode;
  className?: string;
  seal?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "glass-hero relative overflow-hidden rounded-xl p-6 sm:p-8",
        className
      )}
    >
      <div className="portal-pattern pointer-events-none absolute inset-0 opacity-[0.035]" />
      {scene ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex w-[min(48%,380px)] items-end justify-end opacity-55 max-md:hidden"
          aria-hidden
        >
          <div className="h-full w-full translate-x-3 translate-y-4 [mask-image:linear-gradient(to_left,black_40%,transparent_95%)]">
            {scene}
          </div>
        </div>
      ) : null}
      {seal}
      {/* Soft fade so artwork never fights the title */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[70%] bg-[linear-gradient(to_right,var(--color-surface)_42%,transparent)]"
        aria-hidden
      />
      <div className="relative z-10 max-w-md sm:max-w-lg">
        {eyebrow ? (
          <p className="font-ui text-2xs font-medium tracking-wide text-ink-soft">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "font-hero text-h1 font-bold leading-[1.15] tracking-[-0.02em] text-ink",
            eyebrow ? "mt-2" : undefined
          )}
        >
          {title}
        </h1>
        {description ? (
          <div className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">
            {description}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
