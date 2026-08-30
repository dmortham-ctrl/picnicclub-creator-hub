import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

// Protects the private areas at the edge, before any page renders:
//   /userpanel/*   - any signed-in creator
//   /superadmin/*  - admins only (public.is_admin())
// /admin stays public because it hosts the login/sign-up form.
const AUTH_PREFIXES = ["/userpanel", "/superadmin"];
const ADMIN_PREFIXES = ["/superadmin"];

const matches = (path: string, prefixes: string[]) =>
  prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // Demo mode (no Supabase env): no one can be signed in, so send every
  // protected route to the login screen.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (matches(path, AUTH_PREFIXES)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin";
      loginUrl.search = "";
      loginUrl.searchParams.set("redirectedFrom", path);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let user = null;
  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    // Transient auth-server error — don't bounce the user, let the page load and
    // its own client check handle it. Prevents redirect loops on flaky networks.
    return response;
  }

  if (matches(path, AUTH_PREFIXES) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirectedFrom", path);
    const redirect = NextResponse.redirect(loginUrl);
    // Carry over any auth cookies the SSR client refreshed while checking.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value, c));
    return redirect;
  }

  if (matches(path, ADMIN_PREFIXES) && user) {
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin !== true) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/userpanel/:path*", "/superadmin/:path*"],
};
