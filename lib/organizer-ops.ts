import type { ApplicationTypeKey } from "@/lib/applicationTypes";

export type RubricScores = {
  technical: number;
  creativity: number;
  impact: number;
};

export const RUBRIC_KEYS: (keyof RubricScores)[] = [
  "technical",
  "creativity",
  "impact",
];

/** Compare a reviewer score to gold; returns short calibration feedback. */
export function scoreComparisonCopy(
  dimension: keyof RubricScores,
  yours: number,
  gold: number
): string {
  const delta = yours - gold;
  const label = dimension.charAt(0).toUpperCase() + dimension.slice(1);
  if (delta === 0) {
    return `You scored ${label.toLowerCase()} ${yours} — matches gold.`;
  }
  const abs = Math.abs(delta);
  const severity =
    abs <= 1 ? "slightly" : abs <= 2 ? "moderately" : "notably";
  if (delta < 0) {
    return `You scored ${label.toLowerCase()} ${yours} vs gold ${gold} — ${severity} harsh.`;
  }
  return `You scored ${label.toLowerCase()} ${yours} vs gold ${gold} — ${severity} lenient.`;
}

export function isCalibrationComplete(
  sampleCount: number,
  attemptCount: number
): boolean {
  return sampleCount > 0 && attemptCount >= sampleCount;
}

export type CapacityTargetRow = {
  type: ApplicationTypeKey;
  target: number;
};

export function capacityProgressLabel(
  typeLabel: string,
  accepted: number,
  target: number
): string {
  return `Accepted ${accepted}/${target} ${typeLabel.toLowerCase()} slots`;
}

export function wouldExceedCapacity(
  accepted: number,
  target: number,
  currentlyAccepted: boolean
): boolean {
  if (currentlyAccepted) return false;
  return accepted + 1 > target;
}
