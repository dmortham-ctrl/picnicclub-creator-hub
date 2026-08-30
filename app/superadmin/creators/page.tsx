"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/types";
import { CmsSidebar } from "../sidebar";
import { BrandLogo } from "@/app/components/brand-logo";

const pageSize = 30;

export default function CreatorClaimPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [onlyUnclaimed, setOnlyUnclaimed] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let query = supabase.from("profiles").select("*").order("display_name").limit(pageSize);
    if (search.trim()) query = query.or(`display_name.ilike.%${search.trim()}%,username.ilike.%${search.trim()}%`);
    if (onlyUnclaimed) query = query.is("owner_id", null);
    query.then(({ data, error }) => {
      if (error) return setMessage(error.message);
      const rows = (data as Profile[]) ?? [];
      setProfiles(rows);
      setDrafts(Object.fromEntries(rows.map((p) => [p.id, p.claim_email ?? ""])));
    });
  }, [search, onlyUnclaimed]);

  async function saveEmail(profile: Profile) {
    if (!supabase) return;
    const value = (drafts[profile.id] ?? "").trim().toLowerCase();
    if (value === (profile.claim_email ?? "")) return;
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setMessage("Format email tidak valid.");
    const { error } = await supabase.from("profiles").update({ claim_email: value }).eq("id", profile.id);
    if (error) return setMessage(error.message);
    setProfiles(profiles.map((p) => (p.id === profile.id ? { ...p, claim_email: value } : p)));
    setMessage(value ? `Email creator untuk @${profile.username} disimpan.` : `Email dikosongkan — @${profile.username} bebas diklaim.`);
  }

  return (
    <main className="admin-wrap cms-shell">
      <CmsSidebar />
      <div className="cms-main">
        <div className="cms-header admin-topbar">
          <BrandLogo href="/superadmin" />
          <Link href="/" className="button-outline">View website ↗</Link>
        </div>
        {message && <p className="cms-message">{message}</p>}
        <section className="admin-card">
          <div className="eyebrow">Creators / klaim</div>
          <h2>Tautkan profil ke creator.</h2>
          <p className="hero-copy">
            Isi <strong>email creator</strong> untuk tiap profil placeholder. Saat creator itu sign up
            dengan email tersebut, profil (beserta username-nya) otomatis jadi milik mereka. Kosongkan
            email jika profil boleh diklaim siapa saja yang mendaftar dengan username itu.
          </p>

          <div className="creator-toolbar">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau username..." />
            <label className="checkbox-label">
              <input type="checkbox" checked={onlyUnclaimed} onChange={(e) => setOnlyUnclaimed(e.target.checked)} />
              Hanya yang belum diklaim
            </label>
          </div>

          <div className="claim-table">
            {profiles.map((profile) => (
              <div className="claim-row" key={profile.id}>
                <div className="level-identity">
                  {profile.avatar_url ? <Image src={profile.avatar_url} alt="" width={44} height={44} /> : <span className="level-avatar-empty" />}
                  <span>
                    <strong>{profile.display_name}</strong>
                    <small>@{profile.username}</small>
                  </span>
                </div>
                <span className={`status-pill ${profile.owner_id ? "status-published" : "status-draft"}`}>
                  {profile.owner_id ? "Dimiliki" : "Belum diklaim"}
                </span>
                <input
                  type="email"
                  placeholder="email creator (opsional)"
                  value={drafts[profile.id] ?? ""}
                  disabled={!!profile.owner_id}
                  onChange={(e) => setDrafts({ ...drafts, [profile.id]: e.target.value })}
                  onBlur={() => saveEmail(profile)}
                />
              </div>
            ))}
            {profiles.length === 0 && <p className="hero-copy">Tidak ada profil yang cocok.</p>}
          </div>
        </section>
        <Link href="/superadmin" className="panel-back">← Back to CMS</Link>
      </div>
    </main>
  );
}
