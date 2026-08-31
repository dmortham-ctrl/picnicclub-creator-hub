import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicSupabase } from "@/lib/supabase-server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { normalizeWhatsappUrl } from "@/lib/link-types";

const bodySchema = z.object({
  program: z.enum(["tiktok", "shopee"]),
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120),
  whatsapp: z.string().trim().min(6, "Nomor WhatsApp belum lengkap.").max(30),
  email: z.union([z.string().trim().email("Format email tidak valid.").max(160), z.literal("")]).default(""),
  social_username: z.string().trim().max(80).default(""),
  experience: z.string().trim().max(40).default(""),
  note: z.string().trim().max(600).default(""),
});

export async function POST(request: Request) {
  if (!rateLimit(`join:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak kiriman. Coba lagi sebentar." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const supabase = getPublicSupabase();
  if (!supabase) return NextResponse.json({ error: "Server belum siap." }, { status: 503 });

  // Store the WhatsApp number in a consistent 62… form.
  const waLink = normalizeWhatsappUrl(parsed.data.whatsapp);
  const whatsapp = waLink.replace("https://wa.me/", "") || parsed.data.whatsapp;

  const { error } = await supabase.from("join_requests").insert({ ...parsed.data, whatsapp });
  if (error) {
    console.error("[api/join]", error);
    return NextResponse.json({ error: "Gagal menyimpan. Coba lagi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
