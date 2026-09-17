// app/sitemap.ts
// /sitemap.xml — tells Google which pages exist. Blog posts come from Sanity,
// so a new post is listed as soon as it's published (hourly revalidation).

import type { MetadataRoute } from "next";
import { client, ALL_POSTS_QUERY } from "@/lib/sanity";
import { SITE_URL } from "@/lib/brand";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/mitra`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const posts: { slug?: { current?: string }; publishedAt?: string }[] = await client.fetch(ALL_POSTS_QUERY);
    for (const p of posts) {
      if (!p.slug?.current) continue;
      pages.push({
        url: `${SITE_URL}/blog/${p.slug.current}`,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
        changeFrequency: "yearly",
        priority: 0.7,
      });
    }
  } catch {
    // Sanity unreachable: still serve the fixed pages.
  }
  return pages;
}
