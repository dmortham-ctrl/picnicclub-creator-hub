import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabase } from "@/lib/supabase-server";

// Outbound link redirect. Records a link_click, then 302s to the target.
// Fast and transparent: no interstitial. RLS only exposes active links of
// published profiles, so a bad/disabled id just bounces home.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = new URL("/", request.url);

  const supabase = getPublicSupabase();
  if (!supabase) return NextResponse.redirect(home);

  const { data } = await supabase
    .from("profile_links")
    .select("url, profile_id")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return NextResponse.redirect(home);

  await supabase
    .from("analytics_events")
    .insert({ event_name: "link_click", link_id: id, profile_id: data.profile_id });

  return NextResponse.redirect(data.url, 302);
}
