"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile, ProfileLink } from "@/lib/types";
import { firstIssue, linkSchema } from "@/lib/validation";
import { guessLinkType, LINK_TYPES } from "@/lib/link-types";
import { LinkIcon } from "@/app/components/link-icon";
import { BrandLogo } from "@/app/components/brand-logo";

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

  const ordered = resortState(links);

  return (
    <main className="admin-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BrandLogo href="/" />
        <Link href="/admin" className="button-outline">Edit profile</Link>
      </div>
      <section className="panel-hero">
        <div className="eyebrow">Creator dashboard / 001</div>
        <h1>Your space<br />is live.</h1>
        <p className="hero-copy">Kelola profil dan bagikan halaman creator Anda dari satu tempat.</p>
      </section>
      {error && <p className="error">{error}</p>}
      {notice && !error && <p className="cms-message">{notice}</p>}
      {profile ? (
        <>
          <div className="panel-grid">
            <div className="admin-card panel-profile">
              {profile.avatar_url && <Image src={profile.avatar_url} alt={profile.display_name} width={120} height={120} />}
              <div>
                <div className="eyebrow">{profile.status}</div>
                <h2>{profile.display_name}</h2>
                <p className="bio-username">@{profile.username} · {profile.category}</p>
                <p className="hero-copy">{profile.bio}</p>
              </div>
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
