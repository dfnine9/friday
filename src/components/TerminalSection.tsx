"use client";

import { useState, useEffect, useRef } from "react";
import { TERMINAL_LINES, QUICK_ACTIONS } from "@/data/friday-data";
import clsx from "clsx";

type Line = { type: "input" | "output" | "success" | "error"; text: string };

const COMMAND_RESPONSES: Record<string, Line[]> = {
  "/help": [
    { type: "output", text: "Available commands:" },
    { type: "output", text: "  /help         — Show this help message" },
    { type: "output", text: "  /status       — Show system status" },
    { type: "output", text: "  /skills       — List skill domains" },
    { type: "output", text: "  /agents       — List active agents" },
    { type: "output", text: "  /clear        — Clear terminal" },
    ...QUICK_ACTIONS.slice(0, 5).map((a) => ({ type: "output" as const, text: `  ${a.command.padEnd(14)} — ${a.description}` })),
  ],
  "/status": [
    { type: "output", text: "F.R.I.D.A.Y. System Status:" },
    { type: "success", text: "  ✓ Neural Cores:    8/8 Active" },
    { type: "success", text: "  ✓ Skills Loaded:   6,502" },
    { type: "success", text: "  ✓ Agents Online:   942" },
    { type: "success", text: "  ✓ Avg Latency:     38ms" },
    { type: "success", text: "  ✓ Uptime:          99.97%" },
    { type: "output", text: "  ⚠ Plugin Runtime:  Degraded (156ms)" },
  ],
  "/skills": [
    { type: "output", text: "Skill Domains (12 categories, 6,502 total):" },
    { type: "output", text: "  Engineering  1,842  | Security     634" },
    { type: "output", text: "  DevOps         521  | AI/ML        487" },
    { type: "output", text: "  Frontend       445  | Backend      412" },
    { type: "output", text: "  Database       389  | Cloud        356" },
    { type: "output", text: "  Testing        298  | Writing      234" },
    { type: "output", text: "  Business       198  | Orchestration 186" },
  ],
  "/agents": [
    { type: "output", text: "Agent Fleet (942 total across 3 tiers):" },
    { type: "output", text: "  Core (7):          react-expert, typescript-pro, python-pro..." },
    { type: "output", text: "  Specialist (7):    rust-pro, golang-pro, flutter-expert..." },
    { type: "output", text: "  Orchestration (6): ruflo-coordinator, ruflo-swarm, ruflo-neural..." },
  ],
};

// Generate response for any QUICK_ACTION command
QUICK_ACTIONS.forEach((a) => {
  if (!COMMAND_RESPONSES[a.command]) {
    COMMAND_RESPONSES[a.command] = [
      { type: "output", text: `Executing ${a.name}...` },
      { type: "output", text: `  Category: ${a.category}` },
      { type: "output", text: `  Description: ${a.description}` },
      { type: "success", text: `✓ ${a.name} completed successfully.` },
    ];
  }
});

export default function TerminalSection() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [bootDone, setBootDone] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Boot animation on scroll into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !bootDone) {
          let i = 0;
          interval = setInterval(() => {
            if (i < TERMINAL_LINES.length) {
              setLines((prev) => [...prev, TERMINAL_LINES[i]]);
              i++;
            } else {
              if (interval) clearInterval(interval);
              interval = null;
              setBootDone(true);
            }
          }, 150);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [bootDone]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    setHistory((prev) => [cmd, ...prev]);
    setHistoryIdx(-1);
    setInput("");

    // Add input line
    setLines((prev) => [...prev, { type: "input", text: cmd }]);

    // Clear command
    if (cmd === "/clear") {
      setTimeout(() => setLines([{ type: "success", text: "Terminal cleared." }]), 100);
      return;
    }

    // Lookup response
    const response = COMMAND_RESPONSES[cmd];
    if (response) {
      response.forEach((line, i) => {
        setTimeout(() => setLines((prev) => [...prev, line]), (i + 1) * 200);
      });
    } else {
      setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { type: "error", text: `Unknown command: ${cmd}` },
          { type: "output", text: 'Type "/help" for available commands.' },
        ]);
      }, 200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" && history.length > 0) {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = historyIdx - 1;
      if (idx < 0) { setHistoryIdx(-1); setInput(""); }
      else { setHistoryIdx(idx); setInput(history[idx]); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = Object.keys(COMMAND_RESPONSES).filter((c) => c.startsWith(input));
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1) {
        setLines((prev) => [...prev, { type: "output", text: `Suggestions: ${matches.join(", ")}` }]);
      }
    }
  };

  return (
    <section id="terminal" className="section" ref={sectionRef}>
      <div className="section-inner">
        <div className="section-header">
          <h2>Live Terminal</h2>
          <p>Interactive command interface. Type commands, get real responses. Try /help to start.</p>
        </div>
        <div className="glass-card luminous-border shimmer-border overflow-hidden max-w-5xl mx-auto">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-danger/60 cursor-pointer hover:bg-danger/80 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-warning/60 cursor-pointer hover:bg-warning/80 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-success/60 cursor-pointer hover:bg-success/80 transition-colors" />
            </div>
            <span className="text-[10px] text-text-muted font-mono ml-3">friday@stark-tower ~ %</span>
            <span className="text-[10px] text-success/60 ml-auto font-mono">{bootDone ? "READY" : "BOOTING..."}</span>
          </div>
          {/* Terminal body */}
          <div ref={scrollRef} className="p-5 font-mono text-xs space-y-1.5 min-h-[320px] max-h-[400px] overflow-y-auto">
            {lines.map((line, i) => (
              <div key={i} className={clsx(
                "animate-fade-in",
                line.type === "input" && "text-primary font-bold",
                line.type === "output" && "text-text-secondary",
                line.type === "success" && "text-success font-semibold",
                line.type === "error" && "text-danger font-semibold"
              )}>
                {line.type === "input" && <span className="text-text-muted mr-2">$</span>}
                {line.text}
              </div>
            ))}
          </div>
          {/* Input */}
          {bootDone && (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-5 py-3 border-t border-white/[0.05]">
              <span className="text-text-muted font-mono text-xs">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command... (/help for list)"
                className="bg-transparent text-xs text-primary font-mono font-bold placeholder:text-text-muted focus:outline-none w-full"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="text-[9px] text-text-muted font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">TAB</kbd>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
