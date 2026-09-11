import type { SVGProps } from "react";

/**
 * Mini Campanile mark — same two-tone Sather Tower language as the large
 * illustration, scaled for the nav wordmark.
 */
export function CampanileMark({
  className,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 48"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      {/* Spire */}
      <path d="M12 1.5 7 12h5Z" fill="var(--color-paper)" />
      <path d="M12 1.5 17 12h-5Z" fill="var(--color-berkeley)" />
      <rect x="11" y="0" width="2" height="2.5" rx="0.4" fill="var(--color-cal-gold)" />

      {/* Gallery */}
      <path d="M6.5 12h5.5v5H6.5Z" fill="var(--color-paper)" />
      <path d="M12 12h5.5v5H12Z" fill="var(--color-berkeley)" />
      <rect x="8" y="13.5" width="3" height="2.5" fill="var(--color-navy-950)" />
      <rect x="13" y="13.5" width="3" height="2.5" fill="var(--color-navy-950)" opacity={0.85} />

      {/* Belfry arches */}
      <path d="M6 17h6v8H6Z" fill="var(--color-paper)" />
      <path d="M12 17h6v8H12Z" fill="var(--color-berkeley)" />
      <path d="M7.5 23.5v-4a1.6 1.6 0 0 1 3.2 0v4Z" fill="var(--color-navy-950)" />
      <path d="M13.8 23.5v-4a1.4 1.4 0 0 1 2.8 0v4Z" fill="var(--color-navy-950)" />

      {/* Shaft */}
      <path d="M7.5 25 8.5 44h3.5V25Z" fill="var(--color-paper)" />
      <path d="M12 25h3.5l1 19H12Z" fill="var(--color-berkeley)" />
      <rect x="10.5" y="30" width="1.4" height="3.5" rx="0.3" fill="var(--color-navy-950)" opacity={0.55} />
      <rect x="12.2" y="30" width="1.2" height="3.5" rx="0.3" fill="var(--color-navy-950)" opacity={0.7} />
      <rect x="10.5" y="36" width="1.4" height="3.5" rx="0.3" fill="var(--color-navy-950)" opacity={0.55} />
      <rect x="12.2" y="36" width="1.2" height="3.5" rx="0.3" fill="var(--color-navy-950)" opacity={0.7} />

      {/* Base */}
      <path d="M6.5 44h5.5v2.5H6.5Z" fill="var(--color-paper)" />
      <path d="M12 44h5.5v2.5H12Z" fill="var(--color-berkeley)" />
      <rect x="5.5" y="46.5" width="13" height="1.5" fill="var(--color-cal-gold)" />
    </svg>
  );
}

/**
 * Custom logotype — "Hackathons" + Campanile + "Berkeley".
 */
export function Wordmark({
  className = "",
  compact = false,
  light = true,
}: {
  className?: string;
  compact?: boolean;
  light?: boolean;
}) {
  const text = light ? "text-white" : "text-ink";
  const sub = light ? "text-cal-gold" : "text-berkeley";

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 ${text} ${className}`}
      >
        <CampanileMark className="h-7 w-4" />
        <span className="font-hero text-sm font-bold tracking-tight">
          Hackathons
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-end gap-2 ${text} ${className}`}
      aria-label="Hackathons at Berkeley"
    >
      <CampanileMark className="mb-0.5 h-8 w-[1.05rem] sm:h-9 sm:w-5" />
      <span className="flex flex-col leading-none">
        <span className="font-hero text-lg font-extrabold tracking-tight sm:text-xl">
          Hackathons
        </span>
        <span className={`font-ui text-[0.65rem] font-semibold tracking-wide ${sub}`}>
          Berkeley
        </span>
      </span>
    </span>
  );
}
