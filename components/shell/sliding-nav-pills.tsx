"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "cn";

type Pill = {
  key: string;
  href: string;
  label: ReactNode;
  active: boolean;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
};

/**
 * Nav row with a sliding active pill (iOS-segment style) instead of an
 * instant fill swap — position/size animate between items.
 */
export function SlidingNavPills({
  items,
  className,
  indicatorClassName = "bg-navy-800 shadow-[0_4px_12px_rgba(0,0,0,0.35)]",
}: {
  items: Pill[];
  className?: string;
  indicatorClassName?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [box, setBox] = useState({ left: 0, width: 0, ready: false });

  const activeKey = items.find((i) => i.active)?.key;

  function measure() {
    if (!activeKey || !listRef.current) {
      setBox((b) => ({ ...b, ready: false }));
      return;
    }
    const el = itemRefs.current.get(activeKey);
    const parent = listRef.current;
    if (!el) return;
    const parentRect = parent.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setBox({
      left: rect.left - parentRect.left + parent.scrollLeft,
      width: rect.width,
      ready: true,
    });
  }

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, items.length]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  return (
    <div
      ref={listRef}
      className={cn("relative flex items-center gap-1.5", className)}
    >
      {box.ready && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0 h-full rounded-full transition-[transform,width] duration-200 ease-out",
            indicatorClassName
          )}
          style={{
            width: box.width,
            transform: `translateX(${box.left}px)`,
          }}
        />
      )}
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          ref={(node) => {
            if (node) itemRefs.current.set(item.key, node);
            else itemRefs.current.delete(item.key);
          }}
          className={cn(
            "relative z-10 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            item.active
              ? item.activeClassName ?? "text-white"
              : item.inactiveClassName ??
                  "border border-navy-600 bg-transparent text-sky hover:border-sky/50 hover:text-white",
            item.className
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
