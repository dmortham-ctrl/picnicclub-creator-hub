import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { getServerSupabase } from "@/lib/supabase-server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  TOOL_DAILY_LIMIT,
  TOOL_COUNT_MAX,
  TOOL_KEYS,
  TOOL_META,
  TOOL_PLATFORM_VALUES,
  toolPlatformLabel,
  hasBannedUrgency,
  HOOK_SYSTEM,
  SCRIPT_SYSTEM,
  CAPTION_SYSTEM,
  LIVE_SYSTEM,
  CALENDAR_SYSTEM,
  ANALYSIS_SYSTEM,
  type ToolKey,
} from "@/lib/picnic-tools";

// gemini-flash-lite is fast (~2s) and cheap; plenty for short marketing copy.
// The `-latest` alias tracks the newest lite release with no code changes.
const MODEL = "gemini-flash-lite-latest";

const bodySchema = z.object({
  tool: z.enum(TOOL_KEYS as [ToolKey, ...ToolKey[]]),
  product_name: z.string().trim().min(2).max(300),
  product_type: z.string().trim().min(2).max(80),
  platform: z.enum(TOOL_PLATFORM_VALUES),
  count: z.coerce.number().int().min(1).max(TOOL_COUNT_MAX),
});

function since(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

const noStock = (v: string) => !hasBannedUrgency(v);
const stockMsg = "Jangan sebut stok / persediaan / kelangkaan barang. Ganti dengan CTA santai atau urgensi berbasis waktu.";

const SYSTEM: Record<ToolKey, string> = {
  hook: HOOK_SYSTEM,
  script: SCRIPT_SYSTEM,
  caption: CAPTION_SYSTEM,
  live: LIVE_SYSTEM,
  calendar: CALENDAR_SYSTEM,
  analysis: ANALYSIS_SYSTEM,
};

function schemaFor(tool: ToolKey, count: number) {
  switch (tool) {
    case "hook":
      return z.object({ hooks: z.array(z.string().min(3).max(200).refine(noStock, stockMsg)).length(count) });
    case "caption":
      return z.object({ captions: z.array(z.string().min(10).max(600).refine(noStock, stockMsg)).length(count) });
    case "script":
      return z.object({
        scripts: z
          .array(z.object({ angle: z.string().max(40), script: z.string().min(30).max(1200).refine(noStock, stockMsg) }))
          .length(count),
      });
    case "live":
      return z.object({
        sections: z
          .array(z.object({ title: z.string().max(60), script: z.string().min(20).max(1600).refine(noStock, stockMsg) }))
          .length(7),
      });
    case "calendar":
      return z.object({
        days: z
          .array(
            z.object({
              day: z.number().int().min(1).max(7),
              format: z.string().max(40),
              angle: z.string().max(120),
              idea: z.string().min(10).max(400).refine(noStock, stockMsg),
            }),
          )
          .length(7),
      });
    case "analysis":
      return z.object({
        sections: z
          .array(z.object({ title: z.string().max(60), body: z.string().min(20).max(1600).refine(noStock, stockMsg) }))
          .length(7),
      });
  }
}

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Server belum siap." }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Silakan login dulu." }, { status: 401 });

  if (!rateLimit(`tools:${clientIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Terlalu cepat. Tunggu sebentar lalu coba lagi." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Isi nama produk, jenis, dan platform dulu." }, { status: 400 });
  const { tool, product_name, product_type, platform } = parsed.data;
  // Fixed-shape tools (live, calendar) ignore the requested count.
  const count = TOOL_META[tool].hasCount ? parsed.data.count : TOOL_META[tool].defaultCount;

  const hash = createHash("sha256")
    .update(`${tool}|${count}|${product_name.toLowerCase()}|${product_type.toLowerCase()}|${platform}`)
    .digest("hex");

  const countToday = async () =>
    (await supabase
      .from("tool_generations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfToday())).count ?? 0;

  // 1. Cache hit — free, does not use the daily quota.
  const { data: cached } = await supabase
    .from("tool_cache")
    .select("output")
    .eq("input_hash", hash)
    .eq("tool", tool)
    .gte("created_at", since(24))
    .maybeSingle();
  if (cached?.output) {
    return NextResponse.json({ output: cached.output, used_today: await countToday(), limit: TOOL_DAILY_LIMIT, cached: true });
  }

  // 2. Daily quota.
  const used = await countToday();
  if (used >= TOOL_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Batas ${TOOL_DAILY_LIMIT} generate per hari sudah tercapai. Coba lagi besok.`, used_today: used, limit: TOOL_DAILY_LIMIT },
      { status: 429 },
    );
  }

  // 3. Generate.
  const noun = TOOL_META[tool].noun;
  const prompt = `Buat tepat ${count} ${noun}.\nProduk & deskripsi: ${product_name}\nJenis produk: ${product_type}\nPlatform: ${toolPlatformLabel(platform)}`;
  let output: unknown;
  try {
    const { object } = await generateObject({
      model: google(MODEL),
      schema: schemaFor(tool, count),
      temperature: 1,
      maxRetries: 3,
      system: SYSTEM[tool],
      prompt,
    });
    const o = object as Record<string, unknown>;
    output = o.hooks ?? o.captions ?? o.scripts ?? o.sections ?? o.days;
  } catch (error) {
    console.error("[tools/generate]", error);
    return NextResponse.json({ error: "AI sedang sibuk. Coba lagi sebentar." }, { status: 502 });
  }

  // 4. Record + cache (best effort).
  await supabase.from("tool_generations").insert({ owner_id: user.id, tool, input: parsed.data, input_hash: hash, output });
  await supabase.from("tool_cache").upsert({ input_hash: hash, tool, output, created_at: new Date().toISOString() });

  return NextResponse.json({ output, used_today: used + 1, limit: TOOL_DAILY_LIMIT, cached: false });
}
