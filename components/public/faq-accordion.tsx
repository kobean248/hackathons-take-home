"use client";

import { useId, useState } from "react";

type Item = { q: string; a: string };

export function FaqAccordion({ items }: { items: Item[] }) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-navy-600/80 border-y border-navy-600/80">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={item.q}>
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="font-display text-sm font-semibold text-white sm:text-base">
                {item.q}
              </span>
              <span
                className={`shrink-0 font-display text-lg text-sunset transition-transform duration-150 ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden
              >
                +
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-4 text-sm leading-relaxed text-white/65">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
