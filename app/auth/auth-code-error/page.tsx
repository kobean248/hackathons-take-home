import Link from "next/link";

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-h2 font-semibold">
        Confirmation link problem
      </h1>
      <p className="text-sm text-muted-foreground">
        That link is invalid or has expired. Try signing up again.
      </p>
      {reason && (
        <p className="rounded-chip bg-brick/10 px-3 py-2 text-left text-2xs text-brick">
          {reason}
        </p>
      )}
      <Link href="/signup" className="text-sm text-sunset underline">
        Back to sign up
      </Link>
    </main>
  );
}
