export type Profile = {
  id: string;
  owner_id?: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  category: string;
  status: "draft" | "published" | "suspended";
  theme?: "default" | "midnight" | "lime" | "coral";
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
  icon_key: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  affiliate_disclosure: boolean;
};
