import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * Shared portal page hero — glass panel + campus pattern + optional
 * illustration scene so working pages aren't blank white cards.
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
        "glass relative overflow-hidden rounded-xl p-6 sm:p-8",
        className
      )}
    >
      <div className="portal-pattern pointer-events-none absolute inset-0" />
      {scene ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex w-[min(52%,420px)] items-end justify-end opacity-[0.92] max-sm:hidden"
          aria-hidden
        >
          <div className="h-full w-full translate-x-2 translate-y-3 [mask-image:linear-gradient(to_left,black_55%,transparent)]">
            {scene}
          </div>
        </div>
      ) : null}
      {seal}
      <div className="relative z-10 max-w-lg">
        {eyebrow ? (
          <p className="text-2xs font-medium tracking-wide text-ink-soft">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "font-hero text-h1 font-extrabold tracking-tight text-ink",
            eyebrow ? "mt-2" : undefined
          )}
        >
          {title}
        </h1>
        {description ? (
          <div className="mt-3 text-sm leading-relaxed text-ink-soft">
            {description}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
