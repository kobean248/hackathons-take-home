// Initials avatar — deterministic color per id so the same person always
// gets the same color across the table, detail page, and teams page.
const AVATAR_COLORS = [
  { bg: "bg-sky/15", text: "text-sky" },
  { bg: "bg-sunset/15", text: "text-sunset" },
  { bg: "bg-mint/15", text: "text-mint" },
  { bg: "bg-amber/15", text: "text-amber" },
  { bg: "bg-berkeley/15", text: "text-berkeley" },
  { bg: "bg-brick/15", text: "text-brick" },
];

function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]!;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function Avatar({
  id,
  name,
  size = "size-8",
}: {
  id: string;
  name: string;
  size?: string;
}) {
  const c = colorForId(id);
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full font-display text-2xs font-bold ${c.bg} ${c.text}`}
      aria-hidden="true"
    >
      {initialsFor(name)}
    </span>
  );
}
