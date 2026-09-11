"use client";

import { useEffect, useState } from "react";
import { EVENT_START } from "@/lib/deadlines";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

export function getCountdownParts(
  now = new Date(),
  target = EVENT_START
): CountdownParts {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const done = diff === 0;
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, done };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Tick only after mount so SSR HTML matches the first client paint. */
function useLiveCountdown() {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    // Deliberately ticks once on mount (state starts null so SSR markup
    // matches the first client paint, per the comment above) and then
    // every second after — not a candidate for lazy useState init.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParts(getCountdownParts());
    const id = window.setInterval(() => setParts(getCountdownParts()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return parts;
}

/** Single digit with a short fade/flip on change. */
function Digit({
  value,
  tone,
  size,
}: {
  value: string;
  tone: "navy" | "sky";
  size: "hero" | "nav" | "inline";
}) {
  const [display, setDisplay] = useState(value);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (value === display) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Skip the flip animation outright under reduced-motion — still a
      // deliberate sync setState, not an init-on-mount case.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }
    setPulse(true);
    const t = window.setTimeout(() => {
      setDisplay(value);
      setPulse(false);
    }, 120);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const sizeClass =
    size === "hero"
      ? "text-[2.75rem] leading-none sm:text-[3.5rem]"
      : size === "nav"
        ? "text-sm leading-none tabular-nums"
        : "text-h2 leading-none";

  const toneClass = tone === "navy" ? "text-navy-950" : "text-sky";

  return (
    <span
      className={`inline-block font-display font-semibold tabular-nums ${sizeClass} ${toneClass} ${
        pulse ? "motion-safe:animate-[digit-flip_180ms_ease]" : ""
      }`}
    >
      {display}
    </span>
  );
}

function Unit({
  value,
  label,
  size,
  startTone = "navy",
}: {
  value: number;
  label: string;
  size: "hero" | "nav" | "inline";
  startTone?: "navy" | "sky";
}) {
  const str = size === "nav" && label === "d" ? String(value) : pad(value);
  const chars = str.split("");

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex">
        {chars.map((ch, i) => (
          <Digit
            key={`${label}-${i}`}
            value={ch}
            tone={
              (startTone === "navy" ? i % 2 === 0 : i % 2 === 1) ? "navy" : "sky"
            }
            size={size}
          />
        ))}
      </div>
      {size !== "nav" && (
        <span className="text-2xs font-medium uppercase tracking-wide text-ink-soft">
          {label}
        </span>
      )}
    </div>
  );
}

function CountdownSkeleton({
  size,
  className,
  light,
}: {
  size: "hero" | "inline";
  className: string;
  light: boolean;
}) {
  const wrapper = light
    ? "[&_.text-navy-950]:text-paper [&_.text-ink-soft]:text-white/55"
    : "";
  return (
    <div
      className={`flex items-end gap-3 sm:gap-5 ${wrapper} ${className}`}
      role="timer"
      aria-hidden
    >
      <Unit value={0} label="days" size={size} />
      <span
        className={`pb-5 font-display text-h3 font-semibold ${
          light ? "text-white/40" : "text-line"
        }`}
      >
        :
      </span>
      <Unit value={0} label="hours" size={size} startTone="sky" />
      <span
        className={`pb-5 font-display text-h3 font-semibold ${
          light ? "text-white/40" : "text-line"
        }`}
      >
        :
      </span>
      <Unit value={0} label="min" size={size} />
      <span
        className={`pb-5 font-display text-h3 font-semibold ${
          light ? "text-white/40" : "text-line"
        }`}
      >
        :
      </span>
      <Unit value={0} label="sec" size={size} startTone="sky" />
    </div>
  );
}

/**
 * Hero / page countdown — alternating navy/sky digits in tabular
 * Space Grotesk. Digits fade-flip on tick (respects reduced motion).
 */
export function Countdown({
  size = "hero",
  className = "",
  light = false,
}: {
  size?: "hero" | "inline";
  className?: string;
  light?: boolean;
}) {
  const parts = useLiveCountdown();

  if (!parts) {
    return (
      <CountdownSkeleton size={size} className={className} light={light} />
    );
  }

  if (parts.done) {
    return (
      <p className={`font-display text-h3 font-semibold text-sunset ${className}`}>
        We&apos;re live
      </p>
    );
  }

  const wrapper = light
    ? "[&_.text-navy-950]:text-paper [&_.text-ink-soft]:text-white/55"
    : "";

  return (
    <div
      className={`flex items-end gap-3 sm:gap-5 ${wrapper} ${className}`}
      role="timer"
      aria-live="off"
      aria-label={`Countdown: ${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds`}
    >
      <Unit value={parts.days} label="days" size={size} />
      <span
        className={`pb-5 font-display text-h3 font-semibold ${
          light ? "text-white/40" : "text-line"
        }`}
      >
        :
      </span>
      <Unit value={parts.hours} label="hours" size={size} startTone="sky" />
      <span
        className={`pb-5 font-display text-h3 font-semibold ${
          light ? "text-white/40" : "text-line"
        }`}
      >
        :
      </span>
      <Unit value={parts.minutes} label="min" size={size} />
      <span
        className={`pb-5 font-display text-h3 font-semibold ${
          light ? "text-white/40" : "text-line"
        }`}
      >
        :
      </span>
      <Unit value={parts.seconds} label="sec" size={size} startTone="sky" />
    </div>
  );
}

/** Compact persistent chip for the top nav. */
export function CountdownNavChip({ className = "" }: { className?: string }) {
  const parts = useLiveCountdown();

  if (!parts) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-navy-600 bg-navy-800 px-2.5 py-1 font-display text-2xs font-semibold tabular-nums text-paper/40 ${className}`}
        role="timer"
        aria-hidden
      >
        —d · ——:——:——
      </span>
    );
  }

  if (parts.done) {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-navy-600 bg-navy-800 px-2.5 py-1 font-display text-2xs font-semibold text-sunset ${className}`}
      >
        Live
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-navy-600 bg-navy-800 px-2.5 py-1 font-display text-2xs font-semibold tabular-nums text-paper ${className}`}
      role="timer"
      aria-label={`${parts.days}d ${pad(parts.hours)}h ${pad(parts.minutes)}m`}
    >
      <span className="text-sky">{parts.days}d</span>
      <span className="text-paper/40">·</span>
      <span className="text-paper">{pad(parts.hours)}</span>
      <span className="text-paper/40">:</span>
      <span className="text-sky">{pad(parts.minutes)}</span>
      <span className="text-paper/40">:</span>
      <span className="text-paper">{pad(parts.seconds)}</span>
    </span>
  );
}
