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
    normal:     ({ children }) => <p style={{ marginBottom: "1.5rem", lineHeight: 1.9, fontSize: "1rem", fontWeight: 300 }}>{children}</p>,
    h2:         ({ children }) => <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 300, color: "var(--text)", margin: "2.4rem 0 1rem", lineHeight: 1.2, letterSpacing: "-0.01em" }}>{children}</h2>,
    h3:         ({ children }) => <h3 style={{ fontFamily: "var(--font-cinzel)", fontSize: "0.95rem", letterSpacing: ".12em", color: "var(--gold)", margin: "1.8rem 0 0.8rem", textTransform: "uppercase", fontWeight: 500 }}>{children}</h3>,
    blockquote: ({ children }) => <blockquote style={{ borderLeft: "5px solid var(--gold)", paddingLeft: "1.8rem", fontStyle: "italic", color: "var(--gold2)", margin: "2rem 0", fontSize: "1.08rem", fontWeight: 300, opacity: 0.95 }}>{children}</blockquote>,
  },
  marks: {
    strong: ({ children }) => <strong style={{ color: "var(--text)", fontWeight: 600, letterSpacing: "0.3px" }}>{children}</strong>,
    em:     ({ children }) => <em style={{ fontStyle: "italic", color: "var(--gold2)", opacity: 0.95, fontWeight: 400 }}>{children}</em>,
    code:   ({ children }) => <code style={{ background: "rgba(201,166,64,.15)", padding: "5px 10px", fontSize: ".9em", borderRadius: 5, fontFamily: "monospace", color: "var(--text)", border: "1px solid rgba(201,166,64,.25)", fontWeight: 500 }}>{children}</code>,
    link:   ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", textDecoration: "none", borderBottom: "2px solid var(--gold)", transition: "opacity 0.3s", fontWeight: 500 }}>
        {children}
      </a>
    ),
  },
  list: {
    bullet:   ({ children }) => <ul style={{ listStyle: "none", margin: "1.4rem 0 1.6rem", paddingLeft: 0 }}>{children}</ul>,
    number:   ({ children }) => <ol style={{ paddingLeft: "2rem", margin: "1.4rem 0 1.6rem", counterReset: "item" }}>{children}</ol>,
  },
  listItem: {
    bullet:   ({ children }) => (
      <li style={{ padding: "0.5rem 0 0.5rem 1.6rem", position: "relative", color: "var(--text)", marginBottom: "0.8rem", fontSize: "1rem" }}>
        <span style={{ position: "absolute", left: 0, top: "0.9rem", width: 7, height: 7, background: "var(--gold)", borderRadius: "50%", display: "inline-block", opacity: 0.85 }} />
        {children}
      </li>
    ),
    number:   ({ children }) => <li style={{ color: "var(--text)", marginBottom: "0.8rem", fontSize: "1rem" }}>{children}</li>,
  },
};

export const revalidate = 60;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug });
  if (!post) notFound();

  return (
    <>
      {/* Fixed navbar — minimal and elegant */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem clamp(1.5rem, 5vw, 3rem)", background: "linear-gradient(180deg, rgba(7,8,13,.99) 0%, rgba(7,8,13,.96) 100%)", borderBottom: "1px solid rgba(201,166,64,.1)", backdropFilter: "blur(12px)" }}>
        <Link href="/" style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.85rem, 1.8vw, 1rem)", fontWeight: 600, letterSpacing: ".12em", color: "var(--text)", textDecoration: "none", transition: "all 0.3s", display: "flex", alignItems: "center", gap: "0.4rem", textTransform: "uppercase" }}>
          <span style={{ color: "var(--gold)", fontSize: "1.2em" }}>K</span>Katti
        </Link>
        <Link href="/blog" style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.6rem, 1vw, 0.7rem)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text)", textDecoration: "none", padding: "0.65rem 1.4rem", background: "transparent", border: "1.5px solid var(--gold)", borderRadius: "8px", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", fontWeight: 700 }}>
          ← Insights
        </Link>
      </nav>

      {/* Hero section — full viewport experience */}
      <div style={{ marginTop: "70px", position: "relative", width: "100%", height: "clamp(450px, 65vh, 700px)", background: "linear-gradient(135deg, rgba(201,166,64,.05) 0%, rgba(201,166,64,.01) 100%)", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "flex-start" }}>
        {post.image ? (
          <>
            <Image
              src={post.image.asset.url}
              alt={post.title}
              fill
              style={{ objectFit: "cover", opacity: 0.88 }}
              priority
              sizes="(max-width: 768px) 100vw, 100vw"
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,8,13,0.1) 0%, rgba(7,8,13,.35) 50%, rgba(7,8,13,.8) 100%)" }} />
          </>
        ) : null}
        
        <div style={{ position: "relative", padding: "clamp(2.5rem, 8vh, 5rem) clamp(1.5rem, 5vw, 3rem)", maxWidth: "100%", zIndex: 10 }}>
          <div style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.55rem, 1.2vw, 0.8rem)", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "1.4rem", fontWeight: 700, opacity: 0.95 }}>
            {post.category || "Insights"}
          </div>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2.4rem, 7vw, 4.2rem)", fontWeight: 300, lineHeight: 1.08, color: "var(--text)", marginBottom: 0, maxWidth: "95%", letterSpacing: "-0.015em", textShadow: "0 2px 8px rgba(0,0,0,.4)" }}>
            {post.title}
          </h1>
        </div>
      </div>

      {/* Content section — elegant spacing */}
      <main style={{ maxWidth: "clamp(700px, 85vw, 920px)", margin: "0 auto", padding: "clamp(3rem, 8vh, 5rem) clamp(1.5rem, 4vw, 3rem) clamp(4rem, 12vh, 7rem)" }}>
        {/* Metadata bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(201,166,64,.12)", flexWrap: "wrap" }}>
          <time style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.65rem, 1.3vw, 0.8rem)", letterSpacing: ".08em", color: "var(--gold)", fontWeight: 700, textTransform: "uppercase" }}>
            {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </time>
          <span style={{ width: "4px", height: "4px", background: "var(--gold)", borderRadius: "50%", opacity: 0.6 }} />
          <span style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.65rem, 1.2vw, 0.75rem)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--t3)", fontWeight: 600 }}>Katti &amp; Co.</span>
        </div>

        {/* Article content */}
        <article style={{ fontSize: "clamp(0.98rem, 1.8vw, 1.08rem)", lineHeight: 1.98, color: "var(--text)", fontWeight: 300, letterSpacing: "0.15px" }}>
          <PortableText value={post.content} components={ptComponents} />
        </article>

        {/* CTA Section — elegant call-to-action */}
        <div style={{ marginTop: "clamp(4rem, 12vh, 6rem)", paddingTop: "clamp(2.5rem, 8vh, 4rem)", borderTop: "1px solid rgba(201,166,64,.12)" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(201,166,64,.08) 0%, rgba(201,166,64,.03) 100%)", padding: "clamp(2rem, 5vw, 3rem)", borderRadius: "16px", border: "1px solid rgba(201,166,64,.15)" }}>
            <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.3rem, 3vw, 2rem)", fontWeight: 300, color: "var(--text)", marginBottom: "1rem", letterSpacing: "-0.01em" }}>Continue Reading</h3>
            <p style={{ fontSize: "clamp(0.9rem, 1.6vw, 1rem)", lineHeight: 1.85, color: "var(--t2)", marginBottom: "2rem", fontWeight: 300 }}>
              Explore more insights on IP law, patents, and business strategy. Our articles provide practical guidance for startups and enterprises.
            </p>
            <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.7rem", fontSize: "clamp(0.7rem, 1.3vw, 0.85rem)", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text)", textDecoration: "none", padding: "1.1rem 1.9rem", background: "linear-gradient(135deg, rgba(201,166,64,.2) 0%, rgba(201,166,64,.08) 100%)", border: "1.5px solid var(--gold)", borderRadius: "12px", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", fontWeight: 700, fontFamily: "var(--font-cinzel)" }}>
              ← Back to All Insights
            </Link>
          </div>
        </div>
      </main>

      {/* Footer — elegant closing */}
      <footer style={{ marginTop: "clamp(5rem, 15vh, 8rem)", background: "linear-gradient(180deg, rgba(201,166,64,.05) 0%, transparent 100%)", borderTop: "1px solid var(--bdr)", padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)", textAlign: "center" }}>
        <p style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.8rem)", color: "var(--t3)", letterSpacing: "0.3px", lineHeight: 1.9, maxWidth: "700px", margin: "0 auto", fontWeight: 300 }}>
          &copy; 2026 <strong style={{ color: "var(--gold)", fontWeight: 600 }}>Katti &amp; Co.</strong> Legal Insights are provided for informational purposes only and do not constitute legal advice. For professional legal consultation, please contact our team directly.
        </p>
      </footer>
    </>
  );
}
