import { cn } from "cn";

/** Tiny inline bar/spark for trends — flat fills, theme palette. */
export function MiniSparkline({
  values,
  className,
  height = 28,
  barClassName = "bg-sky/70",
}: {
  values: number[];
  className?: string;
  height?: number;
  barClassName?: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <div
      className={cn("flex items-end gap-0.5", className)}
      style={{ height }}
      aria-hidden="true"
    >
      {values.map((v, i) => {
        const pct = (v / max) * 100;
        return (
          <span
            key={i}
            className={cn(
              "bar-grow w-1.5 min-h-0.5 rounded-sm",
              barClassName
            )}
            style={{
              height: `${Math.max(pct, v > 0 ? 8 : 4)}%`,
              animationDelay: `${i * 40}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
