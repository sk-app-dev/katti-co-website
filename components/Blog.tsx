// components/Blog.tsx
"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: any[];
  image?: {
    asset: {
      url: string;
    };
  };
  publishedAt: string;
  author?: string;
}

// Fallback local blog posts (for when Sanity is not available)
const LOCAL_BLOG_POSTS: BlogPost[] = [
  {
    _id: "local-1",
    title: "Understanding Patent Protection",
    slug: "understanding-patent-protection",
    excerpt: "A comprehensive guide to patent protection for startups",
    publishedAt: new Date().toISOString(),
    author: "Aprameya N. Katti",
  },
  {
    _id: "local-2",
    title: "IP Rights in the Tech Industry",
    slug: "ip-rights-tech-industry",
    excerpt: "How to protect intellectual property in technology",
    publishedAt: new Date().toISOString(),
    author: "Aprameya N. Katti",
  },
];

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSanity, setUsingSanity] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Try fetching from Sanity first
        const query = `*[_type == "blog"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          excerpt,
          publishedAt,
          author,
          image {
            asset {
              url
            }
          }
        }`;
        const data = await client.fetch(query);
        
        if (data && data.length > 0) {
          setPosts(data);
          setUsingSanity(true);
        } else {
          // Fall back to local posts if Sanity returns empty
          setPosts(LOCAL_BLOG_POSTS);
          setUsingSanity(false);
        }
      } catch (error) {
        console.log("Sanity fetch failed, using local posts:", error);
        // Fall back to local posts on error
        setPosts(LOCAL_BLOG_POSTS);
        setUsingSanity(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <section className="section blog" id="blog">
      <div className="reveal">
        <div className="section-label">Insights</div>
        <h2 className="section-title">Latest Articles</h2>
        {usingSanity && <p style={{ fontSize: "0.8em", color: "#999" }}>(From Sanity CMS)</p>}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>Loading posts...</div>
      ) : (
        <div className="blog-grid reveal delay-1">
          {posts.map((post) => (
            <article key={post._id} className="blog-card">
              {post.image?.asset?.url && (
                <img
                  src={post.image.asset.url}
                  alt={post.title}
                  className="blog-image"
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />
              )}
              <h3 className="blog-title">{post.title}</h3>
              {post.excerpt && <p className="blog-excerpt">{post.excerpt}</p>}
              <div style={{ fontSize: "0.9em", color: "#999" }}>
                {post.author && <span>{post.author}</span>}
                {post.publishedAt && (
                  <span> • {new Date(post.publishedAt).toLocaleDateString()}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
