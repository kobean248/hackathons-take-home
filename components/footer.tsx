import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-navy-600/30 bg-navy-950 px-6 py-6 text-white/45">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-2xs">Hackathons @ Berkeley — Portal</p>
        <nav className="flex flex-wrap justify-center gap-3 text-2xs" aria-label="Footer">
          <Link href="/" className="hover:text-white/80">
            Home
          </Link>
          <Link href="/login" className="hover:text-white/80">
            Portal
          </Link>
        </nav>
      </div>
    </footer>
  );
}
