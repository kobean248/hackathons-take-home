"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/auth/actions";

function initialsFrom(name: string | null | undefined, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return (first + last).toUpperCase() || email.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// Avatar chip + sign-out dropdown. Shadow is allowed here — design-doc.md
// §5 reserves drop shadows for genuinely floating elements (menus/modals).
export function UserMenu({
  email,
  fullName,
  showOrganizerLink = false,
  showTeams = false,
  showShifts = false,
}: {
  email: string;
  fullName?: string | null;
  showOrganizerLink?: boolean;
  showTeams?: boolean;
  showShifts?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initials = initialsFrom(fullName, email);
  const fill =
    (email.charCodeAt(0) + email.length) % 2 === 0 ? "bg-sunset" : "bg-sky";

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`flex size-8 items-center justify-center rounded-full text-2xs font-semibold text-navy-950 ${fill}`}
      >
        <span className="sr-only">Account menu</span>
        {initials}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-44 rounded-xl border border-line bg-surface py-1 shadow-lg"
        >
          <div className="border-b border-line px-3 py-2">
            <p className="truncate text-2xs text-ink-soft">{email}</p>
          </div>
          {showOrganizerLink && (
            <Link
              href="/organizer/applications"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper"
              onClick={() => setOpen(false)}
            >
              Organizer console
            </Link>
          )}
          <Link
            href="/dashboard"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper"
            onClick={() => setOpen(false)}
          >
            Overview
          </Link>
          {showTeams && (
            <Link
              href="/teams"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper"
              onClick={() => setOpen(false)}
            >
              Teams
            </Link>
          )}
          {showShifts && (
            <Link
              href="/shifts"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper"
              onClick={() => setOpen(false)}
            >
              Shifts
            </Link>
          )}
          <Link
            href="/settings"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
