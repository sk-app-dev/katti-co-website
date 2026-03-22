"use client";
// components/ChatWidget.tsx
// Lex AI Chat — calls /api/chat (server route)
// Anthropic API key is NEVER sent to the browser

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };
type Mode = "text" | "voice" | "both";

const QUICK = [
  { label: "What is a patent?",           q: "What is a patent?" },
  { label: "Trademark?",                   q: "How do I protect my trademark?" },
  { label: "What do you do?",              q: "What does Katti and Co specialise in?" },
  { label: "FTO?",                         q: "What is FTO analysis?" },
  { label: "GST?",                         q: "What is GST litigation?" },
  { label: "Contact?",                     q: "How do I contact Katti and Co?" },
];

export default function ChatWidget() {
  const [open, setOpen]     = useState(false);
  const [mode, setMode]     = useState<Mode>("text");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [bubble, setBubble] = useState("Hello! I'm Lex — your legal assistant.");
  const msgsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 82) + "px";
  };

  const send = async (text?: string) => {
    const txt = (text || input).trim();
    if (!txt || loading) return;
    setInput("");
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }

    const newMessages: Message[] = [...messages, { role: "user", content: txt }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || "I'm sorry, I could not generate a response.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
      setBubble(reply.length > 88 ? reply.slice(0, 85) + "…" : reply);

      // TTS in voice/both mode
      if ((mode === "voice" || mode === "both") && window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(reply);
        utt.lang = "en-IN"; utt.rate = 0.88;
        window.speechSynthesis.speak(utt);
      }
    } catch (err: any) {
      const errMsg = err.message.includes("limit")
        ? "Chat limit reached. Please try again in an hour."
        : "Connection issue. Please try again.";
      setMessages([...newMessages, { role: "assistant", content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const time = () => {
    const d = new Date();
    const h = d.getHours() % 12 || 12;
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m} ${d.getHours() >= 12 ? "PM" : "AM"}`;
  };

  return (
    <>
      {/* Floating chat button */}
      <button className="chat-btn" onClick={() => setOpen(true)} title="Chat with Lex" aria-label="Open chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <div className="chat-dot" />
      </button>

      {/* Chat overlay */}
      {open && (
        <div
          style={{ display:"flex", position:"fixed", inset:0, zIndex:700, background:"rgba(0,0,0,.74)", backdropFilter:"blur(8px)", alignItems:"center", justifyContent:"center", padding:13 }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div style={{ width:"min(96vw,1080px)", height:"min(90vh,680px)", border:"1px solid rgba(201,166,64,.2)", boxShadow:"0 28px 90px rgba(0,0,0,.8)", borderRadius:5, overflow:"hidden", position:"relative", background:"var(--bg)", display:"grid", gridTemplateColumns:"1fr 420px" }}>
            {/* Close */}
            <button onClick={() => setOpen(false)} style={{ position:"absolute", top:11, right:13, zIndex:10, width:30, height:30, borderRadius:"50%", background:"rgba(7,8,13,.92)", border:"1px solid rgba(201,166,64,.22)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(232,228,216,.5)", fontSize:14, cursor:"pointer" }} aria-label="Close">×</button>

            {/* Left panel — character */}
            <div style={{ position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", background:"linear-gradient(155deg,#04050b,#09091a 55%,#07080e)" }}>
              {/* Firm name */}
              <div style={{ position:"absolute", top:20, inset:"auto 0", textAlign:"center", zIndex:2 }}>
                <div style={{ fontFamily:"var(--font-cinzel)", fontSize:".8rem", letterSpacing:".24em", color:"rgba(232,228,216,.48)" }}>KATTI &amp; Co.</div>
                <div style={{ fontSize:".48rem", letterSpacing:".3em", textTransform:"uppercase", color:"var(--gold)", opacity:.5, marginTop:3 }}>Legal Assistant</div>
              </div>
              {/* Mode switcher */}
              <div style={{ position:"absolute", top:68, left:"50%", transform:"translateX(-50%)", display:"flex", border:"1px solid var(--bdr)", borderRadius:3, overflow:"hidden", zIndex:5 }}>
                {(["text","voice","both"] as Mode[]).map((m) => (
                  <button key={m} onClick={() => setMode(m)} style={{ fontFamily:"var(--font-cinzel)", fontSize:".52rem", letterSpacing:".1em", padding:".4rem .76rem", border:"none", borderRight: m !== "both" ? "1px solid var(--bdr)" : "none", background: mode===m ? "rgba(201,166,64,.12)" : "transparent", color: mode===m ? "var(--gold)" : "var(--t3)", cursor:"pointer", whiteSpace:"nowrap" }}>
                    {m.charAt(0).toUpperCase()+m.slice(1)}
                  </button>
                ))}
              </div>
              {/* Speech bubble */}
              <div style={{ position:"absolute", top:10, right:6, zIndex:10, background:"var(--bg3)", border:"1px solid var(--bdr)", borderRadius:"13px 13px 13px 3px", padding:"9px 12px", maxWidth:212, minWidth:130 }}>
                <p style={{ fontFamily:"var(--font-jost)", fontSize:".67rem", lineHeight:1.56, color:"var(--text)", fontWeight:300, margin:0 }}>{bubble}</p>
              </div>
              {/* Name plate */}
              <div style={{ position:"absolute", bottom:216, inset:"auto 0", textAlign:"center", zIndex:3 }}>
                <div style={{ fontFamily:"var(--font-cinzel)", fontSize:".65rem", letterSpacing:".18em", color:"var(--gold)", opacity:.84 }}>Lex</div>
                <div style={{ fontSize:".52rem", letterSpacing:".09em", color:"var(--t3)", marginTop:2 }}>AI Legal Advisor · Katti &amp; Co.</div>
              </div>
              {/* Lex SVG character */}
              <div style={{ position:"relative", zIndex:2, flexShrink:0, width:260 }}>
                <svg width="260" height="390" viewBox="0 0 260 390" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation:"lxFloat 4.5s ease-in-out infinite", display:"block" }}>
                  <style>{`@keyframes lxFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes lxBreathe{0%,100%{transform:none}50%{transform:translateY(-2px)}}@keyframes lxBlink{0%,86%,100%{transform:scaleY(1)}92%{transform:scaleY(.06)}}.lxBody{animation:lxBreathe 4s ease-in-out infinite}.lxEL{transform-origin:110px 108px;animation:lxBlink 5.2s ease-in-out infinite}.lxER{transform-origin:150px 108px;animation:lxBlink 5.2s ease-in-out infinite .15s}`}</style>
                  <ellipse cx="130" cy="386" rx="60" ry="5.5" fill="rgba(201,166,64,0.08)"/>
                  <g className="lxBody">
                    <path d="M 97 288 L 93 375 L 116 375 L 122 314 L 138 314 L 144 375 L 167 375 L 163 288 Z" fill="#1c2135"/>
                    <path d="M 62 172 L 50 205 L 48 290 L 97 290 L 101 218 L 130 235 L 159 218 L 163 290 L 212 290 L 210 205 L 198 172 Q 170 189 130 193 Q 90 189 62 172 Z" fill="#1d2140"/>
                    <path d="M 123 190 L 130 228 L 137 190 L 133 171 L 127 171 Z" fill="#eae7e0"/>
                    <path d="M 127 178 L 123 197 L 130 243 L 137 197 L 133 178 L 130 182 Z" fill="#c9a640"/>
                    <path d="M 62 172 L 44 166 L 27 203 L 32 264 L 48 264 L 52 216 L 75 195 Z" fill="#1b1f3e"/>
                    <ellipse cx="35" cy="268" rx="12" ry="10" fill="#d4976e"/>
                    <path d="M 198 172 L 216 166 L 233 201 L 229 262 L 214 262 L 210 216 L 185 193 Z" fill="#171b38"/>
                    <ellipse cx="225" cy="267" rx="12" ry="10" fill="#d4976e"/>
                    <rect x="118" y="141" width="24" height="32" rx="7.5" fill="#d4976e"/>
                    <path d="M 78 106 Q 80 62 130 56 Q 180 62 182 106 Q 183 148 171 163 Q 158 176 130 178 Q 102 176 89 163 Q 77 148 78 106 Z" fill="#d4976e"/>
                    <path d="M 78 106 Q 80 60 130 54 Q 180 60 182 106 Q 172 74 130 70 Q 88 74 78 106 Z" fill="#190f06"/>
                    <ellipse cx="77" cy="116" rx="8.5" ry="13" fill="#c5875e"/>
                    <ellipse cx="183" cy="116" rx="8.5" ry="13" fill="#c5875e"/>
                    <path d="M 96 95 Q 110 89 126 94" stroke="#190f06" strokeWidth="3.8" fill="none" strokeLinecap="round"/>
                    <path d="M 134 94 Q 150 89 164 95" stroke="#190f06" strokeWidth="3.8" fill="none" strokeLinecap="round"/>
                    <ellipse cx="110" cy="108" rx="14" ry="12" fill="white" className="lxEL"/>
                    <ellipse cx="150" cy="108" rx="14" ry="12" fill="white" className="lxER"/>
                    <circle cx="110" cy="109" r="9.5" fill="#2d1e0d"/>
                    <circle cx="150" cy="109" r="9.5" fill="#2d1e0d"/>
                    <circle cx="111" cy="110" r="5.8" fill="#080403"/>
                    <circle cx="151" cy="110" r="5.8" fill="#080403"/>
                    <circle cx="115" cy="106" r="2.8" fill="rgba(255,255,255,0.94)"/>
                    <circle cx="155" cy="106" r="2.8" fill="rgba(255,255,255,0.94)"/>
                    <rect x="94" y="100" width="33" height="18" rx="8" fill="rgba(201,166,64,0.06)" stroke="#c9a640" strokeWidth="1.5"/>
                    <rect x="133" y="100" width="33" height="18" rx="8" fill="rgba(201,166,64,0.06)" stroke="#c9a640" strokeWidth="1.5"/>
                    <path id="lex-mouth" d="M 116 160 Q 130 167 144 160" fill="none" stroke="#8a3828" strokeWidth="2.5" strokeLinecap="round"/>
                  </g>
                </svg>
              </div>
            </div>

            {/* Right panel — chat */}
            <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--bg2)", borderLeft:"1px solid var(--bdr)" }}>
              {/* Header */}
              <div style={{ padding:"12px 16px 11px", borderBottom:"1px solid var(--bdr)", flexShrink:0, display:"flex", alignItems:"center", gap:9 }}>
                <div style={{ width:32, height:32, background:"var(--bg4)", border:"1px solid var(--bdr)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a640" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--font-cinzel)", fontSize:".73rem", letterSpacing:".1em", color:"var(--text)" }}>Lex — Legal Assistant</div>
                  <div style={{ fontSize:".56rem", color:"var(--gold)", opacity:.65, display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                    <span style={{ width:5, height:5, background:"var(--grn)", borderRadius:"50%", display:"inline-block" }}/>
                    Online · Katti &amp; Co.
                  </div>
                </div>
                <div style={{ fontSize:".5rem", color:"var(--t3)", textAlign:"right", maxWidth:86, lineHeight:1.4, flexShrink:0 }}>General info only</div>
              </div>

              {/* Quick questions */}
              <div style={{ padding:"8px 13px 7px", borderBottom:"1px solid var(--bdr2)", flexShrink:0 }}>
                <div style={{ fontSize:".51rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--t3)", marginBottom:6 }}>Quick questions</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {QUICK.map((q) => (
                    <button key={q.label} onClick={() => send(q.q)} style={{ background:"var(--bg3)", border:"1px solid var(--bdr)", color:"var(--t2)", fontFamily:"var(--font-jost)", fontSize:".64rem", padding:"3px 7px", borderRadius:3, cursor:"pointer" }}>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div ref={msgsRef} style={{ flex:1, overflowY:"auto", padding:13, display:"flex", flexDirection:"column", gap:9 }}>
                {/* Welcome */}
                <div style={{ display:"flex", gap:6, alignItems:"flex-end" }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:"var(--bg4)", border:"1px solid var(--bdr)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-cinzel)", fontSize:".5rem", color:"var(--gold)", flexShrink:0 }}>L</div>
                  <div style={{ maxWidth:"87%", padding:"7px 10px", background:"var(--bg3)", border:"1px solid var(--bdr2)", color:"var(--text)", borderRadius:"9px 9px 9px 3px", fontFamily:"var(--font-jost)", fontSize:".72rem", lineHeight:1.72, fontWeight:300 }}>
                    Welcome to <strong>Katti &amp; Co.</strong> 👋<br/><br/>
                    I&apos;m <strong>Lex</strong>, your AI legal assistant. Ask me about IP, Technology Law, Tax, Commercial, Corporate or White Collar matters!
                  </div>
                </div>

                {messages.map((m, i) => (
                  <div key={i} style={{ display:"flex", gap:6, alignItems:"flex-end", flexDirection: m.role==="user" ? "row-reverse" : "row" }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background: m.role==="user" ? "rgba(201,166,64,.09)" : "var(--bg4)", border:`1px solid ${m.role==="user" ? "rgba(201,166,64,.18)" : "var(--bdr)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-cinzel)", fontSize:".5rem", color:"var(--gold)", flexShrink:0 }}>
                      {m.role==="user" ? "U" : "L"}
                    </div>
                    <div style={{ maxWidth:"87%", padding:"7px 10px", background: m.role==="user" ? "rgba(201,166,64,.08)" : "var(--bg3)", border:`1px solid ${m.role==="user" ? "rgba(201,166,64,.12)" : "var(--bdr2)"}`, color:"var(--text)", borderRadius: m.role==="user" ? "9px 9px 3px 9px" : "9px 9px 9px 3px", fontFamily:"var(--font-jost)", fontSize:".72rem", lineHeight:1.72, fontWeight:300, whiteSpace:"pre-wrap" }}>
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display:"flex", gap:6, alignItems:"flex-end" }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:"var(--bg4)", border:"1px solid var(--bdr)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-cinzel)", fontSize:".5rem", color:"var(--gold)", flexShrink:0 }}>L</div>
                    <div style={{ padding:"8px 11px", background:"var(--bg3)", border:"1px solid var(--bdr2)", borderRadius:"9px 9px 9px 3px", display:"flex", gap:4 }}>
                      {[0,1,2].map(i => <span key={i} style={{ width:4, height:4, background:"var(--gold)", opacity:.36, borderRadius:"50%", display:"inline-block", animation:`dots 1.2s infinite ${i*.22}s` }}/>)}
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ padding:"10px 13px", borderTop:"1px solid var(--bdr)", flexShrink:0, background:"var(--bg2)" }}>
                <style>{`@keyframes dots{0%,60%,100%{opacity:.24;transform:none}30%{opacity:1;transform:translateY(-4px)}}`}</style>
                <div style={{ display:"flex", gap:5, alignItems:"flex-end" }}>
                  <div style={{ flex:1 }}>
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={handleInput}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your question…"
                      rows={1}
                      style={{ width:"100%", background:"var(--bg3)", border:"1px solid var(--bdr)", color:"var(--text)", fontFamily:"var(--font-jost)", fontSize:".74rem", fontWeight:300, padding:"7px 11px", resize:"none", outline:"none", minHeight:36, maxHeight:82, borderRadius:4, lineHeight:1.5 }}
                    />
                  </div>
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    style={{ width:36, height:36, borderRadius:4, border:"none", background: (!input.trim()||loading) ? "rgba(201,166,64,.35)" : "var(--gold)", color:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", cursor: (!input.trim()||loading) ? "default" : "pointer", flexShrink:0 }}
                    aria-label="Send"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
                <div style={{ fontSize:".5rem", color:"var(--t3)", marginTop:5, textAlign:"center" }}>
                  ⚠ General information only — not legal advice for your specific situation.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
