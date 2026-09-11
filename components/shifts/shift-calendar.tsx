"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { claimShift, leaveShift } from "@/app/(app)/shifts/actions";
import { useToast } from "@/components/shell/toast-provider";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";

export type ShiftSlotView = {
  id: string;
  role: ApplicationTypeKey;
  title: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  filled: number;
  mine: boolean;
};

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function timeRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
  };
  return `${new Date(start).toLocaleTimeString("en-US", opts)} – ${new Date(end).toLocaleTimeString("en-US", opts)} PT`;
}

export function ShiftCalendar({
  slots,
  eligibleRoles,
}: {
  slots: ShiftSlotView[];
  eligibleRoles: ApplicationTypeKey[];
}) {
  const days = new Map<string, ShiftSlotView[]>();
  for (const slot of slots) {
    const key = dayKey(slot.starts_at);
    const list = days.get(key) ?? [];
    list.push(slot);
    days.set(key, list);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...days.entries()].map(([day, daySlots]) => (
        <section key={day} className="flex flex-col gap-3">
          <h2 className="font-display text-sm font-semibold text-ink">{day}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {daySlots.map((slot) => (
              <ShiftCard
                key={slot.id}
                slot={slot}
                eligible={eligibleRoles.includes(slot.role)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ShiftCard({
  slot,
  eligible,
}: {
  slot: ShiftSlotView;
  eligible: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const { push } = useToast();
  const full = slot.filled >= slot.capacity;
  const label = APPLICATION_TYPES[slot.role]?.label ?? slot.role;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border px-4 py-3 ${
        slot.mine
          ? "border-sunset/50 bg-sunset/10"
          : "border-line bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">{slot.title}</p>
          <p className="text-2xs text-ink-soft">
            {timeRange(slot.starts_at, slot.ends_at)}
          </p>
        </div>
        <span className="rounded-chip bg-paper px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-ink-soft">
          {label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-2xs tabular-nums text-ink-soft">
          {slot.filled}/{slot.capacity} filled
          {full && !slot.mine ? " · full" : ""}
        </p>
        {!eligible ? (
          <span className="text-2xs text-ink-soft">Needs {label} role</span>
        ) : slot.mine ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                try {
                  await leaveShift(slot.id);
                  push("success", "Left shift.");
                } catch (err) {
                  push(
                    "error",
                    err instanceof Error ? err.message : "Could not leave."
                  );
                }
              });
            }}
          >
            {isPending ? "…" : "Leave"}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={isPending || full}
            onClick={() => {
              startTransition(async () => {
                try {
                  await claimShift(slot.id);
                  push("success", "Shift claimed.");
                } catch (err) {
                  push(
                    "error",
                    err instanceof Error ? err.message : "Could not claim."
                  );
                }
              });
            }}
          >
            {isPending ? "…" : full ? "Full" : "Claim"}
          </Button>
        )}
      </div>
    </div>
  );
}
