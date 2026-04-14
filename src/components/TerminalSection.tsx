"use client";

import { useState, useRef, useEffect } from "react";
import { TERMINAL_LINES } from "@/data/friday-data";
import { executeCommand, TOP_COMMANDS, TOP_AGENTS, TOTAL_COMMANDS, TOTAL_AGENTS, TOTAL_SKILLS, SKILL_DOMAINS } from "@/data/jarvis-registry";
import clsx from "clsx";

type Line = { type: "input" | "output" | "success" | "error"; text: string };

// Static boot log
const BOOT_LOG: Line[] = [
  { type: "output", text: "F.R.I.D.A.Y. v2.0 initialized" },
  { type: "output", text: `Skills: ${TOTAL_SKILLS.toLocaleString()} | Agents: ${TOTAL_AGENTS} | Commands: ${TOTAL_COMMANDS}` },
  { type: "success", text: "✓ All systems nominal. Type /help for commands." },
];

function processCommand(cmd: string): Line[] {
  const c = cmd.trim();

  if (c === "/clear") return [];

  if (c === "/help") {
    return [
      { type: "output", text: "F.R.I.D.A.Y. Terminal — Available commands:" },
      { type: "output", text: "" },
      { type: "output", text: "  /help              Show this help" },
      { type: "output", text: "  /commands           List all 966 commands" },
      { type: "output", text: "  /agents            List all 996 agents" },
      { type: "output", text: "  /skills            List skill domains" },
      { type: "output", text: "  /status            System status" },
      { type: "output", text: "  /help <name>       Details on a command or agent" },
      { type: "output", text: "  /clear             Clear terminal" },
      { type: "output", text: "" },
      { type: "output", text: "  Top commands:" },
      ...TOP_COMMANDS.slice(0, 12).map((c) => ({ type: "output" as const, text: `    /${c}` })),
      { type: "output", text: `    ... and ${TOTAL_COMMANDS - 12} more` },
    ];
  }

  if (c === "/status") {
    return [
      { type: "output", text: "F.R.I.D.A.Y. System Status:" },
      { type: "success", text: `  ✓ Skills:    ${TOTAL_SKILLS.toLocaleString()} loaded` },
      { type: "success", text: `  ✓ Agents:    ${TOTAL_AGENTS} online` },
      { type: "success", text: `  ✓ Commands:  ${TOTAL_COMMANDS} available` },
      { type: "success", text: "  ✓ Latency:   38ms" },
      { type: "success", text: "  ✓ Uptime:    99.97%" },
      { type: "output", text: "  ⚠ Plugin Runtime: Degraded (156ms)" },
    ];
  }

  // Try the registry
  const result = executeCommand(c);
  if (result.length > 0) {
    return result.map((text) => ({
      type: text.startsWith("  ✓") ? "success" as const : "output" as const,
      text,
    }));
  }

  // Try matching any known command with /
  const stripped = c.replace("/", "").toLowerCase();
  if (TOP_COMMANDS.includes(stripped)) {
    return [
      { type: "output", text: `Executing /${stripped}...` },
      { type: "output", text: `  → Loading skill module` },
      { type: "output", text: `  → Spawning @${TOP_AGENTS[Math.floor(Math.random() * TOP_AGENTS.length)]}` },
      { type: "success", text: `  ✓ /${stripped} complete. Use in Claude Code or ask Friday.` },
    ];
  }

  // Try matching agent with @
  if (c.startsWith("@")) {
    const agent = c.slice(1).toLowerCase();
    if (TOP_AGENTS.includes(agent)) {
      return [
        { type: "output", text: `Launching @${agent}...` },
        { type: "output", text: `  → Agent specialization: ${agent.replace(/-/g, " ")}` },
        { type: "output", text: `  → Status: Active, ready for tasks` },
        { type: "success", text: `  ✓ @${agent} standing by. Describe your task.` },
      ];
    }
    return [{ type: "error", text: `Unknown agent: @${agent}. Try /agents to list all.` }];
  }

  // Unknown
  if (c.startsWith("/")) {
    return [
      { type: "error", text: `Unknown command: ${c}` },
      { type: "output", text: "  Type /help for available commands, /commands for full list." },
    ];
  }

  // Natural language — treat as a query to Friday
  return [
    { type: "output", text: "Processing natural language input..." },
    { type: "output", text: "  → For full AI responses, use the Chat or Voice tab." },
    { type: "output", text: "  → Terminal supports / commands and @agent calls." },
    { type: "output", text: '  → Try: /code-review, /deploy, @react-expert, /help' },
  ];
}

export default function TerminalSection() {
  const [bootIndex, setBootIndex] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [userLines, setUserLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Boot animation
  useEffect(() => {
    if (bootDone) return;
    if (bootIndex >= BOOT_LOG.length) { setBootDone(true); return; }
    bootTimerRef.current = setTimeout(() => setBootIndex((p) => p + 1), 200);
    return () => { if (bootTimerRef.current) clearTimeout(bootTimerRef.current); };
  }, [bootIndex, bootDone]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [bootIndex, userLines]);

  const allLines = [...BOOT_LOG.slice(0, bootIndex), ...userLines];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    setHistory((prev) => [cmd, ...prev.slice(0, 19)]);
    setHistoryIdx(-1);
    setInput("");

    if (cmd === "/clear") {
      setUserLines([{ type: "success", text: "Terminal cleared." }]);
      return;
    }

    const inputLine: Line = { type: "input", text: cmd };
    const response = processCommand(cmd);
    setUserLines((prev) => [...prev, inputLine, ...response]);
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
      // Tab completion across all commands and agents
      const allCompletions = [...TOP_COMMANDS.map((c) => "/" + c), ...TOP_AGENTS.map((a) => "@" + a), "/help", "/status", "/commands", "/agents", "/skills", "/clear"];
      const matches = allCompletions.filter((c) => c.startsWith(input));
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1 && matches.length <= 10) {
        setUserLines((prev) => [...prev, { type: "output", text: `Completions: ${matches.join(", ")}` }]);
      }
    }
  };

  return (
    <section id="terminal" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Live Terminal</h2>
          <p>{TOTAL_COMMANDS} commands · {TOTAL_AGENTS} agents · Tab to autocomplete</p>
        </div>
        <div className="glass-card overflow-hidden max-w-5xl mx-auto">
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
          {bootDone && (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-5 py-3 border-t border-white/[0.05]">
              <span className="text-text-muted font-mono text-xs">$</span>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="/command, @agent, or /help" className="bg-transparent text-xs text-primary font-mono font-bold placeholder:text-text-muted focus:outline-none w-full"
                autoComplete="off" spellCheck={false} />
              <kbd className="text-[9px] text-text-muted font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">TAB</kbd>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
