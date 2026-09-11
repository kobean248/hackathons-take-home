// Event timing — keep in sync with the public Cal Hacks calendar.
export const PRIORITY_DEADLINE = new Date("2026-09-13T23:59:59-07:00");
export const PRIORITY_DEADLINE_LABEL = "9/13";

/** Hackathon doors-open / kickoff — drives the public countdown. */
export const EVENT_START = new Date("2026-10-24T18:00:00-07:00");

/** Whole days from now until `target` (may be negative once it's passed). */
export function daysUntil(target: Date): number {
  return Math.ceil((target.getTime() - Date.now()) / 86_400_000);
}

/** Whole days elapsed since `iso` (an ISO timestamp string), floored at 0. */
export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}
