import { demoLinks, demoProfiles } from "./demo-data";
import { supabase } from "./supabase";
import { Profile, ProfileLink } from "./types";

export async function getPublishedProfiles(): Promise<Profile[]> {
  if (!supabase) return demoProfiles.filter((profile) => profile.status === "published");
  const { data } = await supabase.from("profiles").select("*").eq("status", "published").order("featured_order");
  return (data as Profile[] | null) ?? [];
}

export async function getProfile(username: string): Promise<{ profile: Profile; links: ProfileLink[] } | null> {
  if (!supabase) {
    const profile = demoProfiles.find((item) => item.username.toLowerCase() === username.toLowerCase() && item.status === "published");
    return profile ? { profile, links: demoLinks.filter((link) => link.profile_id === profile.id) } : null;
  }
  const { data: profile } = await supabase.from("profiles").select("*").ilike("username", username).eq("status", "published").maybeSingle();
  if (!profile) return null;
  const { data: links } = await supabase.from("profile_links").select("*").eq("profile_id", profile.id).eq("is_active", true).order("sort_order");
  return { profile: profile as Profile, links: (links as ProfileLink[]) ?? [] };
}
