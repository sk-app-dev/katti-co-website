// app/icon.tsx
// Browser-tab icon — see lib/brand-icon.tsx.

import { ImageResponse } from "next/og";
import { brandFonts } from "@/lib/brand-image";
import { BrandIcon } from "@/lib/brand-icon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(<BrandIcon px={64} radius={12} />, { ...size, fonts: await brandFonts() });
}
