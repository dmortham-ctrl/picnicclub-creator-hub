import { z } from "zod";
import { LINK_TYPES } from "./link-types";

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

export const profileSchema = z.object({
  username: usernameSchema,
  display_name: z.string().trim().min(1, "Nama tampilan wajib diisi.").max(60),
  bio: z.string().trim().max(280, "Bio maksimal 280 karakter.").default(""),
  category: z.string().trim().min(1).max(40).default("Lifestyle"),
  avatar_url: z.union([linkUrlSchema, z.literal("")]).default(""),
});

const linkTypeValues = LINK_TYPES.map((t) => t.value) as [string, ...string[]];

export const linkSchema = z.object({
  label: z.string().trim().min(1, "Label wajib diisi.").max(80),
  url: linkUrlSchema,
  link_type: z.enum(linkTypeValues).default("link"),
  affiliate_disclosure: z.boolean().default(false),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type LinkInput = z.infer<typeof linkSchema>;

/** Flatten a ZodError into a single readable message for inline form errors. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}
