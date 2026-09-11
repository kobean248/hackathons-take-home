"use client";

import { usePathname } from "next/navigation";

// Full-bleed dark public pages get the full-strength treatment; every
// working/app page (paper background) gets the barely-there version so it
// doesn't fight with dense data. Single component, mounted once at the
// root layout — see globals.css for the .ambient-* rules and keyframes.
const FULL_INTENSITY_ROUTES = new Set([
  "/",
  "/about",
  "/faq",
  "/schedule",
  "/sponsors",
  "/tracks",
]);

export function AmbientBackground() {
  const pathname = usePathname();
  const full = FULL_INTENSITY_ROUTES.has(pathname);
  const modifier = full ? "" : " ambient-blob--subtle";

  return (
    <div aria-hidden="true" className="ambient-layer">
      <div className={`ambient-blob ambient-blob-1${modifier}`} />
      <div className={`ambient-blob ambient-blob-2${modifier}`} />
      <div className={`ambient-blob ambient-blob-3${modifier}`} />
      <div className="ambient-grain" />
    </div>
  );
}
