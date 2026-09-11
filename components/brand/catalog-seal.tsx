import type { SVGProps } from "react";

/**
 * Flat "registrar's stamp" seal — a Cal-flavored course-catalog stamp for
 * the /apply "course registration" header. Replaces an empty decorative
 * circle that had no content inside it.
 */
export function CatalogSeal({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <circle
        cx="48"
        cy="48"
        r="44"
        fill="var(--color-berkeley)"
        opacity={0.08}
      />
      <circle
        cx="48"
        cy="48"
        r="36"
        fill="none"
        stroke="var(--color-berkeley)"
        strokeWidth={1.5}
        opacity={0.4}
      />
      <circle
        cx="48"
        cy="48"
        r="30"
        fill="none"
        stroke="var(--color-berkeley)"
        strokeWidth={1}
        strokeDasharray="2 3"
        opacity={0.35}
      />
      {/* Tiny campanile glyph, centered */}
      <g transform="translate(40 26)">
        <path d="M8 0 4 6h8L8 0Z" fill="var(--color-cal-gold)" />
        <rect x="5" y="6" width="6" height="26" fill="var(--color-cal-gold)" />
        <rect x="3" y="30" width="10" height="4" fill="var(--color-berkeley)" opacity={0.6} />
      </g>
      {/* Curved rim text */}
      <path id="sealRimTop" d="M18 48a30 30 0 0 1 60 0" fill="none" />
      <text fontSize="7" letterSpacing="1.5" fill="var(--color-berkeley)" opacity={0.55}>
        <textPath href="#sealRimTop" startOffset="50%" textAnchor="middle">
          EST. 2014
        </textPath>
      </text>
      <path id="sealRimBottom" d="M18 48a30 30 0 0 0 60 0" fill="none" />
      <text fontSize="7" letterSpacing="1.5" fill="var(--color-berkeley)" opacity={0.55}>
        <textPath href="#sealRimBottom" startOffset="50%" textAnchor="middle">
          REGISTRAR
        </textPath>
      </text>
    </svg>
  );
}
