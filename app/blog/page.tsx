// app/blog/page.tsx
// Blog listing page — fetches posts from Sanity
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { client, ALL_POSTS_QUERY } from "@/lib/sanity";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author?: string;
  excerpt?: string;
  image?: { asset: { url: string } };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await client.fetch(ALL_POSTS_QUERY);
        console.log("Blog page data fetched from Sanity:", data);
        console.log("Number of posts found:", data.length);
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <section style={{ padding: "80px 20px", minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "10px", color: "var(--gold)" }}>Legal Insights</h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "40px" }}>
          Essays and articles on patents, trademarks, IP law, and entrepreneurship.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading posts...</div>
        ) : posts.length > 0 ? (
          <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {posts.map((post) => (
              <article key={post._id} style={{ border: "1px solid var(--bdr)", borderRadius: "8px", padding: "1.5rem", background: "var(--bg2)" }}>
                {post.image && (
                  <div style={{ position: "relative", width: "100%", height: "200px", marginBottom: "1rem" }}>
                    <Image
                      src={post.image.asset.url}
                      alt={post.title}
                      fill
                      style={{ objectFit: "cover", borderRadius: "4px" }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  <Link href={`/blog/${post.slug.current}`} style={{ color: "var(--gold)", textDecoration: "none" }}>
                    {post.title}
                  </Link>
                </h2>
                <p style={{ fontSize: "0.9rem", color: "var(--text)", marginBottom: "1rem" }}>
                  {new Date(post.publishedAt).toLocaleDateString()} {post.author && `by ${post.author}`}
                </p>
                {post.excerpt && <p style={{ color: "var(--text)" }}>{post.excerpt}</p>}
              </article>
            ))}
          </div>
        ) : (
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
        )}

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
