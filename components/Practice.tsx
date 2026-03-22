"use client";
// components/Practice.tsx

import { useState } from "react";

const PRACTICES = [
  {
    id: "ip", num: "01", name: "Intellectual Property Rights",
    summary: "Patents · Trademarks · Copyrights · Designs · FTO · Global Prosecution",
    items: ["Patentability Assessments","Patent Drafting & Prosecution","PCT / IPO / USPTO / EPO Filing","Prior Art & Invalidity Searches","Freedom-to-Operate (FTO)","Office Action Responses","Pre/Post-Grant Oppositions","Revocation Proceedings","Infringement Actions","IP Due Diligence","Portfolio Strategy","Licensing & Technology Transfer","Trademark Search & Filing","Trademark Oppositions","Design Protection & Filing","Copyright Filing & Advisory","Software & AI Copyright","Online Infringement Actions"],
  },
  {
    id: "tech", num: "02", name: "Technology Law",
    summary: "SaaS Agreements · AI Frameworks · Data Protection · Cybersecurity",
    items: ["SaaS, PaaS & Tech Agreements","Platform Terms & User Policies","Digital Governance Frameworks","Data Protection & Privacy","Cross-border Data Flows","AI Legal Structuring","Algorithmic Decision Frameworks","Cybersecurity Compliance","Incident Response Advisory","Tech Outsourcing Agreements","System Integration Contracts","Digital Business Regulatory Advisory"],
  },
  {
    id: "tax", num: "03", name: "Tax Litigation & Advisory",
    summary: "Direct Tax · Indirect Tax · GST · Tribunals · High Courts · Supreme Court",
    items: ["Direct Tax Litigation","Indirect Tax — GST & Customs","Show Cause Notice Responses","Assessment Disputes","Investigation Matters","Audit-related Disputes","Appellate Tribunal Representation","Commissioners (Appeals)","High Court Writ Proceedings","Supreme Court Appeals","Tax Advisory & Planning","Demand & Recovery Proceedings"],
  },
  {
    id: "civil", num: "04", name: "Civil & Commercial Disputes",
    summary: "Arbitration · Mediation · Commercial Courts · High Courts",
    items: ["Contractual Disputes","Arbitration Proceedings","Mediation & Conciliation","Commercial Court Litigation","Civil Court Proceedings","Recovery Matters","Company-related Issues","Consumer Disputes","High Court Representation","Supreme Court Representation","Injunction Applications","Commercial Advisory"],
  },
  {
    id: "corp", num: "05", name: "Corporate & Commercial Law",
    summary: "Business Structuring · M&A · Contracts · Companies Act · FEMA",
    items: ["Business Structuring & Entity Formation","Commercial Contract Drafting","Mergers & Acquisitions (M&A)","Due Diligence","Joint Ventures & Shareholder Agreements","Companies Act Advisory","FEMA & Foreign Investment","Corporate Governance & Compliance","Founders & Investor Agreements","Board & Shareholder Disputes"],
  },
  {
    id: "wcc", num: "06", name: "White Collar Crimes & Investigations",
    summary: "Fraud Defence · ED · SFIO · CBI · Crisis Management",
    items: ["Fraud, Cheating & Criminal Breach of Trust","Prevention of Corruption Act","Companies Act Offences","IPC Economic Offences","Representation before ED","Representation before SFIO","Representation before CBI","Corporate Internal Investigations","Risk Assessments & Compliance","Litigation Strategy & Crisis Management"],
  },
];

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
    <line x1="2" y1="7" x2="12" y2="7" />
    <path d="M7 2l5 5-5 5" />
  </svg>
);

export default function Practice() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="section practice" id="practice">
      <div className="practice-header reveal">
        <div>
          <div className="section-label">What We Do</div>
          <h2 className="section-title">Practice <em>Areas</em></h2>
        </div>
        <p className="section-sub" style={{ margin: 0 }}>
          Click any area to explore the full scope of services offered.
        </p>
      </div>

      <div className="practice-cards">
        {PRACTICES.map((p) => {
          const isOpen = openId === p.id;
          return (
            <div
              key={p.id}
              className={`practice-card reveal${isOpen ? " open" : ""}`}
            >
              <div
                className="practice-header-row"
                onClick={() => toggle(p.id)}
                role="button"
                aria-expanded={isOpen}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle(p.id)}
              >
                <div className="practice-left">
                  <div className="practice-number">{p.num}</div>
                  <div>
                    <div className="practice-name">{p.name}</div>
                    <div className="practice-summary">{p.summary}</div>
                  </div>
                </div>
                <div className="practice-arrow">
                  <ArrowIcon />
                </div>
              </div>

              <div className="practice-body">
                <div className="practice-items">
                  {p.items.map((item) => (
                    <div className="practice-item" key={item}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
