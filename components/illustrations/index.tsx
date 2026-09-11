import type { SVGProps } from "react";

export type IllustColorProps = {
  /** Primary fill — default sky */
  primary?: string;
  /** Accent fill — default sunset */
  accent?: string;
  /** Secondary fill — default paper/cream */
  cream?: string;
  /** Ink stroke/detail */
  ink?: string;
  className?: string;
};

const defaults = {
  primary: "var(--color-sky)",
  accent: "var(--color-sunset)",
  cream: "var(--color-paper)",
  ink: "var(--color-navy-950)",
};

type SvgBase = SVGProps<SVGSVGElement> & IllustColorProps;

function useColors(props: IllustColorProps) {
  return {
    primary: props.primary ?? defaults.primary,
    accent: props.accent ?? defaults.accent,
    cream: props.cream ?? defaults.cream,
    ink: props.ink ?? defaults.ink,
  };
}

/** Flat paper-plane triangle mark — favicon/loading scale. */
export function PlaneMark({
  primary,
  accent,
  className,
  ...rest
}: SvgBase) {
  const c = useColors({ primary, accent });
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      <path
        d="M28.5 4.2a1.2 1.2 0 0 0-1.2-.28L3.8 11.5a1.2 1.2 0 0 0-.04 2.28l8.4 3 3 8.4a1.2 1.2 0 0 0 2.28-.04L28.8 5.4a1.2 1.2 0 0 0-.3-1.2Z"
        fill={c.accent}
      />
      <path
        d="M12.2 16.8 28 4.8l-10.6 16.4-1.6-3.6-3.6-0.8Z"
        fill={c.primary}
        opacity={0.55}
      />
    </svg>
  );
}

/** Soft rounded cloud — cloud-chip motif at illustration scale. */
export function CloudShape({
  primary,
  cream,
  variant = 1,
  className,
  ...rest
}: SvgBase & { variant?: 1 | 2 | 3 | 4 | 5 }) {
  const c = useColors({ primary, cream });
  const fill = c.cream;
  const paths: Record<number, string> = {
    1: "M18 28c-6.5 0-10-3.5-10-8 0-1.2.3-2.3.8-3.2C7.2 15.5 6 13.2 6 10.5 6 6.4 9.4 3 13.5 3c2.8 0 5.2 1.5 6.5 3.8C21.2 5.5 23.4 4.5 26 4.5c4.1 0 7.5 3.4 7.5 7.5 0 1.4-.4 2.7-1 3.8.6.9 1 2 1 3.2 0 4.5-3.5 9-15.5 9Z",
    2: "M8 26c-3.5 0-6-2.2-6-5.2 0-1.8 1-3.4 2.5-4.3C4.2 15.2 4 13.8 4 12.5 4 8.9 6.9 6 10.5 6c1.8 0 3.4.7 4.6 1.9C16.2 6.4 18.4 5 21 5c4.4 0 8 3.6 8 8 0 .8-.1 1.6-.4 2.3 1.6 1 2.7 2.8 2.7 4.8 0 3.2-2.7 6-7.3 6H8Z",
    3: "M10 22c-4 0-7-2.5-7-6 0-2.2 1.2-4.1 3-5.1C6 9.5 7.2 8 9 8c1.2 0 2.3.5 3.1 1.2C13 7.2 15.2 6 17.8 6 22 6 25.5 9.5 25.5 13.8c0 .9-.2 1.8-.5 2.6 1.4.9 2.3 2.4 2.3 4.1 0 2.8-2.4 5.5-7.3 5.5H10Z",
    4: "M6 20c-2.8 0-5-2-5-4.5S3.2 11 6 11c.6 0 1.2.1 1.7.3C8.2 9.2 10 8 12.2 8c2.8 0 5.1 2 5.5 4.6.6-.3 1.3-.5 2.1-.5 2.5 0 4.5 1.8 4.5 4.1S22.3 20 19.8 20H6Z",
    5: "M12 30c-5 0-9-3-9-7.2 0-2.4 1.3-4.5 3.3-5.7C6 14.8 6.5 12.2 8.5 10.5 10.2 9 12.4 8.2 14.8 8.5c1.2-2.2 3.6-3.7 6.4-3.7 4 0 7.3 3.1 7.5 7 .2 0 .5 0 .7 0 3.6 0 6.5 2.8 6.5 6.3 0 3.8-3.4 7.4-10.4 7.4H12Z",
  };
  return (
    <svg
      viewBox="0 0 40 32"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      <path d={paths[variant]} fill={fill} opacity={variant === 1 ? 1 : 0.92} />
      <path
        d={paths[variant]}
        fill={c.primary}
        opacity={0.12}
        transform="translate(1 1)"
      />
    </svg>
  );
}

/** Alias used in prompts — cloud as a chip-scale decorative mark. */
export function CloudChip(props: SvgBase & { variant?: 1 | 2 | 3 | 4 | 5 }) {
  return <CloudShape {...props} />;
}

/** Scattered constellation-style star/dot field for navy backgrounds. */
export function StarField({
  primary,
  accent,
  cream,
  className,
  density = "normal",
  ...rest
}: SvgBase & { density?: "sparse" | "normal" | "dense" }) {
  const c = useColors({ primary, accent, cream });
  const dots =
    density === "sparse"
      ? [
          [12, 18],
          [48, 32],
          [88, 14],
          [140, 40],
          [180, 22],
          [220, 50],
          [60, 70],
          [160, 80],
          [200, 100],
          [30, 110],
        ]
      : density === "dense"
        ? Array.from({ length: 36 }, (_, i) => [
            (i * 47) % 240,
            (i * 31 + 13) % 140,
          ])
        : [
            [10, 16],
            [36, 40],
            [70, 12],
            [98, 48],
            [130, 20],
            [158, 55],
            [190, 18],
            [220, 42],
            [24, 72],
            [55, 95],
            [110, 78],
            [145, 100],
            [185, 88],
            [210, 115],
            [80, 120],
            [40, 50],
            [170, 35],
            [200, 70],
          ];

  return (
    <svg
      viewBox="0 0 240 140"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      {...rest}
    >
      {dots.map(([x, y], i) => {
        const r = i % 5 === 0 ? 1.6 : i % 3 === 0 ? 1.1 : 0.7;
        const fill =
          i % 7 === 0 ? c.accent : i % 4 === 0 ? c.cream : c.primary;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill={fill}
            opacity={i % 3 === 0 ? 0.9 : 0.45}
          />
        );
      })}
    </svg>
  );
}

/** Flat line-art globe / moon curve from the marketing hero, geometric. */
export function GlobeCurve({
  primary,
  accent,
  ink,
  cream,
  className,
  ...rest
}: SvgBase) {
  const c = useColors({ primary, accent, ink, cream });
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      {/* Outer arc */}
      <path
        d="M20 240c40-140 140-220 260-220 70 0 100 30 100 30"
        stroke={c.primary}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.85}
      />
      {/* Meridian curves */}
      <path
        d="M80 220c30-100 90-170 180-190"
        stroke={c.primary}
        strokeWidth={1.5}
        opacity={0.45}
      />
      <path
        d="M140 230c20-90 70-150 150-170"
        stroke={c.cream}
        strokeWidth={1.5}
        opacity={0.35}
      />
      {/* Latitude bands */}
      <path
        d="M50 160c60-30 140-40 220-20"
        stroke={c.accent}
        strokeWidth={1.5}
        opacity={0.4}
      />
      <path
        d="M70 200c50-20 120-28 190-10"
        stroke={c.primary}
        strokeWidth={1.5}
        opacity={0.35}
      />
      {/* Flat landmass blobs */}
      <ellipse
        cx="160"
        cy="130"
        rx="36"
        ry="22"
        fill={c.accent}
        opacity={0.35}
        transform="rotate(-18 160 130)"
      />
      <ellipse
        cx="240"
        cy="155"
        rx="28"
        ry="16"
        fill={c.cream}
        opacity={0.25}
        transform="rotate(12 240 155)"
      />
      {/* Horizon fill wash — flat, not gradient */}
      <path
        d="M0 200c80-40 180-50 280-20v100H0V200Z"
        fill={c.ink}
        opacity={0.25}
      />
    </svg>
  );
}

type BearPose =
  | "flying"
  | "waving"
  | "sleeping"
  | "celebrating"
  | "reading"
  | "clock"
  | "searching";

/** Flat geometric bear pilot — Cal Hacks world, product style. */
export function BearPilot({
  pose = "flying",
  primary,
  accent,
  cream,
  ink,
  className,
  ...rest
}: SvgBase & { pose?: BearPose }) {
  const c = useColors({ primary, accent, cream, ink });

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      {/* Scarf / body cape */}
      <path
        d="M48 72c8 14 28 18 40 8l-6 18c-16 6-36 2-44-12l10-14Z"
        fill={c.accent}
      />
      {/* Body */}
      <ellipse cx="52" cy="78" rx="22" ry="20" fill={c.cream} />
      {/* Head */}
      <circle cx="58" cy="48" r="26" fill={c.cream} />
      {/* Ears */}
      <circle cx="38" cy="28" r="10" fill={c.cream} />
      <circle cx="38" cy="28" r="5" fill={c.accent} opacity={0.7} />
      <circle cx="78" cy="28" r="10" fill={c.cream} />
      <circle cx="78" cy="28" r="5" fill={c.accent} opacity={0.7} />
      {/* Snout */}
      <ellipse cx="62" cy="56" rx="12" ry="9" fill={c.primary} opacity={0.25} />
      <ellipse cx="62" cy="54" rx="3" ry="2.2" fill={c.ink} />
      {/* Goggles */}
      <rect
        x="40"
        y="38"
        width="36"
        height="14"
        rx="7"
        fill={c.ink}
        opacity={0.9}
      />
      <circle cx="50" cy="45" r="5.5" fill={c.primary} />
      <circle cx="66" cy="45" r="5.5" fill={c.primary} />
      <circle cx="50" cy="45" r="2" fill={c.cream} opacity={0.7} />
      <circle cx="66" cy="45" r="2" fill={c.cream} opacity={0.7} />

      {pose === "flying" && (
        <>
          {/* Wings / arms outstretched */}
          <path
            d="M30 70c-12-2-18-12-16-20 4 2 10 6 14 14l2 6Z"
            fill={c.cream}
          />
          <path
            d="M78 68c14 0 24-6 28-16-6 2-14 6-20 12l-8 4Z"
            fill={c.cream}
          />
          {/* Tiny plane mark beside the bear */}
          <g transform="translate(86 12) rotate(18)">
            <path
              d="M22 2 2 8.5l7 2.5 2.5 7L22 2Z"
              fill={c.accent}
            />
          </g>
        </>
      )}

      {pose === "waving" && (
        <>
          <path d="M28 72c-8-10-6-22 2-24 0 8 2 16 6 22l-8 2Z" fill={c.cream} />
          <path
            d="M74 66c10-2 18-14 16-24-8 4-12 12-12 20l-4 4Z"
            fill={c.cream}
          />
          {/* Wave lines */}
          <path
            d="M92 40c4-6 4-12 0-16M98 44c6-8 6-16 0-22"
            stroke={c.accent}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      )}

      {pose === "sleeping" && (
        <>
          <path d="M30 78c-6-4-8-12-4-16 2 6 4 10 8 14l-4 2Z" fill={c.cream} />
          <path d="M72 76c8-2 14-8 14-14-4 2-8 6-10 10l-4 4Z" fill={c.cream} />
          {/* Zzz */}
          <text
            x="88"
            y="36"
            fill={c.primary}
            fontSize="14"
            fontFamily="var(--font-display), sans-serif"
            fontWeight="600"
          >
            z
          </text>
          <text
            x="98"
            y="24"
            fill={c.accent}
            fontSize="11"
            fontFamily="var(--font-display), sans-serif"
            fontWeight="600"
          >
            z
          </text>
          {/* Closed eyes over goggles — soft lids */}
          <path
            d="M46 45h8M62 45h8"
            stroke={c.ink}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.5}
          />
        </>
      )}

      {pose === "celebrating" && (
        <>
          <path
            d="M26 60c-4-14 4-24 12-22-2 8-2 16 0 22l-12 0Z"
            fill={c.cream}
          />
          <path
            d="M78 58c8-12 20-14 24-6-10 2-16 8-18 16l-6-10Z"
            fill={c.cream}
          />
          {/* Confetti dots */}
          <circle cx="20" cy="28" r="2" fill={c.accent} />
          <circle cx="100" cy="32" r="2" fill={c.primary} />
          <circle cx="94" cy="18" r="1.5" fill={c.cream} />
          <rect
            x="14"
            y="40"
            width="4"
            height="4"
            rx="0.5"
            fill={c.accent}
            transform="rotate(20 16 42)"
          />
          <rect
            x="102"
            y="48"
            width="4"
            height="4"
            rx="0.5"
            fill={c.primary}
            transform="rotate(-15 104 50)"
          />
        </>
      )}

      {pose === "reading" && (
        <>
          <path d="M28 78c-6-4-8-12-4-16 2 6 4 10 8 14l-4 2Z" fill={c.cream} />
          {/* Laptop */}
          <rect
            x="68"
            y="70"
            width="36"
            height="22"
            rx="2"
            fill={c.ink}
            opacity={0.85}
          />
          <rect x="72" y="74" width="28" height="14" rx="1" fill={c.primary} />
          <path d="M66 94h42l-4 6H70l-4-6Z" fill={c.accent} />
          <path
            d="M78 68c10-2 18-10 18-18-6 4-10 10-12 16l-6 2Z"
            fill={c.cream}
          />
        </>
      )}

      {pose === "clock" && (
        <>
          <path d="M30 76c-6-4-8-12-4-16 2 6 4 10 8 14l-4 2Z" fill={c.cream} />
          <path d="M74 74c8-2 14-8 14-14-4 2-8 6-10 10l-4 4Z" fill={c.cream} />
          {/* Clock face */}
          <circle cx="96" cy="36" r="16" fill={c.cream} />
          <circle
            cx="96"
            cy="36"
            r="16"
            stroke={c.ink}
            strokeWidth={2}
            fill="none"
          />
          <circle cx="96" cy="36" r="2" fill={c.accent} />
          <path
            d="M96 36v-8M96 36l6 4"
            stroke={c.ink}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      )}

      {pose === "searching" && (
        <>
          <path d="M28 74c-8-8-6-20 2-22 0 8 2 14 6 20l-8 2Z" fill={c.cream} />
          {/* Magnifying glass */}
          <circle
            cx="92"
            cy="34"
            r="12"
            stroke={c.accent}
            strokeWidth={3}
            fill={c.primary}
            fillOpacity={0.25}
          />
          <path
            d="M100 44l10 12"
            stroke={c.accent}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <path
            d="M76 66c12 0 20-8 22-16-6 2-12 8-14 14l-8 2Z"
            fill={c.cream}
          />
        </>
      )}
    </svg>
  );
}

export function BearFlying(props: SvgBase) {
  return <BearPilot pose="flying" {...props} />;
}
export function BearWaving(props: SvgBase) {
  return <BearPilot pose="waving" {...props} />;
}
export function BearSleeping(props: SvgBase) {
  return <BearPilot pose="sleeping" {...props} />;
}
export function BearCelebrating(props: SvgBase) {
  return <BearPilot pose="celebrating" {...props} />;
}
export function BearReading(props: SvgBase) {
  return <BearPilot pose="reading" {...props} />;
}
export function BearClock(props: SvgBase) {
  return <BearPilot pose="clock" {...props} />;
}
export function BearSearching(props: SvgBase) {
  return <BearPilot pose="searching" {...props} />;
}
