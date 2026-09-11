import { BerkeleySkylineScene } from "@/components/illustrations/berkeley-scenes";

/** Shared Berkeley-world backdrop for public marketing pages. */
export function PublicWorld({
  children,
  className = "",
  scene,
}: {
  children: React.ReactNode;
  className?: string;
  /** Optional full-width set-piece under the header. */
  scene?: React.ReactNode;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-navy-950 text-white ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23FDB515' stroke-width='1'><path d='M12 20c2-6 8-8 12-4'/><path d='M48 52l4-10 4 10h-8z'/><circle cx='64' cy='20' r='3'/></g></svg>`
          )}")`,
          backgroundSize: "80px 80px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-40">
        <BerkeleySkylineScene className="h-48 w-full sm:h-64" />
      </div>
      <div className="relative z-10">
        {scene ? (
          <div className="mx-auto max-w-[1120px] px-6 pt-8">{scene}</div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
