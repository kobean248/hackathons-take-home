import Link from "next/link";

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Confirmation link problem</h1>
      <p className="text-sm text-gray-500">
        That link is invalid or has expired. Try signing up again.
      </p>
      {reason && (
        <p className="rounded bg-red-50 px-3 py-2 text-left text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
          {reason}
        </p>
      )}
      <Link href="/signup" className="text-sm underline">
        Back to sign up
      </Link>
    </main>
  );
}
