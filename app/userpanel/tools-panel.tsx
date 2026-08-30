"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, Copy, Check, Bookmark, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { TOOL_DAILY_LIMIT, TOOL_PLATFORMS, TOOL_TYPE_CHIPS } from "@/lib/picnic-tools";

type ScriptResult = { angle: string; script: string };
type SavedRow = { id: string; content: string; meta: { angle?: string } | null };

export function ToolsPanel({ tool }: { tool: "hook" | "script" }) {
  const isHook = tool === "hook";

  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [platform, setPlatform] = useState<string>(TOOL_PLATFORMS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hooks, setHooks] = useState<string[]>([]);
  const [scripts, setScripts] = useState<ScriptResult[]>([]);
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
    setHooks([]); setScripts([]); setError(""); setNotice("");
    loadSaved();
  }, [loadSaved]);

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setNotice("");
    if (productName.trim().length < 2 || productType.trim().length < 2) {
      setError("Isi nama produk dan jenis produk dulu.");
      return;
    }
    setLoading(true); setHooks([]); setScripts([]);
    try {
      const res = await fetch("/api/tools/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, product_name: productName.trim(), product_type: productType.trim(), platform }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Gagal generate. Coba lagi.");
        if (typeof json.used_today === "number") setUsedToday(json.used_today);
        return;
      }
      if (isHook) setHooks(json.output as string[]);
      else setScripts(json.output as ScriptResult[]);
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

  return (
    <div className="tools-panel">
      <form className="admin-card tools-form" onSubmit={generate}>
        <div className="appear-head">
          <h3>{isHook ? "Ide Hook" : "Ide Script"}</h3>
          <p>
            {isHook
              ? "Masukkan produk kamu, AI buatkan 10 hook siap pakai."
              : "Masukkan produk kamu, AI buatkan 3 script video ±30 detik."}
          </p>
        </div>

        <label>Nama produk<input required maxLength={120} value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="mis. Serum Glow Vitamin C" /></label>

        <label>Jenis produk<input required maxLength={80} value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="mis. skincare" /></label>
        <div className="tools-chips">
          {TOOL_TYPE_CHIPS.map((c) => (
            <button type="button" key={c} className={productType === c ? "active" : ""} onClick={() => setProductType(c)}>{c}</button>
          ))}
        </div>

        <label>Platform
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {TOOL_PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>

        <div className="tools-actions">
          <button className="button-dark" type="submit" disabled={loading}>
            <Sparkles size={15} /> {loading ? "Membuat..." : isHook ? "Generate 10 hook" : "Generate 3 script"}
          </button>
          {remaining !== null && <span className="tools-quota">Sisa hari ini: {remaining}/{TOOL_DAILY_LIMIT}</span>}
        </div>

        {error && <p className="error">{error}</p>}
        {notice && !error && <p className="cms-message">{notice}</p>}
      </form>

      {(hooks.length > 0 || scripts.length > 0) && (
        <div className="admin-card">
          <div className="eyebrow">Hasil</div>
          <div className="tools-results">
            {isHook
              ? hooks.map((h, i) => (
                  <div className="tools-result" key={i}>
                    <p>{h}</p>
                    <div className="tools-result-actions">
                      <button type="button" onClick={() => copy(`h${i}`, h)}>{copiedKey === `h${i}` ? <Check size={14} /> : <Copy size={14} />}</button>
                      <button type="button" onClick={() => save(h)}><Bookmark size={14} /></button>
                    </div>
                  </div>
                ))
              : scripts.map((s, i) => (
                  <div className="tools-result tools-result--script" key={i}>
                    <span className="tools-angle">{s.angle}</span>
                    <p>{s.script}</p>
                    <div className="tools-result-actions">
                      <button type="button" onClick={() => copy(`s${i}`, s.script)}>{copiedKey === `s${i}` ? <Check size={14} /> : <Copy size={14} />}</button>
                      <button type="button" onClick={() => save(s.script, s.angle)}><Bookmark size={14} /></button>
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
              <div className="tools-result" key={row.id}>
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
