"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, Copy, Check, Bookmark, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  TOOL_DAILY_LIMIT,
  TOOL_COUNT_MAX,
  TOOL_META,
  TOOL_PLATFORMS,
  TOOL_TYPE_CHIPS,
  type ToolKey,
} from "@/lib/picnic-tools";

type SavedRow = { id: string; content: string; meta: { angle?: string } | null };
type ResultItem = { key: string; badge?: string; text: string; copyText: string; saveText: string; saveAngle?: string };

type ScriptOut = { angle: string; script: string };
type LiveOut = { title: string; script: string };
type CalendarOut = { day: number; format: string; angle: string; idea: string };

function normalize(tool: ToolKey, output: unknown): ResultItem[] {
  if (tool === "hook" || tool === "caption") {
    return (output as string[]).map((t, i) => ({ key: `${i}`, text: t, copyText: t, saveText: t }));
  }
  if (tool === "script") {
    return (output as ScriptOut[]).map((s, i) => ({
      key: `${i}`, badge: s.angle, text: s.script, copyText: s.script, saveText: s.script, saveAngle: s.angle,
    }));
  }
  if (tool === "live") {
    return (output as LiveOut[]).map((s, i) => ({
      key: `${i}`, badge: s.title, text: s.script, copyText: `${s.title}\n${s.script}`, saveText: s.script, saveAngle: s.title,
    }));
  }
  if (tool === "calendar") {
    return (output as CalendarOut[]).map((d, i) => {
      const badge = `Hari ${d.day} · ${d.format}`;
      const text = `${d.angle}\n${d.idea}`;
      return { key: `${i}`, badge, text, copyText: `${badge}\n${text}`, saveText: text, saveAngle: badge };
    });
  }
  return [];
}

export function ToolsPanel({ tool }: { tool: ToolKey }) {
  const meta = TOOL_META[tool];

  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [platform, setPlatform] = useState<string>(TOOL_PLATFORMS[0].value);
  const [count, setCount] = useState(meta.defaultCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [usedToday, setUsedToday] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState("");
  const [saved, setSaved] = useState<SavedRow[]>([]);

  const loadSaved = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("tool_saves")
      .select("id, content, meta")
      .eq("tool", tool)
      .order("created_at", { ascending: false })
      .limit(60);
    setSaved((data as SavedRow[]) ?? []);
  }, [tool]);

  useEffect(() => {
    setResults([]); setError(""); setNotice("");
    setCount(TOOL_META[tool].defaultCount);
    loadSaved();
  }, [tool, loadSaved]);

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setNotice("");
    if (productName.trim().length < 2 || productType.trim().length < 2) {
      setError("Isi nama produk dan jenis produk dulu.");
      return;
    }
    setLoading(true); setResults([]);
    try {
      const res = await fetch("/api/tools/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          product_name: productName.trim(),
          product_type: productType.trim(),
          platform,
          count: meta.hasCount ? count : meta.defaultCount,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Gagal generate. Coba lagi.");
        if (typeof json.used_today === "number") setUsedToday(json.used_today);
        return;
      }
      setResults(normalize(tool, json.output));
      setUsedToday(json.used_today);
      if (json.cached) setNotice("Diambil dari hasil terbaru untuk produk yang sama (tidak memotong kuota).");
    } finally {
      setLoading(false);
    }
  }

  async function copy(key: string, text: string) {
    await navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1400);
  }

  async function save(content: string, angle?: string) {
    if (!supabase) return;
    const { data, error: saveError } = await supabase
      .from("tool_saves")
      .insert({ tool, content, meta: { product_name: productName, product_type: productType, platform, angle: angle ?? null } })
      .select("id, content, meta")
      .single();
    if (saveError) return setError(saveError.message);
    if (data) setSaved((rows) => [data as SavedRow, ...rows]);
  }

  async function removeSaved(id: string) {
    if (!supabase) return;
    await supabase.from("tool_saves").delete().eq("id", id);
    setSaved((rows) => rows.filter((r) => r.id !== id));
  }

  const remaining = usedToday === null ? null : Math.max(0, TOOL_DAILY_LIMIT - usedToday);
  const buttonLabel = loading
    ? "Membuat..."
    : meta.hasCount
    ? `Generate ${count} ${meta.noun}`
    : tool === "calendar"
    ? "Buat kalender 7 hari"
    : "Buat skrip live";

  return (
    <div className="tools-panel">
      <form className="admin-card admin-form tools-form" onSubmit={generate}>
        <div className="appear-head">
          <h3>{meta.label}</h3>
          <p>{meta.desc}</p>
        </div>

        <label>Nama produk dan deskripsinya<input required maxLength={300} value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="mis. Serum Vitamin C 15ml, mencerahkan & memudarkan noda hitam, sudah BPOM, cocok kulit sensitif" /></label>

        <label>Jenis produk<input required maxLength={80} value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="mis. skincare" /></label>
        <div className="tools-chips">
          {TOOL_TYPE_CHIPS.map((c) => (
            <button type="button" key={c} className={productType === c ? "active" : ""} onClick={() => setProductType(c)}>{c}</button>
          ))}
        </div>

        <div className="admin-row">
          <label>Platform
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {TOOL_PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>
          {meta.hasCount && (
            <label>Jumlah {meta.noun}
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {Array.from({ length: TOOL_COUNT_MAX }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="tools-actions">
          <button className="button-dark" type="submit" disabled={loading}>
            <Sparkles size={15} /> {buttonLabel}
          </button>
          {remaining !== null && <span className="tools-quota">Sisa hari ini: {remaining}/{TOOL_DAILY_LIMIT}</span>}
        </div>

        {error && <p className="error">{error}</p>}
        {notice && !error && <p className="cms-message">{notice}</p>}
      </form>

      {results.length > 0 && (
        <div className="admin-card">
          <div className="eyebrow">Hasil</div>
          <div className="tools-results">
            {results.map((r) => (
              <div className={`tools-result${r.badge ? " tools-result--script" : ""}`} key={r.key}>
                {r.badge && <span className="tools-angle">{r.badge}</span>}
                <p>{r.text}</p>
                <div className="tools-result-actions">
                  <button type="button" onClick={() => copy(r.key, r.copyText)}>{copiedKey === r.key ? <Check size={14} /> : <Copy size={14} />}</button>
                  <button type="button" onClick={() => save(r.saveText, r.saveAngle)}><Bookmark size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="eyebrow">Tersimpan ({saved.length})</div>
        {saved.length === 0 ? (
          <p className="hero-copy">Belum ada yang disimpan. Klik ikon bookmark pada hasil untuk menyimpan.</p>
        ) : (
          <div className="tools-results">
            {saved.map((row) => (
              <div className={`tools-result${row.meta?.angle ? " tools-result--script" : ""}`} key={row.id}>
                {row.meta?.angle && <span className="tools-angle">{row.meta.angle}</span>}
                <p>{row.content}</p>
                <div className="tools-result-actions">
                  <button type="button" onClick={() => copy(`sv${row.id}`, row.content)}>{copiedKey === `sv${row.id}` ? <Check size={14} /> : <Copy size={14} />}</button>
                  <button type="button" onClick={() => removeSaved(row.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
