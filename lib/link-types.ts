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
