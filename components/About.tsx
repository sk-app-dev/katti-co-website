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

interface FounderImage {
  image?: {
    asset: {
      url: string;
    };
  };
}

export default function About() {
  const [founderImage, setFounderImage] = useState<FounderImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFounderImage = async () => {
      try {
        const query = `*[_type == "founder"][0] {
          image {
            asset {
              url
            }
          }
        }`;
        const data = await client.fetch(query);
        setFounderImage(data);
      } catch (error) {
        console.error("Error fetching founder image:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFounderImage();
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

        {/* Right — founder photo */}
        <div className="reveal delay-2">
          {loading ? (
            <div className="founder-card">
              <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
            </div>
          ) : (
            <div className="founder-card">
              <div className="founder-photo">
                <Image
                  src={founderImage?.image?.asset?.url || fallbackFounderImage}
                  alt="Founder photo, Katti & Co."
                  width={500}
                  height={600}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    objectPosition: "center top",
                    maxHeight: 400,
                    filter: "brightness(1.03) contrast(1.06) saturate(1.08)",
                  }}
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
