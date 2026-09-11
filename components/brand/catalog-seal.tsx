import { useId, type SVGProps } from "react";

/**
 * Flat "registrar's stamp" seal — a Cal-flavored course-catalog stamp.
 * Originally built for the /apply header (replacing an empty decorative
 * circle); reused as a recurring signature motif across the portal
 * (accepted decisions, teams header, dashboard) with swappable rim text
 * and ring color so it can sit on a status-tinted card without clashing.
 */
export function CatalogSeal({
  topText = "EST. 2014",
  bottomText = "REGISTRAR",
  ringColor = "var(--color-berkeley)",
  glyphColor = "var(--color-cal-gold)",
  className,
  ...rest
}: SVGProps<SVGSVGElement> & {
  topText?: string;
  bottomText?: string;
  ringColor?: string;
  glyphColor?: string;
}) {
  const uid = useId();
  const topPathId = `sealRimTop-${uid}`;
  const bottomPathId = `sealRimBottom-${uid}`;

  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <circle cx="48" cy="48" r="44" fill={ringColor} opacity={0.08} />
      <circle
        cx="48"
        cy="48"
        r="36"
        fill="none"
        stroke={ringColor}
        strokeWidth={1.5}
        opacity={0.4}
      />
      <circle
        cx="48"
        cy="48"
        r="30"
        fill="none"
        stroke={ringColor}
        strokeWidth={1}
        strokeDasharray="2 3"
        opacity={0.35}
      />
      {/* Tiny campanile glyph, centered */}
      <g transform="translate(40 26)">
        <path d="M8 0 4 6h8L8 0Z" fill={glyphColor} />
        <rect x="5" y="6" width="6" height="26" fill={glyphColor} />
        <rect x="3" y="30" width="10" height="4" fill={ringColor} opacity={0.6} />
      </g>
      {/* Curved rim text */}
      <path id={topPathId} d="M18 48a30 30 0 0 1 60 0" fill="none" />
      <text fontSize="7" letterSpacing="1.5" fill={ringColor} opacity={0.55}>
        <textPath href={`#${topPathId}`} startOffset="50%" textAnchor="middle">
          {topText}
        </textPath>
      </text>
      <path id={bottomPathId} d="M18 48a30 30 0 0 0 60 0" fill="none" />
      <text fontSize="7" letterSpacing="1.5" fill={ringColor} opacity={0.55}>
        <textPath href={`#${bottomPathId}`} startOffset="50%" textAnchor="middle">
          {bottomText}
        </textPath>
      </text>
    </svg>
  );
}
