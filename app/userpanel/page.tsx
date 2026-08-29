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
import { Menu, X, ChevronRight } from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Profil" },
  { id: "links", label: "Link minisite" },
  { id: "theme", label: "Tema minisite" },
  { id: "minisite", label: "Halaman & publikasi" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

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
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({ display_name: "", bio: "", category: "", avatar_url: "", theme: "default" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState<SectionId>("profile");

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

  useEffect(() => {
    if (!menuOpen && !avatarModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setAvatarModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, avatarModalOpen]);

  useEffect(() => {
    if (!profile) return;
    setProfileDraft({
      display_name: profile.display_name,
      bio: profile.bio,
      category: profile.category,
      avatar_url: profile.avatar_url,
      theme: profile.theme ?? "default",
    });
  }, [profile]);

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

  async function logout() {
    await supabase?.auth.signOut();
    window.location.href = "/";
  }

  function revalidateIfPublished(current: Profile) {
    if (current.status === "published") {
      fetch("/api/profile-visibility", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: current.id, status: "published" }) });
    }
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !profile) return;
    const parsed = profileSettingsSchema.safeParse(profileDraft);
    if (!parsed.success) return setError(firstIssue(parsed.error));
    setError("");
    setSavingProfile(true);

    const patch = { display_name: parsed.data.display_name, bio: parsed.data.bio, category: parsed.data.category };
    const { error: updateError } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    if (updateError) { setError(updateError.message); setSavingProfile(false); return; }

    setProfile({ ...profile, ...patch } as Profile);
    setSavingProfile(false);
    setNotice("Profil diperbarui.");
    revalidateIfPublished(profile);
  }

  async function uploadAvatar(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !profile || !avatarFile) return;
    if (!avatarFile.type.startsWith("image/")) return setError("Avatar harus berupa file gambar.");
    if (avatarFile.size > 5 * 1024 * 1024) return setError("Ukuran avatar maksimal 5 MB.");
    setError("");
    setUploadingAvatar(true);

    const path = `${crypto.randomUUID()}-${avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from("Avatar").upload(path, avatarFile, { contentType: avatarFile.type, upsert: false });
    if (uploadError) { setError(uploadError.message); setUploadingAvatar(false); return; }
    const avatarUrl = supabase.storage.from("Avatar").getPublicUrl(path).data.publicUrl;

    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", profile.id);
    if (updateError) { setError(updateError.message); setUploadingAvatar(false); return; }

    setProfile({ ...profile, avatar_url: avatarUrl } as Profile);
    setProfileDraft((prev) => ({ ...prev, avatar_url: avatarUrl }));
    setAvatarFile(null);
    setUploadingAvatar(false);
    setAvatarModalOpen(false);
    setNotice("Foto profil diperbarui.");
    revalidateIfPublished(profile);
  }

  function closeAvatarModal() {
    setAvatarFile(null);
    setAvatarModalOpen(false);
  }

  async function setTheme(theme: string) {
    if (!supabase || !profile) return;
    const { error: updateError } = await supabase.from("profiles").update({ theme }).eq("id", profile.id);
    if (updateError) return setError(updateError.message);
    setProfile({ ...profile, theme: theme as Profile["theme"] });
    setNotice("Tema minisite diperbarui.");
    revalidateIfPublished(profile);
  }

  const ordered = resortState(links);

  return (
    <main className="admin-wrap">
      <div className="admin-topbar">
        <BrandLogo href="/" />
        <div className="admin-topbar-actions">
          <div className="panel-menu">
            <button
              type="button"
              className="button-outline panel-menu-toggle"
              aria-label="Menu editor"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            {menuOpen && (
              <>
                <div className="panel-menu-backdrop" onClick={() => setMenuOpen(false)} />
                <nav className="panel-menu-list" aria-label="Panel editor">
                  <span className="panel-menu-heading">Editor minisite</span>
                  {SECTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={section === item.id ? "active" : ""}
                      onClick={() => { setSection(item.id); setMenuOpen(false); }}
                    >
                      {item.label}
                      <ChevronRight size={15} />
                    </button>
                  ))}
                  <span className="panel-menu-heading">Lainnya</span>
                  {profile && (
                    <a href={`/@${profile.username}`} target="_blank" rel="noreferrer">
                      Lihat halaman publik ↗
                    </a>
                  )}
                  <Link href="/" onClick={() => setMenuOpen(false)}>View website ↗</Link>
                  <button type="button" className="panel-menu-logout" onClick={logout}>Logout</button>
                </nav>
              </>
            )}
          </div>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {notice && !error && <p className="cms-message">{notice}</p>}
      {profile ? (
        <>
          {section === "profile" && (
            <form className="admin-card admin-form panel-profile-editor" onSubmit={saveProfile}>
              <div className="panel-profile-head">
                <button type="button" className="avatar-picker" onClick={() => setAvatarModalOpen(true)} aria-label="Ganti foto profil">
                  {profileDraft.avatar_url ? (
                    <Image className="panel-profile-avatar" src={profileDraft.avatar_url} alt={profile.display_name} width={140} height={140} />
                  ) : (
                    <span className="panel-profile-avatar panel-profile-avatar--empty" aria-hidden="true" />
                  )}
                  <span className="avatar-picker-hint">Ganti foto</span>
                </button>
                <div className="panel-profile-info">
                  <p className="bio-username">
                    @{profile.username}
                    <span className={`status-pill status-${profile.status}`}>{profile.status}</span>
                  </p>
                  <label>Display name<input required value={profileDraft.display_name} onChange={(e) => setProfileDraft({ ...profileDraft, display_name: e.target.value })} /></label>
                </div>
              </div>
              <label>Category<input value={profileDraft.category} onChange={(e) => setProfileDraft({ ...profileDraft, category: e.target.value })} /></label>
              <label>Bio<textarea rows={3} maxLength={280} value={profileDraft.bio} onChange={(e) => setProfileDraft({ ...profileDraft, bio: e.target.value })} /></label>
              <div className="form-actions">
                <button className="button-dark" type="submit" disabled={savingProfile}>{savingProfile ? "Menyimpan..." : "Simpan profil"}</button>
              </div>
            </form>
          )}

          {section === "minisite" && (
            <div className="admin-card panel-actions">
              <div className="eyebrow">Halaman minisite</div>
              <strong>picnicclub.id/@{profile.username}</strong>
              <Link className="button-dark" href={`/@${profile.username}`}>View public page ↗</Link>
              <button className="button-outline" type="button" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/@${profile.username}`); setNotice("Link disalin."); }}>Copy profile link</button>
              {profile.status === "published" ? (
                <button className="button-outline" type="button" onClick={() => setStatus("draft")}>Unpublish page</button>
              ) : (
                <button className="button-dark" type="button" onClick={() => setStatus("published")}>Publish page</button>
              )}
            </div>
          )}

          {section === "theme" && (
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
          )}

          {section === "links" && (
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
          )}
        </>
      ) : (
        <div className="admin-card"><p>{username ? "Loading profile..." : "Profile belum dipilih."}</p></div>
      )}
      <Link href="/" className="panel-back">← Back to homepage</Link>

      {avatarModalOpen && profile && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Ganti foto profil" onClick={closeAvatarModal}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={uploadAvatar}>
            <h2>Ganti foto profil</h2>
            <div className="modal-avatar-preview">
              {avatarFile ? (
                <Image src={URL.createObjectURL(avatarFile)} alt="Pratinjau" width={160} height={160} unoptimized />
              ) : profileDraft.avatar_url ? (
                <Image src={profileDraft.avatar_url} alt={profile.display_name} width={160} height={160} />
              ) : (
                <span className="panel-profile-avatar panel-profile-avatar--empty" aria-hidden="true" />
              )}
            </div>
            <label>Pilih foto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} /></label>
            <p className="hero-copy">PNG, JPG, atau WebP. Maksimal 5 MB.</p>
            <div className="form-actions">
              <button className="button-dark" type="submit" disabled={!avatarFile || uploadingAvatar}>{uploadingAvatar ? "Mengunggah..." : "Unggah foto"}</button>
              <button className="button-outline" type="button" onClick={closeAvatarModal}>Batal</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
