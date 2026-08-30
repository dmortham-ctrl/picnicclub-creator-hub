import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getServerSupabase } from "@/lib/supabase-server";

// Best-effort scrape of a product page for the "Katalog Produk" block: follows
// redirects (affiliate short links -> real product), then reads OpenGraph tags
// and JSON-LD Product schema for name / image / price. Every field is optional —
// the editor always keeps manual inputs so a failed scrape isn't a dead end.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const MAX_HTML = 900_000;

function sourceFromHost(host: string): string {
  const h = host.toLowerCase();
  if (h.includes("shopee") || h.includes("shp.ee") || h.includes("shope.ee")) return "shopee";
  if (h.includes("tokopedia") || h.includes("tokped")) return "tokopedia";
  if (h.includes("tiktok") || h.includes("tiktokw.us") || h.includes("ibyteimg")) return "tiktok";
  if (h.includes("lazada") || h.includes("lzd.co")) return "lazada";
  return "web";
}

function metaContent(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
      "i",
    );
    const tag = html.match(re)?.[0];
    if (!tag) continue;
    const content = tag.match(/content=["']([^"']*)["']/i)?.[1];
    if (content) return decodeEntities(content.trim());
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/gi, "/");
}

type Found = { title?: string; image?: string; price?: string };

function fromJsonLd(html: string): Found {
  const out: Found = {};
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of blocks) {
    const raw = block.replace(/^[\s\S]*?>/, "").replace(/<\/script>$/i, "");
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }
    const nodes = Array.isArray(json) ? json : [json];
    const queue = [...nodes];
    while (queue.length) {
      const node = queue.shift();
      if (!node || typeof node !== "object") continue;
      const n = node as Record<string, unknown>;
      if (Array.isArray(n["@graph"])) queue.push(...(n["@graph"] as unknown[]));
      const type = String(n["@type"] ?? "").toLowerCase();
      if (type !== "product") continue;
      if (!out.title && typeof n.name === "string") out.title = n.name.trim();
      const image = Array.isArray(n.image) ? n.image[0] : n.image;
      if (!out.image && typeof image === "string") out.image = image;
      const offers = Array.isArray(n.offers) ? n.offers[0] : n.offers;
      if (offers && typeof offers === "object") {
        const o = offers as Record<string, unknown>;
        const price = o.price ?? o.lowPrice;
        if (!out.price && (typeof price === "string" || typeof price === "number")) {
          const cur = typeof o.priceCurrency === "string" ? o.priceCurrency : "";
          out.price = formatPrice(String(price), cur);
        }
      }
    }
  }
  return out;
}

function formatPrice(amount: string, currency: string): string {
  const num = Number(String(amount).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(num) || num <= 0) return "";
  const grouped = Math.round(num).toLocaleString("id-ID");
  if (/idr|rp/i.test(currency) || currency === "") return `Rp ${grouped}`;
  return `${currency} ${grouped}`;
}

export async function POST(request: Request) {
  if (!rateLimit(`product-preview:${clientIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Terlalu cepat. Coba lagi sebentar." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  const input = body?.url?.trim() ?? "";
  let target: URL;
  try {
    target = new URL(input);
    if (target.protocol !== "http:" && target.protocol !== "https:") throw new Error("scheme");
  } catch {
    return NextResponse.json({ error: "Masukkan URL http(s) yang valid." }, { status: 400 });
  }

  let html = "";
  let finalUrl = target.toString();
  try {
    const res = await fetch(target, {
      headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9,en;q=0.8", accept: "text/html,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    finalUrl = res.url || finalUrl;
    if (res.ok) {
      const reader = res.body?.getReader();
      if (reader) {
        const chunks: Uint8Array[] = [];
        let size = 0;
        // Read only the <head> region — enough for meta tags, avoids huge bodies.
        for (;;) {
          const { done, value } = await reader.read();
          if (done || !value) break;
          chunks.push(value);
          size += value.length;
          if (size >= MAX_HTML) break;
          if (Buffer.concat(chunks).toString("utf8").includes("</head>")) break;
        }
        reader.cancel().catch(() => {});
        html = Buffer.concat(chunks).toString("utf8");
      } else {
        html = await res.text();
      }
    }
  } catch {
    // Network / timeout / blocked — fall through with whatever we have.
  }

  const host = (() => {
    try {
      return new URL(finalUrl).host;
    } catch {
      return target.host;
    }
  })();

  const ld = fromJsonLd(html);
  const title =
    ld.title ||
    metaContent(html, ["og:title", "twitter:title"]) ||
    decodeEntities((html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim()) ||
    null;
  const rawImage = ld.image || metaContent(html, ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"]) || null;
  const priceAmount = metaContent(html, ["product:price:amount", "og:price:amount"]);
  const priceCurrency = metaContent(html, ["product:price:currency", "og:price:currency"]) ?? "";
  const price = ld.price || (priceAmount ? formatPrice(priceAmount, priceCurrency) : "") || null;

  // Re-host the product photo on our storage so it survives the marketplace CDN
  // rotating URLs or blocking hot-linking. Falls back to the raw URL on failure.
  let image: string | null = rawImage && /^https?:\/\//i.test(rawImage) ? rawImage : null;
  if (image) {
    const rehosted = await rehostImage(image).catch(() => null);
    if (rehosted) image = rehosted;
  }

  return NextResponse.json({ title: title ? title.slice(0, 120) : null, image, price, url: finalUrl, source: sourceFromHost(host) });
}

async function rehostImage(src: string): Promise<string | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const res = await fetch(src, {
    headers: { "user-agent": UA, referer: new URL(src).origin },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") ?? "image/jpeg";
  if (!type.startsWith("image/")) return null;
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength === 0 || buf.byteLength > 6_000_000) return null;

  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("Avatar").upload(path, buf, { contentType: type, upsert: false });
  if (error) return null;
  return supabase.storage.from("Avatar").getPublicUrl(path).data.publicUrl;
}
