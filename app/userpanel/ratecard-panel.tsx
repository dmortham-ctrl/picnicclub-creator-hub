"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Sparkles, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile, ProfileLink, RateCardItem } from "@/lib/types";
import { ratecardBlockSchema, firstIssue } from "@/lib/validation";
import { normalizeWhatsappUrl } from "@/lib/link-types";
import { TOOL_DAILY_LIMIT, TOOL_COUNT_MAX, TOOL_META, TOOL_PLATFORMS, TOOL_TYPE_CHIPS } from "@/lib/picnic-tools";
import { RatecardFields } from "@/app/userpanel/ratecard-fields";

const EMPTY_ITEMS: RateCardItem[] = [{ label: "", price: "", note: "" }];
const meta = TOOL_META.ratecard;

type PlatformEntry = { platform: string; followers: string };
const EMPTY_PLATFORMS: PlatformEntry[] = [{ platform: TOOL_PLATFORMS[0].value, followers: "" }];

/**
 * AI-assisted rate card builder: fill in follower count / niche / platform,
 * get suggested pricing, tweak the rows, then publish them as a "ratecard"
 * block on the creator's own minisite (creating or replacing the one block —
 * a profile only ever has one rate card).
 */
export function RatecardPanel({
  profile,
  links,
  setLinks,
  onMutated,
}: {
  profile: Profile;
  links: ProfileLink[];
  setLinks: Dispatch<SetStateAction<ProfileLink[]>>;
  onMutated: () => void;
}) {
  const [niche, setNiche] = useState("");
  const [platforms, setPlatforms] = useState<PlatformEntry[]>(EMPTY_PLATFORMS);
  const [experience, setExperience] = useState("");
  const [count, setCount] = useState(meta.defaultCount);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [usedToday, setUsedToday] = useState<number | null>(null);
  const [items, setItems] = useState<RateCardItem[]>(EMPTY_ITEMS);
  const [wa, setWa] = useState("");
  const [note, setNote] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const existing = links.find((l) => (l.block_type ?? "link") === "ratecard");

  // A rate card already on the profile loads straight into the editor, so
  // creators can tweak or republish it without generating again.
  useEffect(() => {
    if (existing) {
      setItems(existing.content?.ratecard_items?.length ? existing.content.ratecard_items : EMPTY_ITEMS);
      setWa(existing.url ?? "");
      setNote(existing.content?.ratecard_note ?? "");
      if (existing.content?.ratecard_platforms?.length) {
        setPlatforms(existing.content.ratecard_platforms.map((p) => ({ platform: p.platform, followers: String(p.followers) })));
      }
      setHasGenerated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updatePlatform(index: number, patch: Partial<PlatformEntry>) {
    setPlatforms((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setNotice("");
    if (niche.trim().length < 2) { setError("Isi niche/kategori konten kamu dulu."); return; }
    const validPlatforms = platforms
      .filter((p) => p.followers.trim() !== "")
      .map((p) => ({ platform: p.platform, followers: Number(p.followers) }));
    if (validPlatforms.length === 0 || validPlatforms.some((p) => !Number.isFinite(p.followers) || p.followers < 0)) {
      setError("Isi jumlah followers minimal untuk satu platform.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tools/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "ratecard", niche: niche.trim(), platforms: validPlatforms, experience: experience.trim(), count }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Gagal generate. Coba lagi.");
        if (typeof json.used_today === "number") setUsedToday(json.used_today);
        return;
      }
      setItems((json.output as RateCardItem[]).map((i) => ({ label: i.label, price: i.price, note: i.note ?? "" })));
      setHasGenerated(true);
      setUsedToday(json.used_today);
      if (json.cached) setNotice("Diambil dari hasil terbaru untuk input yang sama (tidak memotong kuota).");
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    if (!supabase) return;
    setError(""); setNotice("");
    const parsed = ratecardBlockSchema.safeParse({
      items: items.filter((i) => i.label.trim() && i.price.trim()),
      note,
      wa: wa.trim() ? normalizeWhatsappUrl(wa) : "",
      platforms: platforms
        .filter((p) => p.followers.trim() !== "")
        .map((p) => ({ platform: p.platform, followers: p.followers })),
    });
    if (!parsed.success) { setError(firstIssue(parsed.error)); return; }
    setPublishing(true);
    const row = {
      block_type: "ratecard" as const,
      label: "Rate Card",
      url: parsed.data.wa,
      link_type: "ratecard",
      icon_key: "ratecard",
      image_url: "",
      affiliate_disclosure: false,
      content: { ratecard_items: parsed.data.items, ratecard_note: parsed.data.note, ratecard_platforms: parsed.data.platforms },
    };
    if (existing) {
      const { error: updateError } = await supabase.from("profile_links").update(row).eq("id", existing.id);
      if (updateError) { setError(updateError.message); setPublishing(false); return; }
      setLinks((rows) => rows.map((r) => (r.id === existing.id ? ({ ...r, ...row } as ProfileLink) : r)));
    } else {
      const nextOrder = links.length ? Math.max(...links.map((l) => l.sort_order)) + 1 : 1;
      const { data, error: insertError } = await supabase
        .from("profile_links")
        .insert({ profile_id: profile.id, ...row, sort_order: nextOrder, is_active: true })
        .select()
        .single();
      if (insertError) { setError(insertError.message); setPublishing(false); return; }
      if (data) setLinks((rows) => [...rows, data as ProfileLink]);
    }
    onMutated();
    setNotice("Rate card tampil di profil kamu 🎉");
    setPublishing(false);
  }

  const remaining = usedToday === null ? null : Math.max(0, TOOL_DAILY_LIMIT - usedToday);

  return (
    <div className="tools-panel">
      <form className="admin-card admin-form tools-form" onSubmit={generate}>
        <div className="appear-head">
          <h3>{meta.label}</h3>
          <p>{meta.desc}</p>
        </div>

        <label>Niche / kategori konten kamu<input required maxLength={80} value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="mis. skincare & beauty" /></label>
        <div className="tools-chips">
          {TOOL_TYPE_CHIPS.map((c) => (
            <button type="button" key={c} className={niche === c ? "active" : ""} onClick={() => setNiche(c)}>{c}</button>
          ))}
        </div>

        <fieldset className="wa-display">
          <legend>Platform &amp; followers kamu</legend>
          <div className="social-rows">
            {platforms.map((p, i) => (
              <div className="social-row" key={i}>
                <select value={p.platform} onChange={(e) => updatePlatform(i, { platform: e.target.value })}>
                  {TOOL_PLATFORMS.map((tp) => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
                </select>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={p.followers}
                  placeholder="Jumlah followers"
                  onChange={(e) => updatePlatform(i, { followers: e.target.value })}
                />
                {platforms.length > 1 && (
                  <button type="button" className="icon-button" aria-label="Hapus platform" onClick={() => setPlatforms((rows) => rows.filter((_, j) => j !== i))}>
                    ×
                  </button>
                )}
              </div>
            ))}
            {platforms.length < 6 && (
              <button
                type="button"
                className="button-outline"
                onClick={() => setPlatforms((rows) => [...rows, { platform: TOOL_PLATFORMS[0].value, followers: "" }])}
              >
                + Tambah platform
              </button>
            )}
          </div>
        </fieldset>
        <label>Pengalaman kerja sama (opsional)<input maxLength={200} value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="mis. sudah kerja sama dengan 5 brand skincare lokal" /></label>
        <label>Jumlah layanan
          <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {Array.from({ length: TOOL_COUNT_MAX }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <div className="tools-actions">
          <button className="button-dark" type="submit" disabled={loading}>
            <Sparkles size={15} /> {loading ? "Membuat..." : hasGenerated ? "Generate ulang" : `Generate ${count} saran harga`}
          </button>
          {remaining !== null && <span className="tools-quota">Sisa hari ini: {remaining}/{TOOL_DAILY_LIMIT}</span>}
        </div>

        {error && <p className="error">{error}</p>}
        {notice && !error && <p className="cms-message">{notice}</p>}
      </form>

      {hasGenerated && (
        <div className="admin-card">
          <div className="appear-head">
            <h3>Rate card kamu</h3>
            <p>Edit bebas sebelum ditampilkan — harga saran AI cuma titik awal.</p>
          </div>
          <RatecardFields items={items} setItems={setItems} wa={wa} setWa={setWa} note={note} setNote={setNote} />
          <div className="form-actions">
            <button className="button-dark" type="button" onClick={publish} disabled={publishing}>
              {publishing ? "Menyimpan..." : existing ? "Perbarui di profil" : "Tampilkan di profil"}
            </button>
            {existing && profile.status === "published" && (
              <a className="button-outline" href={`/@${profile.username}`} target="_blank" rel="noreferrer">
                Lihat profil <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
