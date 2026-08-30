import { z } from "zod";
import { LINK_TYPES } from "./link-types";
import { MINISITE_THEME_VALUES, BUTTON_STYLE_VALUES, BUTTON_SHAPE_VALUES, LAYOUT_VALUES } from "./themes";
import { SOCIAL_PLATFORMS, sanitizeRichText, richTextIsEmpty } from "./blocks";

// Keep this list in sync with the profiles_username_not_reserved CHECK
// constraint in supabase/migrations/20260829090000_phase0_roles_and_rls.sql
export const RESERVED_USERNAMES = new Set([
  "admin", "superadmin", "administrator", "userpanel", "user", "users",
  "members", "member", "about", "support", "contact", "help", "api", "auth",
  "login", "logout", "signin", "signup", "register", "dashboard", "settings",
  "account", "profile", "profiles", "brands", "brand", "faq", "privacy",
  "terms", "legal", "report", "reports", "static", "assets", "public", "www",
  "mail", "blog", "news", "home", "index", "null", "undefined", "next",
  "_next", "vercel", "supabase", "picnic", "picnicclub",
  "l", "r", "go", "track", "sitemap", "robots", "pelanggaran",
]);

export function isReservedUsername(username: string) {
  return RESERVED_USERNAMES.has(username.trim().toLowerCase());
}

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username minimal 3 karakter.")
  .max(30, "Username maksimal 30 karakter.")
  .regex(/^[a-z0-9._-]+$/, "Hanya huruf kecil, angka, titik, garis bawah, dan strip.")
  .refine((value) => !isReservedUsername(value), "Username ini tidak tersedia.");

// Only real web links. Blocks javascript:, data:, mailto-less schemes, etc.
export const linkUrlSchema = z
  .string()
  .trim()
  .min(1, "URL wajib diisi.")
  .max(2048, "URL terlalu panjang.")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Masukkan URL http(s) yang valid.");

const displayNameField = z.string().trim().min(1, "Nama tampilan wajib diisi.").max(60);
const bioField = z.string().trim().max(280, "Bio maksimal 280 karakter.").default("");
const categoryField = z.string().trim().min(1).max(40).default("Lifestyle");
const avatarUrlField = z.union([linkUrlSchema, z.literal("")]).default("");

export const profileSchema = z.object({
  username: usernameSchema,
  display_name: displayNameField,
  bio: bioField,
  category: categoryField,
  avatar_url: avatarUrlField,
});

/** Minisite appearance settings (the "Tema minisite" panel). */
export const appearanceSchema = z.object({
  theme: z.enum(MINISITE_THEME_VALUES).default("default"),
  accent_color: z.union([z.string().regex(/^#[0-9a-fA-F]{6}$/), z.literal("")]).default(""),
  button_style: z.enum(BUTTON_STYLE_VALUES).default("fill"),
  button_shape: z.enum(BUTTON_SHAPE_VALUES).default("rounded"),
  layout: z.enum(LAYOUT_VALUES).default("classic"),
});

/** Fields a creator can edit themselves from /userpanel (username is fixed). */
export const profileSettingsSchema = z.object({
  display_name: displayNameField,
  bio: bioField,
  category: categoryField,
  avatar_url: avatarUrlField,
  theme: z.enum(MINISITE_THEME_VALUES).default("default"),
});

const linkTypeValues = LINK_TYPES.map((t) => t.value) as [string, ...string[]];

export const linkSchema = z.object({
  label: z.string().trim().min(1, "Label wajib diisi.").max(80),
  url: linkUrlSchema,
  link_type: z.enum(linkTypeValues).default("link"),
  image_url: avatarUrlField,
  affiliate_disclosure: z.boolean().default(false),
});

const socialPlatformValues = SOCIAL_PLATFORMS.map((p) => p.key) as [string, ...string[]];

const socialUrlSchema = z
  .string()
  .trim()
  .min(1, "URL wajib diisi.")
  .max(2048, "URL terlalu panjang.")
  .refine((value) => {
    if (/^mailto:/i.test(value)) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Masukkan URL yang valid.");

export const textBlockSchema = z.object({
  html: z
    .string()
    .max(4000, "Teks terlalu panjang.")
    .transform((value) => sanitizeRichText(value))
    .refine((value) => !richTextIsEmpty(value), "Teks tidak boleh kosong."),
});

export const socialBlockSchema = z.object({
  items: z
    .array(
      z.object({
        platform: z.enum(socialPlatformValues),
        url: socialUrlSchema,
      }),
    )
    .min(1, "Tambahkan minimal satu akun.")
    .max(12, "Maksimal 12 akun."),
});

export const photoBlockSchema = z.object({
  image_url: linkUrlSchema,
  url: z.union([linkUrlSchema, z.literal("")]).default(""),
  caption: z.string().trim().max(120, "Caption maksimal 120 karakter.").default(""),
});

export const productBlockSchema = z.object({
  label: z.string().trim().min(1, "Nama produk wajib diisi.").max(120, "Nama produk maksimal 120 karakter."),
  url: linkUrlSchema,
  image_url: z.union([linkUrlSchema, z.literal("")]).default(""),
  price: z.string().trim().max(40, "Harga maksimal 40 karakter.").default(""),
  price_original: z.string().trim().max(40, "Harga maksimal 40 karakter.").default(""),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type LinkInput = z.infer<typeof linkSchema>;

/** Flatten a ZodError into a single readable message for inline form errors. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}
