import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (same behavior, new name/export). See node_modules/next/dist/docs/01-app/
// 03-api-reference/03-file-conventions/proxy.md for details.
//
// Gates exactly /dashboard and /organizer/* per the route-protection spec:
// - no session -> /login
// - session but role isn't organizer/reviewer, hitting /organizer/* -> /dashboard
// Every other route (including /apply, once it exists) is left open here;
// pages that need auth should still re-check server-side themselves, same
// as app/dashboard/page.tsx already does — proxy is a fast first gate, not
// the only one.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/organizer" ||
    pathname.startsWith("/organizer/");

  if (!needsAuth) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session token; must run before reading the user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const isOrganizerRoute =
    pathname === "/organizer" || pathname.startsWith("/organizer/");

  if (isOrganizerRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "organizer" && profile?.role !== "reviewer") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set(
        "error",
        "You don't have access to the organizer area."
      );
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/organizer", "/organizer/:path*"],
};
