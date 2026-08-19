"use client";
// components/Footer.tsx

import Link from "next/link";

export default function Footer() {

  return (
    <>
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">KATTI &amp; Co.</div>
            <p className="footer-tagline">
              Advocates, IP, Tech &amp; Tax Attorneys. Combining technical
              insight with legal depth — Bengaluru, India.
            </p>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Practice</div>
            <ul>
              <li><a href="#practice" onClick={(e) => { e.preventDefault(); document.getElementById("c-ip")?.scrollIntoView(); }}>Patents &amp; IP</a></li>
              <li><a href="#practice">Technology Law</a></li>
              <li><a href="#practice">Tax Litigation</a></li>
              <li><a href="#practice">Commercial Disputes</a></li>
              <li><a href="#practice">Corporate Law</a></li>
              <li><a href="#practice">White Collar</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Links</div>
            <ul>
              <li><a href="#gallery">Gallery</a></li>
              <li><Link href="/blog">Blog &amp; Insights</Link></li>
              <li><a href="https://www.linkedin.com/company/katti-co/?viewAsMember=true" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Firm</div>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#approach">Our Approach</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><Link href="/privacy-policy" style={{ textDecoration: "none" }}><button style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", fontSize: ".74rem", color: "var(--t3)", padding: 0, textAlign: "left" }}>Privacy Policy</button></Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-row">
            <div className="footer-copy">&copy; 2025 Katti &amp; Co. All rights reserved.</div>
            <div className="footer-legal">
              <Link href="/privacy-policy" style={{ textDecoration: "none" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "var(--t3)" }}>Privacy Policy</button>
              </Link>
              <Link href="/disclaimer" style={{ textDecoration: "none" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "var(--t3)" }}>Disclaimer</button>
              </Link>
            </div>
          </div>
          <div className="footer-disclaimer">
            <strong style={{ fontWeight: 500 }}>Disclaimer:</strong> This website is not an advertisement or solicitation. It is maintained solely for general informational purposes and does not constitute legal advice. No attorney-client relationship is created by accessing this website. As per the Bar Council of India Rules, advocates are prohibited from advertising or soliciting work. [Rule 36, Bar Council of India Rules under the Advocates Act, 1961]
          </div>
        </div>
      </footer>

    </>
  );
}
