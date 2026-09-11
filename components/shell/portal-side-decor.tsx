import { CampanileTower } from "@/components/illustrations/berkeley-scenes";

/**
 * Fills empty side gutters on wide portal screens with a Campanile +
 * eucalyptus marks. Mount once in AppShell / organizer layout.
 */
export function PortalSideDecor({
  contentMaxClass = "max-w-[960px]",
}: {
  /** Match the shell content column so the tower sits in the gutter. */
  contentMaxClass?: string;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Soft hillside wash */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--color-berkeley)_8%,transparent),transparent)]" />

      {/* Anchor rail matching the content column */}
      <div
        className={`absolute inset-y-0 left-1/2 w-full -translate-x-1/2 px-6 ${contentMaxClass}`}
      >
        {/* Eucalyptus in the left gutter */}
        <svg
          viewBox="0 0 120 320"
          className="absolute bottom-10 right-full mr-2 hidden h-[min(48vh,380px)] w-auto opacity-[0.11] xl:block"
        >
          <g fill="var(--color-berkeley)">
            <rect x="28" y="140" width="7" height="160" rx="2" />
            <ellipse cx="31" cy="130" rx="26" ry="34" />
            <rect x="72" y="180" width="6" height="120" rx="2" />
            <ellipse cx="75" cy="172" rx="20" ry="28" />
            <rect x="52" y="210" width="5" height="90" rx="2" />
            <ellipse cx="54" cy="204" rx="14" ry="18" />
          </g>
        </svg>

        {/* Campanile in the right gutter */}
        <div className="absolute bottom-0 left-full ml-1 hidden h-[min(82vh,680px)] w-[clamp(80px,12vw,148px)] opacity-[0.22] lg:block xl:ml-3 xl:opacity-[0.28]">
          <CampanileTower className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
