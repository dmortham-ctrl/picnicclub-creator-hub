import { ImageResponse } from "next/og";

export const alt = "Picnic Club — rumah bagi creator & affiliator terbaik Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social-share card for every route that doesn't set its own
// (creator pages at /@username still use the creator's avatar).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#17271f",
          color: "#f2efe4",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#d7f26a",
              color: "#17271f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            P
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>
            picnic club
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            More Than an Agency.
          </div>
          <div style={{ fontSize: 34, color: "#b9c7bd", maxWidth: 900, lineHeight: 1.35 }}>
            Rumah bagi para creator &amp; affiliator terbaik Indonesia — training, mentoring, networking, kolaborasi brand.
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#8fa295" }}>
          <div style={{ width: 40, height: 4, background: "#d7f26a" }} />
          picnicclub.id
        </div>
      </div>
    ),
    { ...size },
  );
}
