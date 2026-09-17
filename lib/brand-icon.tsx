// lib/brand-icon.tsx
// The site icon, stacked like the tiers on the business card:
//     K
//   ─────
//   &CO.
// White on black with a dim hairline, drawn at any square size.

import { COLORS } from "@/lib/brand-image";

export function BrandIcon({ px, radius }: { px: number; radius: number }) {
  const hair = Math.max(1, Math.round(px / 60));
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        borderRadius: radius,
        color: COLORS.brand,
        fontFamily: "Arimo",
        fontWeight: 700,
      }}
    >
      <div style={{ display: "flex", fontSize: px * 0.5, lineHeight: 0.8 }}>K</div>
      <div style={{ display: "flex", width: px * 0.62, height: hair, marginTop: px * 0.08, marginBottom: px * 0.07, background: COLORS.rule }} />
      <div style={{ display: "flex", alignItems: "baseline", fontSize: px * 0.2, lineHeight: 0.8, letterSpacing: px * 0.006 }}>
        <span>&amp;C</span>
        <span style={{ fontSize: px * 0.16 }}>O.</span>
      </div>
    </div>
  );
}
