"use client";
/**
 * components/MitraChat.tsx
 * ─────────────────────────────────────────────────────────
 * Mitra — AI Legal Information Assistant for Katti & Co.
 *
 * Features:
 *  - Professional SVG avatar (no cartoon, no glasses)
 *  - Lip-sync via SVG mouth morphing + Web Speech Synthesis
 *  - Mode toggle: Text-only | Voice+Text (input & output)
 *  - Voice input: SpeechRecognition API
 *  - Voice output: SpeechSynthesis with best-voice selection
 *  - Full TypeScript, no anys, no evals
 *  - WCAG 2.1 AA accessible
 *  - Zero external dependencies
 * ─────────────────────────────────────────────────────────
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { client, SITE_SETTINGS_QUERY } from "@/lib/sanity";

const FALLBACK_CONTACT = { email: "aprameya.katti@kattiandco.com", phone: "+91 78993 01767" };

// ── Strict types ──────────────────────────────────────────

type MessageRole = "user" | "assistant";
type ResponseType = "graph" | "gemini" | "refused" | "error" | "welcome";
type ChatMode = "text" | "voice";
type LipState = "closed" | "slight" | "open" | "wide";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: ResponseType;
  source?: string;
  topic?: string;
  timestamp: number;
}

interface BlogPost {
  title: string;
  category: string;
  excerpt: string;
  date: string;
  slug: string;
}

interface ApiResponse {
  type: string;
  text: string;
  source?: string;
  topic?: string;
  score?: number;
  llmCalled?: boolean;
}

// ── SpeechRecognition web API types (not in lib.dom yet) ─

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: ((event: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

// ── Constants ──────────────────────────────────────────────

const QUICK_QUESTIONS = [
  { label: "About Katti & Co.",    q: "Who is Katti & Co. and what do they do?" },
  { label: "File a patent",        q: "How do I file a patent in India?" },
  { label: "Register trademark",   q: "How do I register a trademark in India?" },
  { label: "Patent exclusions",    q: "What cannot be patented in India?" },
  { label: "GST notice reply",     q: "I received a GST Show Cause Notice. What should I do?" },
  { label: "Contact the firm",     q: "How do I contact Katti & Co.?" },
  { label: "Latest blog posts",    q: "What are the latest blog posts on the website?" },
  { label: "Income tax appeal",    q: "How do I appeal an income tax order in India?" },
] as const;

const WELCOME_CONTENT = `Welcome to **Katti & Co.**

I'm **Mitra** — your legal information assistant. I can help with:
- Indian patent, trademark & copyright law
- GST and income tax disputes
- Company incorporation & corporate law
- Questions about the firm and the website

I will always be honest. If I am unsure, I will say so rather than guess.

*How can I help you today?*`;

const mkId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// ── Mouth morph paths ─────────────────────────────────────
// Professionally designed mouth curves — subtle, not cartoonish

const MOUTH_PATHS: Record<LipState, string> = {
  closed: "M 110 196 Q 130 200 150 196",
  slight: "M 110 194 Q 130 202 150 194 L 149 197 Q 130 201 111 197 Z",
  open:   "M 110 192 Q 130 204 150 192 L 149 199 Q 130 203 111 199 Z",
  wide:   "M 110 190 Q 130 207 150 190 L 149 200 Q 130 205 111 200 Z",
};

// Lip-sync mouth state sequence (approximates natural speech rhythm)
const LIP_SEQUENCE: LipState[] = [
  "slight", "open", "slight", "closed",
  "open",   "wide",  "open",  "slight",
  "closed", "slight","open",  "closed",
];

// ── Markdown renderer (XSS-safe) ─────────────────────────

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(url: string): string {
  return /^(https?:|mailto:)/i.test(url) ? url : "#";
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g,  "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,      "<em>$1</em>")
    .replace(/`([^`]+)`/g,      "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_m, label, url) => `<a href="${safeHref(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`,
    );
}

function renderMarkdown(text: string): string {
  const lines = text.split("\n");
  let html = "";
  let inList = false;
  let inTable = false;
  let inDisclaimer = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";

    // Table rows
    if (/^\|/.test(line)) {
      if (!inTable) {
        if (inList) { html += "</ul>"; inList = false; }
        html += '<table class="mitra-md-table">';
        inTable = true;
      }
      if (/^\|[\s\-:]+\|/.test(line)) continue; // separator
      const nextLine = lines[i + 1] ?? "";
      const isHeader = /^\|[\s\-:]+\|/.test(nextLine);
      const cells = line.split("|").filter((c) => c.trim().length > 0);
      const tag = isHeader ? "th" : "td";
      html += `<tr>${cells.map((c) => `<${tag}>${renderInline(c.trim())}</${tag}>`).join("")}</tr>`;
      continue;
    }
    if (inTable) { html += "</table>"; inTable = false; }

    // Horizontal rule → disclaimer section
    if (/^---+$/.test(line.trim())) {
      if (inList) { html += "</ul>"; inList = false; }
      if (inDisclaimer) { html += "</div>"; }
      html += '<div class="mitra-md-disclaimer">';
      inDisclaimer = true;
      continue;
    }

    if (/^## /.test(line)) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h3 class="mitra-md-h2">${renderInline(line.slice(3).trim())}</h3>`;
      continue;
    }
    if (/^### /.test(line)) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h4 class="mitra-md-h3">${renderInline(line.slice(4).trim())}</h4>`;
      continue;
    }
    if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${renderInline(line.replace(/^[-*] |^\d+\. /, ""))}</li>`;
      continue;
    }
    if (inList) { html += "</ul>"; inList = false; }

    if (/^> /.test(line)) {
      html += `<blockquote>${renderInline(line.slice(2))}</blockquote>`;
      continue;
    }
    if (!line.trim()) continue;
    html += `<p>${renderInline(line)}</p>`;
  }

  if (inList) html += "</ul>";
  if (inTable) html += "</table>";
  if (inDisclaimer) html += "</div>";
  return html;
}

// ── Voice utilities ───────────────────────────────────────

const PREFERRED_VOICES = [
  "Google UK English Female",
  "Google US English",
  "Microsoft Zira",
  "Microsoft Aria",
  "Samantha",
  "Karen",
  "Moira",
  "Daniel",
  "Alex",
] as const;

function pickBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Try preferred voices in order
  for (const name of PREFERRED_VOICES) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }

  // Fallback: first English voice
  return voices.find((v) => v.lang.startsWith("en")) ?? null;
}

function getSpeechRecognitionClass(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ── Time helper ───────────────────────────────────────────

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m} ${d.getHours() >= 12 ? "PM" : "AM"}`;
}

// ── Bird Avatar SVG ───────────────────────────────────────
// Design: elegant bird illustration — brand gold colors

interface AvatarProps {
  lipState: LipState;
  isSpeaking: boolean;
  isListening: boolean;
}

const ProfessionalAvatar: React.FC<AvatarProps> = ({
  lipState,
  isSpeaking,
  isListening,
}) => (
  <svg
    viewBox="0 0 280 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ display: "block", width: "100%", maxWidth: 260 }}
  >
    {/* Ambient shadow */}
    <ellipse cx="140" cy="305" rx="55" ry="6" fill="rgba(201,166,64,0.08)" />

    {/* ── Body ──────────────────────────────────────────── */}
    <ellipse cx="140" cy="200" rx="58" ry="72" fill="#c9a640" />
    {/* Belly */}
    <ellipse cx="140" cy="215" rx="40" ry="52" fill="#e8c870" />
    {/* Body feather texture */}
    <path d="M 110 175 Q 125 170 140 175" stroke="#b8912e" strokeWidth="1" fill="none" opacity="0.3" />
    <path d="M 105 190 Q 125 184 145 190" stroke="#b8912e" strokeWidth="1" fill="none" opacity="0.25" />
    <path d="M 135 175 Q 150 170 165 175" stroke="#b8912e" strokeWidth="1" fill="none" opacity="0.3" />

    {/* ── Tail feathers ─────────────────────────────────── */}
    <path d="M 120 265 Q 100 290 85 310" stroke="#b8912e" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M 140 268 Q 130 295 125 315" stroke="#c9a640" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M 155 265 Q 160 290 170 310" stroke="#b8912e" strokeWidth="3" fill="none" strokeLinecap="round" />

    {/* ── Wings ─────────────────────────────────────────── */}
    {/* Left wing */}
    <path
      d="M 82 185 Q 55 170 40 195 Q 50 215 82 210 Z"
      fill="#b8912e"
    />
    <path d="M 60 190 Q 68 195 78 198" stroke="#a07828" strokeWidth="1" fill="none" opacity="0.4" />
    {/* Right wing */}
    <path
      d="M 198 185 Q 225 170 240 195 Q 230 215 198 210 Z"
      fill="#b8912e"
    />
    <path d="M 220 190 Q 212 195 202 198" stroke="#a07828" strokeWidth="1" fill="none" opacity="0.4" />

    {/* ── Head ──────────────────────────────────────────── */}
    <circle cx="140" cy="115" r="45" fill="#c9a640" />
    {/* Head highlight */}
    <circle cx="132" cy="105" r="20" fill="rgba(232,200,112,0.25)" />

    {/* ── Eyes ──────────────────────────────────────────── */}
    {/* Eye whites */}
    <ellipse cx="122" cy="110" rx="12" ry="13" fill="#f5f0ea" />
    <ellipse cx="158" cy="110" rx="12" ry="13" fill="#f5f0ea" />
    {/* Irises */}
    <circle cx="124" cy="111" r="8" fill="#1c1c1c" />
    <circle cx="156" cy="111" r="8" fill="#1c1c1c" />
    {/* Pupils */}
    <circle cx="125" cy="112" r="4.5" fill="#080403" />
    <circle cx="157" cy="112" r="4.5" fill="#080403" />
    {/* Eye shine */}
    <circle cx="128" cy="108" r="2.5" fill="rgba(255,255,255,0.9)" />
    <circle cx="160" cy="108" r="2.5" fill="rgba(255,255,255,0.9)" />
    <circle cx="122" cy="114" r="1.2" fill="rgba(255,255,255,0.3)" />
    <circle cx="154" cy="114" r="1.2" fill="rgba(255,255,255,0.3)" />

    {/* ── Beak (animated with lip state) ────────────────── */}
    {/* Upper beak */}
    <path
      d="M 130 122 L 140 138 L 150 122 Q 145 120 140 121 Q 135 120 130 122 Z"
      fill="#e07020"
    />
    {/* Lower beak — animated */}
    {lipState === "closed" ? (
      <path d="M 133 125 L 140 130 L 147 125" fill="none" stroke="#c05a18" strokeWidth="1.5" />
    ) : lipState === "slight" ? (
      <path d="M 133 126 L 140 134 L 147 126 Z" fill="#d06020" />
    ) : lipState === "open" ? (
      <path d="M 132 127 L 140 137 L 148 127 Z" fill="#d06020" />
    ) : (
      <path d="M 131 128 L 140 140 L 149 128 Z" fill="#d06020" />
    )}
    {/* Beak highlight */}
    <path d="M 135 123 L 140 130 L 145 123" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" fill="none" />

    {/* ── Small crest/tuft on head ──────────────────────── */}
    <path d="M 135 72 Q 138 55 145 50 Q 140 62 140 70 Z" fill="#b8912e" />
    <path d="M 140 74 Q 145 58 155 55 Q 148 65 145 72 Z" fill="#c9a640" />

    {/* ── Feet ──────────────────────────────────────────── */}
    {/* Left foot */}
    <path d="M 120 270 L 115 290 L 105 295 M 115 290 L 115 298 M 115 290 L 125 296"
      stroke="#e07020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Right foot */}
    <path d="M 160 270 L 165 290 L 175 295 M 165 290 L 165 298 M 165 290 L 155 296"
      stroke="#e07020" strokeWidth="2.5" fill="none" strokeLinecap="round" />

    {/* ── Status indicators ────────────────────────────── */}
    {isSpeaking && (
      <>
        <circle cx="140" cy="115" r="55" stroke="rgba(201,166,64,0.25)" strokeWidth="2" fill="none" />
        <circle cx="140" cy="115" r="62" stroke="rgba(201,166,64,0.12)" strokeWidth="1.5" fill="none" />
      </>
    )}
    {isListening && (
      <circle cx="140" cy="115" r="55" stroke="rgba(61,214,140,0.3)" strokeWidth="2" fill="none" />
    )}
  </svg>
);

// ── Mode toggle button ────────────────────────────────────

interface ModeToggleProps {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
  voiceAvailable: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({
  mode,
  onChange,
  voiceAvailable,
}) => (
  <div className="mitra-mode-toggle" role="radiogroup" aria-label="Input and output mode">
    <button
      className={`mitra-mode-btn${mode === "text" ? " active" : ""}`}
      onClick={() => onChange("text")}
      role="radio"
      aria-checked={mode === "text"}
      aria-label="Text only mode"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      Text
    </button>
    <button
      className={`mitra-mode-btn${mode === "voice" ? " active" : ""}${!voiceAvailable ? " disabled" : ""}`}
      onClick={() => voiceAvailable && onChange("voice")}
      role="radio"
      aria-checked={mode === "voice"}
      aria-label={voiceAvailable ? "Voice and text mode" : "Voice not available in this browser"}
      aria-disabled={!voiceAvailable}
      title={!voiceAvailable ? "Voice not supported in this browser" : undefined}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
      </svg>
      Voice
      {!voiceAvailable && <span className="mitra-mode-unavail" aria-hidden="true">✕</span>}
    </button>
  </div>
);

// ── Main component ────────────────────────────────────────

export default function MitraChat(): React.JSX.Element {
  const [isOpen, setIsOpen]             = useState(false);
  const [mode, setMode]                 = useState<ChatMode>("text");
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [input, setInput]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [lipState, setLipState]         = useState<LipState>("closed");
  const [transcript, setTranscript]     = useState("");
  const transcriptRef = useRef("");
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [livePosts, setLivePosts]       = useState<BlogPost[]>([]);
  const [contact, setContact]           = useState(FALLBACK_CONTACT);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const inputRef        = useRef<HTMLTextAreaElement>(null);
  const abortRef        = useRef<AbortController | null>(null);
  const lipTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const lipIndexRef     = useRef(0);
  const recognizerRef   = useRef<SpeechRecognitionInstance | null>(null);
  const utteranceRef    = useRef<SpeechSynthesisUtterance | null>(null);

  // ── Init welcome message ──────────────────────────────
  useEffect(() => {
    setMessages([
      {
        id:        mkId(),
        role:      "assistant",
        content:   WELCOME_CONTENT,
        type:      "welcome",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // ── Check voice API availability ──────────────────────
  useEffect(() => {
    const SRClass = getSpeechRecognitionClass();
    const hasSynth = typeof window !== "undefined" && "speechSynthesis" in window;
    setVoiceAvailable(!!SRClass && hasSynth);

    if (hasSynth) {
      // Voices may load asynchronously
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
        setVoicesLoaded(true);
      };
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoicesLoaded(true);
      } else {
        window.speechSynthesis.addEventListener("voiceschanged", loadVoices, { once: true });
        return () => {
          window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
        };
      }
    }
  }, []);

  // ── Fetch live blog posts ─────────────────────────────
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/mitra-content");
        if (!res.ok) return;
        const data = await res.json() as { posts?: BlogPost[] };
        if (Array.isArray(data.posts)) {
          setLivePosts(data.posts);
        }
      } catch {
        // Sanity not configured or offline — fail silently
      }
    })();
  }, []);

  // ── Fetch live firm contact info ──────────────────────
  useEffect(() => {
    client
      .fetch<{ email?: string; phone?: string } | null>(SITE_SETTINGS_QUERY)
      .then((data) => {
        if (data) {
          setContact({
            email: data.email || FALLBACK_CONTACT.email,
            phone: data.phone || FALLBACK_CONTACT.phone,
          });
        }
      })
      .catch(() => {
        // keep fallback contact info
      });
  }, []);

  // ── Auto-scroll to latest message ────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Focus input when panel opens ─────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // ── Lock page scroll while the panel is open ─────────
  // Without this, the fixed-position overlay doesn't stop the page
  // behind it from scrolling on mobile — touch gestures over the
  // chat panel can "leak" through and scroll the site instead.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // ── Keyboard: Escape closes panel ────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        stopSpeaking();
        stopListening();
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // ── Stop all voice on unmount / close ─────────────────
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Cleanup on unmount ────────────────────────────────
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Lip-sync engine ───────────────────────────────────

  const startLipSync = useCallback(() => {
    if (lipTimerRef.current !== null) return; // already running
    lipIndexRef.current = 0;
    lipTimerRef.current = setInterval(() => {
      const state = LIP_SEQUENCE[lipIndexRef.current % LIP_SEQUENCE.length];
      if (state !== undefined) setLipState(state);
      lipIndexRef.current++;
    }, 90); // ~11 mouth state changes/sec — natural speech rate
  }, []);

  const stopLipSync = useCallback(() => {
    if (lipTimerRef.current !== null) {
      clearInterval(lipTimerRef.current);
      lipTimerRef.current = null;
    }
    setLipState("closed");
  }, []);

  // ── Speech synthesis (TTS) ────────────────────────────

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
    stopLipSync();
  }, [stopLipSync]);

  const speak = useCallback(
    (text: string): void => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      // Strip markdown for TTS
      const plain = text
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/#{1,4} /g, "")
        .replace(/^[-*] /gm, "")
        .replace(/---+/g, "")
        .replace(/\|[^\n]+\|/g, "") // strip tables
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .trim()
        // Limit length to avoid very long TTS
        .slice(0, 800);

      if (!plain) return;

      stopSpeaking();

      const utt = new SpeechSynthesisUtterance(plain);
      utt.lang    = "en-IN";
      utt.rate    = 0.92;
      utt.pitch   = 1.05;
      utt.volume  = 1.0;

      // Pick best voice (load may be async)
      const voice = pickBestVoice();
      if (voice) utt.voice = voice;

      utt.onstart = () => {
        setIsSpeaking(true);
        startLipSync();
      };

      utt.onend = () => {
        setIsSpeaking(false);
        stopLipSync();
        utteranceRef.current = null;
      };

      utt.onerror = (e: SpeechSynthesisErrorEvent) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.warn("[Mitra TTS] error:", e.error);
        }
        setIsSpeaking(false);
        stopLipSync();
        utteranceRef.current = null;
      };

      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    },
    [stopSpeaking, startLipSync, stopLipSync, voicesLoaded], // voicesLoaded triggers re-bind
  );

  // ── Speech recognition (STT) ─────────────────────────

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop();
    recognizerRef.current = null;
    setIsListening(false);
    setTranscript("");
    transcriptRef.current = "";
  }, []);

  const startListening = useCallback((): void => {
    const SRClass = getSpeechRecognitionClass();
    if (!SRClass) return;

    stopSpeaking();

    const sr = new SRClass();
    sr.continuous      = false;
    sr.interimResults  = true;
    sr.lang            = "en-IN";

    sr.onstart = () => setIsListening(true);

    sr.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (!result) continue;
        const alt = result[0];
        if (!alt) continue;
        interim += alt.transcript;
      }
      transcriptRef.current = interim;
      setTranscript(interim);
    };

    sr.onend = () => {
      setIsListening(false);
      const final = transcriptRef.current || "";
      if (final.trim()) {
        setInput(final.trim());
        setTranscript("");
        transcriptRef.current = "";
        // Auto-send on voice input
        setTimeout(() => {
          void sendMessage(final.trim());
        }, 200);
      }
      recognizerRef.current = null;
    };

    sr.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== "aborted") {
        console.warn("[Mitra STT] error:", e.error);
      }
      setIsListening(false);
      setTranscript("");
      transcriptRef.current = "";
      recognizerRef.current = null;
    };

    recognizerRef.current = sr;
    try {
      sr.start();
    } catch (err) {
      console.warn("[Mitra STT] could not start:", err);
      setIsListening(false);
    }
  }, [stopSpeaking]);

  const toggleMic = useCallback((): void => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // ── Build conversation history ────────────────────────
  const conversationHistory = useMemo(
    () =>
      messages
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content })),
    [messages],
  );

  // ── Send message ──────────────────────────────────────
  const sendMessage = useCallback(
    async (textOverride?: string): Promise<void> => {
      const text = (textOverride ?? input).trim();
      if (!text || isLoading) return;

      setInput("");
      setTranscript("");
      if (inputRef.current) inputRef.current.style.height = "auto";

      stopSpeaking();

      const userMsg: ChatMessage = {
        id:        mkId(),
        role:      "user",
        content:   text,
        type:      "graph",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // Cancel previous request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/mitra", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            query:     text,
            history:   conversationHistory,
            livePosts: livePosts.slice(0, 20),
          }),
          signal: abortRef.current.signal,
        });

        const raw: unknown = await res.json();
        const data = raw as ApiResponse;

        const botMsg: ChatMessage = {
          id:        mkId(),
          role:      "assistant",
          content:   data.text ?? "I couldn't generate a response. Please try again.",
          type:      (data.type as ResponseType) ?? "error",
          source:    data.source,
          topic:     data.topic,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, botMsg]);

        // Auto-speak in voice mode
        if (mode === "voice" && data.text) {
          speak(data.text);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;

        const errMsg: ChatMessage = {
          id:        mkId(),
          role:      "assistant",
          content:   `I encountered a connection issue. Please try again or contact the firm:\n\n📧 **${contact.email}** | 📞 **${contact.phone}**`,
          type:      "error",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, conversationHistory, livePosts, mode, speak, stopSpeaking, contact],
  );

  // ── Textarea handlers ─────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 88)}px`;
  };

  // ── Response type → UI metadata ───────────────────────
  const getPill = (type: ResponseType) => {
    switch (type) {
      case "graph":   return { label: "Knowledge Base", cls: "mitra-pill-kb" };
      case "gemini":  return { label: "AI Verified",    cls: "mitra-pill-ai" };
      case "refused": return { label: "Out of Scope",   cls: "mitra-pill-warn" };
      case "welcome": return { label: "Ready",          cls: "mitra-pill-ready" };
      case "error":   return { label: "Error",          cls: "mitra-pill-warn" };
      default:        return { label: "Ready",          cls: "mitra-pill-ready" };
    }
  };

  // ── Render ────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Trigger ──────────────────────────── */}
      <button
        className="mitra-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open Mitra — Katti & Co. Legal Assistant"
        title="Chat with Mitra"
      >
        {/* Mini bird icon */}
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="30" aria-hidden="true">
          {/* Body */}
          <ellipse cx="20" cy="26" rx="9" ry="10" fill="#1a1400" />
          {/* Belly */}
          <ellipse cx="20" cy="28" rx="6" ry="7" fill="#2a1e00" />
          {/* Left wing */}
          <path d="M 11 24 Q 5 20 4 28 Q 8 30 11 28 Z" fill="#0d0a00" />
          {/* Right wing */}
          <path d="M 29 24 Q 35 20 36 28 Q 32 30 29 28 Z" fill="#0d0a00" />
          {/* Head */}
          <circle cx="20" cy="15" r="8" fill="#1a1400" />
          {/* Crest */}
          <path d="M 18 8 Q 20 3 23 2 Q 21 7 20 9 Z" fill="#0d0a00" />
          {/* Eye */}
          <circle cx="17" cy="13" r="2.5" fill="#f5f0ea" />
          <circle cx="17.5" cy="13.5" r="1.5" fill="#080403" />
          <circle cx="18.2" cy="12.8" r="0.7" fill="rgba(255,255,255,0.9)" />
          {/* Beak */}
          <path d="M 16 18 L 20 23 L 24 18 Q 22 17 20 17.5 Q 18 17 16 18 Z" fill="#e07020" />
        </svg>
        <span className="mitra-fab-dot" aria-hidden="true" />
      </button>

      {/* ── Chat Panel ────────────────────────────────── */}
      {isOpen && (
        <div
          className="mitra-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Mitra Legal Assistant"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              stopSpeaking();
              setIsOpen(false);
            }
          }}
        >
          <div className="mitra-window">

            {/* ── Left: Avatar Panel ───────────────────── */}
            <div className="mitra-avatar-panel" aria-hidden="true">
              {/* Subtle grid overlay */}
              <div className="mitra-grid-overlay" />

              {/* Firm label */}
              <div className="mitra-avatar-firm">
                <span className="mitra-avatar-firm-name">KATTI &amp; Co.</span>
                <span className="mitra-avatar-firm-role">Legal Assistant</span>
              </div>

              {/* Mode toggle */}
              <div className="mitra-mode-wrap">
                <ModeToggle
                  mode={mode}
                  onChange={(m) => {
                    setMode(m);
                    if (m === "text") {
                      stopSpeaking();
                      stopListening();
                    }
                  }}
                  voiceAvailable={voiceAvailable}
                />
              </div>

              {/* Status label */}
              <div className="mitra-avatar-status">
                {isSpeaking  && <span className="mitra-status-speaking">Speaking…</span>}
                {isListening && <span className="mitra-status-listening">Listening…</span>}
              </div>

              {/* Avatar SVG */}
              <div className="mitra-avatar-svg-wrap">
                <ProfessionalAvatar
                  lipState={lipState}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                />
              </div>

              {/* Name plate */}
              <div className="mitra-nameplate">
                <span className="mitra-nameplate-name">Mitra</span>
                <span className="mitra-nameplate-title">AI Legal Information Assistant</span>
              </div>
            </div>

            {/* ── Right: Chat Panel ─────────────────────── */}
            <div className="mitra-chat-panel">

              {/* Header */}
              <div className="mitra-chat-header">
                <div className="mitra-chat-header-info">
                  <span className="mitra-chat-header-name">Legal Information Assistant</span>
                  <span className="mitra-chat-header-sub">
                    <span className="mitra-online-dot" aria-hidden="true" />
                    Online · Katti &amp; Co.
                  </span>
                </div>
                <div className="mitra-header-right">
                  <span className="mitra-info-badge" title="General information only — not legal advice">
                    ⓘ Info only
                  </span>
                  <button
                    className="mitra-close-btn"
                    onClick={() => { stopSpeaking(); stopListening(); setIsOpen(false); }}
                    aria-label="Close assistant"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Quick questions */}
              <div className="mitra-quick-bar" aria-label="Quick questions">
                <div className="mitra-quick-label">Common questions</div>
                <div className="mitra-quick-list" role="list">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q.label}
                      className="mitra-qbtn"
                      onClick={() => void sendMessage(q.q)}
                      disabled={isLoading}
                      role="listitem"
                      aria-label={`Ask: ${q.q}`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div
                className="mitra-messages"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="Chat messages"
              >
                {messages.map((msg) => {
                  const pill = getPill(msg.type);
                  return (
                    <div
                      key={msg.id}
                      className={`mitra-msg${msg.role === "user" ? " mitra-msg-user" : " mitra-msg-bot"}`}
                    >
                      {/* Avatar initials */}
                      <div
                        className={`mitra-msg-av${msg.role === "user" ? " mitra-msg-av-user" : " mitra-msg-av-bot"}`}
                        aria-hidden="true"
                      >
                        {msg.role === "user" ? "You" : "M"}
                      </div>

                      {/* Bubble */}
                      <div className="mitra-bubble-wrap">
                        <div
                          className={`mitra-bubble${msg.role === "user" ? " mitra-bubble-user" : " mitra-bubble-bot"}`}
                          /* Safe: user input is escaped inside renderMarkdown / renderInline */
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                        />

                        {/* Meta row */}
                        <div className={`mitra-msg-meta${msg.role === "user" ? " mitra-msg-meta-user" : ""}`}>
                          {msg.role === "assistant" && (
                            <span className={`mitra-pill ${pill.cls}`}>{pill.label}</span>
                          )}
                          {msg.source && (
                            <span className="mitra-src-tag">
                              {msg.source.split("—")[0].trim().slice(0, 36)}
                            </span>
                          )}
                          {/* Speak button for bot messages in voice mode */}
                          {msg.role === "assistant" && mode === "voice" && (
                            <button
                              className="mitra-speak-btn"
                              onClick={() => isSpeaking ? stopSpeaking() : speak(msg.content)}
                              aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
                              title={isSpeaking ? "Stop" : "Read aloud"}
                            >
                              {isSpeaking ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                  <rect x="6" y="4" width="4" height="16" rx="1" />
                                  <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                              ) : (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                  <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                                </svg>
                              )}
                            </button>
                          )}
                          <span className="mitra-msg-time">{formatTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="mitra-msg mitra-msg-bot" role="status" aria-label="Mitra is thinking">
                    <div className="mitra-msg-av mitra-msg-av-bot" aria-hidden="true">M</div>
                    <div className="mitra-typing-bub">
                      <span /><span /><span />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="mitra-input-area">
                {/* Voice transcript preview */}
                {isListening && transcript && (
                  <div className="mitra-transcript" aria-live="polite">
                    <span className="mitra-transcript-dot" aria-hidden="true" />
                    {transcript}
                  </div>
                )}

                <div className="mitra-input-row">
                  <textarea
                    ref={inputRef}
                    className="mitra-input"
                    value={isListening ? transcript : input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      mode === "voice"
                        ? "Press the mic or type your question…"
                        : "Ask a legal question or ask about Katti & Co.…"
                    }
                    rows={1}
                    aria-label="Your message"
                    aria-describedby="mitra-input-hint"
                    disabled={isLoading || isListening}
                  />

                  {/* Mic button — voice mode only */}
                  {mode === "voice" && voiceAvailable && (
                    <button
                      className={`mitra-mic-btn${isListening ? " listening" : ""}`}
                      onClick={toggleMic}
                      aria-label={isListening ? "Stop listening" : "Start voice input"}
                      aria-pressed={isListening}
                      disabled={isLoading}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                      </svg>
                    </button>
                  )}

                  {/* Send button */}
                  <button
                    className="mitra-send-btn"
                    onClick={() => void sendMessage()}
                    disabled={(!input.trim() && !transcript.trim()) || isLoading || isListening}
                    aria-label="Send message"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>

                <p id="mitra-input-hint" className="mitra-input-note">
                  ⚠ General information only — not legal advice for your specific situation
                </p>
              </div>

            </div>{/* end mitra-chat-panel */}
          </div>{/* end mitra-window */}
        </div>
      )}
    </>
  );
}
