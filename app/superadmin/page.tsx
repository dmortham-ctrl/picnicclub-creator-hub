"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/types";
import { CmsSidebar } from "./sidebar";
import { AnalyticsPanel } from "./analytics-panel";
import { BrandLogo } from "@/app/components/brand-logo";

const contentKeys = [
  ["hero_title", "Hero title"],
  ["hero_description", "Hero description"],
  ["marquee_text", "Marquee text"],
  ["about_title", "About title"],
  ["brands_title", "Brands title"],
  ["faq_intro", "FAQ intro"],
  ["founder_usernames", "Founder usernames (pisahkan dengan koma, sesuai urutan)"],
];

export default function SuperAdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    client.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setMessage("Silakan login sebagai admin terlebih dahulu.");
      const { data: isAdmin } = await client.rpc("is_admin");
      if (isAdmin !== true) return setMessage("Akses superadmin hanya tersedia untuk admin.");
      setAuthorized(true);
      const [{ data: profileRows }, { data: contentRows }] = await Promise.all([
        client.from("profiles").select("*").order("featured_order"),
        client.from("site_content").select("key,value"),
      ]);
      setProfiles((profileRows as Profile[]) ?? []);
      setContent(Object.fromEntries((contentRows ?? []).map((item) => [item.key, item.value])));
    });
  }, []);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !selected) return;
    const { error } = await supabase.from("profiles").update(selected).eq("id", selected.id);
    setMessage(error?.message ?? "Profile berhasil diperbarui.");
    if (!error) setProfiles(profiles.map((profile) => profile.id === selected.id ? selected : profile));
  }

  async function saveContent(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const rows = Object.entries(content).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });
    setMessage(error?.message ?? "Konten homepage berhasil diperbarui.");
  }

  if (!authorized) return <main className="admin-wrap"><div className="admin-topbar"><BrandLogo href={null} /></div><div className="admin-card"><h2>Superadmin CMS</h2><p className="hero-copy">{message || "Memeriksa akses..."}</p></div></main>;
  return <main className="admin-wrap cms-shell"><CmsSidebar /><div className="cms-main"><div id="dashboard" className="cms-header admin-topbar"><BrandLogo href="/" /><Link href="/" className="button-outline">View website ↗</Link></div>{message && <p className="cms-message">{message}</p>}<section id="homepage" className="admin-card"><div className="eyebrow">Homepage copy / 002</div><h2>Edit content.</h2><form className="admin-form" onSubmit={saveContent}>{contentKeys.map(([key, label]) => <label key={key}>{label}{key.includes("description") || key.includes("intro") ? <textarea rows={3} value={content[key] ?? ""} onChange={(event) => setContent({ ...content, [key]: event.target.value })} /> : <input value={content[key] ?? ""} onChange={(event) => setContent({ ...content, [key]: event.target.value })} />}</label>)}<button className="button-dark" type="submit">Save homepage content</button></form></section><section id="creators" className="admin-card"><div className="eyebrow">Creator directory / 003</div><h2>Manage creators.</h2><div className="cms-table">{profiles.map((profile) => <button type="button" className={`cms-row ${selected?.id === profile.id ? "selected" : ""}`} key={profile.id} onClick={() => setSelected(profile)}><span><strong>{profile.display_name}</strong><small>@{profile.username} · {profile.category}</small></span><span className="cms-status">{profile.status}{profile.is_featured ? " · featured" : ""}</span></button>)}</div></section>{selected && <section className="admin-card"><div className="eyebrow">Selected profile / 004</div><h2>Edit {selected.display_name}.</h2><form className="admin-form" onSubmit={saveProfile}><div className="admin-row"><label>Display name<input value={selected.display_name} onChange={(event) => setSelected({ ...selected, display_name: event.target.value })} /></label><label>Category<input value={selected.category} onChange={(event) => setSelected({ ...selected, category: event.target.value })} /></label></div><label>Bio<textarea rows={3} value={selected.bio} onChange={(event) => setSelected({ ...selected, bio: event.target.value })} /></label><div className="admin-row"><label>Status<select value={selected.status} onChange={(event) => setSelected({ ...selected, status: event.target.value as Profile["status"] })}><option value="draft">Draft</option><option value="published">Published</option><option value="suspended">Suspended</option></select></label><label>Featured order<input type="number" value={selected.featured_order} onChange={(event) => setSelected({ ...selected, featured_order: Number(event.target.value) })} /></label></div><label className="checkbox-label"><input type="checkbox" checked={selected.is_featured} onChange={(event) => setSelected({ ...selected, is_featured: event.target.checked })} /> Show in featured section</label><button className="button-dark" type="submit">Save creator</button></form></section>}<AnalyticsPanel /><section id="brands" className="admin-card"><div className="eyebrow">Brands / 006</div><h2>Brand partners.</h2><p className="hero-copy">Kelola logo dan partner di halaman khusus.</p><Link className="button-dark" href="/superadmin/brands">Open brand manager ↗</Link></section><section id="faq" className="admin-card"><div className="eyebrow">FAQ / 007</div><h2>FAQ content.</h2><p className="hero-copy">Tambah, edit, dan urutkan FAQ homepage.</p><Link className="button-dark" href="/superadmin/faq">Open FAQ editor ↗</Link></section><section id="media" className="cms-placeholder admin-card"><div className="eyebrow">Media / 008</div><h2>Media library.</h2><p className="hero-copy">Gunakan Supabase Storage untuk mengelola avatar dan aset brand.</p></section><section id="settings" className="cms-placeholder admin-card"><div className="eyebrow">Settings / 009</div><h2>System settings.</h2><p className="hero-copy">Pengaturan domain dan integrasi akan ditambahkan sebelum production.</p></section></div></main>;
}
