"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/types";
import { CmsSidebar } from "../sidebar";

const categories = ["Fashion", "Random", "Home Living", "Health and Fitness", "Food and Drink", "Beauty & Skincare", "Electronic"];
const levels = ["All Star", "Featured", "Rising"] as const;
const pageSize = 25;

export default function CreatorLevelsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let query = client.from("profiles").select("*", { count: "exact" }).order("display_name").range(page * pageSize, (page + 1) * pageSize - 1);
    if (search.trim()) query = query.or(`display_name.ilike.%${search.trim()}%,username.ilike.%${search.trim()}%`);
    if (level !== "all") query = query.eq("level", level);
    if (category !== "all") query = query.eq("category", category);
    query.then(({ data, count, error }) => { if (error) setMessage(error.message); setProfiles((data as Profile[]) ?? []); setTotal(count ?? 0); setSelected([]); });
  }, [search, level, category, page]);

  async function updateProfile(profile: Profile, patch: Partial<Profile>) { if (!supabase) return; const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id); if (error) return setMessage(error.message); setProfiles(profiles.map((item) => item.id === profile.id ? { ...item, ...patch } : item)); setMessage(`${profile.display_name} updated.`); }
  async function bulkLevel(nextLevel: Profile["level"]) { if (!supabase || selected.length === 0) return; const { error } = await supabase.from("profiles").update({ level: nextLevel, is_featured: nextLevel === "All Star" }).in("id", selected); if (error) return setMessage(error.message); setMessage(`${selected.length} creator berhasil diubah.`); setSelected([]); setProfiles(profiles.map((profile) => selected.includes(profile.id) ? { ...profile, level: nextLevel, is_featured: nextLevel === "All Star" } : profile)); }
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return <main className="admin-wrap cms-shell"><CmsSidebar /><div className="cms-main"><div className="cms-header"><Link href="/superadmin" className="brand"><span className="brand-mark">P</span> picnic club CMS</Link><Link href="/" className="button-outline">View website ↗</Link></div><div className="panel-hero"><div className="eyebrow">Creator management / 004</div><h1>Find your<br />all stars.</h1><p className="hero-copy">Cari, filter, dan kelola creator tanpa memuat seluruh database sekaligus.</p></div>{message && <p className="cms-message">{message}</p>}<section className="admin-card"><div className="creator-toolbar"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search name or username..." aria-label="Search creator" /><select value={level} onChange={(event) => { setLevel(event.target.value); setPage(0); }}><option value="all">All levels</option>{levels.map((item) => <option key={item}>{item}</option>)}</select><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(0); }}><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div><div className="bulk-toolbar"><label><input type="checkbox" checked={profiles.length > 0 && selected.length === profiles.length} onChange={(event) => setSelected(event.target.checked ? profiles.map((profile) => profile.id) : [])} /> Select page</label><span>{total} creators</span><div>{levels.map((item) => <button className="button-outline" type="button" disabled={selected.length === 0} key={item} onClick={() => bulkLevel(item)}>Set {item}</button>)}</div></div><div className="level-table">{profiles.map((profile) => <div className="level-row" key={profile.id}><label className="row-check"><input type="checkbox" checked={selected.includes(profile.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, profile.id] : selected.filter((id) => id !== profile.id))} /></label><div className="level-identity">{profile.avatar_url ? <Image src={profile.avatar_url} alt="" width={48} height={48} /> : <span className="level-avatar-empty" />}<span><strong>{profile.display_name}</strong><small>@{profile.username}</small></span></div><select value={profile.level ?? (profile.is_featured ? "All Star" : "Rising")} onChange={(event) => updateProfile(profile, { level: event.target.value as Profile["level"], is_featured: event.target.value === "All Star" })}>{levels.map((item) => <option key={item}>{item}</option>)}</select><select value={profile.category} onChange={(event) => updateProfile(profile, { category: event.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>)}{profiles.length === 0 && <p className="hero-copy">Tidak ada creator yang cocok dengan filter ini.</p>}</div><div className="pagination"><button className="button-outline" disabled={page === 0} onClick={() => setPage(page - 1)}>← Previous</button><span>Page {page + 1} of {totalPages}</span><button className="button-outline" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next →</button></div></section><Link href="/superadmin" className="panel-back">← Back to CMS</Link></div></main>;
}
