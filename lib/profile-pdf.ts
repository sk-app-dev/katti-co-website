// lib/profile-pdf.ts
// Builds downloadable PDF profiles for the founder and team members from the
// same Sanity content the About section renders — so a profile can never drift
// from what the site shows. Server-only: it uses the token-bearing client.

import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  RGB,
  StandardFonts,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setCharacterSpacing,
} from "pdf-lib";
import { client, SITE_SETTINGS_QUERY } from "@/lib/sanity";
import { urlFor } from "@/lib/sanityImage";

// ── Data ─────────────────────────────────────────────────────

export interface ProfilePerson {
  _id: string;
  _type: "founder" | "teamMember";
  name: string;
  title?: string;
  bio?: string;
  qualifications?: string[];
  expertise?: string[];
  linkedIn?: string;
  email?: string;
  imageAsset?: { _id: string; url: string } | null;
}

interface FirmDetails {
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  pincode?: string;
}

const PERSON_FIELDS = `
  _id, _type, name, title, bio, qualifications, expertise, linkedIn, email,
  "imageAsset": image.asset->{ _id, url }
`;

// The shared client carries a server token, and an authenticated query returns
// unpublished drafts alongside published documents. A half-edited bio must
// never end up in a download, so drafts are excluded explicitly.
const PUBLISHED = `!(_id in path("drafts.**"))`;

const PROFILE_BY_ID_QUERY = `*[_type in ["founder", "teamMember"] && _id == $id && ${PUBLISHED}][0]{${PERSON_FIELDS}}`;

const ALL_PROFILES_QUERY = `{
  "founder": *[_type == "founder" && ${PUBLISHED}][0]{${PERSON_FIELDS}},
  "team": *[_type == "teamMember" && ${PUBLISHED}] | order(_createdAt asc){${PERSON_FIELDS}}
}`;

export async function loadProfiles(id: string): Promise<ProfilePerson[]> {
  if (id === "all") {
    const { founder, team } = await client.fetch<{
      founder: ProfilePerson | null;
      team: ProfilePerson[] | null;
    }>(ALL_PROFILES_QUERY);
    return [...(founder ? [founder] : []), ...(team ?? [])];
  }
  const person = await client.fetch<ProfilePerson | null>(PROFILE_BY_ID_QUERY, { id });
  return person ? [person] : [];
}

async function loadFirm(): Promise<FirmDetails> {
  try {
    return (await client.fetch<FirmDetails | null>(SITE_SETTINGS_QUERY)) ?? {};
  } catch {
    return {};
  }
}

// ── Text handling ────────────────────────────────────────────

// The built-in PDF fonts only encode the WinAnsi character set. Dashes, curly
// quotes and accented Latin letters are fine; ₹, arrows or Indic script would
// throw and fail the whole download, so those are mapped or replaced first.
const REPLACEMENTS: Record<string, string> = {
  "₹": "Rs. ",
  "→": "->",
  "←": "<-",
  " ": " ",
  "​": "",
};

function makeSanitizer(font: PDFFont) {
  const cache = new Map<string, string>();
  return (input: string | undefined | null): string => {
    if (!input) return "";
    let out = "";
    for (const ch of input) {
      let mapped = cache.get(ch);
      if (mapped === undefined) {
        mapped = REPLACEMENTS[ch] ?? ch;
        try {
          font.widthOfTextAtSize(mapped, 10);
        } catch {
          const ascii = mapped.normalize("NFKD").replace(/[^\x20-\x7e]/g, "");
          mapped = ascii;
        }
        cache.set(ch, mapped);
      }
      out += mapped;
    }
    return out;
  };
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    // A single word wider than the column (e.g. a long URL) is hard-broken.
    let rest = word;
    while (font.widthOfTextAtSize(rest, size) > maxWidth) {
      let cut = rest.length - 1;
      while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), size) > maxWidth) cut--;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    line = rest;
  }
  if (line) lines.push(line);
  return lines;
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

// ── Layout ───────────────────────────────────────────────────

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 54;
const BAND_H = 80;
const FOOTER_H = 52;

const INK = rgb(0.11, 0.12, 0.16);
const INK_SOFT = rgb(0.36, 0.38, 0.44);
const RULE = rgb(0.84, 0.82, 0.76);
const GOLD_ON_LIGHT = rgb(0.6, 0.47, 0.15);
const GOLD_ON_DARK = rgb(0.79, 0.65, 0.25);
const BAND = rgb(0.05, 0.06, 0.09);
const BAND_TEXT_STRONG = rgb(1, 1, 1);

interface Fonts {
  serif: PDFFont;
  sans: PDFFont;
  sansBold: PDFFont;
}

function drawSpaced(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; size: number; font: PDFFont; color: ReturnType<typeof rgb>; spacing: number },
) {
  page.pushOperators(pushGraphicsState(), setCharacterSpacing(opts.spacing));
  page.drawText(text, { x: opts.x, y: opts.y, size: opts.size, font: opts.font, color: opts.color });
  page.pushOperators(popGraphicsState());
}

function spacedWidth(text: string, font: PDFFont, size: number, spacing: number) {
  return font.widthOfTextAtSize(text, size) + spacing * Math.max(0, text.length - 1);
}

async function fetchPhoto(doc: PDFDocument, person: ProfilePerson): Promise<PDFImage | null> {
  if (!person.imageAsset?._id) return null;
  try {
    // The raw asset, never the stored hotspot crop — the founder's photo was
    // once visibly cut off by a Studio crop, so profiles always show the whole
    // uploaded image and scale it to fit instead.
    const url = urlFor(person.imageAsset).width(560).format("jpg").quality(85).url();
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await doc.embedJpg(new Uint8Array(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

// Small caps the way the business card sets the name: full-height initials,
// the rest at 80%. Helvetica Bold is the PDF standard face closest to Arial.
const WORDMARK: [string, number][] = [["K", 1], ["ATTI", 0.8], [" & ", 1], ["C", 1], ["O.", 0.8]];

function wordmarkWidth(fonts: Fonts, size: number) {
  return WORDMARK.reduce((w, [t, s]) => w + fonts.sansBold.widthOfTextAtSize(t, size * s), 0);
}

function drawWordmarkName(page: PDFPage, fonts: Fonts, x: number, y: number, size: number, color: RGB) {
  for (const [text, scale] of WORDMARK) {
    page.drawText(text, { x, y, size: size * scale, font: fonts.sansBold, color });
    x += fonts.sansBold.widthOfTextAtSize(text, size * scale);
  }
}

function drawBand(page: PDFPage, fonts: Fonts) {
  page.drawRectangle({ x: 0, y: PAGE_H - BAND_H, width: PAGE_W, height: BAND_H, color: BAND });
  page.drawRectangle({ x: 0, y: PAGE_H - BAND_H, width: PAGE_W, height: 2, color: GOLD_ON_DARK });

  // KATTI & CO.  /  ── ADVOCATES ──  /  IP · TAX · DISPUTES
  const nameSize = 22;
  const nameW = wordmarkWidth(fonts, nameSize);
  const mid = MARGIN + nameW / 2;
  drawWordmarkName(page, fonts, MARGIN, PAGE_H - 38, nameSize, BAND_TEXT_STRONG);

  const adv = "ADVOCATES";
  const advW = spacedWidth(adv, fonts.sansBold, 6.5, 2.2);
  const advY = PAGE_H - 52;
  drawSpaced(page, adv, { x: mid - advW / 2, y: advY, size: 6.5, font: fonts.sansBold, color: BAND_TEXT_STRONG, spacing: 2.2 });
  for (const [x1, x2] of [[MARGIN, mid - advW / 2 - 6], [mid + advW / 2 + 6, MARGIN + nameW]]) {
    page.drawLine({ start: { x: x1, y: advY + 2.3 }, end: { x: x2, y: advY + 2.3 }, thickness: 0.9, color: BAND_TEXT_STRONG });
  }

  const areas = "IP  ·  TAX  ·  DISPUTES";
  const areasW = spacedWidth(areas, fonts.sansBold, 5.5, 1.3);
  const areasY = PAGE_H - 63;
  drawSpaced(page, areas, { x: mid - areasW / 2, y: areasY, size: 5.5, font: fonts.sansBold, color: BAND_TEXT_STRONG, spacing: 1.3 });
  page.drawLine({ start: { x: mid - areasW / 2, y: areasY - 3 }, end: { x: mid + areasW / 2, y: areasY - 3 }, thickness: 0.9, color: BAND_TEXT_STRONG });

  const label = "PROFESSIONAL PROFILE";
  const w = spacedWidth(label, fonts.sans, 7.5, 1.4);
  drawSpaced(page, label, {
    x: PAGE_W - MARGIN - w,
    y: PAGE_H - 45,
    size: 7.5,
    font: fonts.sans,
    color: GOLD_ON_DARK,
    spacing: 1.4,
  });
}

function drawContinuationHeader(page: PDFPage, fonts: Fonts, name: string) {
  const y = PAGE_H - MARGIN;
  drawWordmarkName(page, fonts, MARGIN, y, 10, GOLD_ON_LIGHT);
  const w = fonts.sans.widthOfTextAtSize(name, 8.5);
  page.drawText(name, { x: PAGE_W - MARGIN - w, y, size: 8.5, font: fonts.sans, color: INK_SOFT });
  page.drawLine({
    start: { x: MARGIN, y: y - 10 },
    end: { x: PAGE_W - MARGIN, y: y - 10 },
    thickness: 0.6,
    color: RULE,
  });
}

/** Writes flowing text, starting a new page whenever the current one fills. */
class Cursor {
  page: PDFPage;
  y: number;

  constructor(
    private doc: PDFDocument,
    private fonts: Fonts,
    private personName: string,
    page: PDFPage,
    y: number,
  ) {
    this.page = page;
    this.y = y;
  }

  ensure(height: number) {
    if (this.y - height >= MARGIN + FOOTER_H) return;
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    drawContinuationHeader(this.page, this.fonts, this.personName);
    this.y = PAGE_H - MARGIN - 34;
  }

  label(text: string) {
    this.ensure(40);
    this.y -= 10;
    drawSpaced(this.page, text, {
      x: MARGIN,
      y: this.y,
      size: 8,
      font: this.fonts.sansBold,
      color: GOLD_ON_LIGHT,
      spacing: 1.8,
    });
    this.y -= 18;
  }

  lines(lines: string[], font: PDFFont, size: number, leading: number, color = INK) {
    for (const line of lines) {
      this.ensure(leading);
      this.page.drawText(line, { x: MARGIN, y: this.y, size, font, color });
      this.y -= leading;
    }
  }

  gap(h: number) {
    this.y -= h;
  }
}

async function drawPerson(doc: PDFDocument, fonts: Fonts, person: ProfilePerson) {
  const clean = makeSanitizer(fonts.sans);
  const name = clean(person.name);
  const page = doc.addPage([PAGE_W, PAGE_H]);
  drawBand(page, fonts);

  const top = PAGE_H - BAND_H - 36;
  const photo = await fetchPhoto(doc, person);

  let photoW = 0;
  let photoBottom = top;
  if (photo) {
    const scale = Math.min(140 / photo.width, 175 / photo.height);
    photoW = photo.width * scale;
    const photoH = photo.height * scale;
    page.drawImage(photo, { x: MARGIN, y: top - photoH, width: photoW, height: photoH });
    page.drawRectangle({
      x: MARGIN,
      y: top - photoH,
      width: photoW,
      height: photoH,
      borderColor: GOLD_ON_LIGHT,
      borderWidth: 0.8,
    });
    photoBottom = top - photoH;
  }

  const textX = photo ? MARGIN + photoW + 24 : MARGIN;
  const textW = PAGE_W - MARGIN - textX;
  let ty = top - 22;

  for (const line of wrap(name, fonts.serif, 24, textW)) {
    page.drawText(line, { x: textX, y: ty, size: 24, font: fonts.serif, color: INK });
    ty -= 28;
  }

  if (person.title) {
    ty -= 2;
    drawSpaced(page, clean(person.title).toUpperCase(), {
      x: textX,
      y: ty,
      size: 8.5,
      font: fonts.sansBold,
      color: GOLD_ON_LIGHT,
      spacing: 1.3,
    });
    ty -= 22;
  }

  if (person.qualifications?.length) {
    const quals = clean(person.qualifications.join("  ·  "));
    for (const line of wrap(quals, fonts.sans, 9.5, textW)) {
      page.drawText(line, { x: textX, y: ty, size: 9.5, font: fonts.sans, color: INK_SOFT });
      ty -= 14;
    }
    ty -= 6;
  }

  const contact = [person.email, person.linkedIn].filter(Boolean).map((c) => clean(c));
  for (const item of contact) {
    for (const line of wrap(item, fonts.sans, 9, textW)) {
      page.drawText(line, { x: textX, y: ty, size: 9, font: fonts.sans, color: INK_SOFT });
      ty -= 13;
    }
  }

  const blockBottom = Math.min(photoBottom, ty + 6);
  const ruleY = blockBottom - 22;
  page.drawLine({
    start: { x: MARGIN, y: ruleY },
    end: { x: PAGE_W - MARGIN, y: ruleY },
    thickness: 0.6,
    color: RULE,
  });

  const cursor = new Cursor(doc, fonts, name, page, ruleY - 18);
  const width = PAGE_W - 2 * MARGIN;

  const bio = paragraphs(clean(person.bio));
  if (bio.length) {
    cursor.label("PROFILE");
    bio.forEach((para, i) => {
      cursor.lines(wrap(para, fonts.sans, 10.5, width), fonts.sans, 10.5, 16);
      if (i < bio.length - 1) cursor.gap(8);
    });
  }

  if (person.expertise?.length) {
    cursor.gap(14);
    cursor.label("AREAS OF PRACTICE");
    const areas = clean(person.expertise.join("   ·   "));
    cursor.lines(wrap(areas, fonts.sans, 10, width), fonts.sans, 10, 15, INK_SOFT);
  }
}

function drawFooters(doc: PDFDocument, fonts: Fonts, firm: FirmDetails) {
  const clean = makeSanitizer(fonts.sans);
  const address = clean(
    [firm.addressLine1, firm.addressLine2, firm.addressLine3, [firm.city, firm.pincode].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", "),
  );
  const contact = clean(["www.kattiandco.com", firm.phone, firm.email].filter(Boolean).join("   ·   "));
  const pages = doc.getPages();

  pages.forEach((page, i) => {
    const base = MARGIN - 8;
    page.drawLine({
      start: { x: MARGIN, y: base + 34 },
      end: { x: PAGE_W - MARGIN, y: base + 34 },
      thickness: 0.6,
      color: RULE,
    });
    page.drawText("Katti & Co.  ·  Advocates", {
      x: MARGIN,
      y: base + 20,
      size: 8,
      font: fonts.sansBold,
      color: INK,
    });
    const lines = [address, contact].filter(Boolean);
    lines.forEach((line, j) => {
      const fitted = wrap(line, fonts.sans, 7.5, PAGE_W - 2 * MARGIN - 70)[0] ?? "";
      page.drawText(fitted, { x: MARGIN, y: base + 9 - j * 10, size: 7.5, font: fonts.sans, color: INK_SOFT });
    });
    const num = `Page ${i + 1} of ${pages.length}`;
    const w = fonts.sans.widthOfTextAtSize(num, 7.5);
    page.drawText(num, { x: PAGE_W - MARGIN - w, y: base + 20, size: 7.5, font: fonts.sans, color: INK_SOFT });
  });
}

export async function buildProfilePdf(people: ProfilePerson[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    serif: await doc.embedFont(StandardFonts.TimesRoman),
    sans: await doc.embedFont(StandardFonts.Helvetica),
    sansBold: await doc.embedFont(StandardFonts.HelveticaBold),
  };

  const firm = await loadFirm();
  for (const person of people) {
    await drawPerson(doc, fonts, person);
  }
  drawFooters(doc, fonts, firm);

  const single = people.length === 1;
  doc.setTitle(single ? `${people[0].name} — Katti & Co.` : "Team Profiles — Katti & Co.");
  doc.setAuthor("Katti & Co.");
  doc.setSubject("Professional profile");
  doc.setCreator("kattiandco.com");

  return doc.save();
}

/** An ASCII-safe download filename, honorifics dropped. */
export function profileFilename(people: ProfilePerson[]): string {
  if (people.length !== 1) return "Katti-and-Co-Team-Profiles.pdf";
  const base = people[0].name
    .replace(/^(mr|mrs|ms|dr|adv)\.?\s+/i, "")
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `Katti-and-Co-${base || "Profile"}.pdf`;
}
