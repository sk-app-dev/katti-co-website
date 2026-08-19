/**
 * lib/knowledge/legal-knowledge.ts
 * ─────────────────────────────────────────────────────────
 * Pre-built Q&A sourced from Indian legislation.
 * Each section = one area of law. Answered INSTANTLY — 0 LLM calls.
 *
 * Sources:
 *   Patents Act 1970 · Patents Rules 2003
 *   Trade Marks Act 1999 · Trade Marks Rules 2017
 *   Copyright Act 1957
 *   CGST Act 2017 · CGST Rules 2017
 *   Income Tax Act 1961
 *   Companies Act 2013
 *   Arbitration & Conciliation Act 1996
 *   IPO Official FAQ (ipindia.gov.in)
 * ─────────────────────────────────────────────────────────
 */

import type { KnowledgeNode } from "./firm-knowledge";

export const LEGAL_KNOWLEDGE: Record<string, KnowledgeNode> = {

  // ══════════════════════════════════════════════════════
  // PATENTS
  // ══════════════════════════════════════════════════════
  patents: {
    label: "Patents (India)",
    keywords: [
      "patent", "patents", "invention", "inventive", "patentable",
      "ipo", "indian patent office", "provisional", "complete",
      "specification", "claim", "prior art", "novelty", "inventive step",
      "pct", "wipo", "priority", "grant", "opposition", "fto",
      "freedom to operate", "patent agent", "patent attorney",
    ],
    qa: [
      {
        id: "pat001",
        keywords: [
          "what can patented", "patentable", "patentable subject",
          "requirements patent", "criteria patent",
        ],
        question: "What can be patented in India?",
        answer: `**Patentable Inventions — Patents Act, 1970**

Three mandatory criteria must ALL be satisfied:

**1. Novelty**
Not disclosed anywhere in the world before the Indian filing date. **File before you disclose publicly.**

**2. Inventive Step**
Not obvious to a person skilled in the relevant technical field at the priority date.

**3. Industrial Applicability**
Capable of being made or used in any kind of industry.

**What qualifies:**
- Processes, methods, and methods of manufacture
- Machines, apparatus, and devices
- Products and compositions of matter
- Software producing a **technical effect** (not software *per se*)
- AI/ML inventions with concrete technical improvements

⚠️ Filing a provisional application does NOT guarantee a patent — the IPO independently examines every application.`,
        source: "Patents Act, 1970; IPO FAQ",
        confidence: 1.0,
      },
      {
        id: "pat002",
        keywords: [
          "cannot patent", "non-patentable", "section 3", "excluded",
          "not patentable", "software patent", "algorithm",
          "mathematical", "discovery",
        ],
        question: "What cannot be patented? Section 3 exclusions.",
        answer: `**Non-Patentable Subject Matter — Section 3, Patents Act 1970**

**Excluded:**
- Frivolous inventions or inventions contrary to natural laws
- Against public order, morality, or public health
- Mere discovery of a scientific principle or abstract theory
- Mere discovery of new property of known substance *(prevents pharma evergreening)*
- Substances obtained by mere admixture
- Mere arrangement or rearrangement of known devices
- Methods of agriculture or horticulture
- Processes for medical/surgical/curative treatment
- Plants, animals, seeds, varieties
- **Mathematical methods, business methods, computer programs *per se*, mental acts**
- Traditional knowledge
- Atomic energy inventions

**Software/AI nuance:**
Software *per se* is excluded. However, software producing a **technical effect** or solving a **technical problem** may be patentable when claimed as a method or system.`,
        source: "Patents Act, 1970 — Section 3; IPO CRI Guidelines 2017/2019",
        confidence: 1.0,
      },
      {
        id: "pat003",
        keywords: [
          "patent duration", "patent term", "20 years", "patent expire",
          "how long patent", "patent valid",
        ],
        question: "How long does a patent last in India?",
        answer: `**Patent Term — Patents Act, 1970 — Section 53**

A granted patent is valid for **20 years from the date of filing** — not from the date of grant.

**Key points:**
- 20 years runs from the **filing date** (or PCT international filing date)
- Annual renewal fees (annuities) must be paid from year 3 after filing
- Non-payment → lapse
- No extension beyond 20 years (unlike some countries)

**After expiry:**
The invention enters the **public domain** — anyone can use it freely.`,
        source: "Patents Act, 1970 — Section 53",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // TRADEMARKS
  // ══════════════════════════════════════════════════════
  trademarks: {
    label: "Trade Marks (India)",
    keywords: [
      "trademark", "trade mark", "brand", "registration", "intellectual",
      "mark", "symbol", "logo", "name", "ipo", "infringement",
      "opposition", "renewal", "term", "10 years", "classes",
    ],
    qa: [
      {
        id: "tm001",
        keywords: ["trademark", "brand", "what trademark"],
        question: "What is a trademark?",
        answer: `**Trademark — Trade Marks Act, 1999**

A trademark is any **sign** capable of being represented graphically and distinguishing the goods or services of one person from those of others. It can be:

- **Words** (names, slogans, phrases)
- **Logos** and symbols
- **Sounds, colours, shapes** (non-traditional marks)
- **Combinations** of the above

**Purpose:**
- Protects your brand identity from infringement
- Grants exclusive right to use the mark across specified goods/services
- **Registrable for 10 years** and renewable indefinitely
- Enforcement through civil and criminal law

**Classes:**
There are **45 classifications** (Goods/Services). You must register in the class(es) relevant to your business.`,
        source: "Trade Marks Act, 1999 — Section 2(zb)",
        confidence: 1.0,
      },
      {
        id: "tm002",
        keywords: ["trademark duration", "trademark term", "renewal", "10 years"],
        question: "How long does a trademark registration last?",
        answer: `**Trademark Term — Trade Marks Act, 1999 — Section 15**

A registered trademark is valid for **10 years from the date of registration**.

**Renewal:**
- Before expiry: File Form TM-12 for renewal
- Within 6 months after expiry: File with late fees
- After 6 months: Application lapses; start fresh registration

**Indefinite renewal:**
You can renew every 10 years **indefinitely** — there is no maximum term. Unlike patents (20-year max), trademarks can last forever if maintained.

**Consequence of non-renewal:**
The mark is removed from the register. Your competitor can then register the same mark.`,
        source: "Trade Marks Act, 1999 — Sections 15, 22",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // COPYRIGHT
  // ══════════════════════════════════════════════════════
  copyright: {
    label: "Copyright (India)",
    keywords: [
      "copyright", "literary", "artistic", "musical", "dramatic",
      "work", "author", "infringement", "duration", "registration",
      "50 years", "70 years", "author life",
    ],
    qa: [
      {
        id: "copy001",
        keywords: ["copyright", "what copyright", "protected"],
        question: "What is copyright in India?",
        answer: `**Copyright — Copyright Act, 1957**

Copyright is an **automatic right** granted to the creator of original works. No registration required to own copyright, but registration provides evidence.

**Works protected:**
- Literary (books, articles, software code, scripts)
- Dramatic (plays, choreography)
- Musical (compositions, lyrics)
- Artistic (paintings, photographs, sculptures)
- Cinematograph (films, videos)
- Sound recordings

**Duration:**
- **Literary/Dramatic/Musical/Artistic:** 60 years after author's death (or 60 years from publication if anonymous)
- **Cinematograph:** 60 years from first publication
- **Sound Recordings:** 60 years from first publication

**Rights granted:**
- Reproduce, adapt, distribute, perform, communicate to public
- License or sell your copyright

**Note:** Software source code is protected as a literary work for author's lifetime + 60 years.`,
        source: "Copyright Act, 1957 — Sections 14, 57, 63",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // GST
  // ══════════════════════════════════════════════════════
  gst: {
    label: "GST (Goods and Services Tax) India",
    keywords: [
      "gst", "goods and services tax", "cgst", "sgst", "igst",
      "registration", "gst rate", "invoice", "hsncode", "sac",
      "threshold", "gst dispute", "scn", "audit", "itat", "gstat",
      "input tax", "output tax", "tax rate", "18%", "5%", "12%", "0%",
    ],
    qa: [
      {
        id: "gst001",
        keywords: ["gst", "what gst", "goods services tax"],
        question: "What is GST?",
        answer: `**Goods and Services Tax (GST) — CGST Act, 2017**

GST is a **comprehensive indirect tax** levied on the supply of goods and services in India.

**Key features:**
- **Single, unified tax** replaces multiple taxes (VAT, Excise, Service Tax, etc.)
- **Input tax credit (ITC):** Recover GST paid on inputs against GST on outputs
- **Rates:** 0%, 5%, 12%, 18%, 28% depending on the goods/service
- **Registration:** Mandatory if turnover exceeds ₹20 lakhs/year (₹10 lakhs for specific goods)

**Main taxes:**
- **CGST** — Central GST (Govt. of India)
- **SGST** — State GST (State Government)
- **IGST** — Integrated GST (for inter-state supply)
- CGST + SGST = total GST (intra-state)
- IGST alone (inter-state)

**Compliance:**
- Monthly/quarterly GST returns (GSTR-1, GSTR-3B)
- Invoice requirements (GST number, HSN/SAC, amounts)
- Annual return (GSTR-9)

**Disputes:**
If GST officer issues a Show Cause Notice (SCN), respond within 30 days. Appeal before GSTAT if unsatisfied.`,
        source: "CGST Act, 2017 — Sections 2(47), 22; CGST Rules, 2017",
        confidence: 1.0,
      },
      {
        id: "gst002",
        keywords: ["gst registration", "gstin", "threshold", "when register"],
        question: "When do I need to register for GST?",
        answer: `**GST Registration Threshold — CGST Act, 2017 — Section 22**

**Mandatory registration:**
- **Turnover ≥ ₹20 lakhs/year** — All states (₹10 lakhs for goods suppliers; ₹5 lakhs from 1 Oct 2024)
- **Turnover ≥ ₹10 lakhs/year** — All states (if supplying goods; ₹5 lakhs from 1 Oct 2024)
- **Any service** over the threshold
- **Imports** — mandatory even below threshold
- **E-commerce supplies** — mandatory for sellers on e-commerce platforms

**Voluntary registration:**
You can register even if below threshold (may benefit from ITC).

**Timeline:**
- Application: Online on gst.gov.in
- Approval: Usually within 7 working days
- Use: Start accepting GST from the registration date

**Note:** Non-registration despite crossing threshold → GST + penalties + interest.`,
        source: "CGST Act, 2017 — Section 22",
        confidence: 1.0,
      },
      {
        id: "gst003",
        keywords: ["gst rates", "gst rate", "5%", "12%", "18%", "28%"],
        question: "What are the different GST rates in India?",
        answer: `**GST Rates in India — CGST Act, Schedule I & II**

| Rate | Examples |
|---|---|
| **0%** | Essential food items (wheat, rice, pulses, milk), books, newspapers |
| **5%** | Ready-made garments, footwear, packed food items, light fittings |
| **12%** | Most electronics (smartphones), cosmetics, furniture |
| **18%** | Most services, branded packaged goods, stainless steel, accessories |
| **28%** | Luxury goods, motor vehicles (except EVs), aerated drinks, cosmetics |

**Special rates:**
- **Fractional rates:** Edible oils (0%), certain foods
- **Exemptions:** Medical services, education, financial services

**Your responsibility:**
Identify the correct rate for each good/service and levy accordingly. Misclassification → penalties and interest.

Refer to the official **HSN/SAC Code List** on gst.gov.in for classification.`,
        source: "CGST Act, 2017 — Schedule I & II",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // INCOME TAX
  // ══════════════════════════════════════════════════════
  income_tax: {
    label: "Income Tax (India)",
    keywords: [
      "income tax", "tax", "it", "scn", "assessment", "return",
      "pan", "iti", "itat", "appeal", "audit", "deduction",
      "section 80c", "section 80d", "income slab", "rate", "income",
    ],
    qa: [
      {
        id: "it001",
        keywords: ["income tax", "what income tax", "tax india"],
        question: "What is Income Tax in India?",
        answer: `**Income Tax — Income Tax Act, 1961**

Income Tax is a **direct tax** levied on the income (salary, business profits, capital gains, interest, royalties, etc.) earned by individuals, companies, and other entities.

**Who pays:**
- Individuals, companies, partnerships, LLPs, trusts
- Anyone with income ≥ ₹2,50,000/year (₹3,00,000 for senior citizens, ₹5,00,000 for super-senior citizens)

**Types of income:**
- **Salary** — Employment income
- **Business & Profession** — Self-employment profit
- **Capital Gains** — Profit from sale of assets (shares, property, gold)
- **House Property** — Rental income
- **Interest** — Bank deposits, loans
- **Other Sources** — Royalties, foreign remittance

**Compliance:**
- **File ITR annually** — Mandatory for taxable income
- **PAN number** — Required to file ITR
- **Deductions** — Section 80C (insurance, education), 80D (health), etc.

**Disputes:**
If you receive a notice from the Income Tax officer → respond with supporting documents. Appeal to CIT if unsatisfied.`,
        source: "Income Tax Act, 1961 — Sections 4, 12, 139, 240",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // CONTRACTS & COMMERCIAL LAW
  // ══════════════════════════════════════════════════════
  contracts: {
    label: "Contracts & Commercial Law",
    keywords: [
      "contract", "agreement", "commercial", "purchase", "sale",
      "liability", "breach", "damages", "terms", "conditions",
      "consideration", "valid", "formation", "force majeure",
    ],
    qa: [
      {
        id: "con001",
        keywords: ["contract", "what contract", "agreement"],
        question: "What is a valid contract?",
        answer: `**Valid Contract — Indian Contract Act, 1872**

A contract is an **agreement between two or more parties** that is enforceable by law.

**Essential elements for a valid contract:**
1. **Offer** — One party makes a clear proposal
2. **Acceptance** — Other party accepts the exact terms (no modifications)
3. **Consideration** — Exchange of value (money, service, promise)
4. **Capacity** — Both parties are mentally competent and legally eligible (not minors, not incapacitated)
5. **Consent** — Parties agree freely (no force, fraud, misrepresentation)
6. **Legal object** — Contract is not for illegal purpose
7. **Certainty** — Terms are clear and not ambiguous

**Types:**
- Written contracts (employment, purchase, lease)
- Oral contracts (valid but harder to prove)
- Electronic contracts (emails, digital agreements)

**If breached:**
The non-breaching party can sue for damages (compensation for loss) or specific performance (court order to perform the obligation).`,
        source: "Indian Contract Act, 1872 — Sections 10, 13, 14, 24, 25, 26",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // ARBITRATION
  // ══════════════════════════════════════════════════════
  arbitration: {
    label: "Arbitration & Dispute Resolution",
    keywords: [
      "arbitration", "arbitrator", "dispute", "resolution",
      "mediation", "conciliation", "litigation", "court",
      "award", "enforcement", "arbitration clause",
    ],
    qa: [
      {
        id: "arb001",
        keywords: ["arbitration", "what arbitration", "arbitration vs court"],
        question: "What is arbitration? How is it different from court?",
        answer: `**Arbitration — Arbitration & Conciliation Act, 1996**

Arbitration is an **out-of-court dispute resolution** mechanism where:

1. Parties agree to refer their dispute to a neutral third party (**arbitrator**)
2. The arbitrator hears both sides and issues a **binding award** (decision)
3. The award is **final and enforced** like a court judgment

**Key differences:**
| Aspect | Arbitration | Court |
|---|---|---|
| Speed | 3–12 months | 3–10 years |
| Cost | Lower | Higher |
| Confidentiality | Private | Public |
| Appeal | Limited | Full appeal rights |
| Formality | Flexible | Strict procedures |
| Expertise | Arbitrator chosen for expertise | Judge assigned |

**When used:**
- Commercial disputes (B2B contracts, service disputes, M&A)
- Investor disputes
- Insurance claims
- International transactions

**Arbitration clause:**
Insert in your contracts: *"Any dispute shall be resolved by arbitration under the Arbitration & Conciliation Act, 1996."*

**Enforcement:**
Awards can be enforced in court. If the losing party refuses to pay, the winning party can attach their assets.`,
        source: "Arbitration & Conciliation Act, 1996 — Sections 2, 34",
        confidence: 1.0,
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // GENERAL
  // ══════════════════════════════════════════════════════
  general: {
    label: "General Legal Principles",
    keywords: [
      "law", "legal", "statute", "act", "section", "rule",
      "judgment", "court", "advocate", "lawyer", "rights",
      "obligation", "liability", "limitation", "period", "limitation act",
    ],
    qa: [
      {
        id: "gen001",
        keywords: [
          "limitation period", "time to sue", "how long sue",
          "statute of limitations", "deadline", "when too late",
        ],
        question: "What is the limitation period for legal action?",
        answer: `**Limitation Period — Limitation Act, 1963**

The limitation period is the **maximum time within which you can file a legal claim**. After this period expires, the court cannot hear your case.

**Common periods:**
- **Contract disputes:** 3 years from breach
- **Cheque dishonour:** 3 years from dishonour
- **Intellectual property infringement:** 3 years from knowledge of infringement
- **Recovery of money:** 3 years from the date debt became payable
- **Tort (injury/damage):** 3 years from the act causing injury
- **Property disputes:** 12 years (for dispossession)
- **Defamation:** 1 year from date of publication

**Exceptions:**
- If the defendant is outside India: Limitation may be extended
- Concealed fraud: Period may be extended after discovery
- Minor: Period restarts after reaching age 18

**Recommendation:**
**Act promptly.** Don't wait — file your claim well before the limitation period expires. If unsure of your deadline, consult a lawyer immediately.`,
        source: "Limitation Act, 1963 — Sections 3, Schedule I",
        confidence: 1.0,
      },
    ],
  },
};
