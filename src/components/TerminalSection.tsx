"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

QUICK_ACTIONS.forEach((a) => {
  if (!COMMAND_RESPONSES[a.command]) {
    COMMAND_RESPONSES[a.command] = [
      { type: "output", text: `Executing ${a.name}...` },
      { type: "output", text: `  Category: ${a.category}` },
      { type: "success", text: `✓ ${a.name} completed successfully.` },
    ];
  }
});

export default function TerminalSection() {
  // Boot animation: show N lines from TERMINAL_LINES using a single counter
  // No setInterval, no array copies per tick — just a number that increments
  const [bootIndex, setBootIndex] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [userLines, setUserLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Boot animation using chained setTimeout (not setInterval)
  // Each tick only increments a counter — the actual lines come from
  // slicing the static TERMINAL_LINES array, zero array copies
  useEffect(() => {
    if (bootDone) return;
    if (bootIndex >= TERMINAL_LINES.length) {
      setBootDone(true);
      return;
    }
    bootTimerRef.current = setTimeout(() => {
      setBootIndex((prev) => prev + 1);
    }, 200);
    return () => {
      if (bootTimerRef.current) clearTimeout(bootTimerRef.current);
    };
  }, [bootIndex, bootDone]);

  // Scroll to bottom when content changes
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [bootIndex, userLines]);

  // Derive visible lines from bootIndex + userLines (no state duplication)
  const visibleBootLines = TERMINAL_LINES.slice(0, bootIndex);
  const allLines = [...visibleBootLines, ...userLines];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    setHistory((prev) => [cmd, ...prev.slice(0, 19)]);
    setHistoryIdx(-1);
    setInput("");

    const inputLine: Line = { type: "input", text: cmd };

    if (cmd === "/clear") {
      setUserLines([{ type: "success", text: "Terminal cleared." }]);
      setBootIndex(0);
      setBootDone(true); // Don't replay boot
      return;
    }

    const response = COMMAND_RESPONSES[cmd];
    if (response) {
      // Single state update with all response lines
      setUserLines((prev) => [...prev, inputLine, ...response]);
    } else {
      setUserLines((prev) => [
        ...prev,
        inputLine,
        { type: "error", text: `Unknown command: ${cmd}` },
        { type: "output", text: 'Type "/help" for available commands.' },
      ]);
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
      if (historyIdx <= 0) { setHistoryIdx(-1); setInput(""); }
      else { setHistoryIdx(historyIdx - 1); setInput(history[historyIdx - 1]); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = Object.keys(COMMAND_RESPONSES).filter((c) => c.startsWith(input));
      if (matches.length === 1) setInput(matches[0]);
    }
  };

  return (
    <section id="terminal" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Live Terminal</h2>
          <p>Interactive command interface. Type /help to start.</p>
        </div>
        <div className="glass-card overflow-hidden max-w-5xl mx-auto">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-danger/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <span className="text-[10px] text-text-muted font-mono ml-3">friday@stark-tower ~ %</span>
            <span className="text-[10px] font-mono ml-auto" style={{ color: bootDone ? "#07CA6B" : "#E89558" }}>
              {bootDone ? "READY" : "BOOTING..."}
            </span>
          </div>
          {/* Body */}
          <div ref={scrollRef} className="p-5 font-mono text-xs space-y-1 min-h-[280px] max-h-[360px] overflow-y-auto">
            {allLines.map((line, i) => (
              <div key={i} className={clsx(
                line.type === "input" && "text-primary font-bold",
                line.type === "output" && "text-text-secondary",
                line.type === "success" && "text-success font-semibold",
                line.type === "error" && "text-danger font-semibold"
              )}>
                {line.type === "input" && <span className="text-text-muted mr-2">$</span>}
                {line.text}
              </div>
            ))}
            {!bootDone && (
              <div className="flex items-center gap-1">
                <span className="text-text-muted">$</span>
                <div className="w-2 h-4 bg-primary animate-pulse" />
              </div>
            )}
          </div>
          {/* Input — only shown after boot */}
          {bootDone && (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-5 py-3 border-t border-white/[0.05]">
              <span className="text-text-muted font-mono text-xs">$</span>
              <input
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
