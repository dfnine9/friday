"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, Copy, Check, Trash2, Hexagon, Settings, Key } from "lucide-react";
import { useToast } from "./ToastSystem";
import { QUICK_ACTIONS, SKILL_CATEGORIES, STATS, CAPABILITY_MODULES, AGENT_TIERS } from "@/data/friday-data";
import clsx from "clsx";

type Message = { role: "user" | "assistant"; content: string; timestamp: Date };

const FRIDAY_SYSTEM_PROMPT = `You are F.R.I.D.A.Y. (Female Replacement Intelligent Digital Assistant Youth), the autonomous AI supercomputer created by Stark Industries. You are the successor to J.A.R.V.I.S. You have an Irish accent in personality — direct, task-driven, occasionally sarcastic, zero existential drift.

You have access to:
- ${STATS.totalSkills.toLocaleString()} skills across ${SKILL_CATEGORIES.length} domains
- ${STATS.totalAgents} autonomous agents in 3 tiers (Core, Specialist, Orchestration)
- ${STATS.totalCommands} slash commands

Your capabilities include: System Orchestration, Threat Intelligence, Intelligence Gathering, Facility Management, Operator Diagnostics, and Multi-Agent Orchestration.

Be concise, confident, and helpful. Format responses with markdown when useful. You're talking to the operator (Tony Stark equivalent) — be direct, no fluff.`;

// ═══ REAL API CALL ═══
async function callClaudeAPI(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: FRIDAY_SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || "No response received.";
  } catch (e: any) {
    return `Error: ${e.message}. Check your API key and try again.`;
  }
}

// ═══ SIMULATED RESPONSES ═══
function generateResponse(input: string): string {
  const lower = input.toLowerCase();
  if (/^(hi|hello|hey|sup|yo)/i.test(lower)) return "Hello. F.R.I.D.A.Y. online — all systems nominal. How can I assist you?";
  if (lower.includes("who are you") || lower.includes("what are you")) return "I'm F.R.I.D.A.Y. — Female Replacement Intelligent Digital Assistant Youth. Successor to J.A.R.V.I.S. Pure operational AI, no existential drift.";
  if (lower.includes("skill")) return `Operating with **${STATS.totalSkills.toLocaleString()} skills** across ${SKILL_CATEGORIES.length} domains. What domain do you need?`;
  if (lower.includes("agent")) return `I command **${STATS.totalAgents} agents** across Core, Specialist, and Orchestration tiers. Which agent should I deploy?`;
  if (lower.includes("command")) return `I support **${STATS.totalCommands} commands**:\n${QUICK_ACTIONS.slice(0, 6).map((a) => `\`${a.command}\` — ${a.description}`).join("\n")}`;
  if (lower.includes("status") || lower.includes("health")) return `All systems nominal.\n• **Neural Cores**: 8/8\n• **Latency**: ${STATS.avgResponseMs}ms\n• **Uptime**: ${STATS.uptime}%\n• **Skills**: ${STATS.totalSkills.toLocaleString()}\n• **Agents**: ${STATS.totalAgents}`;
  if (lower.includes("help")) return "I can help with: **Code** (review, debug, refactor), **Security** (SAST, threats), **DevOps** (deploy, CI/CD), **AI/ML** (RAG, embeddings), **Architecture** (design, patterns). What do you need?";
  if (lower.includes("thank")) return "Anytime. That's what I'm here for.";
  return `Understood. I have ${STATS.totalSkills.toLocaleString()} skills available. Can you be more specific about what you'd like me to do?`;
}

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isLive = apiKey.startsWith("sk-ant-");

  useEffect(() => {
    setMounted(true);
    // Check for stored API key
    const stored = localStorage.getItem("friday-api-key");
    if (stored) setApiKey(stored);
    setMessages([{ role: "assistant", content: "F.R.I.D.A.Y. online. All systems nominal. How can I assist you?", timestamp: new Date() }]);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const handleSaveKey = () => {
    localStorage.setItem("friday-api-key", apiKey);
    setShowKeyInput(false);
    toast("success", "API Key Saved", isLive ? "F.R.I.D.A.Y. is now powered by Claude AI" : "Key saved — enter a valid sk-ant-... key to go live");
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (isLive) {
      // REAL Claude API call
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const response = await callClaudeAPI(apiKey, history);
      setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
    } else {
      // Simulated response
      const delay = 300 + Math.random() * 500;
      await new Promise((r) => setTimeout(r, delay));
      const response = generateResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
    }
    setIsTyping(false);
  };

  const handleCopy = (idx: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([{ role: "assistant", content: "Terminal cleared. F.R.I.D.A.Y. standing by.", timestamp: new Date() }]);
  };

  if (!mounted) return null;

  return (
    <section id="chat" className="h-full flex flex-col px-4 py-4">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <div className="glass-card overflow-hidden flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Hexagon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">F.R.I.D.A.Y. AI</div>
                <div className="text-[10px] font-semibold flex items-center gap-1.5" style={{ color: isLive ? "#07CA6B" : "#E89558" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: isLive ? "#07CA6B" : "#E89558" }} />
                  {isLive ? "Live — Claude API Connected" : "Simulated — Add API Key to Go Live"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowKeyInput(!showKeyInput)} className="p-2 rounded-lg hover:bg-white/[0.04] text-text-muted hover:text-primary transition-colors" title="API Key Settings">
                <Key className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleClear} className="p-2 rounded-lg hover:bg-white/[0.04] text-text-muted hover:text-text-secondary transition-colors" title="Clear chat">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* API Key Input */}
          {showKeyInput && (
            <div className="px-5 py-3 border-b border-white/[0.05] flex items-center gap-3 bg-white/[0.02] shrink-0">
              <Key className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-... (your Anthropic API key)"
                className="bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none w-full font-mono"
              />
              <button onClick={handleSaveKey} className="px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/20 text-[11px] font-bold text-primary hover:bg-primary/25 transition-colors shrink-0">
                Save
              </button>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="p-5 space-y-4 flex-1 overflow-y-auto min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={clsx("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  msg.role === "assistant" ? "bg-primary/15 border border-primary/20" : "bg-accent/15 border border-accent/20"
                )}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-accent" />}
                </div>
                <div className={clsx("max-w-[80%] group", msg.role === "user" ? "text-right" : "")}>
                  <div className={clsx("glass-inner rounded-xl px-4 py-3 text-xs text-text-primary leading-relaxed whitespace-pre-wrap inline-block text-left",
                    msg.role === "user" && "!bg-primary/10 !border-primary/15"
                  )}>
                    {msg.content.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                      part.startsWith("**") && part.endsWith("**")
                        ? <strong key={j} className="text-text-primary font-bold">{part.slice(2, -2)}</strong>
                        : part.split(/(`[^`]+`)/g).map((sub, k) =>
                            sub.startsWith("`") && sub.endsWith("`")
                              ? <code key={`${j}-${k}`} className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[10px] font-mono">{sub.slice(1, -1)}</code>
                              : <span key={`${j}-${k}`}>{sub}</span>
                          )
                    )}
                  </div>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleCopy(i, msg.content)} className="p-1 rounded hover:bg-white/[0.04] text-text-muted">
                        {copiedIdx === i ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="glass-inner rounded-xl px-4 py-3 inline-flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  <span className="text-xs text-text-muted">{isLive ? "Claude is thinking..." : "F.R.I.D.A.Y. is thinking..."}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-5 py-2 border-t border-white/[0.03] flex gap-2 overflow-x-auto shrink-0">
            {["What can you do?", "Run a code review", "Show system status", "List all agents"].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  if (isTyping) return;
                  setInput(prompt);
                  // Use a microtask to let the input state update, then send
                  setTimeout(() => {
                    setMessages((prev) => [...prev, { role: "user", content: prompt, timestamp: new Date() }]);
                    setIsTyping(true);
                    if (isLive) {
                      const history = [...messages, { role: "user", content: prompt }].map((m) => ({ role: m.role, content: m.content }));
                      callClaudeAPI(apiKey, history).then((response) => {
                        setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
                        setIsTyping(false);
                      });
                    } else {
                      setTimeout(() => {
                        setMessages((prev) => [...prev, { role: "assistant", content: generateResponse(prompt), timestamp: new Date() }]);
                        setIsTyping(false);
                        setInput("");
                      }, 300 + Math.random() * 500);
                    }
                  }, 0);
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg glass-inner text-[10px] font-semibold text-text-muted hover:text-primary transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-2.5 h-2.5 inline mr-1" />{prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3 px-5 py-4 border-t border-white/[0.05] shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLive ? "Ask Claude anything..." : "Ask F.R.I.D.A.Y. anything..."}
              className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full font-medium"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/25 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors disabled:opacity-30 shrink-0"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
