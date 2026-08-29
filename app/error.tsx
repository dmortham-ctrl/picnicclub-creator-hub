"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportError } from "@/lib/report-error";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, { digest: error.digest });
  }, [error]);

  return (
    <main className="bio-page">
      <div className="bio-card">
        <div className="bio-brand">picnic club</div>
        <h1 style={{ marginTop: 100 }}>Ada yang tidak beres.</h1>
        <p className="bio-copy">
          Halaman ini gagal dimuat. Coba muat ulang; kalau masih bermasalah, kembali ke beranda.
        </p>
        <button className="button-dark" type="button" onClick={reset}>
          Coba lagi
        </button>
        <div style={{ marginTop: 14 }}>
          <Link className="panel-back" href="/">
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
