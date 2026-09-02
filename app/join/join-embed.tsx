"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * Google Forms embed + "confirm to admin on WhatsApp" popup, matching the
 * Banding Pelanggaran flow. Google Forms is cross-origin so we can't read a
 * submit event — but the iframe fires `load` again when it navigates to its
 * "response recorded" page, which we use to trigger the confirm modal.
 */
export function JoinEmbed({
  formSrc,
  adminWa,
  waMessage,
  title,
}: {
  formSrc: string;
  adminWa: string;
  waMessage: string;
  title: string;
}) {
  const loads = useRef(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function onFrameLoad() {
    loads.current += 1;
    if (loads.current >= 2) setConfirmOpen(true);
  }

  const waLink = `https://wa.me/${adminWa}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="support-panel">
      <div className="support-frame">
        <iframe src={formSrc} title={title} onLoad={onFrameLoad} loading="lazy">
          Memuat formulir…
        </iframe>
      </div>

      <div className="support-actions">
        <button type="button" className="button-dark" onClick={() => setConfirmOpen(true)}>
          Saya sudah submit — konfirmasi ke admin
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
              <button
                type="button"
                className="button-outline"
                aria-label="Tutup"
                onClick={() => setConfirmOpen(false)}
              >
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
