"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

const FORM_SRC =
  "https://docs.google.com/forms/d/e/1FAIpQLSftrMydNstjbpli7liWgbW3Zn5tzDOSDT3anlFC6R04woB-8Q/viewform?embedded=true";
const ADMIN_WA = "6287888527772";

export function JoinForm() {
  const loads = useRef(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Google Forms is cross-origin — we can't read a submit event, but the iframe
  // fires `load` again when it navigates to the "response recorded" page.
  function onFrameLoad() {
    loads.current += 1;
    if (loads.current >= 2) setConfirmOpen(true);
  }

  const waText = encodeURIComponent(
    "Halo admin Picnic Club, saya baru saja mengisi formulir Join as Creator.\nMohon dikonfirmasi ya. Terima kasih.",
  );
  const waLink = `https://wa.me/${ADMIN_WA}?text=${waText}`;

  return (
    <div className="support-panel">
      <div className="support-frame">
        <iframe src={FORM_SRC} title="Formulir Join as Creator" onLoad={onFrameLoad} loading="lazy">
          Memuat formulir…
        </iframe>
      </div>

      <div className="support-actions">
        <button type="button" className="button-dark" onClick={() => setConfirmOpen(true)}>
          Saya sudah mengisi — konfirmasi ke admin
        </button>
      </div>

      {confirmOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi pendaftaran"
          onClick={() => setConfirmOpen(false)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="support-modal-head">
              <h2>Konfirmasi ke admin</h2>
              <button type="button" className="button-outline" aria-label="Tutup" onClick={() => setConfirmOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="hero-copy">
              Pendaftaran kamu sudah tercatat. Klik tombol di bawah untuk chat admin Picnic Club di
              WhatsApp — pesan sudah otomatis terisi, kamu tinggal kirim.
            </p>
            <div className="form-actions">
              <a
                className="button-dark"
                href={waLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => setConfirmOpen(false)}
              >
                Chat admin di WhatsApp
              </a>
              <button type="button" className="button-outline" onClick={() => setConfirmOpen(false)}>
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
