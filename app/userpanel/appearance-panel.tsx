"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import {
  MINISITE_THEMES,
  BUTTON_STYLES,
  BUTTON_SHAPES,
  LAYOUTS,
  ACCENT_PRESETS,
  isHexColor,
} from "@/lib/themes";

type Patch = Partial<
  Pick<Profile, "theme" | "accent_color" | "button_style" | "button_shape" | "layout" | "banner_url">
>;

export function AppearancePanel({
  profile,
  setProfile,
  onError,
  onNotice,
  onMutated,
}: {
  profile: Profile;
  setProfile: (p: Profile) => void;
  onError: (msg: string) => void;
  onNotice: (msg: string) => void;
  onMutated: () => void;
}) {
  const [hex, setHex] = useState(profile.accent_color ?? "");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerInput = useRef<HTMLInputElement>(null);

  const theme = profile.theme ?? "default";
  const layout = profile.layout ?? "classic";
  const buttonStyle = profile.button_style ?? "fill";
  const buttonShape = profile.button_shape ?? "rounded";
  const accent = profile.accent_color ?? "";

  async function patch(fields: Patch, note = "Tampilan diperbarui.") {
    if (!supabase) return;
    const { error } = await supabase.from("profiles").update(fields).eq("id", profile.id);
    if (error) return onError(error.message);
    onError("");
    setProfile({ ...profile, ...fields } as Profile);
    onNotice(note);
    onMutated();
  }

  async function uploadBanner(file: File) {
    if (!supabase) return;
    if (!file.type.startsWith("image/")) return onError("Banner harus berupa gambar.");
    if (file.size > 5 * 1024 * 1024) return onError("Ukuran banner maksimal 5 MB.");
    setUploadingBanner(true);
    const path = `banners/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error } = await supabase.storage.from("Avatar").upload(path, file, { contentType: file.type, upsert: false });
    if (error) { onError(error.message); setUploadingBanner(false); return; }
    const url = supabase.storage.from("Avatar").getPublicUrl(path).data.publicUrl;
    await patch({ banner_url: url }, "Banner diperbarui.");
    setUploadingBanner(false);
  }

  function applyHex(value: string) {
    setHex(value);
    if (value === "" || isHexColor(value)) patch({ accent_color: value }, "Warna aksen diperbarui.");
  }

  return (
    <div className="appearance">
      <section className="admin-card">
        <div className="appear-head">
          <h3>Template</h3>
          <p>Pilih gaya latar halaman kamu.</p>
        </div>
        <div className="template-grid">
          {MINISITE_THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`template-card ${theme === t.value ? "selected" : ""}`}
              onClick={() => patch({ theme: t.value }, "Template diperbarui.")}
              aria-pressed={theme === t.value}
            >
              <span className="template-preview" style={{ background: t.swatch }}>
                <span className="template-dot" style={{ background: t.dot }} />
                <span className="template-line" style={{ background: t.ink }} />
                <span className="template-line short" style={{ background: t.ink }} />
              </span>
              <span className="template-name">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <div className="appear-head">
          <h3>Banner</h3>
          <p>Gambar lebar di atas foto profil (khusus layout Classic).</p>
        </div>
        <div className="banner-field">
          <div className="banner-preview">
            {profile.banner_url
              ? <Image src={profile.banner_url} alt="" width={480} height={160} />
              : <span className="banner-empty" aria-hidden="true" />}
          </div>
          <div className="banner-actions">
            <button type="button" className="button-outline" disabled={uploadingBanner} onClick={() => bannerInput.current?.click()}>
              {uploadingBanner ? "Mengunggah..." : profile.banner_url ? "Ganti banner" : "Unggah banner"}
            </button>
            {profile.banner_url && (
              <button type="button" className="button-outline" onClick={() => patch({ banner_url: "" }, "Banner dihapus.")}>Hapus</button>
            )}
            <input
              ref={bannerInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBanner(f); e.target.value = ""; }}
            />
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="appear-head">
          <h3>Layout</h3>
        </div>
        <div className="layout-grid">
          {LAYOUTS.map((l) => (
            <button
              key={l.value}
              type="button"
              className={`layout-card ${layout === l.value ? "selected" : ""}`}
              onClick={() => patch({ layout: l.value }, "Layout diperbarui.")}
              aria-pressed={layout === l.value}
            >
              <span className={`layout-mock layout-mock--${l.value}`} aria-hidden="true" />
              <strong>{l.label}</strong>
              <small>{l.hint}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <div className="appear-head">
          <h3>Warna aksen</h3>
          <p>Warna untuk tautan penting dan tombol.</p>
        </div>
        <div className="accent-swatches">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              className={`accent-swatch ${accent.toLowerCase() === c ? "selected" : ""}`}
              style={{ background: c }}
              onClick={() => applyHex(c)}
              aria-label={c}
            />
          ))}
        </div>
        <div className="accent-input">
          <span className="accent-chip" style={{ background: isHexColor(hex) ? hex : "var(--line)" }} />
          <input value={hex} onChange={(e) => applyHex(e.target.value.trim())} placeholder="#000000" maxLength={7} />
          {accent && (
            <button type="button" className="button-outline" onClick={() => applyHex("")}>Reset</button>
          )}
        </div>
      </section>

      <section className="admin-card">
        <div className="appear-head">
          <h3>Gaya tombol</h3>
        </div>
        <div className="btnstyle-grid">
          {BUTTON_STYLES.map((b) => (
            <button
              key={b.value}
              type="button"
              className={`btnstyle-card ${buttonStyle === b.value ? "selected" : ""}`}
              onClick={() => patch({ button_style: b.value }, "Gaya tombol diperbarui.")}
              aria-pressed={buttonStyle === b.value}
            >
              <span className={`btnstyle-mock btnstyle-mock--${b.value} shape-${buttonShape}`} aria-hidden="true" />
              <small>{b.label}</small>
            </button>
          ))}
        </div>
        <div className="appear-head" style={{ marginTop: 18 }}>
          <h3>Bentuk tombol</h3>
        </div>
        <div className="btnshape-grid">
          {BUTTON_SHAPES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`btnshape-card ${buttonShape === s.value ? "selected" : ""}`}
              onClick={() => patch({ button_shape: s.value }, "Bentuk tombol diperbarui.")}
              aria-pressed={buttonShape === s.value}
            >
              <span className={`btnshape-mock shape-${s.value}`} aria-hidden="true" />
              <small>{s.label}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
