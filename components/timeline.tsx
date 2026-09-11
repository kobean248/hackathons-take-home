// Horizontal stepper: solid navy dots + connecting line for completed
// steps, hollow dots for upcoming. No glow, no gradient — design-doc.md §6/§7.

export type TimelineStep = {
  id: string;
  label: string;
  /** True when this milestone has been reached. */
  completed: boolean;
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  if (steps.length === 0) return null;

  return (
    <ol className="flex w-full items-start">
      {steps.map((step, i) => {
        const next = steps[i + 1];
        const lineDone = step.completed && next?.completed;

        return (
          <li
            key={step.id}
            className={`flex min-w-0 flex-col items-center gap-2 ${
              i < steps.length - 1 ? "flex-1" : ""
            }`}
          >
            <div className="flex w-full items-center">
              {/* Spacer before dot so the line centers on the dot */}
              {i > 0 ? (
                <span
                  className={`h-px flex-1 ${
                    steps[i - 1]?.completed && step.completed
                      ? "bg-navy-950"
                      : "bg-line"
                  }`}
                  aria-hidden
                />
              ) : (
                <span className="flex-1" aria-hidden />
              )}
              <span
                className={`size-2.5 shrink-0 rounded-full ${
                  step.completed
                    ? "bg-navy-950"
                    : "border-[1.5px] border-navy-950 bg-surface"
                }`}
                aria-hidden
              />
              {i < steps.length - 1 ? (
                <span
                  className={`h-px flex-1 ${
                    lineDone ? "bg-navy-950" : "bg-line"
                  }`}
                  aria-hidden
                />
              ) : (
                <span className="flex-1" aria-hidden />
              )}
            </div>
            <span
              className={`max-w-[5.5rem] text-center text-2xs leading-snug ${
                step.completed ? "font-medium text-ink" : "text-ink-soft"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
