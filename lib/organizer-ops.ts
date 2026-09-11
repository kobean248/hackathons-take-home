import type { ApplicationTypeKey } from "@/lib/applicationTypes";

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

/** Bulk accept: how many of the selected would newly count against capacity. */
export function wouldBulkAcceptExceedCapacity(
  currentlyAccepted: number,
  target: number,
  newlyAcceptingCount: number
): boolean {
  if (newlyAcceptingCount <= 0) return false;
  return currentlyAccepted + newlyAcceptingCount > target;
}

export function bulkCapacityWarning(
  typeLabel: string,
  currentlyAccepted: number,
  target: number,
  newlyAcceptingCount: number
): string {
  const next = currentlyAccepted + newlyAcceptingCount;
  return `This would put you at ${next}/${target} ${typeLabel.toLowerCase()} slots.`;
}

/** Z-score max−min threshold for the "needs a tiebreaker" view. */
export const TIEBREAKER_Z_SPREAD = 1.5;
