"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";

export type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  group?: string;
};

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

/** Cmd+K / Ctrl+K palette — one component, every authenticated shell. */
export function CommandPalette({ items }: { items: CommandItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.hint?.toLowerCase().includes(q) ||
        item.group?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const activeIndex = Math.min(active, Math.max(0, filtered.length - 1));

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const run = useCallback(
    (item: CommandItem) => {
      close();
      router.push(item.href);
    },
    [close, router]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[Math.min(active, filtered.length - 1)];
        if (item) run(item);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, [open, filtered, active, close, run]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const g = item.group ?? "Go to";
    (acc[g] ??= []).push(item);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-navy-950/40 px-4 pt-[12vh] backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="glass w-full max-w-lg overflow-hidden rounded-xl shadow-[0_24px_48px_rgba(10,14,31,0.2)]">
        <div className="flex items-center gap-2 border-b border-line/70 px-3 py-2.5">
          <SearchGlyph className="size-4 text-ink-soft" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Jump to a page…"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
            aria-autocomplete="list"
          />
          <kbd className="hidden rounded-chip border border-line bg-paper px-1.5 py-0.5 text-[0.65rem] text-ink-soft sm:inline">
            esc
          </kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto p-1.5" role="listbox">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-ink-soft">
              No matches
            </li>
          )}
          {Object.entries(groups).map(([group, groupItems]) => (
            <li key={group} className="mb-1">
              <p className="px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-soft">
                {group}
              </p>
              <ul>
                {groupItems.map((item) => {
                  flatIndex += 1;
                  const idx = flatIndex;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={idx === activeIndex}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-chip px-2.5 py-2 text-left text-sm",
                          idx === activeIndex
                            ? "bg-sunset/15 text-ink"
                            : "text-ink hover:bg-black/[.03]"
                        )}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => run(item)}
                      >
                        <span className="font-medium">{item.label}</span>
                        {item.hint && (
                          <span className="text-2xs text-ink-soft">
                            {item.hint}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        <div className="border-t border-line/70 px-3 py-2 text-[0.65rem] text-ink-soft">
          <span className="font-medium text-ink">↑↓</span> navigate ·{" "}
          <span className="font-medium text-ink">↵</span> open ·{" "}
          <span className="font-medium text-ink">⌘K</span> toggle
        </div>
      </div>
    </div>
  );
}

export function CommandPaletteHint({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        "hidden items-center gap-1.5 rounded-full border border-navy-600/80 bg-navy-800/50 px-2.5 py-1 text-[0.65rem] text-white/55 hover:border-sky/40 hover:text-white sm:inline-flex",
        className
      )}
      onClick={() => {
        window.dispatchEvent(new Event("open-command-palette"));
      }}
      aria-label="Open command palette"
    >
      <span>Search</span>
      <kbd className="rounded border border-white/15 px-1 font-sans">⌘K</kbd>
    </button>
  );
}

export function buildApplicantCommands(opts: {
  showConsole?: boolean;
}): CommandItem[] {
  const items: CommandItem[] = [
    { id: "dash", label: "Overview", href: "/dashboard", group: "Portal" },
    { id: "apply", label: "Apply", href: "/apply", group: "Portal" },
    { id: "teams", label: "Teams", href: "/teams", group: "Portal" },
    { id: "settings", label: "Settings", href: "/settings", group: "Portal" },
    { id: "home", label: "Home", href: "/", group: "Browse" },
  ];
  if (opts.showConsole) {
    items.splice(4, 0, {
      id: "console",
      label: "Organizer console",
      href: "/organizer/applications",
      group: "Portal",
      hint: "Applications",
    });
  }
  return items;
}

export function buildOrganizerCommands(): CommandItem[] {
  return [
    {
      id: "apps",
      label: "Applications",
      href: "/organizer/applications",
      group: "Review",
    },
    {
      id: "queue",
      label: "My queue",
      href: "/organizer/applications?assigned_to_me=true",
      group: "Review",
    },
    {
      id: "cal",
      label: "Calibration",
      href: "/organizer/calibration",
      group: "Review",
    },
    {
      id: "rev",
      label: "Reviewers",
      href: "/organizer/reviewers",
      group: "Manage",
    },
    {
      id: "an",
      label: "Analytics",
      href: "/organizer/analytics",
      group: "Manage",
    },
    {
      id: "dash",
      label: "Applicant overview",
      href: "/dashboard",
      group: "Portal",
    },
  ];
}

/** Unused type kept for consumers that slot custom palette chrome. */
export type CommandPaletteSlot = ReactNode;
