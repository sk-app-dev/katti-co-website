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
  image {
    asset -> {
      url
    }
  }
}`;

export const ALL_POSTS_QUERY = `*[_type == "post"] | order(_createdAt desc) {
  _id,
  title,
  slug {
    current
  },
  publishedAt,
  author -> {
    name
  },
  excerpt,
  mainImage {
    asset -> {
      url
    }
  }
}`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  publishedAt,
  author -> {
    name
  },
  body,
  excerpt,
  category,
  mainImage {
    asset -> {
      url
    }
  }
}`;
