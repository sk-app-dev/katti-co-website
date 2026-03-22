// app/blog/page.tsx
// Blog listing page
"use client";

import Link from "next/link";

export default function BlogPage() {
  return (
    <section style={{ padding: "80px 20px", minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "10px", color: "var(--gold)" }}>Legal Insights</h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "40px" }}>
          Essays and articles on patents, trademarks, IP law, and entrepreneurship.
        </p>

        {/* Blog posts will appear here once you add them in Sanity Studio */}
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "var(--bg2)",
            borderRadius: "8px",
            border: "1px solid var(--bdr)",
          }}
        >
          <p style={{ fontSize: "1rem", color: "var(--text)" }}>
            📝 No blog posts yet. Visit <strong>kattiandco.in/studio</strong> to add your first article!
          </p>
        </div>

        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <Link
            href="/"
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
            ← Back Home
          </Link>
        </div>
      </div>
    </section>
  );
}
