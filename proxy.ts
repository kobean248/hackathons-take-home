import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (same behavior, new name/export). See node_modules/next/dist/docs/01-app/
// 03-api-reference/03-file-conventions/proxy.md for details.
//
// Gates authenticated portal routes:
// - no session -> /login
// - session but role isn't organizer/reviewer, hitting /organizer/* -> /dashboard
// Public marketing routes (including `/`) stay open for everyone — signed-in
// users get a "Go to dashboard" banner instead of a force redirect.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/apply" ||
    pathname.startsWith("/apply/") ||
    pathname === "/teams" ||
    pathname.startsWith("/teams/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
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
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/apply",
    "/apply/:path*",
    "/teams",
    "/teams/:path*",
    "/settings",
    "/settings/:path*",
    "/organizer",
    "/organizer/:path*",
  ],
};
