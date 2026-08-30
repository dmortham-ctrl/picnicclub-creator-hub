"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Profile, ProfileLink } from "@/lib/types";
import { firstIssue, profileSettingsSchema } from "@/lib/validation";
import { BrandLogo } from "@/app/components/brand-logo";
import { MinisiteView } from "@/app/components/minisite-view";
import { BlockManager } from "@/app/userpanel/block-manager";
import { AppearancePanel } from "@/app/userpanel/appearance-panel";
import { Menu, X, Eye, User, LayoutGrid, Palette, BarChart3, ExternalLink, LogOut } from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Profil" },
  { id: "links", label: "Minisite Kamu" },
  { id: "theme", label: "Tema minisite" },
  { id: "analytics", label: "Analitik" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

const SECTION_ICON: Record<SectionId, ReactNode> = {
  profile: <User size={17} />,
  links: <LayoutGrid size={17} />,
  theme: <Palette size={17} />,
  analytics: <BarChart3 size={17} />,
};

type CreatorAnalytics = {
  window_days: number;
  profile_views: number;
  link_clicks: number;
  daily: { day: string; profile_views: number; link_clicks: number }[];
  top_links: { id: string; label: string; clicks: number }[];
};

type ProfileDraft = { display_name: string; bio: string; category: string; avatar_url: string; theme: string };

export default function UserPanelPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({ display_name: "", bio: "", category: "", avatar_url: "", theme: "default" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState<SectionId>("links");

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
    if (!sidebarOpen && !avatarModalOpen && !previewOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setSidebarOpen(false);
      setAvatarModalOpen(false);
      setPreviewOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, avatarModalOpen, previewOpen]);

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

  useEffect(() => {
    if (!supabase || !profile || section !== "analytics") return;
    setAnalytics(null);
    supabase.rpc("creator_analytics", { target: profile.id, days: analyticsDays }).then(({ data, error: rpcError }) => {
      if (rpcError) return setError(rpcError.message);
      setAnalytics(data as CreatorAnalytics);
    });
  }, [profile, section, analyticsDays]);

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

  const ordered = [...links].sort((a, b) => a.sort_order - b.sort_order);
  const previewProfile = profile && {
    username: profile.username,
    display_name: profileDraft.display_name || profile.display_name,
    category: profileDraft.category || profile.category,
    bio: profileDraft.bio || profile.bio,
    avatar_url: profileDraft.avatar_url || profile.avatar_url,
    theme: profile.theme ?? "default",
    accent_color: profile.accent_color ?? "",
    button_style: profile.button_style ?? "fill",
    button_shape: profile.button_shape ?? "rounded",
    banner_url: profile.banner_url ?? "",
    layout: profile.layout ?? "classic",
  };
  return (
    <>
    <div className="panel-shell">
      <header className="panel-mobilebar">
        <BrandLogo href="/" />
        <button type="button" className="panel-mobilebar-toggle" aria-label="Buka menu" onClick={() => setSidebarOpen(true)}>
          <Menu size={18} />
        </button>
      </header>

      {sidebarOpen && <div className="panel-scrim" onClick={() => setSidebarOpen(false)} />}

      <aside className={`panel-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="panel-sidebar-head">
          <BrandLogo href="/" />
          <button type="button" className="panel-sidebar-x" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {profile && (
          <div className="panel-sidebar-me">
            {profileDraft.avatar_url || profile.avatar_url ? (
              <Image src={profileDraft.avatar_url || profile.avatar_url} alt="" width={84} height={84} />
            ) : (
              <span className="panel-sidebar-me-empty" aria-hidden="true" />
            )}
            <div>
              <strong>{profile.display_name}</strong>
              <span className="panel-sidebar-handle">@{profile.username}</span>
              <span className={`status-pill status-${profile.status}`}>{profile.status}</span>
            </div>
          </div>
        )}

        <nav className="panel-sidebar-nav">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? "is-active" : ""}
              onClick={() => { setSection(item.id); setSidebarOpen(false); }}
            >
              {SECTION_ICON[item.id]}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="panel-sidebar-foot">
          {profile && (
            <a href={`/@${profile.username}`} target="_blank" rel="noreferrer">
              <ExternalLink size={16} /><span>Lihat halaman publik</span>
            </a>
          )}
          <Link href="/"><ExternalLink size={16} /><span>Buka website</span></Link>
          <button type="button" onClick={logout}><LogOut size={16} /><span>Keluar</span></button>
        </div>
      </aside>

      <main className="panel-main">
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

          {section === "theme" && (
            <AppearancePanel
              profile={profile}
              setProfile={setProfile}
              onError={setError}
              onNotice={setNotice}
              onMutated={() => revalidateIfPublished(profile)}
            />
          )}

          {section === "analytics" && (
          <div className="admin-card">
            <div className="cms-section-head">
              <div>
                <h2>Analitik minisite</h2>
                <p className="hero-copy">Kunjungan halaman dan klik link kamu.</p>
              </div>
              <div className="range-tabs">
                {[7, 30, 90].map((r) => (
                  <button key={r} type="button" className={analyticsDays === r ? "active" : ""} onClick={() => setAnalyticsDays(r)}>{r}h</button>
                ))}
              </div>
            </div>
            {!analytics ? (
              <p className="hero-copy">Memuat data...</p>
            ) : (
              <>
                <div className="stat-row stat-row--3">
                  <div><strong>{analytics.profile_views}</strong><small>Kunjungan halaman</small></div>
                  <div><strong>{analytics.link_clicks}</strong><small>Klik link</small></div>
                  <div><strong>{analytics.profile_views ? Math.round((analytics.link_clicks / analytics.profile_views) * 100) : 0}%</strong><small>Rasio klik</small></div>
                </div>
                <h3 className="analytics-subhead">Klik per link</h3>
                {analytics.top_links.length === 0 ? (
                  <p className="hero-copy">Belum ada klik pada rentang ini.</p>
                ) : (
                  analytics.top_links.map((l) => (
                    <div className="analytics-line" key={l.id}>
                      <span><strong>{l.label}</strong></span>
                      <span className="analytics-count">{l.clicks}</span>
                    </div>
                  ))
                )}
                <p className="analytics-note">Agregat {analytics.window_days} hari terakhir. Tanpa data pribadi, IP, atau query string affiliate mentah.</p>
              </>
            )}
          </div>
          )}

          {section === "links" && (
            <BlockManager
              profile={profile}
              links={links}
              setLinks={setLinks}
              onError={setError}
              onNotice={setNotice}
              onMutated={() => revalidateIfPublished(profile)}
            />
          )}

          {section === "links" && (
          <div className="admin-card panel-actions">
            <div className="eyebrow">Halaman &amp; publikasi</div>
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
        </>
      ) : (
        <div className="admin-card"><p>{username ? "Memuat profil..." : "Profil belum dipilih."}</p></div>
      )}
      </main>
    </div>

      {previewProfile && (
        <aside className="panel-preview">
          <div className="panel-preview-head">Pratinjau halaman</div>
          <div className="preview-phone">
            <MinisiteView profile={previewProfile} links={ordered} />
          </div>
        </aside>
      )}

      {!!profile && (
        <button type="button" className="preview-fab" onClick={() => setPreviewOpen(true)}>
          <Eye size={16} /> Preview
        </button>
      )}

      {previewOpen && previewProfile && (
        <div className="preview-backdrop" onClick={() => setPreviewOpen(false)}>
          <aside className="preview-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="preview-drawer-head">
              <strong>Pratinjau halaman</strong>
              <button type="button" className="button-outline" onClick={() => setPreviewOpen(false)} aria-label="Tutup preview"><X size={16} /></button>
            </div>
            <div className="preview-phone">
              <MinisiteView profile={previewProfile} links={ordered} />
            </div>
            <p className="analytics-note">Tampilan untuk pengunjung. Link nonaktif tidak ditampilkan.</p>
          </aside>
        </div>
      )}

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
    </>
  );
}
