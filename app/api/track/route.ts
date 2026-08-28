import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicSupabase } from "@/lib/supabase-server";

// Records a single analytics event. Deliberately permissive and quiet:
// invalid payloads and DB errors return 204 so the caller's beacon never
// surfaces a failure. RLS lets anon insert into analytics_events only.
const schema = z.object({
  event_name: z.enum(["page_view", "profile_view", "link_click", "cta_click"]),
  path: z.string().max(512).optional(),
  profile_id: z.string().uuid().optional(),
  link_id: z.string().uuid().optional(),
  cta_key: z.string().max(64).optional(),
  referrer_host: z.string().max(255).optional(),
});

export async function POST(request: Request) {
  const supabase = getPublicSupabase();
  if (!supabase) return new NextResponse(null, { status: 204 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 204 });

  await supabase.from("analytics_events").insert(parsed.data);
  return new NextResponse(null, { status: 204 });
}
