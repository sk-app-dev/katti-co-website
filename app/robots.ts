// app/robots.ts
// /robots.txt — lets search engines crawl the public site, keeps them out of
// the CMS studio and API routes, and points them at the sitemap.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/studio-v2", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
