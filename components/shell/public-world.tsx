import {
  CloudShape,
  GlobeCurve,
  StarField,
} from "@/components/illustrations";

/** Shared low-opacity illustrated backdrop for public marketing pages. */
export function PublicWorld({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-navy-950 text-white ${className}`}
    >
      <StarField
        density="sparse"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
      />
      <GlobeCurve className="pointer-events-none absolute -bottom-24 left-1/2 w-[120%] max-w-4xl -translate-x-1/2 opacity-25 sm:opacity-30" />
      <CloudShape
        variant={2}
        cream="var(--color-navy-800)"
        primary="var(--color-sky)"
        className="pointer-events-none absolute -left-10 top-24 w-36 opacity-40 sm:w-48"
      />
      <CloudShape
        variant={4}
        cream="var(--color-navy-800)"
        primary="var(--color-sky)"
        className="pointer-events-none absolute -right-8 top-40 w-32 opacity-35 sm:w-44"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
