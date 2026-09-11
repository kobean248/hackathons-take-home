"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const FULL_INTENSITY_ROUTES = new Set([
  "/",
  "/about",
  "/faq",
  "/schedule",
  "/sponsors",
  "/tracks",
]);

/**
 * Single root ambient layer: drifting color mesh + grain.
 * Public/dark routes get full strength + gentle cursor magnetism;
 * paper working pages get a barely-there version (no cursor pull).
 */
export function AmbientBackground() {
  const pathname = usePathname();
  const full = FULL_INTENSITY_ROUTES.has(pathname);
  const modifier = full ? "" : " ambient-blob--subtle";
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!full) return;
    const layer = layerRef.current;
    if (!layer) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const blobs = layer.querySelectorAll<HTMLElement>(".ambient-blob");

    function onMove(e: PointerEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      blobs.forEach((blob, i) => {
        const strength = 12 + i * 6;
        blob.style.translate = `${x * strength}px ${y * strength * 0.7}px`;
      });
    }

    function onLeave() {
      blobs.forEach((blob) => {
        blob.style.translate = "0px 0px";
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      blobs.forEach((blob) => {
        blob.style.translate = "";
      });
    };
  }, [full]);

  return (
    <div ref={layerRef} aria-hidden="true" className="ambient-layer">
      <div className={`ambient-blob ambient-blob-1${modifier}`} />
      <div className={`ambient-blob ambient-blob-2${modifier}`} />
      <div className={`ambient-blob ambient-blob-3${modifier}`} />
      <div className="ambient-grain" />
    </div>
  );
}
