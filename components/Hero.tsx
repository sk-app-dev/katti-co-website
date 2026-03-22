// components/Hero.tsx
// Server component — no interactivity needed

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-grid" />
      <div className="hero-glow" />

      <div className="hero-content">
        <div className="hero-eyebrow">Katti &amp; Co.</div>

        <h1 className="hero-title">
          Where Technical<br />
          Insight Meets<br />
          <em>Legal Depth</em>
        </h1>

        <p className="hero-tagline">
          A multidisciplinary law firm specialising in Intellectual Property,
          Technology Law, Tax Litigation, Civil &amp; Commercial, Corporate Law
          and White Collar Crimes — combining engineering precision with
          rigorous legal practice.
        </p>

        <div className="hero-actions">
          <a href="#practice" className="btn-primary">
            Explore Practice Areas
          </a>
          <a href="#contact" className="btn-outline">
            Schedule Consultation
          </a>
        </div>
      </div>

      <div className="hero-stats">
        <div className="stat">
          <span className="stat-number">6</span>
          <span className="stat-label">Core Practice Areas</span>
        </div>
        <div className="stat">
          <span className="stat-number">IPO · USPTO · EPO</span>
          <span className="stat-label">Filing Jurisdictions</span>
        </div>
        <div className="stat">
          <span className="stat-number">HC · SC</span>
          <span className="stat-label">Constitutional Courts</span>
        </div>
        <div className="stat">
          <span className="stat-number">IP · Tech · Tax</span>
          <span className="stat-label">Core Disciplines</span>
        </div>
      </div>
    </section>
  );
}
