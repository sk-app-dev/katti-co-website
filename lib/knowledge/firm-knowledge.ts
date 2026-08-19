/**
 * lib/knowledge/firm-knowledge.ts
 * ─────────────────────────────────────────────────────────
 * Pre-built Q&A about Katti & Co., the website, services,
 * contact, team, blog, gallery, and firm approach.
 * Answered INSTANTLY — zero LLM calls.
 *
 * HOW TO ADD MORE Q&A:
 *   Find the right section → add to its `qa` array.
 *   See template at the bottom.
 *
 * NEVER add admin passwords, API keys, or credentials here.
 * ─────────────────────────────────────────────────────────
 */

export interface QAEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  source: string;
  confidence: number;
  dynamic?: boolean;
}

export interface KnowledgeNode {
  label: string;
  keywords: string[];
  qa: QAEntry[];
}

export const FIRM_KNOWLEDGE: Record<string, KnowledgeNode> = {

  // ══════════════════════════════════════════════════════
  // ABOUT THE FIRM
  // ══════════════════════════════════════════════════════
  about_firm: {
    label: "About Katti & Co.",
    keywords: [
      "katti", "katti co", "kattiandco", "law firm", "about",
      "who are you", "who is", "what is katti", "firm info",
      "about the firm", "bengaluru firm", "ip firm",
      "advocates", "attorneys", "legal firm", "katti and co",
    ],
    qa: [
      {
        id: "firm001",
        keywords: [
          "who is katti", "what is katti", "about katti", "who are you",
          "who are katti", "tell me about", "about the firm", "what firm",
        ],
        question: "Who is Katti & Co.?",
        answer: `**Katti & Co. — Advocates, IP, Tech & Tax Attorneys**

Katti & Co. is a multidisciplinary law firm based in **Bengaluru, Karnataka, India**, founded by Mr. Aprameya N. Katti.

**What makes the firm unique:**
The founder is a **computer science engineer turned advocate** — enabling the firm to handle complex technology-driven legal matters with genuine technical depth.

**Core practice areas:**
- Intellectual Property Rights (Patents, Trademarks, Copyrights, Designs, FTO)
- Technology Law (SaaS, Data Protection, AI, Cybersecurity)
- Tax Litigation & Advisory (Direct Tax, GST, ITAT, High Courts)
- Civil & Commercial Disputes (Arbitration, Mediation, Commercial Courts)
- Corporate & Commercial Law (M&A, Companies Act, FEMA, Startups)
- White Collar Crimes & Investigations (Fraud, ED, SFIO, CBI)

**Jurisdictions:** IPO, USPTO, EPO, PCT, Supreme Court, High Courts, ITAT, GSTAT, Commercial Courts, Arbitration Tribunals.

**Contact:**
📧 aprameya.katti@kattiandco.com | 📞 +91 78993 01767 | 📍 Bengaluru, India`,
        source: "Katti & Co. — kattiandco.com",
        confidence: 1.0,
      },
      {
        id: "firm002",
        keywords: [
          "founder", "aprameya", "aprameya katti", "who founded",
          "principal attorney", "ank", "managing partner",
        ],
        question: "Who is Mr. Aprameya N. Katti?",
        answer: `**Mr. Aprameya N. Katti — Founder & Principal Attorney**

**Background:**
- Formally trained as a **computer science engineer** before entering law — a rare dual background
- **Former Judicial Researcher at the High Court of Karnataka** — direct exposure to constitutional and judicial processes
- Previously at leading IP firms in India
- Worked closely with a Senior Advocate on tax, commercial, and constitutional matters

**Why this matters:**
His engineering background enables deep technical understanding of patent inventions in AI, software, semiconductor, and mechanical domains — critical for quality patent drafting and prosecution that generic law firms cannot match.

**Contact:**
📧 aprameya.katti@kattiandco.com
📞 +91 78993 01767
🌐 linkedin.com/in/adv-aprameya-n-katti-640974119/`,
        source: "Katti & Co. — About Section (kattiandco.com)",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // CONTACT & CONSULTATION
  // ══════════════════════════════════════════════════════
  contact: {
    label: "Contact & Consultation",
    keywords: [
      "contact", "email", "phone", "reach", "consult", "consultation",
      "appointment", "meeting", "book", "schedule", "enquiry", "inquiry",
      "how to contact", "get in touch", "office", "location", "address",
      "call", "respond", "linkedin", "phone number",
    ],
    qa: [
      {
        id: "cont001",
        keywords: [
          "contact", "email", "phone", "reach", "how to contact",
          "get in touch", "consult", "enquiry", "office", "location",
          "phone number", "address",
        ],
        question: "How do I contact Katti & Co.?",
        answer: `**Contact Katti & Co.**

📧 **Email:** aprameya.katti@kattiandco.com
📞 **Phone:** +91 78993 01767
📍 **Location:** Bengaluru, Karnataka, India
💼 **LinkedIn (Firm):** linkedin.com/company/katti-co/?viewAsMember=true
🌐 **Website:** kattiandco.com

**Contact Form (recommended):**
Go to **kattiandco.com** → scroll to "Get In Touch" → fill your name, email, matter type, and brief description → submit.

**Response time:** Within one business day.

**Important:** All communications from first contact are protected by **attorney-client privilege**. Your inquiry is fully confidential.`,
        source: "Katti & Co. — Contact Section (kattiandco.com)",
        confidence: 1.0,
      },
      {
        id: "cont002",
        keywords: [
          "schedule consultation", "book appointment", "meeting",
          "how to book", "first meeting", "consultation fee",
          "free consultation",
        ],
        question: "How do I schedule a consultation?",
        answer: `**Scheduling a Consultation with Katti & Co.**

**Option 1 — Website Contact Form (recommended):**
1. Visit **kattiandco.com**
2. Scroll to the "Get In Touch" section
3. Fill in: name, email, phone, organisation, matter type, brief description
4. Submit — the firm responds within one business day

**Option 2 — Direct Email:**
Email **aprameya.katti@kattiandco.com** with:
- Your name and contact details
- Nature of the legal matter (e.g., patent filing, GST dispute, trademark)
- Preferred time for a call or meeting

**Option 3 — Phone:**
Call directly: **+91 78993 01767**

**Privilege:** Attorney-client privilege applies from the moment of first contact.

*Note: I'm Mitra, an AI assistant — I cannot book appointments. Please use the channels above.*`,
        source: "Katti & Co. — Contact (kattiandco.com)",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // SERVICES & PRACTICE AREAS
  // ══════════════════════════════════════════════════════
  services: {
    label: "Services Offered",
    keywords: [
      "services", "practice areas", "what do you do", "what areas",
      "specialise", "specialize", "offer", "help with", "handle",
      "work on", "expertise", "fields", "areas of law",
    ],
    qa: [
      {
        id: "svc001",
        keywords: [
          "what services", "practice areas", "what do you do",
          "what areas", "help with", "specialize", "offer",
        ],
        question: "What services does Katti & Co. offer?",
        answer: `**Katti & Co. — Practice Areas**

**1. Intellectual Property Rights**
Full-spectrum IP: patent drafting & prosecution (IPO/USPTO/EPO/PCT), trademark registration & enforcement, copyright, designs, FTO (Freedom to Operate), IP due diligence, licensing, portfolio strategy.

**2. Technology Law**
SaaS & platform agreements, data protection & privacy, AI legal frameworks, cybersecurity compliance, digital governance, tech outsourcing contracts.

**3. Tax Litigation & Advisory**
Direct tax and GST disputes, SCN responses, appeals before ITAT and GSTAT, High Court writs, Supreme Court matters, tax planning.

**4. Civil & Commercial Disputes**
Arbitration, mediation, conciliation, commercial court litigation, injunctions, recovery matters, consumer disputes.

**5. Corporate & Commercial Law**
Company incorporation, M&A, due diligence, shareholders' agreements, Companies Act compliance, FEMA, foreign investment, startup structuring, ESOP.

**6. White Collar Crimes & Investigations**
Fraud defence, corporate investigations, representation before ED (Enforcement Directorate), SFIO, CBI. Crisis management.

📧 aprameya.katti@kattiandco.com | 📞 +91 78993 01767`,
        source: "Katti & Co. — Practice Areas (kattiandco.com)",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // WEBSITE NAVIGATION
  // ══════════════════════════════════════════════════════
  website: {
    label: "Website & Navigation",
    keywords: [
      "website", "site", "page", "section", "navigate", "find",
      "kattiandco", "blog", "gallery", "insights", "about page",
      "contact page", "home", "footer", "privacy policy",
      "what is on the website", "sections",
    ],
    qa: [
      {
        id: "web001",
        keywords: [
          "what is on the website", "website sections", "navigate",
          "what can i find", "website content", "website pages",
        ],
        question: "What is on the Katti & Co. website?",
        answer: `**Katti & Co. Website — kattiandco.com**

**Home Page Sections:**
- **Hero** — Tagline "Where Technical Insight Meets Legal Depth" + firm overview
- **About** — Firm philosophy, 4 core values and founder profile
- **Practice Areas** — 6 accordion cards (click each to expand full service list)
- **Gallery** — Photos and videos from the firm
- **Legal Insights (Blog)** — Articles on IP, Tax, and Technology law
- **Contact** — Contact form, email, phone, and LinkedIn
- **Footer** — Links, disclaimer, and privacy policy

**Separate Pages:**
- **/blog** — All published legal insights at kattiandco.com/blog

**Navigation:**
- "Consult Us" button in the nav bar jumps to the contact form
- Blog articles at kattiandco.com/blog`,
        source: "Katti & Co. — kattiandco.com",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // APPROACH
  // ══════════════════════════════════════════════════════
  approach: {
    label: "Firm's Approach",
    keywords: [
      "approach", "process", "how do you work", "methodology",
      "how does the firm work", "values",
    ],
    qa: [
      {
        id: "app001",
        keywords: [
          "approach", "process", "how do you work",
          "methodology", "how does the firm work",
        ],
        question: "What is Katti & Co.'s approach?",
        answer: `**Katti & Co. — Approach**

**Core Values:** Clarity · Precision · Integrity · Client Focus

The firm combines technical insight, legal depth, and practical problem-solving — delivering representation that is both reliable and result-oriented.

📧 aprameya.katti@kattiandco.com | 📞 +91 78993 01767`,
        source: "Katti & Co. — Approach Section (kattiandco.com)",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // FALLBACK
  // ══════════════════════════════════════════════════════
  fallback: {
    label: "Refer to Firm",
    keywords: ["help", "question", "need help", "my case", "advice"],
    qa: [
      {
        id: "fall001",
        keywords: [
          "my case", "my situation", "specific advice",
          "my matter", "what should i do",
        ],
        question: "Can you give me specific advice for my situation?",
        answer: `**Specific Legal Advice**

I can provide general legal information, but I cannot give advice specific to your exact situation. That requires a qualified advocate who knows all the facts.

**Contact Katti & Co. for a consultation:**

📧 aprameya.katti@kattiandco.com
📞 +91 78993 01767
🌐 kattiandco.com → "Get In Touch"

Response time: within one business day.`,
        source: "Katti & Co. — Contact (kattiandco.com)",
        confidence: 1.0,
      },
    ],
  },
};
