"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { decideApplicationsBulk } from "@/app/organizer/applications/actions";
import { useToast } from "@/components/shell/toast-provider";
import {
  bulkCapacityWarning,
  wouldBulkAcceptExceedCapacity,
} from "@/lib/organizer-ops";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import type { ApplicationStatus } from "@/types";

type Row = {
  id: string;
  type: ApplicationTypeKey;
  status: ApplicationStatus;
};

type CapacityMap = Partial<
  Record<ApplicationTypeKey, { accepted: number; target: number }>
>;

const BulkCtx = createContext<{
  selected: Set<string>;
  toggle: (id: string) => void;
  enabled: boolean;
} | null>(null);

export function useBulkSelection() {
  return useContext(BulkCtx);
}

export function RowCheckbox({ id }: { id: string }) {
  const ctx = useBulkSelection();
  if (!ctx?.enabled) return null;
  return (
    <input
      type="checkbox"
      checked={ctx.selected.has(id)}
      onChange={() => ctx.toggle(id)}
      className="accent-sunset"
      aria-label="Select application"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

/** Wraps the applications table: toolbar + selection context for row checkboxes. */
export function ApplicationsBulkToolbar({
  rows,
  capacityByType,
  exportHref,
  enableBulk,
  children,
}: {
  rows: Row[];
  capacityByType: CapacityMap;
  exportHref: string;
  enableBulk: boolean;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);
  const [pendingAccept, setPendingAccept] = useState(false);
  const { push } = useToast();

  const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.id)),
    [rows, selected]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setCapacityWarning(null);
    setPendingAccept(false);
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds)
    );
    setCapacityWarning(null);
    setPendingAccept(false);
  }

  function checkCapacityForAccept(): string | null {
    const byType = new Map<ApplicationTypeKey, number>();
    for (const row of selectedRows) {
      if (row.status === "accepted") continue;
      byType.set(row.type, (byType.get(row.type) ?? 0) + 1);
    }
    const warnings: string[] = [];
    for (const [type, count] of byType) {
      const cap = capacityByType[type];
      if (!cap) continue;
      if (wouldBulkAcceptExceedCapacity(cap.accepted, cap.target, count)) {
        warnings.push(
          bulkCapacityWarning(
            APPLICATION_TYPES[type].label,
            cap.accepted,
            cap.target,
            count
          )
        );
      }
    }
    return warnings.length ? warnings.join(" ") : null;
  }

  function runBulk(status: ApplicationStatus, force = false) {
    if (selected.size === 0) return;

    if (status === "accepted" && !force) {
      const warning = checkCapacityForAccept();
      if (warning) {
        setCapacityWarning(warning);
        setPendingAccept(true);
        return;
      }
    }

    setCapacityWarning(null);
    setPendingAccept(false);
    const ids = [...selected];
    startTransition(async () => {
      try {
        const { updated } = await decideApplicationsBulk(ids, status);
        push(
          "success",
          `${updated} application${updated === 1 ? "" : "s"} → ${status}.`
        );
        setSelected(new Set());
      } catch (err) {
        push(
          "error",
          err instanceof Error ? err.message : "Bulk decision failed."
        );
      }
    });
  }

  return (
    <BulkCtx.Provider value={{ selected, toggle, enabled: enableBulk }}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
          {enableBulk ? (
            <>
              <label className="flex items-center gap-2 text-2xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={allIds.length > 0 && selected.size === allIds.length}
                  onChange={toggleAll}
                  className="accent-sunset"
                  aria-label="Select all"
                />
                Select all
              </label>
              <span className="text-2xs text-ink-soft">
                {selected.size} selected
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={selected.size === 0 || isPending}
                  onClick={() => runBulk("accepted")}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={selected.size === 0 || isPending}
                  onClick={() => runBulk("waitlisted")}
                >
                  Waitlist
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={selected.size === 0 || isPending}
                  onClick={() => runBulk("rejected")}
                >
                  Reject
                </Button>
              </div>
            </>
          ) : (
            <span className="text-2xs text-ink-soft">Applications list</span>
          )}
          <a
            href={exportHref}
            className="ml-auto inline-flex h-7 items-center rounded-chip border border-border px-2.5 text-[0.8rem] font-medium text-ink hover:bg-black/[.03]"
          >
            Export CSV
          </a>
        </div>

        {capacityWarning && pendingAccept && (
          <div className="flex flex-col gap-2 rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber">
              {capacityWarning} Accept anyway?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => runBulk("accepted", true)}
              >
                Accept anyway
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setCapacityWarning(null);
                  setPendingAccept(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {children}
      </div>
    </BulkCtx.Provider>
  );
}
