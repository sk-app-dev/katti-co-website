// app/apple-icon.tsx
// Home-screen icon (iOS/Android "Add to Home Screen").

import { ImageResponse } from "next/og";
import { COLORS, Wordmark, brandFonts } from "@/lib/brand-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
          fontFamily: "Arimo",
        }}
      >
        <div style={{ display: "flex", color: COLORS.gold, fontSize: 96, fontWeight: 700, lineHeight: 1 }}>K</div>
        <div style={{ display: "flex", marginTop: 8, transform: "scale(0.9)" }}>
          <Wordmark size={24} />
        </div>
      </div>
    ),
    { ...size, fonts: await brandFonts() },
  );
}
