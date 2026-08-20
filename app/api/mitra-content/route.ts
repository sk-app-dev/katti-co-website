/**
 * app/api/mitra-content/route.ts
 * ─────────────────────────────────────────────────────────
 * Serves recent blog posts (from Sanity) as light-weight
 * context for Mitra, shaped to match components/MitraChat.tsx's
 * and lib/mitra-engine.ts's BlogPost interface.
 *
 * GET /api/mitra-content
 * Returns: { posts: BlogPost[] }
 * ─────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import { client, ALL_POSTS_QUERY } from "@/lib/sanity";

interface SanityPost {
  title?: string;
  category?: string;
  excerpt?: string;
  publishedAt?: string;
  slug?: { current?: string };
}

export async function GET() {
  try {
    const posts = await client.fetch<SanityPost[]>(ALL_POSTS_QUERY);

    const shaped = (posts || [])
      .filter((p) => p.slug?.current)
      .slice(0, 10)
      .map((p) => ({
        title: p.title || "",
        category: p.category || "",
        excerpt: p.excerpt || "",
        date: p.publishedAt || "",
        slug: p.slug!.current!,
      }));

    return NextResponse.json({ posts: shaped });
  } catch (error) {
    console.error("[/api/mitra-content] Sanity fetch failed:", error);
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
