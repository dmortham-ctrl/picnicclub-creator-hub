"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile, ProfileLink } from "@/lib/types";
import { firstIssue, linkSchema } from "@/lib/validation";

export default function UserPanelPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [newLink, setNewLink] = useState({ label: "", url: "", affiliate_disclosure: false });
  const [savingLink, setSavingLink] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const requestedUsername = search.get("username") ?? "";
    setUsername(requestedUsername);
    if (!supabase || !requestedUsername) return;
    const client = supabase;
    client.from("profiles").select("*").eq("username", requestedUsername).maybeSingle().then(async ({ data, error: queryError }) => {
      if (queryError) setError(queryError.message);
      setProfile(data as Profile | null);
      if (data) {
        const { data: profileLinks, error: linksError } = await client.from("profile_links").select("*").eq("profile_id", data.id).order("sort_order");
        if (linksError) setError(linksError.message);
        setLinks((profileLinks as ProfileLink[]) ?? []);
      }
    });
  }, []);

  async function addLink(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !profile) return;
    const parsed = linkSchema.safeParse(newLink);
    if (!parsed.success) return setError(firstIssue(parsed.error));
    setError("");
    setSavingLink(true);
    const { data, error: linkError } = await supabase.from("profile_links").insert({ profile_id: profile.id, ...parsed.data, link_type: "link", icon_key: "link", sort_order: links.length + 1, is_active: true }).select().single();
    if (linkError) setError(linkError.message);
    if (data) { setLinks([...links, data as ProfileLink]); setNewLink({ label: "", url: "", affiliate_disclosure: false }); }
    setSavingLink(false);
  }

  async function removeLink(id: string) {
    if (!supabase) return;
    const { error: linkError } = await supabase.from("profile_links").delete().eq("id", id);
    if (linkError) return setError(linkError.message);
    setLinks(links.filter((link) => link.id !== id));
  }

  async function togglePublished() {
    if (!profile) return;
    const status = profile.status === "published" ? "draft" : "published";
    const response = await fetch("/api/profile-visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id, status }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setError(result.error ?? "Gagal memperbarui status.");
    setError("");
    setProfile({ ...profile, status });
  }

  return <main className="admin-wrap"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Link href="/" className="brand"><span className="brand-mark">P</span> picnic club</Link><Link href="/admin" className="button-outline">Edit profile</Link></div><section className="panel-hero"><div className="eyebrow">Creator dashboard / 001</div><h1>Your space<br />is live.</h1><p className="hero-copy">Kelola profil dan bagikan halaman creator Anda dari satu tempat.</p></section>{error && <p className="error">{error}</p>}{profile ? <><div className="panel-grid"><div className="admin-card panel-profile"><img src={profile.avatar_url} alt={profile.display_name} /><div><div className="eyebrow">{profile.status}</div><h2>{profile.display_name}</h2><p className="bio-username">@{profile.username} · {profile.category}</p><p className="hero-copy">{profile.bio}</p></div></div><div className="admin-card panel-actions"><div className="eyebrow">Your minisite</div><strong>picnicclub.id/@{profile.username}</strong><Link className="button-dark" href={`/@${profile.username}`}>View public page ↗</Link><button className="button-outline" type="button" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/@${profile.username}`)}>Copy profile link</button><button className="button-outline" type="button" onClick={togglePublished}>{profile.status === "published" ? "Unpublish page" : "Publish page"}</button></div></div><div className="admin-card link-manager"><div className="eyebrow">Minisite links / 002</div><h2>Build your link stack.</h2><div className="admin-list">{links.map((link) => <div className="admin-item" key={link.id}><div><strong>{link.label}</strong><small>{link.url}</small></div><button className="button-outline" type="button" onClick={() => removeLink(link.id)}>Remove</button></div>)}{links.length === 0 && <p className="hero-copy">Belum ada link. Tambahkan link pertama Anda.</p>}</div><form className="admin-form link-form" onSubmit={addLink}><div className="admin-row"><label>Label<input required value={newLink.label} onChange={(event) => setNewLink({ ...newLink, label: event.target.value })} placeholder="My favorite finds" /></label><label>URL<input required type="url" value={newLink.url} onChange={(event) => setNewLink({ ...newLink, url: event.target.value })} placeholder="https://..." /></label></div><label className="checkbox-label"><input type="checkbox" checked={newLink.affiliate_disclosure} onChange={(event) => setNewLink({ ...newLink, affiliate_disclosure: event.target.checked })} /> This is an affiliate or paid link</label><button className="button-dark" type="submit" disabled={savingLink}>{savingLink ? "Adding..." : "Add link"}</button></form></div></> : <div className="admin-card"><p>{username ? "Loading profile..." : "Profile belum dipilih."}</p></div>}<Link href="/" className="panel-back">← Back to homepage</Link></main>;
}
