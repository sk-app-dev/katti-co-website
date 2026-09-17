// lib/brand-image.tsx
// Shared pieces for the generated link-preview image and app icons
// (next/og ImageResponse). Satori has no small-caps support, so the
// card's small caps are built by hand: full-size initials, the rest at 80%.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const COLORS = {
  bg: "#07080d",
  text: "#e8e4d8",
  muted: "rgba(232,228,216,.62)",
  gold: "#c9a640",
  brand: "#ffffff",
  line: "rgba(201,166,64,.10)",
};

export async function brandFonts() {
  const dir = join(process.cwd(), "node_modules/@fontsource/arimo/files");
  const bold = await readFile(join(dir, "arimo-latin-700-normal.woff"));
  return [{ name: "Arimo", data: bold, style: "normal" as const, weight: 700 as const }];
}

export function Wordmark({ size }: { size: number }) {
  const small = Math.round(size * 0.8);
  const part = (text: string, s: number, gap = 0) => (
    <span style={{ fontSize: s, marginLeft: gap, marginRight: gap }}>{text}</span>
  );
  return (
    <div style={{ display: "flex", alignItems: "baseline", fontWeight: 700, color: COLORS.brand, lineHeight: 1 }}>
      {part("K", size)}
      {part("ATTI", small)}
      {part("&", size, Math.round(size * 0.24))}
      {part("C", size)}
      {part("O.", small)}
    </div>
  );
}
