// app/blog/[slug]/page.tsx
// Individual blog post page

import Link from "next/link";

export default function BlogPostPage() {
  return (
    <section style={{ padding: "80px 20px", minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Link href="/blog" style={{ color: "var(--gold)", textDecoration: "none" }}>
          ← All Insights
        </Link>

        <h1 style={{ fontSize: "2.5rem", marginTop: "20px", marginBottom: "10px", color: "var(--gold)" }}>
          Blog Post
        </h1>

        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "var(--bg2)",
            borderRadius: "8px",
            border: "1px solid var(--bdr)",
            marginTop: "40px",
          }}
        >
          <p style={{ fontSize: "1rem", color: "var(--text)" }}>
            📝 This page will display individual blog posts once they are added in Sanity Studio.
          </p>
        </div>

        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <Link
            href="/blog"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "var(--gold)",
              color: "#000",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ← Back to All Insights
          </Link>
        </div>
      </div>
    </section>
  );
}
