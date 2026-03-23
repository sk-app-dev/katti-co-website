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
                <p>We collect only such personal information as is necessary and voluntarily provided by you. This may include your email address and any details you choose to share when contacting us through our website or other communication channels. We do not engage in the collection of personal data beyond what is reasonably required.</p>
                <h3>2. Purpose of Use</h3>
                <p>The information provided by you is used strictly for professional purposes—primarily to respond to your queries, communicate with you, and, where applicable, facilitate consultations. Your data is not used for unsolicited communications, and we do not sell, trade, or otherwise transfer your information to third parties.</p>
                <h3>3. Consent</h3>
                <p>By voluntarily providing your information, you signify your consent to its collection and use in accordance with this Policy. Such consent is not irrevocable—you retain the right to withdraw it at any time by contacting us, upon which we shall take appropriate steps to cease further use, subject to legal or professional obligations.</p>
                <h3>4. Data Protection and Security</h3>
                <p>We adopt reasonable and appropriate safeguards to protect your information against unauthorised access, disclosure, alteration, or destruction. While no system can claim absolute security, we remain committed to maintaining the confidentiality and integrity of your data.</p>
                <h3>5. Your Rights</h3>
                <p>You retain the right to access, review, correct, or request deletion of your personal information held by us. Any such request may be addressed to: <a href="mailto:aprameya.katti@kattiandco.com" style={{ color: "var(--gold)" }}>aprameya.katti@kattiandco.com</a> and we shall endeavour to respond within a reasonable timeframe, in accordance with applicable laws.</p>
                <h3>6. Updates to this Policy</h3>
                <p>This Privacy Policy may be revised periodically to reflect changes in legal, regulatory, or operational requirements. Any updates will be published on this page with the revised effective date, and your continued engagement with us shall constitute acceptance of such changes</p>
                <h3>Disclaimer</h3>
                <p>This website is made available by Katti & Co. solely for the purpose of disseminating general information about the firm and its areas of practice, in compliance with the rules of the Bar Council of India. By accessing this website, you acknowledge and accept the following conditions:</p>
                <ul>
                  <li>The contents of this website do not constitute, and are not intended to constitute, any form of advertisement, solicitation, or inducement for the purpose of obtaining legal work.</li>
                  <li>You confirm that you are seeking information about Katti & Co. on your own initiative, and that there has been no form of solicitation or encouragement by the firm or its members.</li>
                  <li>Your use of this website, including any communication through it, does not create a lawyer–client relationship between you and Katti & Co.</li>
                  <li>The material provided on this website is for informational purposes only and should not be construed as legal advice or opinion. You are advised to seek independent legal counsel for any specific legal issue.</li>
                  <li>Katti & Co. shall not be liable for any loss or consequence arising from reliance on the information contained on this website or from its use.</li>
                  <li>Katti &amp; Co. is not responsible for consequences arising from information on this website.</li>
                  <li>All content, including text, design, and materials on this website, is the exclusive intellectual property of Katti & Co. and is protected under applicable laws. Unauthorized use or reproduction is prohibited.</li>
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
