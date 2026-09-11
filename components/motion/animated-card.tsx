import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "cn";

type AnimatedCardProps<T extends ElementType> = {
  as?: T;
  index?: number;
  lift?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/** Shared card entrance — optional lift hover for interactive surfaces. */
export function AnimatedCard<T extends ElementType = "div">({
  as,
  index = 0,
  lift = false,
  children,
  className,
  style,
  ...props
}: AnimatedCardProps<T>) {
  const Tag = as ?? "div";
  return (
    <Tag
      className={cn("card-enter", lift && "card-lift", className)}
      style={{
        ...(typeof style === "object" && style ? style : {}),
        animationDelay: `${index * 50}ms`,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
