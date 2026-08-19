// components/Expertise.tsx
const SECTORS = [
  { num:"01", name:"Semiconductors",       desc:"Circuit designs, chip architectures and fabrication processes across global jurisdictions." },
  { num:"02", name:"Artificial Intelligence", desc:"AI models, ML systems, neural architectures and copyright for AI-generated works." },
  { num:"03", name:"Software & SaaS",      desc:"Software patents, copyright for code, APIs, platform innovations and digital interfaces." },
  { num:"04", name:"Mechanical Engineering", desc:"Mechanical inventions, machine components, manufacturing and apparatus patents." },
  { num:"05", name:"Chemical & Pharma",    desc:"Chemical compositions, pharmaceutical formulations, drug delivery and synthesis patents." },
  { num:"06", name:"Deep Tech & Quantum",  desc:"Quantum computing, advanced materials, nanotechnology and frontier innovations." },
  { num:"07", name:"Biotechnology",        desc:"Biological processes, genetic engineering, diagnostic tools and life sciences IP." },
  { num:"08", name:"Fintech & Payments",   desc:"Financial technology, payment systems, algorithmic trading and digital banking." },
  { num:"09", name:"Cybersecurity",        desc:"Security protocols, encryption, authentication technologies and data protection." },
  { num:"10", name:"IoT & Embedded",       desc:"IoT hardware, embedded systems, wireless protocols and sensor technology." },
  { num:"11", name:"Blockchain & Web3",    desc:"Smart contracts, DLT, NFT-related IP and decentralised application patents." },
  { num:"12", name:"Aerospace & Defence",  desc:"Aerospace engineering, propulsion, navigation technologies and defence-related IP." },
];

export function Expertise() {
  return (
    <section className="section expertise" id="expertise">
      <div className="reveal">
        <div className="section-label">Technology Sectors</div>
        <h2 className="section-title">Sectors We <em>Specialise</em> In</h2>
        <p className="section-sub">
          Our founder's engineering background enables deep technical
          understanding across emerging technology domains.
        </p>
      </div>
      <div className="expertise-grid">
        {SECTORS.map((s, i) => (
          <div
            className={`expertise-card reveal delay-${((i % 4) + 1) as 1|2|3|4}`}
            key={s.num}
          >
            <div className="expertise-num">{s.num}</div>
            <div className="expertise-name">{s.name}</div>
            <div className="expertise-desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// components/Approach.tsx
const STEPS = [
  { num:"01", title:"Understand & Assess",  desc:"We begin with a thorough understanding of your matter — its technical, commercial, and legal dimensions — before charting any strategy." },
  { num:"02", title:"Research & Analyse",   desc:"Prior art searches, legal research, landscape analysis and jurisdiction assessment form the foundation of our advice." },
  { num:"03", title:"Draft & Strategise",   desc:"Precise drafting — whether of patent specifications, pleadings, opinions or contracts — executed with technical accuracy and legal rigour." },
  { num:"04", title:"Represent & Resolve",  desc:"Steadfast advocacy before the Patent Office, Tax Authorities, Tribunals, High Courts and the Supreme Court of India." },
];

const COURTS = [
  "Supreme Court of India",
  "High Courts of India",
  "Income Tax Appellate Tribunals (ITAT)",
  "GST Appellate Authorities",
  "Indian Patent Office (IPO)",
  "USPTO & EPO",
  "Commercial Courts",
  "Arbitration Tribunals",
];

export function Approach() {
  return (
    <section className="section approach" id="approach">
      <div className="reveal">
        <div className="section-label">How We Work</div>
        <h2 className="section-title">Our <em>Approach</em></h2>
      </div>

      <div className="approach-grid">
        <div className="reveal delay-1">
          {STEPS.map((s) => (
            <div className="approach-step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal delay-2">
          <div className="quote-block">
            <div className="quote-mark">"</div>
            <p className="quote-text">
              The firm combines technical insight, legal depth, and practical
              problem-solving — delivering representation that is both reliable
              and result-oriented.
            </p>
            <div className="quote-attr">— Mr. Aprameya N. Katti, Founder</div>
          </div>

          <div className="courts-block">
            <div className="courts-title">Courts &amp; Forums We Appear Before</div>
            {COURTS.map((c) => (
              <div className="court-item" key={c}>{c}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// components/BlogTeaser.tsx
import Link from "next/link";
import Image from "next/image";
import { client, ALL_POSTS_QUERY } from "@/lib/sanity";

interface Post {
  _id: string; title: string; slug: { current: string };
  category?: string; publishedAt: string;
  image?: { asset: { url: string } };
}

export async function BlogTeaser() {
  let posts: Post[] = [];
  try {
    const all: Post[] = await client.fetch(ALL_POSTS_QUERY);
    posts = all.slice(0, 6);
  } catch {
    // Fail silently — Sanity not yet configured
  }

  return (
    <section className="section blog-teaser" id="blog-teaser">
      <div className="reveal">
        <div className="section-label">Insights</div>
        <h2 className="section-title">
          Legal <em>Insights</em>
          <br />from Katti &amp; Co.
        </h2>
      </div>

      <div className="blog-teaser-grid">
        <div className="blog-teaser-text reveal delay-1">
          <p>
            We share perspectives on Intellectual Property, Technology Law,
            Tax Litigation, and the evolving legal landscape — practical
            insights written for founders, businesses, and innovators.
          </p>
          <p>
            From understanding patent protection for AI inventions to
            navigating GST disputes — our blog delivers actionable legal
            knowledge.
          </p>
          <div style={{ marginTop: "1.75rem" }}>
            <Link href="/blog" className="btn-primary">
              Read All Insights →
            </Link>
          </div>
        </div>

        <div className="blog-preview-cards reveal delay-2">
          {posts.length > 0 ? (
            posts.map((p) => (
              <Link
                key={p._id}
                href={`/blog/${p.slug.current}`}
                className="blog-preview-card"
                style={{ textDecoration: "none" }}
              >
                {p.image?.asset?.url && (
                  <div className="preview-card-image">
                    <Image
                      src={p.image.asset.url}
                      alt={p.title}
                      width={120}
                      height={90}
                      sizes="120px"
                    />
                  </div>
                )}
                <div className="preview-card-body">
                  <div className="preview-card-cat">{p.category || "Insights"}</div>
                  <div className="preview-card-title">{p.title}</div>
                  <div className="preview-card-date">
                    {new Date(p.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ fontSize: ".8rem", color: "var(--t3)", lineHeight: 1.8 }}>
              No posts yet.{" "}
              <Link href="/blog" style={{ color: "var(--gold)" }}>
                Visit the blog
              </Link>{" "}
              to publish insights.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
