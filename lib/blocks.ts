import type { BlockType } from "./types";

export const BLOCK_TYPES: { value: BlockType; label: string; hint: string }[] = [
  { value: "link", label: "Link", hint: "Tombol menuju satu URL." },
  { value: "product", label: "Produk", hint: "Kartu produk otomatis dari link Shopee, TikTok Shop, dll." },
  { value: "social", label: "Social media", hint: "Deretan ikon akun sosial kamu." },
  { value: "text", label: "Teks", hint: "Judul atau paragraf dengan format." },
  { value: "photo", label: "Foto", hint: "Satu gambar, bisa diklik ke link." },
];

/** Marketplace label from a product link's host. */
export function productSourceLabel(source?: string): string {
  const map: Record<string, string> = {
    shopee: "Shopee",
    tokopedia: "Tokopedia",
    tiktok: "TikTok Shop",
    lazada: "Lazada",
  };
  return source ? map[source] ?? "" : "";
}

export function blockTypeLabel(value: string): string {
  return BLOCK_TYPES.find((b) => b.value === value)?.label ?? "Link";
}

/**
 * Social platforms shown in the "Social media" block. `key` maps to a brand
 * glyph in app/components/social-icons.tsx; `prefix` pre-fills the URL field.
 */
export const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/username" },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/username" },
  { key: "threads", label: "Threads", placeholder: "https://threads.net/@username" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/62..." },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/username" },
  { key: "shopee", label: "Shopee", placeholder: "https://shopee.co.id/username" },
  { key: "tokopedia", label: "Tokopedia", placeholder: "https://tokopedia.com/store" },
  { key: "lazada", label: "Lazada", placeholder: "https://lazada.co.id/shop/..." },
  { key: "tiktokshop", label: "TikTok Shop", placeholder: "https://vt.tokopedia.com/..." },
  { key: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/username" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "snapchat", label: "Snapchat", placeholder: "https://snapchat.com/add/username" },
  { key: "discord", label: "Discord", placeholder: "https://discord.gg/invite" },
  { key: "email", label: "Email", placeholder: "mailto:you@email.com" },
  { key: "website", label: "Website", placeholder: "https://..." },
] as const;

export function socialPlatformLabel(key: string): string {
  return SOCIAL_PLATFORMS.find((p) => p.key === key)?.label ?? key;
}

/**
 * Isomorphic allow-list sanitizer for the rich-text block. Keeps a small set of
 * formatting tags, strips every attribute except a validated http(s) href on
 * <a>, and removes script/style entirely. Runs on save and again on render.
 */
const ALLOWED_TAGS = new Set(["p", "br", "b", "strong", "i", "em", "u", "s", "a", "ul", "ol", "li", "h3"]);

export function sanitizeRichText(input: string): string {
  if (!input) return "";
  let html = input.replace(/<\s*(script|style)[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<\/?([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (match, rawTag, attrs) => {
    const tag = String(rawTag).toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (match.startsWith("</")) return `</${tag}>`;
    if (tag === "a") {
      const href =
        (attrs.match(/href\s*=\s*"([^"]*)"/i) || attrs.match(/href\s*=\s*'([^']*)'/i) || [])[1] || "";
      if (/^https?:\/\//i.test(href)) {
        return `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noreferrer nofollow">`;
      }
      return "<a>";
    }
    return `<${tag}>`;
  });
  return html.trim();
}

export function richTextIsEmpty(html: string): boolean {
  return sanitizeRichText(html).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim().length === 0;
}
