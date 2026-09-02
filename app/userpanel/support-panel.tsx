"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { PelanggaranGuide } from "@/app/components/pelanggaran-guide";

const FORM_SRC =
  "https://docs.google.com/forms/d/e/1FAIpQLSe9UGLP3rRubXW-lE_fH7WXQdaYcfHEagurM_RDZ3QEXMgtQQ/viewform?embedded=true";
const ADMIN_WA = "6289526701680";

export function SupportPanel({ username }: { username: string }) {
  const loads = useRef(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Google Forms is cross-origin — we can't read a submit event, but the iframe
  // fires `load` again when it navigates to the "response recorded" page.
  function onFrameLoad() {
    loads.current += 1;
    if (loads.current >= 2) setConfirmOpen(true);
  }

  const waText = encodeURIComponent(
    `Halo admin Picnic, saya sudah mengirim form Banding Pelanggaran.\nUsername minisite: @${username}\nMohon dikonfirmasi ya. Terima kasih.`,
  );
  const waLink = `https://wa.me/${ADMIN_WA}?text=${waText}`;

  return (
    <div className="support-panel">
      <div className="admin-card">
        <div className="appear-head">
          <h3>Kena Pelanggaran? Gak Usah Panik</h3>
          <p>
            Ikuti langkah di bawah kalau minisite atau akun kamu kena pembatasan dan kamu merasa itu
            keliru.
          </p>
        </div>

        <PelanggaranGuide />

        <hr className="support-divider" />

        <div className="support-formhead">
          <h3>Formulir Banding Pelanggaran</h3>
          <p>Isi formulir di bawah, lalu konfirmasi ke admin lewat WhatsApp supaya diproses lebih cepat.</p>
        </div>

        <div className="support-frame">
          <iframe
            src={FORM_SRC}
            title="Form Banding Pelanggaran"
            onLoad={onFrameLoad}
            loading="lazy"
          >
            Memuat formulir…
          </iframe>
        </div>

        <div className="support-actions">
          <button type="button" className="button-dark" onClick={() => setConfirmOpen(true)}>
            Saya sudah submit — konfirmasi ke admin
          </button>
        </div>
      </div>

      {confirmOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Konfirmasi banding" onClick={() => setConfirmOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="support-modal-head">
              <h2>Konfirmasi ke admin</h2>
              <button type="button" className="button-outline" aria-label="Tutup" onClick={() => setConfirmOpen(false)}><X size={16} /></button>
            </div>
            <p className="hero-copy">
              Banding kamu sudah tercatat. Klik tombol di bawah untuk chat admin Picnic di WhatsApp —
              pesan sudah otomatis terisi, kamu tinggal kirim.
            </p>
            <div className="form-actions">
              <a className="button-dark" href={waLink} target="_blank" rel="noreferrer" onClick={() => setConfirmOpen(false)}>
                Chat admin di WhatsApp
              </a>
              <button type="button" className="button-outline" onClick={() => setConfirmOpen(false)}>Nanti saja</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
