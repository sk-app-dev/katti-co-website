// lib/brand.ts
// One place for the firm's name, tagline and public URL, as printed on the
// business card. Page metadata, link previews, the icon and the PDF
// profiles all read from here.

export const SITE_URL = "https://www.kattiandco.com";

export const BRAND = {
  name: "Katti & Co.",
  descriptor: "Advocates",
  areas: ["IP", "Tax", "Disputes"],
  tagline: "Advocates · IP · Tax · Disputes",
  city: "Bengaluru",
  // Informational only (Bar Council Rule 36): who the firm is and what it
  // practises, never a claim or an invitation.
  description:
    "Katti & Co. is a Bengaluru law firm practising in intellectual property, " +
    "technology law, tax, and civil and commercial disputes.",
} as const;

export const SITE_TITLE = `${BRAND.name} — ${BRAND.tagline}`;
