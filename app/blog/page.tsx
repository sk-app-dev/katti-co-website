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
    <section className="section blog-page">
      <div>
        <div className="section-label">Insights</div>
        <h1 className="section-title">Legal Insights</h1>
        <p className="section-sub">
          Essays and articles on patents, trademarks, IP law, and entrepreneurship.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>Loading posts...</div>
        ) : posts.length > 0 ? (
          <div className="blog-page-grid">
            {posts.map((post) => (
              <article key={post._id} className="blog-page-card">
                {post.image && (
                  <div className="blog-page-card-image">
                    <Image
                      src={post.image.asset.url}
                      alt={post.title}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <h2>
                  <Link href={`/blog/${post.slug.current}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="blog-page-card-meta">
                  {new Date(post.publishedAt).toLocaleDateString()} {post.author && `by ${post.author}`}
                </p>
                {post.excerpt && <p className="blog-page-card-excerpt">{post.excerpt}</p>}
              </article>
            ))}
          </div>
        ) : (
          <div className="blog-page-empty">
            <p>
              📝 No blog posts yet. Visit <strong>kattiandco.in/studio</strong> to add your first article!
            </p>
          </div>
        )}

        <div style={{ marginTop: "3rem", textAlign: "center" }}>
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
              fontSize: "0.9rem",
              transition: "opacity 0.2s",
            }}
          >
            ← Back Home
          </Link>
        </div>
      </div>
    </section>
  );
}
