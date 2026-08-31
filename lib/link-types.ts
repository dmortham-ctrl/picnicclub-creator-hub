// Supported minisite link types. `icon` maps to app/components/link-icon.tsx.
export const LINK_TYPES = [
  { value: "link", label: "Website / link lain", icon: "link" },
  { value: "tiktok", label: "TikTok", icon: "tiktok" },
  { value: "instagram", label: "Instagram", icon: "instagram" },
  { value: "youtube", label: "YouTube", icon: "youtube" },
  { value: "facebook", label: "Facebook", icon: "facebook" },
  { value: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { value: "shop", label: "Toko / produk (Shopee, TikTok Shop, Tokopedia, dll)", icon: "shop" },
  { value: "email", label: "Email", icon: "email" },
] as const;

export type LinkTypeValue = (typeof LINK_TYPES)[number]["value"];

const byValue = new Map(LINK_TYPES.map((t) => [t.value, t]));

export function linkTypeMeta(value: string) {
  return byValue.get(value as LinkTypeValue) ?? LINK_TYPES[0];
}

/**
 * Turn whatever the creator typed for a WhatsApp contact — a local number
 * (0857…), an international number (62857…), or a wa.me link with a bad number —
 * into a working `https://wa.me/62…` link. `wa.me/085…` opens as a username
 * ("@085…") and fails, which is the bug this fixes.
 */
export function normalizeWhatsappUrl(raw: string): string {
  const input = (raw ?? "").trim();
  if (!input) return "";

  let phonePart = input;
  let query = "";
  try {
    const u = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    const host = u.hostname.toLowerCase();
    // Group invite links are not phone numbers — leave them alone.
    if (host === "chat.whatsapp.com") return input;
    if (host === "wa.me" || host === "api.whatsapp.com" || host === "web.whatsapp.com" || host.endsWith(".wa.me")) {
      query = u.searchParams.get("text") ? `?text=${encodeURIComponent(u.searchParams.get("text")!)}` : "";
      phonePart = u.searchParams.get("phone") || u.pathname.replace(/^\/+/, "");
    } else if (/^https?:\/\//i.test(input)) {
      return input; // some other URL the creator pasted — don't touch it
    }
  } catch {
    // not a URL — treat the whole thing as a phone number
  }

  let digits = phonePart.replace(/\D/g, "");
  if (digits.startsWith("620")) digits = `62${digits.slice(3)}`;
  else if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  if (!digits) return "";
  return `https://wa.me/${digits}${query}`;
}

/** Best-effort guess of link type from a URL, for a friendlier add form. */
export function guessLinkType(url: string): LinkTypeValue {
  const u = url.toLowerCase();
  if (u.startsWith("mailto:")) return "email";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("facebook.com") || u.includes("fb.com") || u.includes("fb.me")) return "facebook";
  if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
  if (u.includes("shopee.") || u.includes("tokopedia.") || u.includes("lazada.") || u.includes("/shop"))
    return "shop";
  return "link";
}
