"use client";

import type { RateCardItem } from "@/lib/types";

/**
 * Editable rows for a rate card: one row per paid service (label + price +
 * optional note), plus a footer note. Shared by the manual block editor
 * (block-manager.tsx) and the AI generator (ratecard-panel.tsx) so a
 * generated rate card can be tweaked with the exact same controls.
 */
export function RatecardFields({
  items,
  setItems,
  note,
  setNote,
}: {
  items: RateCardItem[];
  setItems: (items: RateCardItem[]) => void;
  note: string;
  setNote: (note: string) => void;
}) {
  function update(index: number, patch: Partial<RateCardItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="ratecard-rows">
      {items.map((item, i) => (
        <div className="ratecard-row" key={i}>
          <input
            value={item.label}
            maxLength={80}
            placeholder="Nama layanan (mis. 1 Video TikTok)"
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <input
            value={item.price}
            maxLength={40}
            placeholder="Rp 300.000"
            onChange={(e) => update(i, { price: e.target.value })}
          />
          <input
            value={item.note ?? ""}
            maxLength={120}
            placeholder="Catatan (opsional)"
            onChange={(e) => update(i, { note: e.target.value })}
          />
          {items.length > 1 && (
            <button type="button" className="icon-button" aria-label="Hapus layanan" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              ×
            </button>
          )}
        </div>
      ))}
      {items.length < 12 && (
        <button type="button" className="button-outline" onClick={() => setItems([...items, { label: "", price: "", note: "" }])}>
          + Tambah layanan
        </button>
      )}
      <label>
        Catatan tambahan (opsional)
        <textarea
          rows={2}
          maxLength={200}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Mis. harga bisa nego untuk kerja sama jangka panjang, cara booking, dll."
        />
      </label>
    </div>
  );
}
