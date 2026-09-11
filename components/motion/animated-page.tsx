"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "cn";

/** Route-keyed fade+slide so every page change shares one entrance. */
export function AnimatedPage({
  children,
  className,
  stagger = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}) {
  const pathname = usePathname();
  return (
    <div
      key={pathname}
      className={cn("page-enter", stagger && "stagger-in", className)}
    >
      {children}
    </div>
  );
}
