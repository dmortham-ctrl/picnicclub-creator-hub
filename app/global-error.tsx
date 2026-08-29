"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest, scope: "global" });
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "Poppins, system-ui, sans-serif",
          background: "#e6eedf",
          color: "#162a24",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <p style={{ fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 12 }}>
            picnic club
          </p>
          <h1 style={{ fontSize: 30, letterSpacing: "-.04em", margin: "18px 0 10px" }}>
            Ada yang tidak beres.
          </h1>
          <p style={{ color: "#4a564f", fontSize: 14, lineHeight: 1.6 }}>
            Terjadi kesalahan tak terduga. Silakan muat ulang halaman.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 18,
              background: "#162a24",
              color: "white",
              border: 0,
              borderRadius: 999,
              padding: "12px 20px",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
