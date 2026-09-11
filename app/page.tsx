import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-[#0B1120] px-6 text-center text-slate-50">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Hackathons @ Berkeley — Portal
      </h1>
      <p className="mt-4 max-w-md text-slate-400">
        Apply, track your status, and (if you&apos;re an organizer) review
        applications — all in one place.
      </p>
      <Button
        render={<Link href="/login" />}
        size="lg"
        className="mt-8 bg-blue-600 text-white hover:bg-blue-500"
      >
        Sign in
      </Button>
    </main>
  );
}
