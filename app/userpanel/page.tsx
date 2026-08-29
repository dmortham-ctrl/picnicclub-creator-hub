"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile, ProfileLink } from "@/lib/types";
import { firstIssue, linkSchema, profileSettingsSchema } from "@/lib/validation";
import { guessLinkType, LINK_TYPES } from "@/lib/link-types";
import { MINISITE_THEMES } from "@/lib/themes";
import { LinkIcon } from "@/app/components/link-icon";
import { BrandLogo } from "@/app/components/brand-logo";

type ProfileDraft = { display_name: string; bio: string; category: string; avatar_url: string; theme: string };

type LinkDraft = { label: string; url: string; link_type: string; affiliate_disclosure: boolean };
const emptyDraft: LinkDraft = { label: "", url: "", link_type: "link", affiliate_disclosure: false };

export default function UserPanelPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [newLink, setNewLink] = useState<LinkDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<LinkDraft>(emptyDraft);
  const [savingLink, setSavingLink] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({ display_name: "", bio: "", category: "", avatar_url: "", theme: "default" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

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

  function resortState(rows: ProfileLink[]) {
    return [...rows].sort((a, b) => a.sort_order - b.sort_order);
  }

  async function addLink(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !profile) return;
    const parsed = linkSchema.safeParse(newLink);
    if (!parsed.success) return setError(firstIssue(parsed.error));
    setError("");
    setSavingLink(true);
    const nextOrder = links.length ? Math.max(...links.map((l) => l.sort_order)) + 1 : 1;
    const { data, error: linkError } = await supabase
      .from("profile_links")
      .insert({ profile_id: profile.id, ...parsed.data, icon_key: parsed.data.link_type, sort_order: nextOrder, is_active: true })
      .select()
      .single();
    if (linkError) setError(linkError.message);
    if (data) {
      setLinks(resortState([...links, data as ProfileLink]));
      setNewLink(emptyDraft);
      setNotice("Link ditambahkan.");
    }
    setSavingLink(false);
  }

  async function saveEdit(id: string) {
    if (!supabase) return;
    const parsed = linkSchema.safeParse(editDraft);
    if (!parsed.success) return setError(firstIssue(parsed.error));
    setError("");
    const { error: updateError } = await supabase
      .from("profile_links")
      .update({ ...parsed.data, icon_key: parsed.data.link_type })
      .eq("id", id);
    if (updateError) return setError(updateError.message);
    setLinks(links.map((link) => (link.id === id ? { ...link, ...parsed.data } : link)));
    setEditingId(null);
    setNotice("Link diperbarui.");
  }

  async function toggleActive(link: ProfileLink) {
    if (!supabase) return;
    const { error: updateError } = await supabase.from("profile_links").update({ is_active: !link.is_active }).eq("id", link.id);
    if (updateError) return setError(updateError.message);
    setLinks(links.map((l) => (l.id === link.id ? { ...l, is_active: !l.is_active } : l)));
  }

  async function move(link: ProfileLink, direction: -1 | 1) {
    if (!supabase) return;
    const ordered = resortState(links);
    const index = ordered.findIndex((l) => l.id === link.id);
    const swapWith = ordered[index + direction];
    if (!swapWith) return;
    const a = { ...link, sort_order: swapWith.sort_order };
    const b = { ...swapWith, sort_order: link.sort_order };
    setLinks(resortState(links.map((l) => (l.id === a.id ? a : l.id === b.id ? b : l))));
    const [r1, r2] = await Promise.all([
      supabase.from("profile_links").update({ sort_order: a.sort_order }).eq("id", a.id),
      supabase.from("profile_links").update({ sort_order: b.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) setError((r1.error ?? r2.error)!.message);
  }

  async function removeLink(id: string) {
    if (!supabase) return;
    const { error: linkError } = await supabase.from("profile_links").delete().eq("id", id);
    if (linkError) return setError(linkError.message);
    setLinks(links.filter((link) => link.id !== id));
    setNotice("Link dihapus.");
  }

  async function setStatus(status: Profile["status"]) {
    if (!profile) return;
    const response = await fetch("/api/profile-visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id, status }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setError(result.error ?? "Gagal memperbarui status.");
    setError("");
    setProfile({ ...profile, status });
    setNotice(status === "published" ? "Halaman dipublikasikan." : "Halaman disembunyikan.");
  }

  function startEditProfile() {
    if (!profile) return;
    setProfileDraft({
      display_name: profile.display_name,
      bio: profile.bio,
      category: profile.category,
      avatar_url: profile.avatar_url,
      theme: profile.theme ?? "default",
    });
    setAvatarFile(null);
    setEditingProfile(true);
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !profile) return;
    const parsed = profileSettingsSchema.safeParse(profileDraft);
    if (!parsed.success) return setError(firstIssue(parsed.error));
    setError("");
    setSavingProfile(true);

    let avatarUrl = parsed.data.avatar_url;
    if (avatarFile) {
      if (!avatarFile.type.startsWith("image/")) { setError("Avatar harus berupa file gambar."); setSavingProfile(false); return; }
      if (avatarFile.size > 5 * 1024 * 1024) { setError("Ukuran avatar maksimal 5 MB."); setSavingProfile(false); return; }
      const path = `${crypto.randomUUID()}-${avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error: uploadError } = await supabase.storage.from("Avatar").upload(path, avatarFile, { contentType: avatarFile.type, upsert: false });
      if (uploadError) { setError(uploadError.message); setSavingProfile(false); return; }
      avatarUrl = supabase.storage.from("Avatar").getPublicUrl(path).data.publicUrl;
    }

    const patch = { ...parsed.data, avatar_url: avatarUrl };
    const { error: updateError } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    if (updateError) { setError(updateError.message); setSavingProfile(false); return; }

    setProfile({ ...profile, ...patch } as Profile);
    setEditingProfile(false);
    setSavingProfile(false);
    setNotice("Profil diperbarui.");
    if (profile.status === "published") {
      fetch("/api/profile-visibility", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: profile.id, status: "published" }) });
    }
  }

  async function setTheme(theme: string) {
    if (!supabase || !profile) return;
    const { error: updateError } = await supabase.from("profiles").update({ theme }).eq("id", profile.id);
    if (updateError) return setError(updateError.message);
    setProfile({ ...profile, theme: theme as Profile["theme"] });
    setNotice("Tema minisite diperbarui.");
    if (profile.status === "published") {
      fetch("/api/profile-visibility", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: profile.id, status: "published" }) });
    }
  }

  const ordered = resortState(links);

  return (
    <main className="admin-wrap">
      <div className="admin-topbar">
        <BrandLogo href="/" />
        <Link href="/" className="button-outline">View website ↗</Link>
      </div>
      {error && <p className="error">{error}</p>}
      {notice && !error && <p className="cms-message">{notice}</p>}
      {profile ? (
        <>
          <div className="panel-grid">
            <div className="admin-card panel-profile">
              {editingProfile ? (
                <form className="admin-form" onSubmit={saveProfile} style={{ flex: 1 }}>
                  <div className="admin-row">
                    <label>Display name<input required value={profileDraft.display_name} onChange={(e) => setProfileDraft({ ...profileDraft, display_name: e.target.value })} /></label>
                    <label>Category<input value={profileDraft.category} onChange={(e) => setProfileDraft({ ...profileDraft, category: e.target.value })} /></label>
                  </div>
                  <label>Bio<textarea rows={3} maxLength={280} value={profileDraft.bio} onChange={(e) => setProfileDraft({ ...profileDraft, bio: e.target.value })} /></label>
                  <div className="admin-row">
                    <label>Upload avatar<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} /></label>
                    <label>Avatar URL<input type="url" value={profileDraft.avatar_url} onChange={(e) => setProfileDraft({ ...profileDraft, avatar_url: e.target.value })} placeholder="https://..." /></label>
                  </div>
                  <div className="form-actions">
                    <button className="button-dark" type="submit" disabled={savingProfile}>{savingProfile ? "Menyimpan..." : "Simpan profil"}</button>
                    <button className="button-outline" type="button" onClick={() => setEditingProfile(false)}>Batal</button>
                  </div>
                </form>
              ) : (
                <>
                  {profile.avatar_url ? (
                    <Image className="panel-profile-avatar" src={profile.avatar_url} alt={profile.display_name} width={140} height={140} />
                  ) : (
                    <span className="panel-profile-avatar panel-profile-avatar--empty" aria-hidden="true" />
                  )}
                  <div className="panel-profile-info">
                    <h2>{profile.display_name}</h2>
                    <p className="bio-username">@{profile.username} · {profile.category}</p>
                    {profile.bio && <p className="hero-copy">{profile.bio}</p>}
                  </div>
                  <div className="panel-profile-meta">
                    <span className={`status-pill status-${profile.status}`}>{profile.status}</span>
                    <button className="button-outline" type="button" onClick={startEditProfile}>Edit profile</button>
                  </div>
                </>
              )}
            </div>
            <div className="admin-card panel-actions">
              <div className="eyebrow">Your minisite</div>
              <strong>picnicclub.id/@{profile.username}</strong>
              <Link className="button-dark" href={`/@${profile.username}`}>View public page ↗</Link>
              <button className="button-outline" type="button" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/@${profile.username}`); setNotice("Link disalin."); }}>Copy profile link</button>
              {profile.status === "published" ? (
                <button className="button-outline" type="button" onClick={() => setStatus("draft")}>Unpublish page</button>
              ) : (
                <button className="button-dark" type="button" onClick={() => setStatus("published")}>Publish page</button>
              )}
            </div>
          </div>

          <div className="admin-card">
            <div className="eyebrow">Minisite theme</div>
            <div className="theme-picker">
              {MINISITE_THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`theme-swatch ${(profile.theme ?? "default") === t.value ? "selected" : ""}`}
                  onClick={() => setTheme(t.value)}
                  style={{ background: t.swatch, color: t.ink }}
                  aria-pressed={(profile.theme ?? "default") === t.value}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-card link-manager">
            <div className="eyebrow">Minisite links / 002</div>
            <h2>Build your link stack.</h2>
            <div className="admin-list">
              {ordered.map((link, index) => (
                <div className="link-row" key={link.id}>
                  {editingId === link.id ? (
                    <form className="link-edit" onSubmit={(e) => { e.preventDefault(); saveEdit(link.id); }}>
                      <div className="admin-row">
                        <label>Label<input required value={editDraft.label} onChange={(e) => setEditDraft({ ...editDraft, label: e.target.value })} /></label>
                        <label>Tipe
                          <select value={editDraft.link_type} onChange={(e) => setEditDraft({ ...editDraft, link_type: e.target.value })}>
                            {LINK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </label>
                      </div>
                      <label>URL<input required type="url" value={editDraft.url} onChange={(e) => setEditDraft({ ...editDraft, url: e.target.value })} /></label>
                      <label className="checkbox-label"><input type="checkbox" checked={editDraft.affiliate_disclosure} onChange={(e) => setEditDraft({ ...editDraft, affiliate_disclosure: e.target.checked })} /> Tautan affiliasi / berbayar</label>
                      <div className="form-actions">
                        <button className="button-dark" type="submit">Simpan</button>
                        <button className="button-outline" type="button" onClick={() => setEditingId(null)}>Batal</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span className="link-row-icon"><LinkIcon linkType={link.link_type} /></span>
                      <div className="link-row-main">
                        <strong>{link.label}{!link.is_active && <em className="link-off"> · nonaktif</em>}{link.affiliate_disclosure && <em className="link-aff"> · affiliate</em>}</strong>
                        <small>{link.url}</small>
                      </div>
                      <div className="link-row-actions">
                        <button className="icon-button" type="button" aria-label="Naikkan" disabled={index === 0} onClick={() => move(link, -1)}>↑</button>
                        <button className="icon-button" type="button" aria-label="Turunkan" disabled={index === ordered.length - 1} onClick={() => move(link, 1)}>↓</button>
                        <button className="button-outline" type="button" onClick={() => toggleActive(link)}>{link.is_active ? "Sembunyikan" : "Aktifkan"}</button>
                        <button className="button-outline" type="button" onClick={() => { setEditingId(link.id); setEditDraft({ label: link.label, url: link.url, link_type: link.link_type, affiliate_disclosure: link.affiliate_disclosure }); }}>Edit</button>
                        <button className="button-outline" type="button" onClick={() => removeLink(link.id)}>Hapus</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {links.length === 0 && <p className="hero-copy">Belum ada link. Tambahkan link pertama Anda.</p>}
            </div>

            <form className="admin-form link-form" onSubmit={addLink}>
              <div className="admin-row">
                <label>Label<input required value={newLink.label} onChange={(e) => setNewLink({ ...newLink, label: e.target.value })} placeholder="My favorite finds" /></label>
                <label>Tipe
                  <select value={newLink.link_type} onChange={(e) => setNewLink({ ...newLink, link_type: e.target.value })}>
                    {LINK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </label>
              </div>
              <label>URL<input required type="url" value={newLink.url} onChange={(e) => { const url = e.target.value; setNewLink((prev) => ({ ...prev, url, link_type: prev.link_type === "link" ? guessLinkType(url) : prev.link_type })); }} placeholder="https://..." /></label>
              <label className="checkbox-label"><input type="checkbox" checked={newLink.affiliate_disclosure} onChange={(e) => setNewLink({ ...newLink, affiliate_disclosure: e.target.checked })} /> Tautan affiliasi / berbayar</label>
              <button className="button-dark" type="submit" disabled={savingLink}>{savingLink ? "Menambahkan..." : "Tambah link"}</button>
            </form>
          </div>
        </>
      ) : (
        <div className="admin-card"><p>{username ? "Loading profile..." : "Profile belum dipilih."}</p></div>
      )}
      <Link href="/" className="panel-back">← Back to homepage</Link>
    </main>
  );
}
