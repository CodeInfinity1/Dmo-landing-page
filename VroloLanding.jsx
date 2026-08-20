import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSquare,
  Github,
  KanbanSquare,
  FileText,
  Mail,
  BookOpen,
  Users,
  Brain,
  Bot,
  ArrowRight,
  Check,
  ArrowUpRight,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Design tokens                                                          */
/* ---------------------------------------------------------------------- */

const COLOR = {
  bg: "#0A0B0D",
  bgAlt: "#0D0E11",
  surface: "#131519",
  surface2: "#1A1D22",
  border: "#212429",
  borderSoft: "#1B1E23",
  text: "#EDEDEA",
  textDim: "#9A9CA2",
  textFaint: "#5B5D63",
  accent: "#E8A33D",
  accentDim: "#8A6427",
  accentSoft: "rgba(232,163,61,0.10)",
  accentLine: "rgba(232,163,61,0.4)",
  lineIdle: "#2A2D33",
};

const FONT_DISPLAY = "'Space Grotesk', 'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_BODY = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";

/* ---------------------------------------------------------------------- */
/* Reveal-on-scroll wrapper                                               */
/* ---------------------------------------------------------------------- */

function Reveal({ children, delay = 0, className = "", as: Tag = "div", style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------------- */
/* Small building blocks                                                  */
/* ---------------------------------------------------------------------- */

function Eyebrow({ children }) {
  return (
    <div
      className="inline-flex items-center gap-2 mb-4"
      style={{ fontFamily: FONT_MONO, fontSize: "12px", letterSpacing: "0.14em", color: COLOR.accent }}
    >
      <span style={{ width: 14, height: 1, background: COLOR.accent, display: "inline-block" }} />
      {children.toUpperCase()}
    </div>
  );
}

function SectionShell({ id, children, alt = false, className = "" }) {
  return (
    <section
      id={id}
      className={`relative w-full px-6 md:px-10 ${className}`}
      style={{ background: alt ? COLOR.bgAlt : COLOR.bg, borderTop: `1px solid ${COLOR.borderSoft}` }}
    >
      <div className="max-w-6xl mx-auto py-20 md:py-28">{children}</div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Hero graph — signature visual                                          */
/* ---------------------------------------------------------------------- */

const SOURCE_NODES = [
  { label: "Slack", Icon: MessageSquare },
  { label: "GitHub", Icon: Github },
  { label: "Jira", Icon: KanbanSquare },
  { label: "Docs", Icon: FileText },
  { label: "Email", Icon: Mail },
  { label: "Wikis", Icon: BookOpen },
  { label: "People", Icon: Users },
];

function HeroGraph() {
  const W = 640;
  const H = 480;
  const center = { x: 300, y: 240 };
  const agent = { x: 566, y: 240 };
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 260);
    return () => clearTimeout(t);
  }, []);

  const sources = useMemo(() => {
    const startDeg = 100;
    const endDeg = 262;
    const radius = 208;
    return SOURCE_NODES.map((node, i) => {
      const deg = startDeg + ((endDeg - startDeg) * i) / (SOURCE_NODES.length - 1);
      const rad = (deg * Math.PI) / 180;
      const x = center.x - radius * Math.cos(rad);
      const y = center.y - radius * Math.sin(rad) * 0.86;
      const len = Math.hypot(x - center.x, y - center.y);
      return { ...node, x, y, len };
    });
  }, []);

  const agentLen = Math.hypot(agent.x - center.x, agent.y - center.y);

  return (
    <div className="relative w-full" style={{ maxWidth: W, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label="Diagram of fragmented company sources converging into a central company memory node and flowing out to AI agents">
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLOR.accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor={COLOR.accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* source -> center lines */}
        {sources.map((s, i) => (
          <line
            key={s.label}
            x1={s.x}
            y1={s.y}
            x2={center.x}
            y2={center.y}
            stroke={COLOR.lineIdle}
            strokeWidth="1"
            strokeDasharray={s.len}
            strokeDashoffset={drawn ? 0 : s.len}
            style={{
              transition: `stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1) ${140 + i * 90}ms, stroke 0.6s ease ${140 + i * 90}ms`,
              stroke: drawn ? "#3A3E45" : COLOR.lineIdle,
            }}
          />
        ))}

        {/* center -> agent line, thicker, accented */}
        <line
          x1={center.x}
          y1={center.y}
          x2={agent.x}
          y2={agent.y}
          stroke={COLOR.accent}
          strokeWidth="1.5"
          strokeDasharray={agentLen}
          strokeDashoffset={drawn ? 0 : agentLen}
          style={{ transition: `stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1) 900ms` }}
        />
        {drawn && (
          <circle r="2.5" fill={COLOR.accent} opacity="0.9">
            <animateMotion
              dur="2.4s"
              repeatCount="indefinite"
              path={`M${center.x},${center.y} L${agent.x},${agent.y}`}
              begin="1.3s"
            />
          </circle>
        )}

        {/* center glow */}
        <circle cx={center.x} cy={center.y} r="70" fill="url(#centerGlow)" />
      </svg>

      {/* HTML nodes positioned over the SVG */}
      <div className="absolute inset-0">
        {sources.map((s, i) => (
          <div
            key={s.label}
            className="absolute flex flex-col items-center"
            style={{
              left: `${(s.x / W) * 100}%`,
              top: `${(s.y / H) * 100}%`,
              transform: "translate(-50%,-50%)",
              opacity: drawn ? 1 : 0,
              transition: `opacity 0.5s ease ${260 + i * 90}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${260 + i * 90}ms`,
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 40,
                height: 40,
                background: COLOR.surface,
                border: `1px solid ${COLOR.border}`,
                color: COLOR.textDim,
              }}
            >
              <s.Icon size={16} strokeWidth={1.6} />
            </div>
            <span
              className="mt-1.5"
              style={{ fontFamily: FONT_MONO, fontSize: "10px", color: COLOR.textFaint, letterSpacing: "0.03em" }}
            >
              {s.label}
            </span>
          </div>
        ))}

        {/* center node */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${(center.x / W) * 100}%`, top: `${(center.y / H) * 100}%`, transform: "translate(-50%,-50%)" }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 76,
              height: 76,
              background: COLOR.surface2,
              border: `1px solid ${COLOR.accentLine}`,
              boxShadow: drawn ? `0 0 0 1px rgba(232,163,61,0.08), 0 0 28px rgba(232,163,61,0.18)` : "none",
              transition: "box-shadow 1s ease 700ms",
              color: COLOR.accent,
            }}
          >
            <Brain size={26} strokeWidth={1.5} />
          </div>
          <span className="mt-2 text-center" style={{ fontFamily: FONT_MONO, fontSize: "11px", color: COLOR.text }}>
            Company memory
          </span>
        </div>

        {/* agent node */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: `${(agent.x / W) * 100}%`,
            top: `${(agent.y / H) * 100}%`,
            transform: "translate(-50%,-50%)",
            opacity: drawn ? 1 : 0,
            transition: "opacity 0.6s ease 1050ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) 1050ms",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 56, height: 56, background: COLOR.surface, border: `1px solid ${COLOR.border}`, color: COLOR.text }}
          >
            <Bot size={22} strokeWidth={1.6} />
          </div>
          <span className="mt-1.5 text-center" style={{ fontFamily: FONT_MONO, fontSize: "10px", color: COLOR.textDim }}>
            AI agents
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Waitlist form                                                          */
/* ---------------------------------------------------------------------- */

function WaitlistForm({ compact = false }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | error | success
  const [entries, setEntries] = useState([]);

  const submit = (e) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setStatus("error");
      return;
    }
    setEntries((prev) => [...prev, email.trim()]);
    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div
        className="flex items-center gap-2.5 px-4 py-3 rounded-lg w-full"
        style={{ background: COLOR.accentSoft, border: `1px solid ${COLOR.accentLine}`, maxWidth: compact ? 380 : 440 }}
      >
        <Check size={16} color={COLOR.accent} />
        <span style={{ fontFamily: FONT_BODY, fontSize: "14px", color: COLOR.text }}>
          You&apos;re on the list. We&apos;ll email you when Vrolo is ready.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full" style={{ maxWidth: compact ? 380 : 440 }}>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="you@company.com"
          className="w-full outline-none px-4 py-3 rounded-lg"
          style={{
            background: COLOR.surface,
            border: `1px solid ${status === "error" ? "#8A3B2E" : COLOR.border}`,
            color: COLOR.text,
            fontFamily: FONT_BODY,
            fontSize: "14px",
          }}
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg whitespace-nowrap shrink-0"
          style={{
            background: COLOR.accent,
            color: "#1B1305",
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: "14px",
            transition: "filter 0.2s ease, transform 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          Join the waitlist
          <ArrowRight size={15} />
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2" style={{ fontFamily: FONT_BODY, fontSize: "12.5px", color: "#D97D6B" }}>
          Enter a valid email address.
        </p>
      )}
    </form>
  );
}

/* ---------------------------------------------------------------------- */
/* Page                                                                    */
/* ---------------------------------------------------------------------- */

export default function VroloLanding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToWaitlist = (e) => {
    e.preventDefault();
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const consequences = [
    "AI agents lack organizational context and improvise instead of knowing.",
    "Employees answer the same questions on repeat, in a dozen different threads.",
    "Critical decisions get made in a conversation, then disappear into it.",
    "Institutional knowledge walks out the door when people leave.",
    "Agents can't reliably execute workflows that are specific to how your company works.",
  ];

  const agentCapabilities = [
    { label: "Context", desc: "What's normal here, and what isn't." },
    { label: "Organizational memory", desc: "What was decided, and why." },
    { label: "Decisions", desc: "The call that was made, not just the debate." },
    { label: "Relationships", desc: "Who owns what, and who to ask." },
    { label: "Operational knowledge", desc: "How things actually get done." },
    { label: "Evidence", desc: "The source behind every claim." },
    { label: "Current state", desc: "What's true right now, not last quarter." },
  ];

  return (
    <div style={{ background: COLOR.bg, color: COLOR.text, fontFamily: FONT_BODY, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(232,163,61,0.28); color: #fff; }
        input::placeholder { color: ${COLOR.textFaint}; }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* NAV */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10"
        style={{
          background: scrolled ? "rgba(10,11,13,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: `1px solid ${scrolled ? COLOR.borderSoft : "transparent"}`,
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between" style={{ height: 64 }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-md"
              style={{ width: 26, height: 26, background: COLOR.accent, color: "#1B1305" }}
            >
              <Brain size={15} strokeWidth={2} />
            </div>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "16px", letterSpacing: "-0.01em" }}>
              Vrolo
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ border: `1px solid ${COLOR.border}`, fontFamily: FONT_MONO, fontSize: "11px", color: COLOR.textDim }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 999, background: COLOR.accent, animation: "pulseGlow 2s ease-in-out infinite" }} />
              Coming soon
            </span>
            <a
              href="#waitlist"
              onClick={scrollToWaitlist}
              className="px-3.5 py-1.5 rounded-md"
              style={{ background: COLOR.surface2, border: `1px solid ${COLOR.border}`, fontSize: "13px", fontWeight: 500 }}
            >
              Join waitlist
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-6 md:px-10 pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal>
              <Eyebrow>The company brain</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h1
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.08,
                  fontSize: "clamp(2.1rem, 4.4vw, 3.4rem)",
                }}
              >
                Turn fragmented company knowledge into intelligence your AI agents can use.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6" style={{ fontSize: "17px", lineHeight: 1.65, color: COLOR.textDim, maxWidth: 480 }}>
                Your company's real knowledge lives across Slack threads, tickets, docs, and inboxes —
                and mostly in people's heads. Vrolo continuously turns that fragmented knowledge into
                structured, contextual company memory that AI agents can actually understand and use.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9">
                <WaitlistForm />
                <p className="mt-3" style={{ fontFamily: FONT_MONO, fontSize: "11.5px", color: COLOR.textFaint, letterSpacing: "0.02em" }}>
                  Currently in early build. No spam, one email when we launch.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <HeroGraph />
          </Reveal>
        </div>
      </section>

      {/* PROBLEM */}
      <SectionShell id="problem">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div>
              <Eyebrow>The problem</Eyebrow>
              <h2
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "clamp(1.7rem, 3vw, 2.3rem)", letterSpacing: "-0.015em", lineHeight: 1.18 }}
              >
                Your company knows more than your AI can access.
              </h2>
              <p className="mt-5" style={{ fontSize: "15.5px", lineHeight: 1.7, color: COLOR.textDim, maxWidth: 460 }}>
                Every company runs on knowledge that never made it into a database: a decision buried
                in a Slack thread, a workaround one engineer knows, a policy explained over email once
                and never again. AI agents can't see any of it — so they guess.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SOURCE_NODES.map((s, i) => (
                <div
                  key={s.label}
                  className="flex flex-col items-start gap-3 px-4 py-4 rounded-xl"
                  style={{
                    background: COLOR.surface,
                    border: `1px solid ${COLOR.border}`,
                    transform: i % 2 === 0 ? "translateY(-4px)" : "translateY(4px)",
                  }}
                >
                  <s.Icon size={18} strokeWidth={1.6} color={COLOR.textDim} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: "12.5px", color: COLOR.text }}>{s.label}</span>
                </div>
              ))}
              <div
                className="flex flex-col items-start gap-3 px-4 py-4 rounded-xl"
                style={{ background: "transparent", border: `1px dashed ${COLOR.border}`, transform: "translateY(-4px)" }}
              >
                <Users size={18} strokeWidth={1.6} color={COLOR.textFaint} />
                <span style={{ fontFamily: FONT_MONO, fontSize: "12.5px", color: COLOR.textFaint }}>...and people</span>
              </div>
            </div>
          </Reveal>
        </div>
      </SectionShell>

      {/* CONCEPT */}
      <SectionShell id="concept" alt>
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "clamp(1.7rem, 3vw, 2.3rem)", letterSpacing: "-0.015em", lineHeight: 1.18, maxWidth: 640 }}
          >
            One continuous layer that turns operational knowledge into structured company memory.
          </h2>
        </Reveal>

        <Reveal delay={140}>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6">
            {[
              {
                step: "Sources",
                title: "Everywhere knowledge already lives",
                desc: "Slack, email, tickets, docs, GitHub, wikis — read continuously, not in a one-off import.",
              },
              {
                step: "Company memory",
                title: "Structured, contextual, current",
                desc: "Fragments get connected, deduplicated, and organized into memory that reflects how your company actually works.",
              },
              {
                step: "AI agents",
                title: "Context an agent can act on",
                desc: "Agents query company memory directly, so answers and actions are grounded in what's actually true.",
              },
            ].map((col, i) => (
              <React.Fragment key={col.step}>
                <div className="py-8 md:py-2">
                  <span style={{ fontFamily: FONT_MONO, fontSize: "12px", color: COLOR.accent, letterSpacing: "0.06em" }}>
                    {col.step}
                  </span>
                  <h3 className="mt-3" style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "18px" }}>
                    {col.title}
                  </h3>
                  <p className="mt-2.5" style={{ fontSize: "14.5px", lineHeight: 1.65, color: COLOR.textDim }}>
                    {col.desc}
                  </p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex items-start justify-center pt-2">
                    <ArrowRight size={16} color={COLOR.textFaint} style={{ marginTop: 8 }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Reveal>
      </SectionShell>

      {/* WHY IT MATTERS */}
      <SectionShell id="why">
        <div className="grid md:grid-cols-[0.9fr,1.1fr] gap-14">
          <Reveal>
            <div>
              <Eyebrow>Why it matters</Eyebrow>
              <h2
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "clamp(1.7rem, 3vw, 2.3rem)", letterSpacing: "-0.015em", lineHeight: 1.18 }}
              >
                Fragmented knowledge has a cost. It's just paid quietly.
              </h2>
            </div>
          </Reveal>
          <div>
            {consequences.map((c, i) => (
              <Reveal key={c} delay={i * 70}>
                <div
                  className="flex items-start gap-4 py-5"
                  style={{ borderTop: i === 0 ? "none" : `1px solid ${COLOR.borderSoft}` }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: COLOR.accent, marginTop: 8, flexShrink: 0 }} />
                  <p style={{ fontSize: "15.5px", lineHeight: 1.65, color: COLOR.text }}>{c}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* BUILT FOR AI AGENTS */}
      <SectionShell id="agents" alt>
        <Reveal>
          <Eyebrow>Built for AI agents</Eyebrow>
          <h2
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "clamp(1.8rem, 3.4vw, 2.5rem)", letterSpacing: "-0.015em", lineHeight: 1.16, maxWidth: 680 }}
          >
            Not another chatbot over your documents.
          </h2>
          <p className="mt-5" style={{ fontSize: "16px", lineHeight: 1.7, color: COLOR.textDim, maxWidth: 560 }}>
            Vrolo is built to give agents what a new hire spends months absorbing: not just what's
            written down, but what's actually true, who owns it, and what happened last time. The goal
            is an agent that operates with the context of someone who has actually worked at the company.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agentCapabilities.map((cap, i) => (
            <Reveal key={cap.label} delay={i * 60}>
              <div
                className="h-full px-5 py-5 rounded-xl"
                style={{ background: COLOR.surface, border: `1px solid ${COLOR.border}` }}
              >
                <span style={{ fontFamily: FONT_MONO, fontSize: "11px", color: COLOR.accent, letterSpacing: "0.05em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3" style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "15.5px" }}>
                  {cap.label}
                </h3>
                <p className="mt-2" style={{ fontSize: "13.5px", lineHeight: 1.55, color: COLOR.textDim }}>
                  {cap.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* EARLY BUILD */}
      <SectionShell id="status">
        <Reveal>
          <div
            className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 px-7 py-8 rounded-2xl"
            style={{ background: COLOR.surface, border: `1px solid ${COLOR.border}` }}
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 44, height: 44, background: COLOR.accentSoft, border: `1px solid ${COLOR.accentLine}`, color: COLOR.accent }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 999, background: COLOR.accent, animation: "pulseGlow 2s ease-in-out infinite" }} />
            </div>
            <div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "17px" }}>Vrolo is currently being built.</h3>
              <p className="mt-2" style={{ fontSize: "14.5px", lineHeight: 1.65, color: COLOR.textDim, maxWidth: 640 }}>
                We're an early-stage, founder-led team building the first version now. An early
                prototype is already in development and being tested against real open-source
                organizational data, not synthetic demos. We're not live yet — the waitlist is how
                we'll reach out first.
              </p>
            </div>
          </div>
        </Reveal>
      </SectionShell>

      {/* WAITLIST */}
      <SectionShell id="waitlist" alt>
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <Eyebrow>Get early access</Eyebrow>
            <h2
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)", letterSpacing: "-0.015em", lineHeight: 1.15, maxWidth: 620 }}
            >
              Get notified when Vrolo is ready.
            </h2>
            <p className="mt-4 mb-9" style={{ fontSize: "15.5px", color: COLOR.textDim, maxWidth: 440 }}>
              One email, when there's something real to try. No newsletter, no spam.
            </p>
            <div className="w-full flex justify-center">
              <WaitlistForm compact />
            </div>
          </div>
        </Reveal>
      </SectionShell>

      {/* FOOTER */}
      <footer className="px-6 md:px-10 py-14" style={{ borderTop: `1px solid ${COLOR.borderSoft}` }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-md"
                style={{ width: 22, height: 22, background: COLOR.accent, color: "#1B1305" }}
              >
                <Brain size={12} strokeWidth={2} />
              </div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "15px" }}>Vrolo</span>
            </div>
            <p className="mt-3" style={{ fontSize: "13.5px", color: COLOR.textDim, maxWidth: 340 }}>
              Building the memory layer for AI-native companies.
            </p>
            <span
              className="inline-flex items-center gap-1.5 mt-4 px-2.5 py-1 rounded-full"
              style={{ border: `1px solid ${COLOR.border}`, fontFamily: FONT_MONO, fontSize: "11px", color: COLOR.textDim }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 999, background: COLOR.accent }} />
              Coming soon
            </span>
          </div>

          <div className="flex gap-8">
            {[
              { label: "X", href: "#" },
              { label: "LinkedIn", href: "#" },
              { label: "GitHub", href: "#" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1"
                style={{ fontSize: "13.5px", color: COLOR.textDim }}
              >
                {link.label}
                <ArrowUpRight size={13} />
              </a>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6" style={{ borderTop: `1px solid ${COLOR.borderSoft}` }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: "11.5px", color: COLOR.textFaint }}>
            © {new Date().getFullYear()} Vrolo. Pre-launch.
          </p>
        </div>
      </footer>
    </div>
  );
}
