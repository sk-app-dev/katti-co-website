// components/About.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
const fallbackFounderImage = "/founder.jpg";

const VALUES = [
  {
    title: "Clarity",
    desc: "Clear, practical guidance on every matter from first contact to resolution",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="14" cy="14" r="11" />
        <path d="M9 14l3.5 3.5L19 10" />
      </svg>
    ),
  },
  {
    title: "Precision",
    desc: "Meticulous attention to strategy, documentation and legal argument",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="3" y="3" width="22" height="22" rx="2" />
        <line x1="3" y1="10" x2="25" y2="10" />
        <line x1="10" y1="10" x2="10" y2="25" />
      </svg>
    ),
  },
  {
    title: "Integrity",
    desc: "Unwavering ethical standards and transparent communication always",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M14 3l2.5 8H24l-6.5 4.5 2.5 8L14 19l-6 4.5 2.5-8L4 11h7.5z" />
      </svg>
    ),
  },
  {
    title: "Client Focus",
    desc: "Your commercial interests and objectives drive every decision we make",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4 7l10 7 10-7" />
        <rect x="4" y="7" width="20" height="14" rx="2" />
      </svg>
    ),
  },
];

interface Founder {
  _id: string;
  name: string;
  title: string;
  bio?: string;
  expertise?: string[];
  linkedIn?: string;
  image?: {
    asset: {
      url: string;
    };
  };
}

export default function About() {
  const [founder, setFounder] = useState<Founder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFounder = async () => {
      try {
        const query = `*[_type == "founder"][0] {
          _id,
          name,
          title,
          bio,
          expertise,
          linkedIn,
          image {
            asset {
              url
            }
          }
        }`;
        const data = await client.fetch(query);
        console.log("Founder data fetched:", data);
        setFounder(data);
      } catch (error) {
        console.error("Error fetching founder:", error);
        setFounder(null); // Fallback to no data state
      } finally {
        setLoading(false);
      }
    };

    fetchFounder();
  }, []);

  return (
    <section className="section about" id="about">
      <div className="reveal">
        <div className="section-label">The Firm</div>
        <h2 className="section-title">
          Built on <em>Technical Depth</em>
          <br />and Legal Precision
        </h2>
      </div>

      <div className="about-grid">
        {/* Left — text + values */}
        <div>
          <div className="about-text reveal delay-1">
            <p>
              We are a multidisciplinary law firm with core practices in
              Intellectual Property Rights, Technology Law, Tax Litigation and
              Advisory, and Civil &amp; Commercial Disputes. We assist
              individuals, startups, and businesses by offering clear,
              practical, and reliable legal support.
            </p>
            <p>
              Our IP practice covers the full spectrum — patents, trademarks,
              copyrights, designs, and related advisory and enforcement work.
              We handle drafting, prosecution, oppositions, IP due-diligence,
              portfolio strategy, and dispute resolution across
              technology-driven sectors.
            </p>
            <p>
              Our work is guided by core values of clarity, precision,
              integrity, and client-focused advocacy — ensuring dependable
              representation across all matters.
            </p>
          </div>

          <div className="values-grid reveal delay-2">
            {VALUES.map((v) => (
              <div className="value-card" key={v.title}>
                <div className="value-icon">{v.icon}</div>
                <div className="value-title">{v.title}</div>
                <div className="value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — founder profile */}
        <div className="reveal delay-2">
          {loading ? (
            <div className="founder-card">
              <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
            </div>
          ) : founder ? (
            <div className="founder-card">
              <div className="founder-photo">
                <Image
                  src={founder.image?.asset?.url ? founder.image.asset.url : fallbackFounderImage}
                  alt={`${founder.name} — ${founder.title}, Katti & Co.`}
                  width={400}
                  height={500}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    objectPosition: "center center",
                    filter: "brightness(1.03) contrast(1.06) saturate(1.08)",
                    display: "block",
                    verticalAlign: "top",
                  }}
                  priority
                  onError={() => console.error("Image failed to load:", founder.image?.asset?.url || fallbackFounderImage)}
                />
              </div>

              <div className="founder-name">{founder.name}</div>
              <div className="founder-role">{founder.title}</div>

              {founder.bio && <p className="founder-bio">{founder.bio}</p>}

              {founder.expertise && founder.expertise.length > 0 && (
                <div className="tags">
                  {founder.expertise.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="founder-links">
                <a href="mailto:aprameya.katti@kattiandco.com" className="founder-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  aprameya.katti@kattiandco.com
                </a>
                {founder.linkedIn && (
                  <a href={founder.linkedIn} target="_blank" rel="noopener noreferrer" className="founder-link">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    LinkedIn — Personal Profile
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="founder-card">
              <div style={{ padding: "2rem", textAlign: "center" }}>No founder data available</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
