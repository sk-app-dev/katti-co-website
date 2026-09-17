// app/icon.tsx
// Browser-tab icon: the card's "K" in white on black, with the card's
// hairline rule beneath it.

import { ImageResponse } from "next/og";
import { COLORS, brandFonts } from "@/lib/brand-image";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
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
          background: "#000",
          borderRadius: 12,
          fontFamily: "Arimo",
        }}
      >
        <div style={{ display: "flex", color: COLORS.brand, fontWeight: 700, fontSize: 44, lineHeight: 1 }}>K</div>
        <div style={{ display: "flex", width: 34, height: 2, marginTop: 4, background: COLORS.rule }} />
      </div>
    ),
    { ...size, fonts: await brandFonts() },
  );
}
