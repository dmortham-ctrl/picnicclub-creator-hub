"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Profile, ProfileLink } from "@/lib/types";

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const username = decodeURIComponent(params.username).replace(/^@/, "").toLowerCase();
    if (!supabase) return setLoading(false);
    const client = supabase;
    client.from("profiles").select("*").eq("username", username).eq("status", "published").maybeSingle().then(async ({ data, error: profileError }) => {
      if (profileError) setError(profileError.message);
      setProfile(data as Profile | null);
      if (data) {
        const { data: profileLinks } = await client.from("profile_links").select("*").eq("profile_id", data.id).eq("is_active", true).order("sort_order");
        setLinks((profileLinks as ProfileLink[]) ?? []);
      }
      setLoading(false);
    });
  }, [params.username]);

  if (loading) return <main className="bio-page"><div className="bio-card"><div className="bio-brand">picnic club</div><p className="bio-copy">Loading profile...</p></div></main>;
  if (!profile) return <main className="bio-page"><div className="bio-card"><div className="bio-brand">picnic club</div><h1 style={{ marginTop: 100 }}>{error ? "Could not load profile." : "Page not found."}</h1><p className="bio-copy">{error || "Profile ini belum tersedia atau sudah tidak aktif."}</p><Link className="button-dark" href="/members">Back to creators</Link></div></main>;
  return <main className="bio-page"><div className="bio-card"><div className="bio-brand">picnic club</div><img className="bio-avatar" src={profile.avatar_url} alt={profile.display_name} /><h1>{profile.display_name}</h1><div className="bio-username">@{profile.username} · {profile.category}</div><p className="bio-copy">{profile.bio}</p>{links.map((link) => <a className="bio-link" href={link.url} key={link.id} target="_blank" rel="noreferrer">{link.label}<ExternalLink size={15} style={{ position: "absolute", right: 17 }} />{link.affiliate_disclosure && <small>affiliate</small>}</a>)}<div className="bio-footer">Part of the Picnic Club community ↗</div></div></main>;
}
