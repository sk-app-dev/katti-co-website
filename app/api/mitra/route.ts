/**
 * app/api/mitra/route.ts
 * ─────────────────────────────────────────────────────────
 * Server-side API route for Mitra.
 * Gemini API key stays server-side — never in the browser.
 *
 * POST /api/mitra
 * Body:    { query, history, livePosts? }
 * Returns: { type, text, source?, topic?, llmCalled, score? }
 * ─────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  containsSecretTopic,
  isLegalOrFirmQuery,
  searchKnowledge,
  getGraphContext,
  buildSystemPrompt,
  buildRefusal,
  formatGraphAnswer,
  checkRateLimit,
  callGemini,
  getDisclaimer,
  type ConversationMessage,
  type BlogPost,
  type FirmInfo,
} from "@/lib/yogi-engine";
import { YOGI_CONFIG } from "@/lib/yogi-config";
import { client, SITE_SETTINGS_QUERY } from "@/lib/sanity";

// ── Live firm contact info (Sanity, falls back to static config) ──

async function getFirmInfo(): Promise<FirmInfo> {
  try {
    const settings = await client.fetch<{ email?: string; phone?: string } | null>(
      SITE_SETTINGS_QUERY,
    );
    if (!settings) return YOGI_CONFIG.FIRM;
    return {
      ...YOGI_CONFIG.FIRM,
      email: settings.email || YOGI_CONFIG.FIRM.email,
      phone: settings.phone || YOGI_CONFIG.FIRM.phone,
    };
  } catch {
    return YOGI_CONFIG.FIRM;
  }
}

// ── Input validation schemas ───────────────────────────────

const MessageSchema = z.object({
  role:    z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

const BlogPostSchema = z.object({
  title:    z.string().max(300),
  category: z.string().max(100),
  excerpt:  z.string().max(500),
  date:     z.string().max(50),
  slug:     z.string().max(200),
});

const RequestSchema = z.object({
  query:     z.string().min(1).max(2000).trim(),
  history:   z.array(MessageSchema).max(20).default([]),
  livePosts: z.array(BlogPostSchema).max(50).default([]),
});

// ── Ensure disclaimer present in LLM response ─────────────

function ensureDisclaimer(text: string, firm: FirmInfo): string {
  const hasIt =
    text.includes("general legal information") ||
    text.includes("not legal advice");
  return hasIt ? text : text + getDisclaimer(firm);
}

// ── Main POST handler ─────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Client IP for per-IP rate limiting ────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // ── Live firm contact info (kicked off early, awaited below) ──
  const firmPromise = getFirmInfo();

  // ── Parse and validate body ───────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { type: "error", text: "Invalid JSON body.", llmCalled: false },
      { status: 400 },
    );
  }

  const firm = await firmPromise;

  const parsed = RequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { type: "error", text: "Invalid request format.", llmCalled: false },
      { status: 422 },
    );
  }

  const { query, history, livePosts } = parsed.data;
  const typedHistory = history as ConversationMessage[];
  const typedPosts   = livePosts as BlogPost[];

  // ── 1. Secret topic check ─────────────────────────────
  if (containsSecretTopic(query)) {
    return NextResponse.json({
      type:     "refused",
      subtype:  "secret",
      text:     buildRefusal("secret", firm),
      llmCalled: false,
    });
  }

  // ── 2. Legal / firm domain check ──────────────────────
  const domainCheck = isLegalOrFirmQuery(query);
  if (!domainCheck.isLegal) {
    return NextResponse.json({
      type:     "refused",
      subtype:  "non_legal",
      text:     buildRefusal("non_legal", firm),
      llmCalled: false,
    });
  }

  // ── 3. BM25 knowledge graph search ────────────────────
  const graphResult = searchKnowledge(query);

  // ── 4. High-confidence graph answer (0 LLM calls) ────
  if (graphResult !== null && graphResult.score >= YOGI_CONFIG.GRAPH_THRESHOLD) {
    return NextResponse.json({
      type:     "graph",
      text:     formatGraphAnswer(graphResult, firm),
      topic:    graphResult.topic,
      score:    graphResult.score,
      source:   graphResult.qa.source,
      llmCalled: false,
    });
  }

  // ── 5. Very low confidence → refuse ──────────────────
  if (
    graphResult === null ||
    (graphResult.score < YOGI_CONFIG.LLM_THRESHOLD && domainCheck.score < 0.35)
  ) {
    return NextResponse.json({
      type:     "refused",
      subtype:  "low_confidence",
      text:     buildRefusal("low_confidence", firm),
      llmCalled: false,
    });
  }

  // ── 6. API key present? ───────────────────────────────
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { type: "no_key", text: buildRefusal("no_key", firm), llmCalled: false },
      { status: 503 },
    );
  }

  // ── 7. Per-IP rate limit ──────────────────────────────
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { type: "rate_limit", text: buildRefusal("rate_limit", firm), llmCalled: false },
      { status: 429 },
    );
  }

  // ── 8. Call Gemini with graph context ─────────────────
  const contextItems =
    graphResult !== null
      ? getGraphContext(graphResult.queryTokens)
      : [];

  const systemPrompt = buildSystemPrompt(contextItems, typedPosts, firm);

  try {
    const geminiText = await callGemini(query, typedHistory, systemPrompt);
    const finalText  = ensureDisclaimer(geminiText, firm);

    return NextResponse.json({
      type:             "gemini",
      text:             finalText,
      llmCalled:        true,
      contextItemsUsed: contextItems.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";

    if (msg === "RATE_LIMIT") {
      return NextResponse.json(
        { type: "rate_limit", text: buildRefusal("rate_limit", firm), llmCalled: false },
        { status: 429 },
      );
    }

    if (msg === "GEMINI_API_KEY not configured") {
      return NextResponse.json(
        { type: "no_key", text: buildRefusal("no_key", firm), llmCalled: false },
        { status: 503 },
      );
    }

    console.error("[Mitra API] Gemini error:", msg);
    return NextResponse.json(
      { type: "error", text: buildRefusal("error", firm), llmCalled: false },
      { status: 500 },
    );
  }
}
