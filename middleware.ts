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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (matches(path, AUTH_PREFIXES) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirectedFrom", path);
    return NextResponse.redirect(loginUrl);
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
