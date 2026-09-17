// app/apple-icon.tsx
// Home-screen icon (iOS/Android "Add to Home Screen"), styled like the card:
// white lettering on black, dim hairline rules.

import { ImageResponse } from "next/og";
import { COLORS, Wordmark, brandFonts } from "@/lib/brand-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const rule = { display: "flex", flex: 1, height: 1.5, background: COLORS.rule };
  return (
    new ImageResponse(
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
            fontFamily: "Arimo",
            color: COLORS.brand,
          }}
        >
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1 }}>K</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", marginTop: 12 }}>
            <Wordmark size={22} />
            <div style={{ display: "flex", alignItems: "center", marginTop: 6, gap: 5 }}>
              <div style={rule} />
              <div style={{ display: "flex", fontSize: 8, fontWeight: 700, letterSpacing: 2.4, marginRight: -2.4 }}>ADVOCATES</div>
              <div style={rule} />
            </div>
          </div>
        </div>
      ),
      { ...size, fonts: await brandFonts() },
    )
  );
}
