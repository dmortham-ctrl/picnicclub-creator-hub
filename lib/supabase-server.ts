import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./supabase";

// Cookieless anon client for public data reads in Server Components. Because it
// never touches cookies(), pages that only use this stay statically renderable
// / ISR-cacheable. RLS still restricts it to published rows.
export function getPublicSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Server client for Server Components, Route Handlers and Server Actions.
// Returns `null` when Supabase env is missing so callers fall back to demo data.
export async function getServerSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render - safe to ignore, the
          // middleware refreshes the session cookie on the next request.
        }
      },
    },
  });
}

export async function getCurrentUser() {
  const client = await getServerSupabase();
  if (!client) return null;
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}

export async function isCurrentUserAdmin() {
  const client = await getServerSupabase();
  if (!client) return false;
  const { data } = await client.rpc("is_admin");
  return data === true;
}
