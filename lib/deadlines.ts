// Event timing — keep in sync with the public Cal Hacks calendar.
export const PRIORITY_DEADLINE = new Date("2026-09-13T23:59:59-07:00");
export const PRIORITY_DEADLINE_LABEL = "9/13";

/** Hackathon doors-open / kickoff — drives the public countdown. */
export const EVENT_START = new Date("2026-10-24T18:00:00-07:00");

/** Whole days from now until `target` (may be negative once it's passed). */
export function daysUntil(target: Date): number {
  return Math.ceil((target.getTime() - Date.now()) / 86_400_000);
}
