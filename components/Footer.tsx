"use client";
// components/Footer.tsx

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [ppOpen, setPpOpen] = useState(false);

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
              <li><button onClick={() => setPpOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", fontSize: ".74rem", color: "var(--t3)", padding: 0, textAlign: "left" }}>Privacy Policy</button></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-row">
            <div className="footer-copy">&copy; 2025 Katti &amp; Co. All rights reserved.</div>
            <div className="footer-legal">
              <button onClick={() => setPpOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}>Privacy Policy</button>
              <button onClick={() => setPpOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}>Disclaimer</button>
            </div>
          </div>
          <div className="footer-disclaimer">
            <strong style={{ fontWeight: 500 }}>Disclaimer:</strong> This website is not an advertisement or solicitation. It is maintained solely for general informational purposes and does not constitute legal advice. No attorney-client relationship is created by accessing this website. As per the Bar Council of India Rules, advocates are prohibited from advertising or soliciting work. [Rule 36, Bar Council of India Rules under the Advocates Act, 1961]
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {ppOpen && (
        <div
          className="modal-overlay open"
          onClick={(e) => e.target === e.currentTarget && setPpOpen(false)}
        >
          <div className="modal-box" style={{ width: "min(94vw, 680px)" }}>
            <div className="modal-title">Privacy Policy</div>
            <div className="pp-eff">Effective Date: 22 September 2025</div>
            <div className="pp-scroll">
              <div className="pp-body">
                <p>At Katti &amp; Co., we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website.</p>
                <h3>1. Information We Collect</h3>
                <p>We may collect your email address when you contact us via the website. We do not collect any other personal information unless you voluntarily provide it.</p>
                <h3>2. How We Use Your Information</h3>
                <p>We use your email address solely to respond to your inquiries and schedule a consultation. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
                <h3>3. Consent</h3>
                <p>When you provide your email address, you consent to our collection and use of such data. You may withdraw consent at any time by writing to us.</p>
                <h3>4. Data Security</h3>
                <p>We take reasonable steps to protect your information from unauthorised access, disclosure, or misuse.</p>
                <h3>5. Your Rights</h3>
                <p>You may request access to, correction, or deletion of your personal data. Contact: <a href="mailto:aprameya.katti@kattiandco.com" style={{ color: "var(--gold)" }}>aprameya.katti@kattiandco.com</a></p>
                <h3>6. Changes to this Policy</h3>
                <p>We may update this Privacy Policy from time to time. Changes will be posted here with an updated effective date.</p>
                <h3>Disclaimer</h3>
                <p>In accordance with the rules of the Bar Council of India, Katti &amp; Co. and its members are prohibited from soliciting work or advertising in any form. By continuing to use this website, you confirm that:</p>
                <ul>
                  <li>There has been no advertisement, solicitation, or inducement to solicit work through this website.</li>
                  <li>The sole purpose of this website is to provide general information about Katti &amp; Co.</li>
                  <li>You are accessing this website of your own accord.</li>
                  <li>Using this website does not create a lawyer-client relationship.</li>
                  <li>Content on this website should not be interpreted as legal advice.</li>
                  <li>Katti &amp; Co. is not responsible for consequences arising from information on this website.</li>
                  <li>All content is the intellectual property of Katti &amp; Co.</li>
                </ul>
              </div>
            </div>
            <div className="modal-buttons">
              <button className="modal-confirm" onClick={() => setPpOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
