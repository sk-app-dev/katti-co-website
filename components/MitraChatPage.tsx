"use client";
import React, { useState, useRef, useEffect } from "react";

type MessageRole = "user" | "assistant";
type ResponseType = "graph" | "gemini" | "refused" | "error" | "welcome";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: ResponseType;
  timestamp: number;
}

interface BlogPost {
  title: string;
  category: string;
  excerpt: string;
  date: string;
  slug: string;
}

const QUICK_QUESTIONS = [
  { label: "About the firm", q: "Who is Katti & Co.?" },
  { label: "File a patent", q: "How do I file a patent in India?" },
  { label: "Trademark", q: "How do I register a trademark?" },
  { label: "GST help", q: "What is GST?" },
  { label: "Contact the firm", q: "How do I contact Katti & Co.?" },
] as const;

const WELCOME_MSG = `Welcome to **Katti & Co.**

I'm **Mitra** — your legal information assistant. I can help with:
- Indian patent, trademark & copyright law
- GST and income tax information
- Company law and contracts
- Questions about the firm

How can I help today?`;

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

function renderMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => `<a href="${safeHref(url)}" target="_blank" rel="noreferrer">${label}</a>`);
}

export default function MitraChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [livePosts, setLivePosts] = useState<BlogPost[]>([]);
  const msgsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/mitra-content");
        if (!res.ok) return;
        const data = (await res.json()) as { posts?: BlogPost[] };
        if (Array.isArray(data.posts)) setLivePosts(data.posts);
      } catch {
        // Sanity not configured or offline — fail silently
      }
    })();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const send = async (query?: string) => {
    const text = (query || input).trim();
    if (!text || loading) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      type: "graph",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/mitra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          livePosts: livePosts.slice(0, 20),
        }),
      });

      const data = (await res.json()) as {
        type?: string;
        text?: string;
      };

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: data.text || "I could not generate a response.",
        type: (data.type as ResponseType) || "error",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: "Connection error. Please try again.",
        type: "error",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="mitrapage">
      <div className="mitrapage-inner">
        <div className="mitrapage-grid">
          <aside className="mitrapage-aside">
            <div className="mitrapage-brand">
              <div className="mitrapage-brand-mark">M</div>
              <div>
                <p className="mitrapage-brand-label">Mitra</p>
                <h1 className="mitrapage-brand-title">Legal AI Assistant</h1>
              </div>
            </div>

            <div className="mitrapage-intro">
              <p>Ask questions about Indian law, patents, trademarks, GST, contracts, or firm services.</p>
              <p className="mitrapage-intro-note">Your conversation is informational only and does not constitute legal advice.</p>
            </div>

            <div>
              <h2 className="mitrapage-quick-label">Try these</h2>
              <div className="mitrapage-quick-list">
                {QUICK_QUESTIONS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => send(item.q)}
                    disabled={loading}
                    className="mitrapage-quick-btn"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mitrapage-how">
              <p>How Mitra works</p>
              <ul>
                <li>Searches firm knowledge and relevant legal topics.</li>
                <li>Uses Gemini for natural language answers.</li>
                <li>Keeps context while you ask follow-up questions.</li>
              </ul>
            </div>
          </aside>

          <main className="mitrapage-main">
            <div className="mitrapage-chat-header">
              <div>
                <p className="mitrapage-chat-header-label">Chat session</p>
                <h2 className="mitrapage-chat-header-title">Ask Mitra anything</h2>
              </div>
              <div className="mitrapage-live-badge">Live</div>
            </div>

            <div ref={msgsRef} className="mitrapage-msgs">
              {messages.length === 0 ? (
                <div className="mitrapage-welcome">
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(WELCOME_MSG) }} />
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`mitrapage-row ${m.role}`}>
                    <div className={`mitrapage-bubble ${m.role}`}>
                      <div className="mitrapage-bubble-role">
                        {m.role === "user" ? "You" : "Mitra"}
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="mitrapage-thinking">
                  <div className="mitrapage-thinking-avatar" />
                  <div className="mitrapage-thinking-bubble">Thinking...</div>
                </div>
              )}
            </div>

            <div className="mitrapage-inputbar">
              <div className="mitrapage-inputrow">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a legal question…"
                  rows={1}
                  disabled={loading}
                  className="mitrapage-textarea"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="mitrapage-send-btn"
                >
                  Send
                </button>
              </div>
              <p className="mitrapage-hint">Pro tip: press Enter to send, Shift+Enter for a newline.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
