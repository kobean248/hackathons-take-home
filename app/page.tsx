import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BracketsIcon, PlaneIcon } from "@/components/icons";
import { Chip } from "@/components/chip";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-navy-950 px-6 text-center text-white">
      <BracketsIcon className="mb-6 size-8 text-sky" />

      <h1 className="max-w-2xl font-display text-h1 font-semibold tracking-tight sm:text-display">
        Hackathons @ Berkeley — Portal
      </h1>
      <p className="mt-4 max-w-md text-white/70">
        Apply, track your status, and — if you&apos;re an organizer — review
        applications. All in one place.
      </p>

      <div className="mt-6">
        <Chip>
          <PlaneIcon className="size-3 text-sunset" />
          Priority deadline 9/13
        </Chip>
      </div>

      <Button
        render={<Link href="/login" />}
        size="lg"
        className="mt-8 rounded-chip bg-sunset px-6 text-navy-950 hover:bg-[color-mix(in_oklch,var(--color-sunset),black_8%)]"
      >
        Sign in
      </Button>
    </main>
  );
}
