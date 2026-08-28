import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase-server";

// Central place to change a profile's publish state. Runs the update through
// RLS (owner or admin), then revalidates every page that renders the profile
// so the minisite, directory and homepage update immediately.
const bodySchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "published", "suspended"]),
});

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const { id, status } = parsed.data;
  const { data, error } = await supabase
    .from("profiles")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("username")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Profil tidak ditemukan atau tidak diizinkan." }, { status: 403 });
  }

  revalidatePath(`/@${data.username}`);
  revalidatePath("/members");
  revalidatePath("/");

  return NextResponse.json({ status });
}
