// lib/sanity.ts
import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
});

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
