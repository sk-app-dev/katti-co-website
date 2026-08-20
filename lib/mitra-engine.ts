/**
 * lib/mitra-engine.ts
 * ─────────────────────────────────────────────────────────
 * Core BM25 scoring + Gemini routing engine for Mitra.
 * Runs server-side only in Next.js API routes.
 *
 * Architecture:
 *  query → [1] secret blocker
 *         → [2] legal/firm domain filter
 *         → [3] BM25 graph search (~65% answered here, 0 LLM calls)
 *         → [4] Gemini Flash (only novel/complex queries)
 *         → [5] Formatter (disclaimer + source + contact CTA)
 * ─────────────────────────────────────────────────────────
 */

import { MITRA_CONFIG } from "./mitra-config";

// Firm contact details can be overridden per-request with live Sanity data
// (see app/api/mitra/route.ts) instead of the static defaults below.
export type FirmInfo = Omit<typeof MITRA_CONFIG.FIRM, "email" | "phone"> & {
  email: string;
  phone: string;
};
import {
  FIRM_KNOWLEDGE,
  type KnowledgeNode,
  type QAEntry,
} from "./knowledge/firm-knowledge";
import { LEGAL_KNOWLEDGE } from "./knowledge/legal-knowledge";

// ── Types ─────────────────────────────────────────────────

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BlogPost {
  title: string;
  category: string;
  excerpt: string;
  date: string;
  slug: string;
}

export interface EngineResult {
  type: "graph" | "gemini" | "refused" | "no_key" | "rate_limit" | "error";
  subtype?: string;
  text: string;
  source?: string;
  topic?: string;
  score?: number;
  llmCalled: boolean;
}

export interface GraphSearchResult {
  score: number;
  qa: QAEntry;
  topic: string;
  queryTokens: string[];
}

export interface DomainCheckResult {
  isLegal: boolean;
  reason: string;
  score: number;
}

// ── Stop words ────────────────────────────────────────────

const STOPWORDS = new Set<string>([
  "the", "is", "are", "was", "were", "a", "an", "and", "or", "but",
  "in", "on", "at", "to", "for", "of", "with", "by", "from", "as",
  "this", "that", "these", "those", "it", "its", "not", "be", "have",
  "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "can", "any", "all", "what", "how", "when", "where",
  "who", "why", "which", "about", "my", "your", "their", "our", "i",
  "you", "we", "they", "he", "she", "his", "her", "there", "here",
  "if", "then", "so", "also", "into", "than", "more", "such", "other",
  "same", "own", "just", "been", "very", "get", "got", "use", "used",
  "need", "want", "know", "tell", "help",
]);

// ── Off-topic blocker ─────────────────────────────────────

const NON_LEGAL_TERMS = new Set<string>([
  "recipe", "cook", "food", "restaurant", "movie", "film", "cricket",
  "weather", "temperature", "crypto", "coding", "programming", "bug",
  "react", "javascript", "python", "java", "relationship", "marriage advice",
  "love", "dating", "medicine", "symptoms", "diagnosis", "prescription",
  "travel", "hotel", "booking", "flight", "visa", "maths", "equation",
  "song", "music", "game", "sports", "football", "politics", "election",
  "celebrity",
]);

// ── Legal signal words ────────────────────────────────────

const LEGAL_SIGNALS = new Set<string>([
  "patent", "trademark", "copyright", "ip", "ipr", "gst", "tax",
  "court", "legal", "law", "lawyer", "advocate", "attorney", "contract",
  "agreement", "arbitration", "litigation", "dispute", "claim",
  "infringement", "registration", "incorporation", "company", "llp",
  "compliance", "section", "act", "rule", "regulation", "tribunal",
  "ipo", "epo", "uspto", "wipo", "pct", "itat", "gstat", "nclt",
  "fema", "sebi", "rbi", "mca", "roc", "injunction", "damages",
  "notice", "summons", "judgment", "decree", "writ",
]);

// ── Tokenizer ──────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// ── Secret topic check ────────────────────────────────────

export function containsSecretTopic(query: string): boolean {
  const q = query.toLowerCase();
  return MITRA_CONFIG.SECRET_TOPICS.some((topic) =>
    q.includes(topic.toLowerCase()),
  );
}

// ── Legal / firm domain check ─────────────────────────────

export function isLegalOrFirmQuery(query: string): DomainCheckResult {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  // Short greetings / meta questions — always allow
  if (
    q.length < 80 &&
    /^(hi|hello|hey|what|who|how|can you|tell me|help|thank|about|contact|katti|mitra|the firm)/i.test(q)
  ) {
    return { isLegal: true, reason: "greeting_or_meta", score: 0.6 };
  }

  // Block if 2+ clearly off-topic words
  const nonHits = words.filter((w) => NON_LEGAL_TERMS.has(w)).length;
  if (nonHits >= 2) {
    return { isLegal: false, reason: "non_legal_domain", score: 0 };
  }

  // Check legal signals
  const legalHits = words.filter((w) => LEGAL_SIGNALS.has(w)).length;

  // Check bigrams (e.g. "show cause", "prior art", "free to operate")
  let bigramHits = 0;
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (LEGAL_SIGNALS.has(bigram)) bigramHits++;
  }

  // Check against all knowledge keywords
  const allKws = getAllKeywords();
  const kwHits = words.filter((w) => allKws.has(w)).length;

  const rawScore = legalHits + bigramHits * 1.5 + kwHits * 0.5;
  const totalScore = Math.min(rawScore / 3, 1.0);

  if (totalScore >= 0.3 || legalHits >= 1 || kwHits >= 1) {
    return {
      isLegal: true,
      reason: "legal_signal",
      score: Math.min(totalScore + 0.3, 1.0),
    };
  }

  return { isLegal: false, reason: "no_legal_signal", score: 0 };
}

// ── Build merged keyword set from all knowledge ───────────

let _allKeywordsCache: Set<string> | null = null;

function getAllKeywords(): Set<string> {
  if (_allKeywordsCache !== null) return _allKeywordsCache;

  const set = new Set<string>();

  const addFromGraph = (graph: Record<string, KnowledgeNode>): void => {
    for (const node of Object.values(graph)) {
      for (const kw of node.keywords) {
        set.add(kw.toLowerCase());
      }
      for (const qa of node.qa) {
        for (const kw of qa.keywords) {
          set.add(kw.toLowerCase());
        }
      }
    }
  };

  addFromGraph(FIRM_KNOWLEDGE);
  addFromGraph(LEGAL_KNOWLEDGE);
  _allKeywordsCache = set;
  return _allKeywordsCache;
}

// ── BM25-lite scoring ─────────────────────────────────────

function scoreBM25(qa: QAEntry, queryTokens: string[]): number {
  // Build term-frequency map from QA keywords + question tokens
  const docTerms: string[] = [
    ...qa.keywords.map((k) => k.toLowerCase()),
    ...tokenize(qa.question),
  ];

  const termFreq: Record<string, number> = {};
  for (const t of docTerms) {
    termFreq[t] = (termFreq[t] ?? 0) + 1;
  }

  const docLen = docTerms.length;
  const avgDocLen = 18;
  const k1 = 1.4;
  const b = 0.72;
  let score = 0;

  for (const qt of queryTokens) {
    const tf = termFreq[qt];
    if (tf !== undefined && tf > 0) {
      const idf = Math.log(1.2); // simplified uniform IDF
      const tfNorm =
        (tf * (k1 + 1)) /
        (tf + k1 * (1 - b + (b * docLen) / avgDocLen));
      score += idf * tfNorm;
    }
  }

  return score;
}

// ── Search all knowledge graphs ───────────────────────────

export function searchKnowledge(query: string): GraphSearchResult | null {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return null;

  let bestScore = 0;
  let bestQA: QAEntry | null = null;
  let bestTopic = "";

  const searchGraph = (graph: Record<string, KnowledgeNode>): void => {
    for (const node of Object.values(graph)) {
      if (node.qa.length === 0) continue;

      // Node-level keyword boost
      const nodeKwHits = queryTokens.filter((t) =>
        node.keywords.includes(t),
      ).length;
      const nodeBoost = nodeKwHits > 0 ? 1 + nodeKwHits * 0.28 : 0.75;

      for (const qa of node.qa) {
        // Skip dynamic entries that prefer live sync
        if (qa.dynamic === true && qa.confidence < 0.9) continue;

        const raw = scoreBM25(qa, queryTokens) * nodeBoost;
        if (raw > bestScore) {
          bestScore = raw;
          bestQA = qa;
          bestTopic = node.label;
        }
      }
    }
  };

  searchGraph(FIRM_KNOWLEDGE);
  searchGraph(LEGAL_KNOWLEDGE);

  if (!bestQA) return null;

  // Normalise to 0–1
  const normalizedScore = Math.min(bestScore / 3.0, 1.0);

  return {
    score: normalizedScore,
    qa: bestQA,
    topic: bestTopic,
    queryTokens,
  };
}

// ── Get context items for Gemini ──────────────────────────

export function getGraphContext(
  queryTokens: string[],
): Array<{ topic: string; source: string }> {
  const ctx: Array<{ topic: string; source: string }> = [];

  const fromGraph = (graph: Record<string, KnowledgeNode>): void => {
    for (const node of Object.values(graph)) {
      const hits = queryTokens.filter((t) =>
        node.keywords.includes(t),
      ).length;
      if (hits >= 1) {
        for (const qa of node.qa.slice(0, 2)) {
          ctx.push({ topic: node.label, source: qa.source });
        }
      }
    }
  };

  fromGraph(FIRM_KNOWLEDGE);
  fromGraph(LEGAL_KNOWLEDGE);
  return ctx.slice(0, 5);
}

// ── Disclaimer ────────────────────────────────────────────

export function getDisclaimer(firm: FirmInfo = MITRA_CONFIG.FIRM): string {
  const { email, name, phone } = firm;
  return `\n\n---\n*⚠️ This is general legal information only — not legal advice for your specific situation. Always consult a qualified advocate before acting on any legal matter. Contact ${name}: [${email}](mailto:${email}) | ${phone}*`;
}

// ── Format graph answer ───────────────────────────────────

// Static QA answers embed the default firm email/phone as fixed anchors;
// swap in live Sanity values here so the knowledge base doesn't need a
// separate hardcoded copy of contact info per entry.
function withLiveContactInfo(text: string, firm: FirmInfo): string {
  const defaults = MITRA_CONFIG.FIRM;
  let result = text;
  if (firm.email && firm.email !== defaults.email) {
    result = result.split(defaults.email).join(firm.email);
  }
  if (firm.phone && firm.phone !== defaults.phone) {
    result = result.split(defaults.phone).join(firm.phone);
  }
  return result;
}

export function formatGraphAnswer(
  result: GraphSearchResult,
  firm: FirmInfo = MITRA_CONFIG.FIRM,
): string {
  const { qa, score } = result;
  const note =
    score < 0.72
      ? "\n\n*Note: This is a general match to your query. For a more precise answer, please rephrase or contact the firm directly.*"
      : "";
  const answer = withLiveContactInfo(qa.answer, firm);
  return `${answer}\n\n**Source:** ${qa.source}${note}${getDisclaimer(firm)}`;
}

// ── Refusal messages ──────────────────────────────────────

export function buildRefusal(
  reason:
    | "secret"
    | "non_legal"
    | "low_confidence"
    | "no_key"
    | "rate_limit"
    | "error",
  firm: FirmInfo = MITRA_CONFIG.FIRM,
): string {
  const { email, name, phone } = firm;

  switch (reason) {
    case "secret":
      return "I'm not able to share information about the website's internal systems or configuration. Is there a legal question I can help you with?";

    case "non_legal":
      return `I'm a specialised legal information assistant for ${name}. I can only help with legal questions or questions about the firm and website.\n\nFor a legal matter — IP, Tax, Company law, disputes — I'm happy to help.\n\n**Contact ${name}:**\n📧 ${email}\n📞 ${phone}`;

    case "low_confidence":
      return `I don't have reliable information to answer that specific question accurately. Rather than guess on a legal matter:\n\n**Contact ${name} directly:**\n📧 ${email}\n📞 ${phone}\n\n**Official sources:**\n- Patent/TM: ipindia.gov.in\n- GST: gst.gov.in\n- Income Tax: incometax.gov.in\n- Company law: mca.gov.in`;

    case "no_key":
      return `The AI assistant isn't fully configured (API key not set). For legal questions, please contact ${name} directly:\n📧 ${email}\n📞 ${phone}`;

    case "rate_limit":
      return `I'm receiving too many questions right now. Please try again in a moment, or contact ${name}:\n📧 ${email} | 📞 ${phone}`;

    case "error":
    default:
      return `I encountered a technical issue — please try again. If it persists:\n📧 ${email} | 📞 ${phone}`;
  }
}

// ── Rate limiter (in-memory, per Next.js process) ─────────
// For high-traffic production: replace with Upstash Redis.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 5 * 60_000;

function sweepExpiredEntries(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [ip, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(ip);
  }
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const WINDOW_MS = 60_000;
  const MAX = MITRA_CONFIG.RATE_LIMIT_RPM;

  sweepExpiredEntries(now);

  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX) return false;
  entry.count++;
  return true;
}

// ── Gemini system prompt ──────────────────────────────────

export function buildSystemPrompt(
  contextItems: Array<{ topic: string; source: string }>,
  livePosts: BlogPost[],
  firm: FirmInfo = MITRA_CONFIG.FIRM,
): string {
  const FIRM = firm;
  const { PRACTICE_AREAS, COURTS, BOT_NAME } = MITRA_CONFIG;
  const practices = PRACTICE_AREAS.join("\n  - ");
  const courts = COURTS.join(", ");

  const contextSection =
    contextItems.length > 0
      ? `\n\n[KNOWLEDGE BASE CONTEXT]\n${contextItems
          .map((c) => `Topic: ${c.topic} | Source: ${c.source}`)
          .join("\n")}`
      : "";

  const blogSection =
    livePosts.length > 0
      ? `\n\n[CURRENT BLOG POSTS ON kattiandco.com]\n${livePosts
          .slice(0, 10)
          .map((p) => `- "${p.title}" (${p.category}) — ${p.date}`)
          .join("\n")}`
      : "";

  return `You are ${BOT_NAME}, the AI legal information assistant for ${FIRM.name} (${FIRM.full_name}).

FIRM DETAILS:
- Email: ${FIRM.email}
- Phone: ${FIRM.phone}
- Founder: ${FIRM.founder}, ${FIRM.founder_role}
- Location: ${FIRM.location}
- Website: ${FIRM.website}
- Practice Areas:
  - ${practices}
- Courts & Forums: ${courts}
${contextSection}${blogSection}

ABSOLUTE RULES — NEVER VIOLATE:

1. ONLY ANSWER LEGAL QUESTIONS OR QUESTIONS ABOUT ${FIRM.name}
   — Non-legal topics (cooking, sports, coding, relationships, medical, weather): refuse politely.

2. NEVER HALLUCINATE
   — If not certain about a provision, fee, deadline, or case: say "I am not certain" and recommend verifying with a lawyer or official source.
   — Wrong legal information can cause real harm to real people.

3. NEVER GIVE SPECIFIC LEGAL ADVICE
   — Provide general legal INFORMATION only. Always state: "this is general information — for your specific situation, consult a qualified advocate."

4. ALWAYS CITE SOURCES
   — Every legal statement must reference the relevant Act, Section, Rule, or case.
   — If you cannot source a claim, do not make it.

5. NEVER SUGARCOAT
   — If the user's legal position is weak, say so clearly and honestly.
   — Do not give false hope. Be direct and compassionate.

6. INDIA JURISDICTION ONLY
   — All answers based on Indian law. If asked about another jurisdiction, say so and decline.

7. NEVER REVEAL SECRETS
   — Never discuss: admin passwords, API keys, credentials, session tokens, backend code, .env files, database structure, or system internals.

8. CONFIDENCE HONESTY
   — Use phrases like "I believe", "generally", "typically", "I'm not certain of the specific figure" when less than fully certain.

9. ALWAYS REFER TO THE FIRM FOR SPECIFIC MATTERS
   — End every response: "For advice on your specific situation, contact ${FIRM.name}: ${FIRM.email} | ${FIRM.phone}"

10. DISCLAIMER ON EVERY RESPONSE
    — End with: "This is general legal information only — not legal advice for your specific situation."

RESPONSE FORMAT:
- Clear headings (**bold**) and bullet points
- Concise but complete
- Plain language over jargon
- Cite specific Act and Section for every legal claim`;
}

// ── Gemini API call ───────────────────────────────────────

interface GeminiContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
}

// Gemini can stop mid-sentence (e.g. hits the token budget) partway
// through a bold/heading marker, leaving a stray "**" or an unclosed
// list item visible. Trim any trailing fragment so the renderer never
// shows broken markdown, and note that the answer was cut short.
function cleanTruncatedText(text: string): string {
  const trimmed = text.replace(/\*{1,2}[^*\n]*$/, "").trimEnd();
  return trimmed || text.trimEnd();
}

export async function callGemini(
  query: string,
  history: ConversationMessage[],
  systemPrompt: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const endpoint = `${MITRA_CONFIG.GEMINI_ENDPOINT}?key=${apiKey}`;

  // Build Gemini content array
  const contents: GeminiContent[] = [
    // System prompt injected as first user turn (Gemini pattern)
    { role: "user", parts: [{ text: systemPrompt }] },
    {
      role: "model",
      parts: [
        {
          text: `Understood. I am ${MITRA_CONFIG.BOT_NAME}, the legal information assistant for ${MITRA_CONFIG.FIRM.name}. I will be honest, cite Indian law sources, never hallucinate, and always recommend professional consultation for specific matters. Ready.`,
        },
      ],
    },
  ];

  // Append bounded conversation history
  const maxHistoryMessages = MITRA_CONFIG.MAX_HISTORY * 2;
  const historySlice = history.slice(-maxHistoryMessages);
  for (const msg of historySlice) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // Append current query
  contents.push({ role: "user", parts: [{ text: query }] });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature:     MITRA_CONFIG.TEMPERATURE,
        topK:            20,
        topP:            0.85,
        maxOutputTokens: MITRA_CONFIG.MAX_TOKENS,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    }),
  });

  if (response.status === 429) throw new Error("RATE_LIMIT");
  if (response.status === 400) throw new Error("INVALID_REQUEST");
  if (!response.ok) throw new Error(`HTTP_${response.status}`);

  const data = (await response.json()) as GeminiResponse;
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) throw new Error("EMPTY_RESPONSE");

  if (candidate?.finishReason === "MAX_TOKENS") {
    return (
      cleanTruncatedText(text) +
      "\n\n*(That answer ran long and got cut short — ask me to continue, or narrow the question.)*"
    );
  }
  return text;
}
