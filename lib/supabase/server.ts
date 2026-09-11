import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use this client in Server Components, Server Actions, and Route Handlers.
// A new client is created per request so it can read/write that request's cookies.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll was called from a Server Component that can't write
            // cookies. Safe to ignore as long as proxy.ts is refreshing
            // sessions on every request.
          }
        },
      },
    }
  );
}
