import type { SVGProps } from "react";

type SceneProps = SVGProps<SVGSVGElement> & { className?: string };

/**
 * Sather Tower (Campanile) — Berkeley Times–style flat two-tone vector.
 * Light left face / shadowed right face, pyramidal spire, observation
 * gallery with corner pinnacles, three arched belfry openings, recessed
 * shaft with slit windows. viewBox 80×500 (~1:6.25, real proportions).
 */
function CampanileGlyph() {
  const light = "var(--color-paper)";
  const shadow = "var(--color-berkeley)";
  const deep = "var(--color-navy-950)";
  const accent = "var(--color-cal-gold)";

  return (
    <g>
      {/* —— Spire —— */}
      <path d="M40 6 22 58h18Z" fill={light} />
      <path d="M40 6 58 58H40Z" fill={shadow} />
      {/* Finial */}
      <rect x="38.5" y="0" width="3" height="8" rx="0.5" fill={accent} />
      <rect x="37" y="6" width="6" height="2.5" rx="0.5" fill={accent} />

      {/* —— Observation deck / gallery —— */}
      <path d="M18 58h22v28H18Z" fill={light} />
      <path d="M40 58h22v28H40Z" fill={shadow} />
      {/* Corner pinnacles */}
      <path d="M18 58 21 50l3 8Z" fill={light} />
      <path d="M56 58 59 50l3 8Z" fill={shadow} />
      <path d="M37 58 40 51l3 7Z" fill={accent} opacity={0.85} />
      {/* Dark gallery band */}
      <rect x="22" y="68" width="16" height="10" fill={deep} />
      <rect x="42" y="68" width="16" height="10" fill={deep} opacity={0.85} />
      {/* Gallery pillars (light face) */}
      <rect x="22" y="68" width="2.5" height="10" fill={light} opacity={0.55} />
      <rect x="35.5" y="68" width="2.5" height="10" fill={light} opacity={0.55} />

      {/* —— Belfry with three tall arches —— */}
      <path d="M16 86h24v52H16Z" fill={light} />
      <path d="M40 86h24v52H40Z" fill={shadow} />
      {/* Arch recesses — left face */}
      <path d="M20 132v-28a5 5 0 0 1 10 0v28Z" fill={deep} />
      <path d="M32.5 132v-24a4 4 0 0 1 6 0v24Z" fill={deep} opacity={0.9} />
      {/* Arch recesses — right face (foreshortened) */}
      <path d="M44 132v-28a5 5 0 0 1 8 0v28Z" fill={deep} />
      <path d="M54 132v-24a4 4 0 0 1 6 0v24Z" fill={deep} opacity={0.85} />
      {/* Belfry cornice */}
      <rect x="14" y="86" width="52" height="4" fill={accent} opacity={0.7} />
      <rect x="14" y="134" width="52" height="4" fill={deep} opacity={0.45} />

      {/* —— Clock / chevron band (BT mark) —— */}
      <path d="M18 138h22v28H18Z" fill={light} />
      <path d="M40 138h22v28H40Z" fill={shadow} />
      {/* Subtle clock face on light side */}
      <circle cx="29" cy="152" r="9" fill={light} />
      <circle
        cx="29"
        cy="152"
        r="9"
        fill="none"
        stroke={deep}
        strokeWidth={1.2}
        opacity={0.35}
      />
      <path
        d="M29 152 29 145M29 152 34.5 155"
        stroke={deep}
        strokeWidth={1.4}
        strokeLinecap="round"
        opacity={0.55}
      />
      <circle cx="29" cy="152" r="1.3" fill={accent} />
      {/* BT-style chevrons on shadow face */}
      <path
        d="M48 148h10M50 152h8M52 156h6"
        stroke={deep}
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={0.4}
      />

      {/* —— Main shaft (tapers slightly) —— */}
      <path d="M20 166 24 470h16V166Z" fill={light} />
      <path d="M40 166h16l4 304H40Z" fill={shadow} />
      {/* Recessed center panel */}
      <path d="M32 175h8v280H32Z" fill={deep} opacity={0.12} />
      <path d="M40 175h8v280H40Z" fill={deep} opacity={0.22} />
      {/* Slit windows */}
      <rect x="35" y="210" width="4" height="22" rx="1" fill={deep} opacity={0.55} />
      <rect x="41" y="210" width="3.5" height="22" rx="1" fill={deep} opacity={0.7} />
      <rect x="35" y="290" width="4" height="22" rx="1" fill={deep} opacity={0.55} />
      <rect x="41" y="290" width="3.5" height="22" rx="1" fill={deep} opacity={0.7} />
      <rect x="35" y="370" width="4" height="22" rx="1" fill={deep} opacity={0.55} />
      <rect x="41" y="370" width="3.5" height="22" rx="1" fill={deep} opacity={0.7} />

      {/* —— Base plinth —— */}
      <path d="M16 470h24v18H16Z" fill={light} />
      <path d="M40 470h24v18H40Z" fill={shadow} />
      <rect x="12" y="488" width="56" height="8" fill={accent} />
      <rect x="8" y="496" width="64" height="4" fill={deep} opacity={0.85} />
    </g>
  );
}

/** Standalone Campanile — side decor, heroes, seals. */
export function CampanileTower({ className, ...rest }: SceneProps) {
  return (
    <svg
      viewBox="0 0 80 500"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      <CampanileGlyph />
    </svg>
  );
}

/**
 * Flat Berkeley skyline: Campanile, Sather Gate, hills, eucalyptus.
 * Full-bleed hero set-piece — not a floating icon.
 */
export function BerkeleySkylineScene({ className, ...rest }: SceneProps) {
  return (
    <svg
      viewBox="0 0 1200 420"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      {...rest}
    >
      {/* Hills */}
      <path
        d="M0 320c80-40 160-70 280-60 90 8 140 40 220 35 100-6 160-50 280-45 90 4 150 40 220 30 60-8 120-35 200-25v165H0V320Z"
        fill="var(--color-berkeley)"
        opacity={0.55}
      />
      <path
        d="M0 350c100-30 200-55 340-40 110 12 180 40 300 28 140-14 200-55 340-40 80 8 140 35 220 28v94H0V350Z"
        fill="var(--color-navy-800)"
        opacity={0.9}
      />

      {/* Eucalyptus silhouettes left */}
      <g fill="var(--color-navy-800)" opacity={0.85}>
        <rect x="48" y="220" width="8" height="120" rx="2" />
        <ellipse cx="52" cy="210" rx="28" ry="36" />
        <rect x="92" y="240" width="6" height="100" rx="2" />
        <ellipse cx="95" cy="235" rx="20" ry="26" />
      </g>

      {/* Sather Gate */}
      <g transform="translate(220 248)">
        <rect x="0" y="40" width="14" height="90" fill="var(--color-cal-gold)" opacity={0.85} />
        <rect x="106" y="40" width="14" height="90" fill="var(--color-cal-gold)" opacity={0.85} />
        <path
          d="M0 40c20-36 40-52 60-52s40 16 60 52"
          stroke="var(--color-cal-gold)"
          strokeWidth={8}
          fill="none"
          opacity={0.9}
        />
        <rect x="14" y="52" width="92" height="6" fill="var(--color-cal-gold)" opacity={0.5} />
      </g>

      {/* Campanile — centerpiece. Base lands just above the ground strip
          (y=400); BT-style two-tone tower via shared glyph. */}
      <g transform="translate(568 8) scale(0.76)">
        <CampanileGlyph />
      </g>

      {/* Low campus buildings right of tower */}
      <g fill="var(--color-navy-600)" opacity={0.75}>
        <rect x="680" y="250" width="70" height="90" />
        <rect x="760" y="270" width="90" height="70" />
        <rect x="860" y="240" width="55" height="100" />
        <rect x="925" y="260" width="80" height="80" />
      </g>
      <g fill="var(--color-cal-gold)" opacity={0.25}>
        <rect x="690" y="262" width="10" height="10" />
        <rect x="710" y="262" width="10" height="10" />
        <rect x="690" y="282" width="10" height="10" />
        <rect x="780" y="285" width="12" height="12" />
        <rect x="800" y="285" width="12" height="12" />
        <rect x="870" y="255" width="10" height="10" />
      </g>

      {/* Eucalyptus right */}
      <g fill="var(--color-navy-800)" opacity={0.8}>
        <rect x="1080" y="230" width="8" height="110" rx="2" />
        <ellipse cx="1084" cy="220" rx="32" ry="40" />
        <rect x="1130" y="250" width="6" height="90" rx="2" />
        <ellipse cx="1133" cy="245" rx="22" ry="28" />
      </g>

      {/* Bear gripping the belfry ledge — paws hooked over the edge, body
          hanging against the tower, not just standing beside it. */}
      <g transform="translate(566 58) scale(0.62)">
        <ellipse cx="40" cy="72" rx="20" ry="17" fill="var(--color-paper)" />
        <circle cx="42" cy="40" r="22" fill="var(--color-paper)" />
        <circle cx="26" cy="22" r="8" fill="var(--color-paper)" />
        <circle cx="58" cy="22" r="8" fill="var(--color-paper)" />
        <circle cx="26" cy="22" r="3.5" fill="var(--color-sunset)" opacity={0.75} />
        <circle cx="58" cy="22" r="3.5" fill="var(--color-sunset)" opacity={0.75} />
        <rect x="26" y="32" width="30" height="11" rx="5.5" fill="var(--color-navy-950)" opacity={0.85} />
        <circle cx="35" cy="37" r="4" fill="var(--color-sky)" />
        <circle cx="47" cy="37" r="4" fill="var(--color-sky)" />
        {/* Arms reaching up to grip the ledge */}
        <path
          d="M8 62c-6 4-8 12-4 18 4-6 8-10 14-12L8 62Z"
          fill="var(--color-paper)"
        />
        <path
          d="M74 60c7 3 10 11 7 18-5-6-9-9-15-11l8-7Z"
          fill="var(--color-paper)"
        />
        {/* Paws hooked over the ledge edge */}
        <rect x="2" y="57" width="13" height="6" rx="3" fill="var(--color-paper)" />
        <rect x="65" y="55" width="13" height="6" rx="3" fill="var(--color-paper)" />
        {/* Tiny banner */}
        <rect x="82" y="30" width="36" height="12" rx="2" fill="var(--color-sunset)" />
        <text
          x="100"
          y="39"
          textAnchor="middle"
          fill="var(--color-navy-950)"
          fontSize="8"
          fontFamily="var(--font-ui), sans-serif"
          fontWeight="600"
        >
          13.0
        </text>
      </g>

      {/* Ground strip */}
      <rect x="0" y="400" width="1200" height="20" fill="var(--color-navy-950)" />
    </svg>
  );
}

/** About page — bear reading on a stack of old posters. */
export function SceneFoundingStory({ className, ...rest }: SceneProps) {
  return (
    <svg
      viewBox="0 0 900 280"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      {...rest}
    >
      <rect x="0" y="200" width="900" height="80" fill="var(--color-navy-800)" />
      {/* Poster stack */}
      <g transform="translate(120 80)">
        <rect x="20" y="40" width="140" height="100" rx="4" fill="var(--color-cal-gold)" opacity={0.35} />
        <rect x="10" y="20" width="140" height="100" rx="4" fill="var(--color-sunset)" opacity={0.45} />
        <rect x="0" y="0" width="140" height="100" rx="4" fill="var(--color-paper)" />
        <text x="70" y="48" textAnchor="middle" fill="var(--color-berkeley)" fontSize="14" fontFamily="var(--font-hero), sans-serif" fontWeight="700">
          CAL HACKS
        </text>
        <text x="70" y="70" textAnchor="middle" fill="var(--color-ink-soft)" fontSize="10" fontFamily="var(--font-sans), sans-serif">
          2014 · poster
        </text>
      </g>
      {/* Hills hint */}
      <path d="M400 220c60-40 140-50 220-30 50 12 100 20 160 10v80H400V220Z" fill="var(--color-berkeley)" opacity={0.35} />
      {/* Mini campanile */}
      <g transform="translate(620 70) scale(0.55)">
        <path d="M60 0 40 28h40L60 0Z" fill="var(--color-cal-gold)" />
        <rect x="46" y="28" width="28" height="160" fill="var(--color-cal-gold)" />
      </g>
      {/* Bear reading */}
      <g transform="translate(280 95) scale(0.9)">
        <ellipse cx="50" cy="90" rx="28" ry="22" fill="var(--color-paper)" />
        <circle cx="52" cy="52" r="28" fill="var(--color-paper)" />
        <circle cx="32" cy="30" r="10" fill="var(--color-paper)" />
        <circle cx="72" cy="30" r="10" fill="var(--color-paper)" />
        <rect x="34" y="42" width="36" height="14" rx="7" fill="var(--color-navy-950)" opacity={0.85} />
        <circle cx="44" cy="49" r="5" fill="var(--color-sky)" />
        <circle cx="60" cy="49" r="5" fill="var(--color-sky)" />
        <rect x="70" y="70" width="36" height="28" rx="2" fill="var(--color-cal-gold)" />
        <path d="M70 70l18 10 18-10" stroke="var(--color-berkeley)" strokeWidth={1.5} />
      </g>
    </svg>
  );
}

/** Schedule — bear pinning flyers (Telegraph vibe). */
export function SceneBulletinBoard({ className, ...rest }: SceneProps) {
  return (
    <svg
      viewBox="0 0 900 260"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      <rect x="180" y="40" width="420" height="180" rx="6" fill="var(--color-navy-800)" />
      <rect x="196" y="56" width="100" height="70" rx="3" fill="var(--color-paper)" />
      <rect x="316" y="56" width="100" height="70" rx="3" fill="var(--color-cal-gold)" opacity={0.7} />
      <rect x="436" y="56" width="140" height="70" rx="3" fill="var(--color-sunset)" opacity={0.55} />
      <rect x="196" y="140" width="140" height="60" rx="3" fill="var(--color-sky)" opacity={0.45} />
      <rect x="356" y="140" width="100" height="60" rx="3" fill="var(--color-paper)" opacity={0.85} />
      <rect x="476" y="140" width="100" height="60" rx="3" fill="var(--color-mint)" opacity={0.45} />
      {/* Pins */}
      <circle cx="210" cy="64" r="4" fill="var(--color-brick)" />
      <circle cx="330" cy="64" r="4" fill="var(--color-brick)" />
      <circle cx="450" cy="64" r="4" fill="var(--color-brick)" />
      {/* Bear pinning */}
      <g transform="translate(620 70) scale(0.85)">
        <ellipse cx="40" cy="90" rx="24" ry="20" fill="var(--color-paper)" />
        <circle cx="42" cy="50" r="26" fill="var(--color-paper)" />
        <circle cx="24" cy="30" r="9" fill="var(--color-paper)" />
        <circle cx="60" cy="30" r="9" fill="var(--color-paper)" />
        <rect x="26" y="40" width="32" height="13" rx="6" fill="var(--color-navy-950)" opacity={0.85} />
        <circle cx="36" cy="46" r="4.5" fill="var(--color-sky)" />
        <circle cx="48" cy="46" r="4.5" fill="var(--color-sky)" />
        <path d="M68 55c12-2 22-14 18-24-8 4-12 12-12 20l-6 4Z" fill="var(--color-paper)" />
        <rect x="72" y="42" width="28" height="20" rx="2" fill="var(--color-cal-gold)" transform="rotate(-12 86 52)" />
      </g>
    </svg>
  );
}

/** Teams — two bears at a workbench. */
export function SceneTeamWorkbench({ className, ...rest }: SceneProps) {
  return (
    <svg viewBox="0 0 900 240" fill="none" className={className} aria-hidden {...rest}>
      <rect x="200" y="160" width="500" height="28" rx="4" fill="var(--color-navy-800)" />
      <rect x="380" y="110" width="80" height="50" rx="4" fill="var(--color-sky)" opacity={0.5} />
      <rect x="400" y="90" width="40" height="30" rx="2" fill="var(--color-cal-gold)" />
      {/* Bear L */}
      <g transform="translate(260 70) scale(0.7)">
        <ellipse cx="40" cy="90" rx="24" ry="20" fill="var(--color-paper)" />
        <circle cx="42" cy="50" r="26" fill="var(--color-paper)" />
        <circle cx="24" cy="30" r="9" fill="var(--color-paper)" />
        <circle cx="60" cy="30" r="9" fill="var(--color-paper)" />
        <rect x="26" y="40" width="32" height="13" rx="6" fill="var(--color-navy-950)" opacity={0.85} />
        <circle cx="36" cy="46" r="4.5" fill="var(--color-sky)" />
        <circle cx="48" cy="46" r="4.5" fill="var(--color-sky)" />
      </g>
      {/* Bear R */}
      <g transform="translate(520 70) scale(0.7)">
        <ellipse cx="40" cy="90" rx="24" ry="20" fill="var(--color-paper)" />
        <circle cx="42" cy="50" r="26" fill="var(--color-paper)" />
        <circle cx="24" cy="30" r="9" fill="var(--color-paper)" />
        <circle cx="60" cy="30" r="9" fill="var(--color-paper)" />
        <rect x="26" y="40" width="32" height="13" rx="6" fill="var(--color-navy-950)" opacity={0.85} />
        <circle cx="36" cy="46" r="4.5" fill="var(--color-sunset)" />
        <circle cx="48" cy="46" r="4.5" fill="var(--color-sunset)" />
      </g>
      {/* Handshake lines */}
      <path d="M380 130h80" stroke="var(--color-cal-gold)" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/** Sponsors — bear with gold medals. */
export function SceneSponsorMedals({ className, ...rest }: SceneProps) {
  return (
    <svg viewBox="0 0 900 240" fill="none" className={className} aria-hidden {...rest}>
      <g transform="translate(380 40) scale(0.95)">
        <ellipse cx="50" cy="120" rx="30" ry="24" fill="var(--color-paper)" />
        <circle cx="52" cy="60" r="30" fill="var(--color-paper)" />
        <circle cx="30" cy="36" r="11" fill="var(--color-paper)" />
        <circle cx="74" cy="36" r="11" fill="var(--color-paper)" />
        <rect x="32" y="48" width="40" height="15" rx="7" fill="var(--color-navy-950)" opacity={0.85} />
        <circle cx="44" cy="55" r="5" fill="var(--color-sky)" />
        <circle cx="60" cy="55" r="5" fill="var(--color-sky)" />
        <path d="M78 70c14 0 26-12 22-24-10 4-16 12-16 20l-6 4Z" fill="var(--color-paper)" />
        {/* Medals */}
        <circle cx="110" cy="90" r="18" fill="var(--color-cal-gold)" />
        <circle cx="110" cy="90" r="10" fill="var(--color-berkeley)" opacity={0.35} />
        <path d="M102 72l8-18 8 18" fill="var(--color-sunset)" />
        <circle cx="145" cy="105" r="14" fill="var(--color-cal-gold)" opacity={0.75} />
        <path d="M139 90l6-12 6 12" fill="var(--color-sky)" />
      </g>
      <text
        x="450"
        y="210"
        textAnchor="middle"
        fill="var(--color-cal-gold)"
        fontSize="14"
        fontFamily="var(--font-hero), sans-serif"
        fontWeight="700"
        opacity={0.8}
      >
        Thank you, partners
      </text>
    </svg>
  );
}

/** FAQ — bear with magnifying glass. */
export function SceneFaqSearch({ className, ...rest }: SceneProps) {
  return (
    <svg viewBox="0 0 900 220" fill="none" className={className} aria-hidden {...rest}>
      <g transform="translate(360 30) scale(0.9)">
        <ellipse cx="50" cy="120" rx="28" ry="22" fill="var(--color-paper)" />
        <circle cx="52" cy="60" r="28" fill="var(--color-paper)" />
        <circle cx="32" cy="38" r="10" fill="var(--color-paper)" />
        <circle cx="72" cy="38" r="10" fill="var(--color-paper)" />
        <rect x="34" y="50" width="36" height="14" rx="7" fill="var(--color-navy-950)" opacity={0.85} />
        <circle cx="44" cy="57" r="5" fill="var(--color-sky)" />
        <circle cx="60" cy="57" r="5" fill="var(--color-sky)" />
        <path d="M78 75c14-2 24-16 18-28-8 6-12 14-12 22l-6 6Z" fill="var(--color-paper)" />
        <circle cx="115" cy="70" r="22" stroke="var(--color-cal-gold)" strokeWidth={5} fill="none" />
        <path d="M130 86l22 22" stroke="var(--color-cal-gold)" strokeWidth={6} strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Tracks — bear with trophy ribbon. */
export function SceneTracksTrophy({ className, ...rest }: SceneProps) {
  return (
    <svg viewBox="0 0 900 220" fill="none" className={className} aria-hidden {...rest}>
      <g transform="translate(380 25)">
        <ellipse cx="50" cy="130" rx="28" ry="22" fill="var(--color-paper)" />
        <circle cx="52" cy="70" r="28" fill="var(--color-paper)" />
        <circle cx="32" cy="48" r="10" fill="var(--color-paper)" />
        <circle cx="72" cy="48" r="10" fill="var(--color-paper)" />
        <rect x="34" y="60" width="36" height="14" rx="7" fill="var(--color-navy-950)" opacity={0.85} />
        <circle cx="44" cy="67" r="5" fill="var(--color-sky)" />
        <circle cx="60" cy="67" r="5" fill="var(--color-sky)" />
        <path d="M20 40c-4-16 8-28 18-22-2 10-2 18 0 24l-18-2Z" fill="var(--color-paper)" />
        <path d="M80 95c8-14 24-16 30-4-12 0-20 8-22 18l-8-14Z" fill="var(--color-paper)" />
        {/* Trophy */}
        <path d="M120 50h40l-6 36h-28L120 50Z" fill="var(--color-cal-gold)" />
        <rect x="132" y="86" width="16" height="20" fill="var(--color-cal-gold)" />
        <rect x="124" y="106" width="32" height="8" fill="var(--color-berkeley)" />
        <path d="M120 55c-12 4-16 16-8 24M160 55c12 4 16 16 8 24" stroke="var(--color-cal-gold)" strokeWidth={3} fill="none" />
      </g>
    </svg>
  );
}

/** Apply — Sather Gate silhouette + course cart hint. */
export function SceneSatherGate({ className, ...rest }: SceneProps) {
  return (
    <svg
      viewBox="0 0 520 280"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      {/* Hills */}
      <path
        d="M0 200c60-30 120-40 200-28 70 10 120 35 200 28 50-4 80-20 120-16v96H0V200Z"
        fill="var(--color-berkeley)"
        opacity={0.35}
      />
      {/* Gate columns */}
      <g fill="var(--color-cal-gold)">
        <rect x="90" y="70" width="28" height="150" rx="2" />
        <rect x="400" y="70" width="28" height="150" rx="2" />
        <rect x="70" y="55" width="68" height="22" rx="3" />
        <rect x="380" y="55" width="68" height="22" rx="3" />
      </g>
      {/* Arch */}
      <path
        d="M118 100h282c0 0-20 70-141 70S118 100 118 100Z"
        fill="var(--color-berkeley)"
        opacity={0.55}
      />
      <path
        d="M130 100h258c0 0-18 55-129 55S130 100 130 100Z"
        fill="var(--color-navy-800)"
        opacity={0.5}
      />
      {/* Cart / enrollment chip */}
      <g transform="translate(220 150)">
        <rect width="90" height="36" rx="8" fill="var(--color-sunset)" />
        <text
          x="45"
          y="23"
          textAnchor="middle"
          fill="var(--color-navy-950)"
          fontSize="11"
          fontFamily="var(--font-ui), sans-serif"
          fontWeight="700"
        >
          Add to cart
        </text>
      </g>
    </svg>
  );
}

/** Organizer console — inbox stack + stamp. */
export function SceneReviewInbox({ className, ...rest }: SceneProps) {
  return (
    <svg
      viewBox="0 0 480 240"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      <rect x="40" y="160" width="400" height="24" rx="4" fill="var(--color-navy-800)" />
      <g>
        <rect x="90" y="90" width="200" height="70" rx="6" fill="var(--color-paper)" />
        <rect x="110" y="70" width="200" height="70" rx="6" fill="var(--color-sky)" opacity={0.35} />
        <rect x="130" y="50" width="200" height="70" rx="6" fill="var(--color-cal-gold)" opacity={0.55} />
        <rect x="150" y="30" width="200" height="70" rx="6" fill="var(--color-paper)" />
        <rect x="166" y="48" width="120" height="8" rx="2" fill="var(--color-berkeley)" opacity={0.35} />
        <rect x="166" y="64" width="90" height="6" rx="2" fill="var(--color-ink-soft)" opacity={0.35} />
      </g>
      {/* Stamp */}
      <g transform="translate(320 40)">
        <circle cx="48" cy="48" r="40" fill="none" stroke="var(--color-sunset)" strokeWidth={4} opacity={0.85} />
        <text
          x="48"
          y="44"
          textAnchor="middle"
          fill="var(--color-sunset)"
          fontSize="11"
          fontFamily="var(--font-hero), sans-serif"
          fontWeight="800"
        >
          REVIEW
        </text>
        <text
          x="48"
          y="60"
          textAnchor="middle"
          fill="var(--color-sunset)"
          fontSize="10"
          fontFamily="var(--font-ui), sans-serif"
          fontWeight="600"
        >
          QUEUE
        </text>
      </g>
    </svg>
  );
}

/** Settings — locker / profile card motif. */
export function SceneProfileLocker({ className, ...rest }: SceneProps) {
  return (
    <svg
      viewBox="0 0 420 260"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      <rect x="120" y="30" width="180" height="200" rx="10" fill="var(--color-berkeley)" />
      <rect x="136" y="48" width="148" height="100" rx="6" fill="var(--color-navy-800)" />
      <circle cx="210" cy="88" r="28" fill="var(--color-cal-gold)" opacity={0.85} />
      <ellipse cx="210" cy="130" rx="40" ry="18" fill="var(--color-cal-gold)" opacity={0.45} />
      <rect x="150" y="168" width="120" height="10" rx="3" fill="var(--color-cal-gold)" opacity={0.5} />
      <rect x="165" y="188" width="90" height="8" rx="3" fill="var(--color-sky)" opacity={0.5} />
      <circle cx="278" cy="160" r="10" fill="var(--color-sunset)" />
    </svg>
  );
}
