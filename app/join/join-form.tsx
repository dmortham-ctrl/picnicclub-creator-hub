"use client";

import { useState } from "react";
import { X } from "lucide-react";

const EXPERIENCE = [
  "Belum pernah, mau mulai",
  "Baru mulai (< 3 bulan)",
  "Sudah jalan (3-12 bulan)",
  "Sudah berpengalaman (> 1 tahun)",
];

export function JoinForm({
  program,
  adminWa,
  waMessage,
  socialLabel,
}: {
  program: "tiktok" | "shopee";
  adminWa: string;
  waMessage: string;
  socialLabel: string;
}) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [socialUsername, setSocialUsername] = useState("");
  const [experience, setExperience] = useState(EXPERIENCE[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const waLink = `https://wa.me/${adminWa}?text=${encodeURIComponent(waMessage)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          program,
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          social_username: socialUsername.trim(),
          experience,
          note: note.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim. Coba lagi.");
        return;
      }
      setDone(true);
    } catch {
      setError("Gagal terhubung. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="support-panel">
      <form className="admin-card admin-form join-form" onSubmit={submit}>
        <div className="admin-row">
          <label>Nama lengkap<input required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu" /></label>
          <label>Nomor WhatsApp<input required type="tel" maxLength={30} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="0857xxxxxxxx" /></label>
        </div>
        <div className="admin-row">
          <label>Email<input type="email" maxLength={160} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@email.com" /></label>
          <label>{socialLabel}<input maxLength={80} value={socialUsername} onChange={(e) => setSocialUsername(e.target.value)} placeholder="@username" /></label>
        </div>
        <label>Pengalaman affiliate
          <select value={experience} onChange={(e) => setExperience(e.target.value)}>
            {EXPERIENCE.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label>Catatan (opsional)<textarea rows={3} maxLength={600} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ada yang mau kamu sampaikan?" /></label>

        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button className="button-dark" type="submit" disabled={busy}>{busy ? "Mengirim…" : "Kirim pendaftaran"}</button>
        </div>
      </form>

      {done && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Pendaftaran terkirim" onClick={() => setDone(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="support-modal-head">
              <h2>Pendaftaran terkirim 🎉</h2>
              <button type="button" className="button-outline" aria-label="Tutup" onClick={() => setDone(false)}><X size={16} /></button>
            </div>
            <p className="hero-copy">
              Data kamu sudah masuk. Untuk diproses lebih cepat, konfirmasi ke admin Picnic Club di WhatsApp —
              pesan sudah otomatis terisi, kamu tinggal kirim.
            </p>
            <div className="form-actions">
              <a className="button-dark" href={waLink} target="_blank" rel="noreferrer">Chat admin di WhatsApp</a>
              <button type="button" className="button-outline" onClick={() => setDone(false)}>Nanti saja</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
