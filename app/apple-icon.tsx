// app/apple-icon.tsx
// Home-screen icon (iOS/Android "Add to Home Screen") — see lib/brand-icon.tsx.
// No corner radius: iOS and Android apply their own mask.

import { ImageResponse } from "next/og";
import { brandFonts } from "@/lib/brand-image";
import { BrandIcon } from "@/lib/brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(<BrandIcon px={180} radius={0} />, { ...size, fonts: await brandFonts() });
}
