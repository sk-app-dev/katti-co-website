// app/icon.tsx
// Browser-tab icon: the card's "K" in gold on the site's dark ground.

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
          alignItems: "center",
          justifyContent: "center",
          background: COLORS.bg,
          borderRadius: 12,
          color: COLORS.gold,
          fontFamily: "Arimo",
          fontWeight: 700,
          fontSize: 46,
          lineHeight: 1,
        }}
      >
        K
      </div>
    ),
    { ...size, fonts: await brandFonts() },
  );
}
