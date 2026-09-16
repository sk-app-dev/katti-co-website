// components/BrandMark.tsx
// The wordmark as printed on the business card:
//   KATTI & CO.
//   ── ADVOCATES ──
//   IP · TAX · DISPUTES

import { BRAND } from "@/lib/brand";

export default function BrandMark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className={`brand brand--${size}`}>
      <span className="brand-name">{BRAND.name}</span>
      <span className="brand-descriptor">{BRAND.descriptor}</span>
      <span className="brand-areas">{BRAND.areas.join(" · ")}</span>
    </span>
  );
}
