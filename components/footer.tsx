import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/schedule", label: "Schedule" },
  { href: "/faq", label: "FAQ" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/tracks", label: "Tracks" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-navy-600/30 bg-navy-950 px-6 py-6 text-white/45">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-2xs">Hackathons @ Berkeley — Portal</p>
        <nav className="flex flex-wrap justify-center gap-3 text-2xs" aria-label="Footer">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-white/80"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
