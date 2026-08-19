/**
 * lib/yogi-config.ts
 * ─────────────────────────────────────────────────────────
 * Single source of truth for the Mitra bot.
 * All firm data verified from kattiandco.com (live).
 * Edit this file when details change — nothing else needs to.
 * ─────────────────────────────────────────────────────────
 */

export const YOGI_CONFIG = {
  // ── Bot identity ──────────────────────────────────────
  BOT_NAME:   "Mitra",
  BOT_PERSONA: "AI Legal Information Assistant for Katti & Co.",

  // ── Gemini — API key is read from process.env.GEMINI_API_KEY ────
  // Set GEMINI_API_KEY in .env.local (never hardcode the key here)
  GEMINI_API_KEY:  "",  // intentionally empty — real key comes from .env.local
  GEMINI_MODEL:    "gemini-3-flash-preview",
  GEMINI_ENDPOINT:
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
  TEMPERATURE:  0.2,   // low = less hallucination
  MAX_TOKENS:   1200,
  MAX_HISTORY:  6,     // conversation turns kept per request

  // ── Rate limiting ─────────────────────────────────────
  RATE_LIMIT_RPM: 8,   // Gemini free tier: 15 RPM; we stay well under

  // ── Routing thresholds ────────────────────────────────
  GRAPH_THRESHOLD: 0.58, // score ≥ this → answer from graph (0 LLM calls)
  LLM_THRESHOLD:   0.25, // score < this → refuse (off-topic)

  // ── Firm data (fallback only) ─────────────────────────
  // email/phone are overridden per-request with live Sanity Site Settings
  // data (see app/api/yogi/route.ts's getFirmInfo()) whenever available —
  // these values are only used if that fetch fails. Edit Site Settings in
  // Sanity Studio to change the live email/phone, not this file.
  FIRM: {
    name:          "Katti & Co.",
    full_name:     "Katti & Co. — Advocates, IP, Tech & Tax Attorneys",
    tagline:       "Where Technical Insight Meets Legal Depth",
    email:         "aprameya.katti@kattiandco.com",
    phone:         "+91 78993 01767",
    location:      "Bengaluru, Karnataka, India",
    website:       "https://kattiandco.com",
    vercel_url:    "https://katti-co-website.vercel.app",
    linkedin_firm: "https://www.linkedin.com/company/katti-co/?viewAsMember=true",
    linkedin_ank:  "https://www.linkedin.com/in/adv-aprameya-n-katti-640974119/",
    founder:       "Mr. Aprameya N. Katti",
    founder_role:  "Founder & Principal Attorney",
    founder_bg:
      "Computer science engineer turned advocate. Former Judicial Researcher, High Court of Karnataka.",
    description:
      "Multidisciplinary law firm in Bengaluru specialising in IP, Technology Law, Tax Litigation, Civil & Commercial, Corporate Law, and White Collar Crimes.",
  },

  PRACTICE_AREAS: [
    "Intellectual Property Rights (Patents, Trademarks, Copyrights, Designs, FTO)",
    "Technology Law (SaaS, Data Protection, AI frameworks, Cybersecurity)",
    "Tax Litigation & Advisory (Direct Tax, GST, ITAT, High Court, Supreme Court)",
    "Civil & Commercial Disputes (Arbitration, Mediation, Commercial Courts)",
    "Corporate & Commercial Law (M&A, Companies Act, FEMA, Startups)",
    "White Collar Crimes & Investigations (Fraud, ED, SFIO, CBI)",
  ],

  COURTS: [
    "Supreme Court of India",
    "High Courts of India",
    "Income Tax Appellate Tribunals (ITAT)",
    "GST Appellate Authorities (GSTAT)",
    "Indian Patent Office (IPO)",
    "USPTO & EPO (International)",
    "Commercial Courts",
    "Arbitration Tribunals",
  ],

  // ── Topics the bot must NEVER reveal ─────────────────
  SECRET_TOPICS: [
    "admin password",
    "admin credentials",
    "admin login",
    "blog password",
    "api key",
    "gemini key",
    "anthropic key",
    "session token",
    "jwt secret",
    "nextauth",
    "bcrypt",
    "hash",
    "sanity token",
    "resend api",
    "environment variable",
    "env file",
    ".env",
    "database schema",
    "source code",
    "backend code",
    "server config",
    "middleware secret",
  ],

  // ── Sanity blog sync ──────────────────────────────────
  SANITY_BLOG_API: "/api/mitra-content",
} as const;

export type YogiConfig = typeof YOGI_CONFIG;
