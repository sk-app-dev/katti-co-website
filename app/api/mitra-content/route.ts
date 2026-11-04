/**
 * app/api/mitra-content/route.ts
 * ─────────────────────────────────────────────────────────
 * Serves recent blog posts (from Sanity) as light-weight
 * context for Mitra, shaped to match lib/mitra-engine.ts's
 * BlogPost interface.
 *
 * GET /api/mitra-content
 * Returns: { posts: BlogPost[] }
 * ─────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import { fetchRecentPosts } from "@/lib/sanity";

export async function GET() {
  try {
    return NextResponse.json({ posts: await fetchRecentPosts(10) });
  } catch (error) {
    console.error("[/api/mitra-content] Sanity fetch failed:", error);
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
