import { demoLinks, demoProfiles } from "./demo-data";
import { getPublicSupabase } from "./supabase-server";
import { isReservedUsername } from "./validation";
import { Profile, ProfileLink } from "./types";

function withLevel(profile: Profile): Profile {
  return { ...profile, level: profile.level ?? (profile.is_featured ? "All Star" : "Rising") };
}

export async function getPublishedProfiles(): Promise<Profile[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return demoProfiles.filter((profile) => profile.status === "published");
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "published")
    .order("featured_order");
  return ((data as Profile[] | null) ?? []).map(withLevel);
}

export async function getProfile(
  username: string,
): Promise<{ profile: Profile; links: ProfileLink[] } | null> {
  const normalized = decodeURIComponent(username).replace(/^@/, "").trim().toLowerCase();
  if (!normalized || isReservedUsername(normalized)) return null;

  const supabase = getPublicSupabase();
  if (!supabase) {
    const profile = demoProfiles.find(
      (item) => item.username.toLowerCase() === normalized && item.status === "published",
    );
    return profile
      ? { profile: withLevel(profile), links: demoLinks.filter((link) => link.profile_id === profile.id) }
      : null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", normalized)
    .eq("status", "published")
    .maybeSingle();
  if (!profile) return null;

  const { data: links } = await supabase
    .from("profile_links")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_active", true)
    .order("sort_order");
  return { profile: withLevel(profile as Profile), links: (links as ProfileLink[]) ?? [] };
}
