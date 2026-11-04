// lib/sanity.ts
import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
  // Server-side the token can read unpublished drafts; never serve those.
  perspective: "published",
});

// Recent posts shaped as Mitra's BlogPost (lib/mitra-engine.ts).
export async function fetchRecentPosts(limit = 10) {
  const posts = await client.fetch<
    { title?: string; category?: string; excerpt?: string; publishedAt?: string; slug?: { current?: string } }[]
  >(ALL_POSTS_QUERY);
  return (posts || [])
    .filter((p) => p.slug?.current)
    .slice(0, limit)
    .map((p) => ({
      title: p.title || "",
      category: p.category || "",
      excerpt: p.excerpt || "",
      date: p.publishedAt || "",
      slug: p.slug!.current!,
    }));
}

// GROQ Queries
export const GALLERY_QUERY = `*[_type == "gallery"] | order(_createdAt desc) {
  _id,
  title,
  description,
  "items": images[] {
    _key,
    asset -> {
      url,
      metadata {
        dimensions {
          width,
          height
        }
      }
    },
    alt,
    caption
  }
}`;

export const ALL_POSTS_QUERY = `*[_type == "blog"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  author,
  excerpt,
  category,
  image {
    asset -> {
      url
    }
  }
}`;

export const POST_BY_SLUG_QUERY = `*[_type == "blog" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  publishedAt,
  author,
  content,
  excerpt,
  image {
    asset -> {
      url
    }
  }
}`;

export const TEAM_MEMBER_QUERY = `*[_type == "teamMember"] | order(_createdAt asc) {
  _id,
  name,
  title,
  bio,
  expertise,
  linkedIn,
  image {
    asset->,
    hotspot,
    crop
  }
}`;

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0] {
  email,
  phone,
  addressLine1,
  addressLine2,
  addressLine3,
  city,
  pincode
}`;
