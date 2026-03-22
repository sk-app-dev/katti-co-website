"use client";
// components/Contact.tsx

import { useState } from "react";

const MATTER_TYPES = [
  "Patent Filing & Prosecution",
  "Trademark Protection",
  "Copyright Advisory",
  "IP Enforcement & Litigation",
  "FTO / IP Due Diligence",
  "Technology Law Advisory",
  "Tax Litigation — Direct",
  "Tax Litigation — Indirect / GST",
  "Commercial Dispute",
  "Arbitration / Mediation",
  "Corporate / M&A",
  "White Collar Crime",
  "Other",
];

type Status = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("fn") as HTMLInputElement).value,
      lastName:  (form.elements.namedItem("ln") as HTMLInputElement).value,
      email:     (form.elements.namedItem("em") as HTMLInputElement).value,
      phone:     (form.elements.namedItem("ph") as HTMLInputElement).value,
      org:       (form.elements.namedItem("og") as HTMLInputElement).value,
      matter:    (form.elements.namedItem("mt") as HTMLSelectElement).value,
      message:   (form.elements.namedItem("mg") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <section className="section contact" id="contact">
      <div className="reveal">
        <div className="section-label">Get In Touch</div>
        <h2 className="section-title">
          Begin Your
          <br />
          <em>Legal Journey</em>
        </h2>
      </div>

      <div className="contact-grid">
        {/* Left — contact info */}
        <div className="contact-info reveal delay-1">
          <p>
            All communications are protected by attorney-client privilege from
            the moment of first contact. We respond within one business day.
          </p>

          <div className="privilege-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Attorney-Client Privilege Protected
          </div>

          <div className="contact-detail">
            <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <div className="contact-label">Email</div>
              <div className="contact-value">
                <a href="mailto:aprameya.katti@kattiandco.com">
                  aprameya.katti@kattiandco.com
                </a>
              </div>
            </div>
          </div>

          <div className="contact-detail">
            <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            <div>
              <div className="contact-label">Phone</div>
              <div className="contact-value">+91 78993 01767</div>
            </div>
          </div>

          <div className="contact-detail">
            <svg className="contact-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            <div>
              <div className="contact-label">LinkedIn</div>
              <div className="contact-value">
                <a
                  href="https://www.linkedin.com/company/katti-co/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin.com/company/katti-co
                </a>
              </div>
            </div>
          </div>

          <div className="contact-detail">
            <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div>
              <div className="contact-label">Office</div>
              <div className="contact-value">Bengaluru, Karnataka, India</div>
            </div>
          </div>
        </div>

        {/* Right — contact form */}
        <div className="reveal delay-2">
          {status === "success" ? (
            <div
              style={{
                background: "var(--bg3)",
                border: "1px solid rgba(61,214,140,.25)",
                padding: "2.5rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✓</div>
              <div
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: ".8rem",
                  letterSpacing: ".12em",
                  color: "var(--grn)",
                  marginBottom: ".75rem",
                }}
              >
                Enquiry Received
              </div>
              <p style={{ fontSize: ".82rem", color: "var(--t2)", lineHeight: 1.7 }}>
                Thank you for reaching out. We will respond within one business
                day. A confirmation has been sent to your email.
              </p>
              <button
                className="btn-outline"
                style={{ marginTop: "1.5rem", fontSize: ".62rem" }}
                onClick={() => setStatus("idle")}
              >
                Send Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <div className="form-row">
                  <div>
                    <label className="form-label" htmlFor="fn">First Name *</label>
                    <input id="fn" name="fn" type="text" className="form-input" placeholder="Rajan" required autoComplete="given-name" />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="ln">Last Name</label>
                    <input id="ln" name="ln" type="text" className="form-input" placeholder="Sharma" autoComplete="family-name" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="em">Email Address *</label>
                <input id="em" name="em" type="email" className="form-input" placeholder="rajan@company.com" required autoComplete="email" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ph">Phone</label>
                <input id="ph" name="ph" type="tel" className="form-input" placeholder="+91 98XXX XXXXX" autoComplete="tel" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="og">Organisation</label>
                <input id="og" name="og" type="text" className="form-input" placeholder="Company / Startup / Individual" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mt">Matter Type *</label>
                <select id="mt" name="mt" className="form-select" required defaultValue="">
                  <option value="" disabled>Select a practice area</option>
                  {MATTER_TYPES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mg">Brief Description *</label>
                <textarea
                  id="mg" name="mg" className="form-textarea"
                  placeholder="Describe your matter briefly. All communications are confidential."
                  required
                />
              </div>

              {status === "error" && (
                <div className="form-error" style={{ marginBottom: ".75rem" }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="form-submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send Enquiry"}
              </button>

              <div className="form-note">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Encrypted &amp; protected by Attorney-Client Privilege
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
