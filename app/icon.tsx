// app/icon.tsx
// Browser-tab icon — see lib/brand-icon.tsx.

import { ImageResponse } from "next/og";
import { brandFonts } from "@/lib/brand-image";
import { BrandIcon } from "@/lib/brand-icon";

export const size = { width: 144, height: 144 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(<BrandIcon px={144} radius={26} />, { ...size, fonts: await brandFonts() });
}
