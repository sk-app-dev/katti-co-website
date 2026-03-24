// app/blog/[slug]/page.tsx
// Individual blog post page — Server Component
// Fetches from Sanity, renders Portable Text (rich text)

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { client, POST_BY_SLUG_QUERY, ALL_POSTS_QUERY } from "@/lib/sanity";
import { notFound } from "next/navigation";
import { PortableText, PortableTextComponents } from "@portabletext/react";

// Tell Next.js which slugs to pre-render at build time
export async function generateStaticParams() {
  try {
    const posts: { slug: { current: string } }[] = await client.fetch(ALL_POSTS_QUERY);
    return posts.map((p) => ({ slug: p.slug.current }));
  } catch {
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await client.fetch(POST_BY_SLUG_QUERY, { slug });
    if (!post) return { title: "Post Not Found" };
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.publishedAt,
      },
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

// Portable Text components — render Sanity block content as HTML
const ptComponents: PortableTextComponents = {
  block: {
    normal:     ({ children }) => <p style={{ marginBottom: "1.1rem", lineHeight: 1.75 }}>{children}</p>,
    h2:         ({ children }) => <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.5rem", fontWeight: 400, color: "var(--text)", margin: "1.9rem 0 .7rem" }}>{children}</h2>,
    h3:         ({ children }) => <h3 style={{ fontFamily: "var(--font-cinzel)", fontSize: ".8rem", letterSpacing: ".08em", color: "var(--gold)", margin: "1.3rem 0 .5rem", textTransform: "uppercase" }}>{children}</h3>,
    blockquote: ({ children }) => <blockquote style={{ borderLeft: "3px solid var(--gold)", paddingLeft: "1rem", fontStyle: "italic", color: "var(--t2)", margin: "1.2rem 0" }}>{children}</blockquote>,
  },
  marks: {
    strong: ({ children }) => <strong style={{ color: "var(--text)", fontWeight: 600 }}>{children}</strong>,
    em:     ({ children }) => <em style={{ fontStyle: "italic", color: "var(--gold2)" }}>{children}</em>,
    code:   ({ children }) => <code style={{ background: "rgba(201,166,64,.1)", padding: "2px 6px", fontSize: ".85em", borderRadius: 3, fontFamily: "monospace" }}>{children}</code>,
    link:   ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", textDecoration: "underline" }}>
        {children}
      </a>
    ),
  },
  list: {
    bullet:   ({ children }) => <ul style={{ listStyle: "none", margin: ".85rem 0 1.2rem", paddingLeft: 0 }}>{children}</ul>,
    number:   ({ children }) => <ol style={{ paddingLeft: "1.2rem", margin: ".85rem 0 1.2rem" }}>{children}</ol>,
  },
  listItem: {
    bullet:   ({ children }) => (
      <li style={{ padding: ".26rem 0 .26rem 1rem", position: "relative", color: "var(--t2)" }}>
        <span style={{ position: "absolute", left: 0, top: ".65rem", width: 4, height: 4, background: "var(--gold)", opacity: .5, transform: "rotate(45deg)", display: "inline-block" }} />
        {children}
      </li>
    ),
    number:   ({ children }) => <li style={{ color: "var(--t2)", marginBottom: ".3rem" }}>{children}</li>,
  },
};

export const revalidate = 60;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug });
  if (!post) notFound();

  return (
    <>
      {/* Minimal nav for blog post */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5vw", height: 70, background: "rgba(7,8,13,.97)", borderBottom: "1px solid var(--bdr)" }}>
        <Link href="/" style={{ fontFamily: "var(--font-cinzel)", fontSize: ".98rem", fontWeight: 500, letterSpacing: ".22em", color: "var(--text)", textDecoration: "none" }}>
          KATTI <span style={{ color: "#fff", fontStyle: "italic" }}>&amp;</span> Co.
        </Link>
        <Link href="/blog" style={{ fontFamily: "var(--font-cinzel)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--t2)", textDecoration: "none" }}>
          ← All Insights
        </Link>
      </nav>

      <main style={{ maxWidth: 740, margin: "0 auto", padding: "96px 5vw 80px" }}>
        <div style={{ fontFamily: "var(--font-cinzel)", fontSize: ".56rem", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "1rem" }}>
          {post.category || "Insights"}
        </div>

        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.8rem, 3.8vw, 2.9rem)", fontWeight: 300, lineHeight: 1.12, color: "var(--text)", marginBottom: ".85rem" }}>
          {post.title}
        </h1>

        {post.image && (
          <div style={{ position: "relative", width: "100%", height: "400px", marginBottom: "2rem", borderRadius: "8px", overflow: "hidden" }}>
            <Image
              src={post.image.asset.url}
              alt={post.title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        )}

        <div style={{ fontSize: ".66rem", color: "var(--t3)", marginBottom: "2.2rem", paddingBottom: "1.6rem", borderBottom: "1px solid var(--bdr2)" }}>
          Published{" "}
          {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          {" · "}Katti &amp; Co.
        </div>

        <div style={{ fontSize: ".91rem", lineHeight: 1.92, color: "var(--t2)", fontWeight: 300 }}>
          <PortableText value={post.content} components={ptComponents} />
        </div>

        <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid var(--bdr)" }}>
          <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: ".45rem", fontSize: ".66rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--t2)", textDecoration: "none" }}>
            ← Back to All Insights
          </Link>
        </div>
      </main>

      <footer style={{ background: "var(--bg2)", borderTop: "1px solid var(--bdr)", padding: "1.8rem 5vw", textAlign: "center" }}>
        <p style={{ fontSize: ".66rem", color: "var(--t3)" }}>
          &copy; 2025 Katti &amp; Co. — Insights are for informational purposes only and do not constitute legal advice.
        </p>
      </footer>
    </>
  );
}
