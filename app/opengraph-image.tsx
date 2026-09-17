// app/opengraph-image.tsx
// The preview card shown when a kattiandco.com link is shared on WhatsApp,
// LinkedIn, X, Slack, iMessage etc. Rendered once at build time.

import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { COLORS, Wordmark, brandFonts } from "@/lib/brand-image";

export const alt = `${BRAND.name} — ${BRAND.tagline}, ${BRAND.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const rule = { flex: 1, height: 1.5, background: "rgba(255,255,255,.45)" };
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: COLORS.bg,
          backgroundImage: `linear-gradient(${COLORS.line} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.line} 1px, transparent 1px)`,
          backgroundSize: "62px 62px",
          fontFamily: "Arimo",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
          <Wordmark size={132} />
          <div style={{ display: "flex", alignItems: "center", marginTop: 26, gap: 26 }}>
            <div style={rule} />
            <div style={{ fontSize: 36, letterSpacing: 16, marginRight: -16, color: COLORS.brand, fontWeight: 700 }}>ADVOCATES</div>
            <div style={rule} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
            <div
              style={{
                fontSize: 27,
                letterSpacing: 10,
                color: COLORS.brand,
                fontWeight: 700,
                paddingBottom: 10,
                paddingLeft: 10,
                borderBottom: `1.5px solid rgba(255,255,255,.45)`,
              }}
            >
              {BRAND.areas.map((a) => a.toUpperCase()).join("  ·  ")}
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 44,
            display: "flex",
            fontSize: 24,
            letterSpacing: 4,
            color: COLORS.muted,
            fontWeight: 700,
          }}
        >
          {`${BRAND.city.toUpperCase()}   ·   WWW.KATTIANDCO.COM`}
        </div>
      </div>
    ),
    { ...size, fonts: await brandFonts() },
  );
}
