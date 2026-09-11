import type { SVGProps } from "react";

// Flat 1.5px-stroke line icons, 24x24 grid, single color (currentColor) —
// no shading, no two-tone. See design-doc.md §4. Used sparingly (2-3 per
// screen max), never as a big illustrated scene.

export function BracketsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 4c-2 0-3 1-3 3v3.5c0 1-.4 1.5-1.5 1.5.9 0 1.5.5 1.5 1.5V17c0 2 1 3 3 3" />
      <path d="M15 4c2 0 3 1 3 3v3.5c0 1 .4 1.5 1.5 1.5-.9 0-1.5.5-1.5 1.5V17c0 2-1 3-3 3" />
    </svg>
  );
}

export function PlaneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M21.7 3.3a1 1 0 0 0-1-.24L3.4 8.9a1 1 0 0 0-.03 1.9l6.6 2.36 2.36 6.6a1 1 0 0 0 1.9-.03l5.84-17.3a1 1 0 0 0-.37-1.13Z" />
    </svg>
  );
}

export function QuestionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function OverviewIcon(props: SVGProps<SVGSVGElement>) {
  // Mini two-tone Campanile — matches the Berkeley Times tower language.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.2 9.2 6.8h2.8Z" opacity={0.95} />
      <path d="M12 2.2 14.8 6.8H12Z" opacity={0.55} />
      <path d="M8.8 6.8h3.2v2.4H8.8Z" opacity={0.95} />
      <path d="M12 6.8h3.2v2.4H12Z" opacity={0.55} />
      <path d="M9.2 9.2h2.8v3.2H9.2Z" opacity={0.95} />
      <path d="M12 9.2h2.8v3.2H12Z" opacity={0.55} />
      <path d="M10 11.6v-1.4a1 1 0 0 1 2 0v1.4Z" opacity={0.35} />
      <path d="M9.6 12.4 10.2 21h1.8V12.4Z" opacity={0.95} />
      <path d="M12 12.4h1.8l.6 8.6H12Z" opacity={0.55} />
      <path d="M9 21h6v1.2H9Z" opacity={0.75} />
    </svg>
  );
}

export function ApplyIcon(props: SVGProps<SVGSVGElement>) {
  // Paper plane — the portal's submit / apply mark.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21.5 3.5 3.5 10.2l7.2 2.6 2.6 7.2L21.5 3.5Z" />
      <path d="M10.7 12.8 21.5 3.5" />
      <path d="M10.7 12.8l2.1 2.1" />
    </svg>
  );
}

export function ApplicationsIcon(props: SVGProps<SVGSVGElement>) {
  // Stacked course cards — CalCentral enrollment vibe.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="5" y="5" width="14" height="11" rx="1.5" />
      <path d="M5 9h14" />
      <path d="M8 12.5h5M8 15h3.5" />
      <path d="M7 18.5h10" />
      <path d="M8.5 20.5h7" />
    </svg>
  );
}

export function QueueIcon(props: SVGProps<SVGSVGElement>) {
  // Campanile clock face — queue / waiting.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 5.5V4M10 4h4" />
      <path d="M12 13V9.5" />
      <path d="M12 13l3.2 2" />
      <path d="M12 5.5l1.2-1.2M12 5.5 10.8 4.3" />
    </svg>
  );
}

export function ReviewersIcon(props: SVGProps<SVGSVGElement>) {
  // Clipboard + stamp — review / grade.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="5" y="4" width="11" height="16" rx="1.5" />
      <path d="M8 2.5h5v3H8z" />
      <path d="M8 10h5M8 13h3.5" />
      <circle cx="17.5" cy="16.5" r="3.5" />
      <path d="M16.2 16.5h2.6M17.5 15.2v2.6" />
    </svg>
  );
}

export function AnalyticsIcon(props: SVGProps<SVGSVGElement>) {
  // Funnel bars with a spark — analytics, not a generic chart.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 19h16" />
      <path d="M6 16V11" />
      <path d="M11 16V7" />
      <path d="M16 16v-5" />
      <path d="M19.5 5.5 21 4M19.5 5.5l-1.5-1.5M19.5 5.5v2.2" />
    </svg>
  );
}

export function TeamsIcon(props: SVGProps<SVGSVGElement>) {
  // Linked crew around a shared table — not stock "users".
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="6.5" r="2.25" />
      <circle cx="5.5" cy="9" r="2" />
      <circle cx="18.5" cy="9" r="2" />
      <path d="M8.5 19c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5" />
      <path d="M3.5 19c.2-1.5 1.4-2.7 2.9-3" />
      <path d="M20.5 19c-.2-1.5-1.4-2.7-2.9-3" />
      <path d="M8 13.5h8" />
    </svg>
  );
}

export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  // Profile / CalCentral ID card — settings as "you", not a gear.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="11" r="2.4" />
      <path d="M5.8 16.2c.5-1.5 1.8-2.5 3.2-2.5s2.7 1 3.2 2.5" />
      <path d="M14.5 10h4M14.5 13h3.2" />
    </svg>
  );
}

export function CalibrationIcon(props: SVGProps<SVGSVGElement>) {
  // Balance scale — gold-sample calibration.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 4v13" />
      <path d="M8 21h8" />
      <path d="M12 4 5 8" />
      <path d="M12 4l7 4" />
      <path d="M5 8c0 2.2 1.6 4 3.5 4S12 10.2 12 8" />
      <path d="M12 8c0 2.2 1.6 4 3.5 4S19 10.2 19 8" />
    </svg>
  );
}

export function GraduationCapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M2 9.5 12 5l10 4.5-10 4.5L2 9.5Z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
      <path d="M21 9.5V15" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 12.5 9.5 18 20 6" />
    </svg>
  );
}

export function FlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 4v16" />
      <path d="M5 5h10l-1.5 3.5L15 12H5" />
    </svg>
  );
}

export function AuditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 6h11" />
      <path d="M8 12h11" />
      <path d="M8 18h11" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </svg>
  );
}

export function ShiftsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
      <path d="M3.5 10h17" />
      <path d="M8 14h3" />
      <path d="M13 14h3" />
      <path d="M8 17h3" />
    </svg>
  );
}
