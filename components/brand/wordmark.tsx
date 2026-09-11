import type { SVGProps } from "react";

/** Campanile tower glyph — used in the logotype in place of "@". */
export function CampanileMark({
  className,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 40"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      <path
        d="M12 2 8 8h8L12 2Z"
        fill="var(--color-cal-gold)"
      />
      <rect x="9" y="8" width="6" height="28" rx="0.5" fill="var(--color-cal-gold)" />
      <rect x="7" y="12" width="10" height="2" fill="var(--color-berkeley)" />
      <rect x="7" y="18" width="10" height="2" fill="var(--color-berkeley)" />
      <rect x="7" y="24" width="10" height="2" fill="var(--color-berkeley)" />
      <rect x="6" y="34" width="12" height="4" fill="var(--color-cal-gold)" />
      {/* Clock face */}
      <circle cx="12" cy="15" r="1.6" fill="var(--color-navy-950)" opacity={0.35} />
    </svg>
  );
}

/**
 * Custom logotype — "Hackathons" + Campanile + "Berkeley".
 * Display face for the word; Space Grotesk stays on chrome elsewhere.
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
        aria-label="Hackathons at Berkeley"
      >
        <CampanileMark className="h-7 w-4" />
        <span className="font-hero text-sm font-bold tracking-tight">
          H<span className={sub}>@</span>B
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-end gap-1.5 ${text} ${className}`}
      aria-label="Hackathons at Berkeley"
    >
      <span className="font-hero text-[0.95rem] font-bold leading-none tracking-tight sm:text-base">
        Hackathons
      </span>
      <CampanileMark className="mb-0.5 h-8 w-[1.05rem] sm:h-9 sm:w-5" />
      <span className={`font-hero text-[0.95rem] font-bold leading-none tracking-tight sm:text-base ${sub}`}>
        Berkeley
      </span>
    </span>
  );
}
