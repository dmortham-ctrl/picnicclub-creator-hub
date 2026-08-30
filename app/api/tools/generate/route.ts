import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { getServerSupabase } from "@/lib/supabase-server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  TOOL_DAILY_LIMIT,
  TOOL_PLATFORM_VALUES,
  toolPlatformLabel,
  HOOK_SYSTEM,
  SCRIPT_SYSTEM,
} from "@/lib/picnic-tools";

// gemini-flash-lite is fast (~2s) and cheap; plenty for short marketing copy.
// The `-latest` alias tracks the newest lite release with no code changes.
const MODEL = "gemini-flash-lite-latest";

const bodySchema = z.object({
  tool: z.enum(["hook", "script"]),
  product_name: z.string().trim().min(2).max(120),
  product_type: z.string().trim().min(2).max(80),
  platform: z.enum(TOOL_PLATFORM_VALUES),
});

const hookSchema = z.object({ hooks: z.array(z.string().min(3).max(200)).length(10) });
const scriptSchema = z.object({
  scripts: z.array(z.object({ angle: z.string().max(40), script: z.string().min(30).max(1200) })).length(3),
});

function since(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
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

  const hash = createHash("sha256")
    .update(`${tool}|${product_name.toLowerCase()}|${product_type.toLowerCase()}|${platform}`)
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
    return NextResponse.json({
      output: cached.output,
      used_today: await countToday(),
      limit: TOOL_DAILY_LIMIT,
      cached: true,
    });
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
  const promptInput = `Produk: ${product_name}\nJenis produk: ${product_type}\nPlatform: ${toolPlatformLabel(platform)}`;
  let output: unknown;
  try {
    if (tool === "hook") {
      const { object } = await generateObject({
        model: google(MODEL),
        schema: hookSchema,
        temperature: 1,
        system: HOOK_SYSTEM,
        prompt: promptInput,
      });
      output = object.hooks;
    } else {
      const { object } = await generateObject({
        model: google(MODEL),
        schema: scriptSchema,
        temperature: 1,
        system: SCRIPT_SYSTEM,
        prompt: promptInput,
      });
      output = object.scripts;
    }
  } catch (error) {
    console.error("[tools/generate]", error);
    return NextResponse.json({ error: "AI sedang sibuk. Coba lagi sebentar." }, { status: 502 });
  }

  // 4. Record + cache (best effort).
  await supabase.from("tool_generations").insert({ owner_id: user.id, tool, input: parsed.data, input_hash: hash, output });
  await supabase.from("tool_cache").upsert({ input_hash: hash, tool, output, created_at: new Date().toISOString() });

  return NextResponse.json({ output, used_today: used + 1, limit: TOOL_DAILY_LIMIT, cached: false });
}
