export type Profile = {
  id: string;
  owner_id?: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  category: string;
  status: "draft" | "published" | "suspended";
  theme?: "default" | "midnight" | "lime" | "coral" | "blossom" | "ocean" | "sunset" | "grape" | "mint" | "mono";
  accent_color?: string;
  button_style?: "fill" | "outline" | "shadow";
  button_shape?: "sharp" | "rounded" | "pill";
  banner_url?: string;
  layout?: "classic" | "full";
  claim_email?: string;
  level?: "All Star" | "Featured" | "Rising";
  is_featured: boolean;
  featured_order: number;
};

export type Brand = {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  is_active: boolean;
  sort_order: number;
};

export type ProfileLink = {
  id: string;
  profile_id: string;
  label: string;
  url: string;
  link_type: string;
  block_type?: BlockType;
  content?: BlockContent;
  icon_key: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  affiliate_disclosure: boolean;
};

export type BlockType = "link" | "text" | "social" | "photo" | "product";

export type SocialItem = { platform: string; url: string };

export type BlockContent = {
  html?: string;
  items?: SocialItem[];
  caption?: string;
  /** WhatsApp link shown as a floating button (bottom-right) instead of in the list. */
  wa_float?: boolean;
  /** Product block: display price, e.g. "Rp 89.000". */
  price?: string;
  /** Product block: crossed-out original price. */
  price_original?: string;
  /** Product block: marketplace the link came from (shopee/tokopedia/tiktok/lazada/web). */
  source?: string;
};
