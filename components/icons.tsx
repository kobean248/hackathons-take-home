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
