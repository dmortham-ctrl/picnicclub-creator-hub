"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Profile, ProfileLink, SocialItem, BlockType } from "@/lib/types";
import { firstIssue, linkSchema, textBlockSchema, socialBlockSchema, photoBlockSchema } from "@/lib/validation";
import { guessLinkType, LINK_TYPES } from "@/lib/link-types";
import { BLOCK_TYPES, blockTypeLabel, SOCIAL_PLATFORMS, socialPlatformLabel } from "@/lib/blocks";
import { LinkIcon } from "@/app/components/link-icon";
import { SocialIcon } from "@/app/components/social-icons";
import { RichTextEditor } from "@/app/components/rich-text-editor";

type Draft = {
  label: string;
  url: string;
  link_type: string;
  affiliate_disclosure: boolean;
  wa_float: boolean;
  html: string;
  items: SocialItem[];
  caption: string;
};

const EMPTY: Draft = { label: "", url: "", link_type: "link", affiliate_disclosure: false, wa_float: false, html: "", items: [], caption: "" };

function draftFrom(block: ProfileLink): Draft {
  return {
    label: block.label ?? "",
    url: block.url ?? "",
    link_type: block.link_type ?? "link",
    affiliate_disclosure: block.affiliate_disclosure ?? false,
    wa_float: block.content?.wa_float ?? false,
    html: block.content?.html ?? "",
    items: block.content?.items?.length ? block.content.items : [{ platform: "instagram", url: "" }],
    caption: block.content?.caption ?? "",
  };
}

export function BlockManager({
  profile,
  links,
  setLinks,
  onError,
  onNotice,
  onMutated,
}: {
  profile: Profile;
  links: ProfileLink[];
  setLinks: Dispatch<SetStateAction<ProfileLink[]>>;
  onError: (msg: string) => void;
  onNotice: (msg: string) => void;
  onMutated: () => void;
}) {
  const [adding, setAdding] = useState<BlockType | null>(null);
  const [addDraft, setAddDraft] = useState<Draft>(EMPTY);
  const [addImage, setAddImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImageCleared, setEditImageCleared] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const ordered = [...links].sort((a, b) => a.sort_order - b.sort_order);

  async function uploadImage(file: File): Promise<string | null> {
    if (!supabase) return null;
    if (!file.type.startsWith("image/")) { onError("File harus berupa gambar."); return null; }
    if (file.size > 5 * 1024 * 1024) { onError("Ukuran gambar maksimal 5 MB."); return null; }
    const path = `links/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error } = await supabase.storage.from("Avatar").upload(path, file, { contentType: file.type, upsert: false });
    if (error) { onError(error.message); return null; }
    return supabase.storage.from("Avatar").getPublicUrl(path).data.publicUrl;
  }

  /** Turn a draft into the columns to write, or an error string. */
  async function buildRow(
    type: BlockType,
    draft: Draft,
    imageFile: File | null,
    existingImage: string,
    imageCleared: boolean,
  ): Promise<{ row: Record<string, unknown> } | { error: string }> {
    if (type === "text") {
      const parsed = textBlockSchema.safeParse({ html: draft.html });
      if (!parsed.success) return { error: firstIssue(parsed.error) };
      return { row: { block_type: "text", label: "", url: "", link_type: "link", icon_key: "link", image_url: "", content: { html: parsed.data.html } } };
    }
    if (type === "social") {
      const parsed = socialBlockSchema.safeParse({ items: draft.items.filter((i) => i.url.trim()) });
      if (!parsed.success) return { error: firstIssue(parsed.error) };
      return { row: { block_type: "social", label: "", url: "", link_type: "link", icon_key: "link", image_url: "", content: { items: parsed.data.items } } };
    }
    if (type === "photo") {
      let image = imageCleared ? "" : existingImage;
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        if (uploaded === null) return { error: "" };
        image = uploaded;
      }
      const parsed = photoBlockSchema.safeParse({ image_url: image, url: draft.url, caption: draft.caption });
      if (!parsed.success) return { error: firstIssue(parsed.error) };
      return { row: { block_type: "photo", label: "", url: parsed.data.url, link_type: "link", icon_key: "link", image_url: parsed.data.image_url, content: { caption: parsed.data.caption } } };
    }
    // link
    const parsed = linkSchema.safeParse({
      label: draft.label,
      url: draft.url,
      link_type: draft.link_type,
      affiliate_disclosure: draft.affiliate_disclosure,
    });
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const isWa = parsed.data.link_type === "whatsapp";
    return {
      row: {
        block_type: "link",
        label: parsed.data.label,
        url: parsed.data.url,
        link_type: parsed.data.link_type,
        icon_key: parsed.data.link_type,
        image_url: "",
        affiliate_disclosure: parsed.data.affiliate_disclosure,
        content: isWa && draft.wa_float ? { wa_float: true } : {},
      },
    };
  }

  async function addBlock(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !adding) return;
    setSaving(true);
    const built = await buildRow(adding, addDraft, addImage, "", false);
    if ("error" in built) { if (built.error) onError(built.error); setSaving(false); return; }
    onError("");
    const nextOrder = links.length ? Math.max(...links.map((l) => l.sort_order)) + 1 : 1;
    const { data, error } = await supabase
      .from("profile_links")
      .insert({ profile_id: profile.id, ...built.row, sort_order: nextOrder, is_active: true })
      .select()
      .single();
    if (error) onError(error.message);
    if (data) {
      setLinks((rows) => [...rows, data as ProfileLink]);
      setAdding(null);
      setAddDraft(EMPTY);
      setAddImage(null);
      onNotice("Block ditambahkan.");
      onMutated();
    }
    setSaving(false);
  }

  async function saveEdit(block: ProfileLink) {
    if (!supabase) return;
    setSaving(true);
    const type = (block.block_type ?? "link") as BlockType;
    const built = await buildRow(type, editDraft, editImage, block.image_url ?? "", editImageCleared);
    if ("error" in built) { if (built.error) onError(built.error); setSaving(false); return; }
    onError("");
    const { error } = await supabase.from("profile_links").update(built.row).eq("id", block.id);
    if (error) { onError(error.message); setSaving(false); return; }
    setLinks((rows) => rows.map((r) => (r.id === block.id ? ({ ...r, ...built.row } as ProfileLink) : r)));
    setEditingId(null);
    setEditImage(null);
    setEditImageCleared(false);
    onNotice("Block diperbarui.");
    onMutated();
    setSaving(false);
  }

  async function toggleActive(block: ProfileLink) {
    if (!supabase) return;
    const { error } = await supabase.from("profile_links").update({ is_active: !block.is_active }).eq("id", block.id);
    if (error) return onError(error.message);
    setLinks((rows) => rows.map((r) => (r.id === block.id ? { ...r, is_active: !r.is_active } : r)));
    onMutated();
  }

  async function move(block: ProfileLink, direction: -1 | 1) {
    if (!supabase) return;
    const index = ordered.findIndex((l) => l.id === block.id);
    const swap = ordered[index + direction];
    if (!swap) return;
    const a = { ...block, sort_order: swap.sort_order };
    const b = { ...swap, sort_order: block.sort_order };
    setLinks((rows) => rows.map((r) => (r.id === a.id ? a : r.id === b.id ? b : r)));
    const [r1, r2] = await Promise.all([
      supabase.from("profile_links").update({ sort_order: a.sort_order }).eq("id", a.id),
      supabase.from("profile_links").update({ sort_order: b.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) onError((r1.error ?? r2.error)!.message);
    else onMutated();
  }

  async function remove(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("profile_links").delete().eq("id", id);
    if (error) return onError(error.message);
    setLinks((rows) => rows.filter((r) => r.id !== id));
    setConfirmDeleteId(null);
    onNotice("Block dihapus.");
    onMutated();
  }

  function startEdit(block: ProfileLink) {
    setEditingId(block.id);
    setEditDraft(draftFrom(block));
    setEditImage(null);
    setEditImageCleared(false);
  }

  return (
    <div className="admin-card link-manager">
      <h2>Masukan link kamu</h2>

      <div className="admin-list">
        {ordered.map((block, index) => {
          const type = (block.block_type ?? "link") as BlockType;
          if (editingId === block.id) {
            return (
              <div className="link-row" key={block.id}>
                <form className="link-edit" onSubmit={(e) => { e.preventDefault(); saveEdit(block); }}>
                  <span className="block-tag">{blockTypeLabel(type)}</span>
                  <BlockFields
                    type={type}
                    draft={editDraft}
                    setDraft={setEditDraft}
                    image={editImage}
                    setImage={setEditImage}
                    existingImage={editImageCleared ? "" : block.image_url ?? ""}
                    onClearImage={() => { setEditImage(null); setEditImageCleared(true); }}
                  />
                  <div className="form-actions">
                    <button className="button-dark" type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
                    <button className="button-outline" type="button" onClick={() => setEditingId(null)}>Batal</button>
                  </div>
                </form>
              </div>
            );
          }
          if (confirmDeleteId === block.id) {
            return (
              <div className="link-row" key={block.id}>
                <div className="link-delete-confirm">
                  <span>Hapus block ini?</span>
                  <div className="link-row-actions">
                    <button className="button-dark" type="button" onClick={() => remove(block.id)}>Ya, hapus</button>
                    <button className="button-outline" type="button" onClick={() => setConfirmDeleteId(null)}>Batal</button>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div className="link-row" key={block.id}>
              <span className="link-row-icon">
                {type === "link" && block.image_url
                  ? <Image className="link-thumb" src={block.image_url} alt="" width={48} height={48} />
                  : type === "photo" && block.image_url
                  ? <Image className="link-thumb" src={block.image_url} alt="" width={48} height={48} />
                  : type === "social"
                  ? <SocialIcon platform={block.content?.items?.[0]?.platform ?? "website"} size={20} />
                  : type === "text"
                  ? <span aria-hidden="true">¶</span>
                  : <LinkIcon linkType={block.link_type} />}
              </span>
              <div className="link-row-main">
                <strong>
                  <span className="block-tag">{blockTypeLabel(type)}</span>
                  {rowSummary(block, type)}
                  {!block.is_active && <em className="link-off"> · nonaktif</em>}
                  {type === "link" && block.affiliate_disclosure && <em className="link-aff"> · affiliate</em>}
                  {type === "link" && block.content?.wa_float && <em className="link-aff"> · melayang</em>}
                </strong>
                {(type === "link" || (type === "photo" && block.url)) && <small>{block.url}</small>}
              </div>
              <div className="link-row-actions">
                <button className="icon-button" type="button" aria-label="Naikkan" disabled={index === 0} onClick={() => move(block, -1)}>↑</button>
                <button className="icon-button" type="button" aria-label="Turunkan" disabled={index === ordered.length - 1} onClick={() => move(block, 1)}>↓</button>
                <button className="button-outline" type="button" onClick={() => toggleActive(block)}>{block.is_active ? "Sembunyikan" : "Aktifkan"}</button>
                <button className="button-outline" type="button" onClick={() => startEdit(block)}>Edit</button>
                <button className="button-outline" type="button" onClick={() => setConfirmDeleteId(block.id)}>Hapus</button>
              </div>
            </div>
          );
        })}
        {links.length === 0 && <p className="hero-copy">Belum ada block. Tambahkan block pertama kamu.</p>}
      </div>

      <div className="block-add">
        {adding === null ? (
          <>
            <p className="block-add-label">Tambah block</p>
            <div className="block-type-grid">
              {BLOCK_TYPES.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  className="block-type-button"
                  onClick={() => { setAdding(b.value); setAddDraft(b.value === "social" ? { ...EMPTY, items: [{ platform: "instagram", url: "" }] } : EMPTY); setAddImage(null); onError(""); }}
                >
                  <span className="block-type-icon">
                    {b.value === "link" && <LinkIcon linkType="link" />}
                    {b.value === "social" && <SocialIcon platform="instagram" size={20} />}
                    {b.value === "text" && <span aria-hidden="true">¶</span>}
                    {b.value === "photo" && <span aria-hidden="true">🖼</span>}
                  </span>
                  <strong>{b.label}</strong>
                  <small>{b.hint}</small>
                </button>
              ))}
            </div>
          </>
        ) : (
          <form className="admin-form" onSubmit={addBlock}>
            <div className="block-add-head">
              <strong>Block baru: {blockTypeLabel(adding)}</strong>
              <button type="button" className="button-outline" onClick={() => { setAdding(null); onError(""); }}>Ganti jenis</button>
            </div>
            <BlockFields
              type={adding}
              draft={addDraft}
              setDraft={setAddDraft}
              image={addImage}
              setImage={setAddImage}
              existingImage=""
              onClearImage={() => setAddImage(null)}
            />
            <button className="button-dark" type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Tambah block"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

function rowSummary(block: ProfileLink, type: BlockType): string {
  if (type === "link") return ` ${block.label}`;
  if (type === "text") return ` ${block.content?.html?.replace(/<[^>]+>/g, "").slice(0, 40) || "(kosong)"}`;
  if (type === "social") return ` ${(block.content?.items ?? []).map((i) => socialPlatformLabel(i.platform)).join(", ") || "(kosong)"}`;
  if (type === "photo") return ` ${block.content?.caption || "Foto"}`;
  return "";
}

function BlockFields({
  type,
  draft,
  setDraft,
  image,
  setImage,
  existingImage,
  onClearImage,
}: {
  type: BlockType;
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  image: File | null;
  setImage: (f: File | null) => void;
  existingImage: string;
  onClearImage: () => void;
}) {
  if (type === "text") {
    return (
      <label>
        Teks
        <RichTextEditor value={draft.html} onChange={(html) => setDraft((d) => ({ ...d, html }))} />
      </label>
    );
  }

  if (type === "social") {
    return (
      <div className="social-rows">
        {draft.items.map((item, i) => (
          <div className="social-row" key={i}>
            <select
              value={item.platform}
              onChange={(e) => setDraft((d) => ({ ...d, items: d.items.map((it, j) => (j === i ? { ...it, platform: e.target.value } : it)) }))}
            >
              {SOCIAL_PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <input
              type="text"
              value={item.url}
              placeholder={SOCIAL_PLATFORMS.find((p) => p.key === item.platform)?.placeholder}
              onChange={(e) => setDraft((d) => ({ ...d, items: d.items.map((it, j) => (j === i ? { ...it, url: e.target.value } : it)) }))}
            />
            {draft.items.length > 1 && (
              <button type="button" className="icon-button" aria-label="Hapus akun" onClick={() => setDraft((d) => ({ ...d, items: d.items.filter((_, j) => j !== i) }))}>×</button>
            )}
          </div>
        ))}
        {draft.items.length < 12 && (
          <button type="button" className="button-outline" onClick={() => setDraft((d) => ({ ...d, items: [...d.items, { platform: "instagram", url: "" }] }))}>
            + Tambah akun
          </button>
        )}
      </div>
    );
  }

  if (type === "photo") {
    return (
      <>
        <div className="link-image-field">
          {image ? (
            <Image className="link-thumb" src={URL.createObjectURL(image)} alt="" width={48} height={48} unoptimized />
          ) : existingImage ? (
            <Image className="link-thumb" src={existingImage} alt="" width={48} height={48} />
          ) : (
            <span className="link-thumb link-thumb--empty" aria-hidden="true" />
          )}
          <label className="link-image-pick">Foto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImage(e.target.files?.[0] ?? null)} /></label>
          {(image || existingImage) && <button type="button" className="button-outline" onClick={onClearImage}>Hapus foto</button>}
        </div>
        <label>Caption (opsional)<input type="text" maxLength={120} value={draft.caption} onChange={(e) => setDraft((d) => ({ ...d, caption: e.target.value }))} /></label>
        <label>Link saat foto diklik (opsional)<input type="url" value={draft.url} placeholder="https://..." onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} /></label>
      </>
    );
  }

  // link
  return (
    <>
      <div className="admin-row">
        <label>Label<input required value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} placeholder="My favorite finds" /></label>
        <label>Tipe
          <select value={draft.link_type} onChange={(e) => setDraft((d) => ({ ...d, link_type: e.target.value }))}>
            {LINK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
      </div>
      <label>URL<input required type="url" value={draft.url} onChange={(e) => { const url = e.target.value; setDraft((d) => ({ ...d, url, link_type: d.link_type === "link" ? guessLinkType(url) : d.link_type })); }} placeholder="https://..." /></label>
      {draft.link_type === "whatsapp" && (
        <fieldset className="wa-display">
          <legend>Tampilan tombol WhatsApp</legend>
          <label className="radio-label">
            <input type="radio" checked={!draft.wa_float} onChange={() => setDraft((d) => ({ ...d, wa_float: false }))} />
            Di daftar link (seperti link lain)
          </label>
          <label className="radio-label">
            <input type="radio" checked={draft.wa_float} onChange={() => setDraft((d) => ({ ...d, wa_float: true }))} />
            Tombol melayang di pojok kanan bawah
          </label>
        </fieldset>
      )}
      <label className="checkbox-label"><input type="checkbox" checked={draft.affiliate_disclosure} onChange={(e) => setDraft((d) => ({ ...d, affiliate_disclosure: e.target.checked }))} /> Tautan affiliasi / berbayar</label>
    </>
  );
}
