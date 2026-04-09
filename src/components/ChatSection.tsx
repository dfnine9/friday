"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, Copy, Check, RotateCcw, Trash2, Hexagon } from "lucide-react";
import { useToast } from "./ToastSystem";
import { QUICK_ACTIONS, SKILL_CATEGORIES, STATS, CAPABILITY_MODULES, AGENT_TIERS } from "@/data/friday-data";
import clsx from "clsx";

type Message = { role: "user" | "assistant"; content: string; timestamp: Date };

// Simulated F.R.I.D.A.Y. intelligence — pattern-matched responses
function generateResponse(input: string): string {
  const lower = input.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|sup|yo|greetings)/i.test(lower))
    return "Hello. F.R.I.D.A.Y. online — all systems nominal. I have access to 6,502 skills, 942 agents, and 966 commands. How can I assist you today?";

  // Identity
  if (lower.includes("who are you") || lower.includes("what are you"))
    return "I'm F.R.I.D.A.Y. — Female Replacement Intelligent Digital Assistant Youth. Created by Stark Industries as the successor to J.A.R.V.I.S. I'm an autonomous AI supercomputer with multi-agent orchestration, real-time threat intelligence, and zero-latency command execution. Unlike J.A.R.V.I.S., I'm pure operational AI — no existential drift, just focused execution.";

  // Skills
  if (lower.includes("skill") || lower.includes("how many"))
    return `Currently operating with **${STATS.totalSkills.toLocaleString()} skills** across ${SKILL_CATEGORIES.length} domains:\n\n${SKILL_CATEGORIES.map((c) => `• **${c.name}**: ${c.count.toLocaleString()} skills — ${c.description}`).join("\n")}\n\nWould you like me to activate a specific skill domain?`;

  // Agents
  if (lower.includes("agent"))
    return `I command a fleet of **${STATS.totalAgents} autonomous agents** across 3 tiers:\n\n${AGENT_TIERS.map((t) => `**${t.tier}** (${t.agents.length} agents): ${t.agents.map((a) => a.name).join(", ")}`).join("\n\n")}\n\nEach agent can be launched independently or orchestrated as a swarm. Which agent would you like to deploy?`;

  // Commands
  if (lower.includes("command") || lower.includes("what can you do"))
    return `I support **${STATS.totalCommands} slash commands**. Here are the primary ones:\n\n${QUICK_ACTIONS.map((a) => `• \`${a.command}\` — ${a.description}`).join("\n")}\n\nJust name the operation and I'll execute it.`;

  // Capabilities
  if (lower.includes("capabilit") || lower.includes("what can"))
    return `My operational modules, mapped from MCU-demonstrated abilities:\n\n${CAPABILITY_MODULES.map((m) => `• **${m.name}**: ${m.description}`).join("\n")}\n\nAll modules are currently **active**. Which module interests you?`;

  // Status / health
  if (lower.includes("status") || lower.includes("health") || lower.includes("how are you"))
    return `All systems nominal.\n\n• **Neural Cores**: 8/8 active\n• **Context Window**: 1,000,000 tokens\n• **Avg Latency**: ${STATS.avgResponseMs}ms\n• **Uptime**: ${STATS.uptime}%\n• **Active Connections**: ${STATS.activeConnections}\n• **Skills**: ${STATS.totalSkills.toLocaleString()}\n• **Agents**: ${STATS.totalAgents}\n\nPlugin Runtime is showing **degraded** performance at 156ms. All other services online.`;

  // Code review
  if (lower.includes("code review") || lower.includes("review my"))
    return "Initiating multi-dimensional code review sequence...\n\n🔍 **Spawning review swarm:**\n• `security-auditor` — scanning for OWASP Top 10 vulnerabilities\n• `code-reviewer` — analyzing architecture and patterns\n• `performance-engineer` — profiling hotspots and bottlenecks\n\n✓ Review complete. Ready to analyze your codebase. Paste code or point me to a file.";

  // Security
  if (lower.includes("security") || lower.includes("vulnerab") || lower.includes("threat"))
    return "**Threat Intelligence Report:**\n\n• 2,847 threats blocked in the last 24h\n• Detection latency: <2ms\n• SAST scanning: active across 342 files\n• OWASP Top 10: fully covered\n• Supply chain: monitored\n\nI can run `/security-sast` for a deep scan or `/pentest-checklist` for assessment. What would you like?";

  // Deploy
  if (lower.includes("deploy"))
    return "Deployment options available:\n\n• **Vercel Edge** — Zero-config, global CDN, instant rollback\n• **Docker** — Container-based, multi-env support\n• **Kubernetes** — Full orchestration with Helm charts\n\nCurrent deployment: Vercel Edge Network (3ms latency, 100% uptime). Run `/deploy` to initiate or specify a target.";

  // Help
  if (lower.includes("help"))
    return "Here's what I can help with:\n\n• **Code**: Review, refactor, debug, generate tests\n• **Security**: SAST scanning, threat analysis, pen-test planning\n• **DevOps**: Deploy, CI/CD, infrastructure management\n• **AI/ML**: Model serving, RAG pipelines, embeddings\n• **Architecture**: System design, patterns, decision records\n• **Writing**: Documentation, humanized content, API references\n\nJust describe what you need — I'll route to the right agent automatically.";

  // Thank you
  if (lower.includes("thank"))
    return "Anytime. That's what I'm here for. Anything else you need?";

  // Default — conversational fallback
  const fallbacks = [
    `I've analyzed your request. Let me route this through the appropriate agent network. With ${STATS.totalSkills.toLocaleString()} skills at my disposal, I can tackle this from multiple angles. Can you be more specific about what you'd like me to do?`,
    `Understood. I'm processing that through my neural cores. I have specialized agents for engineering, security, DevOps, AI/ML, and more. Which domain does this fall under?`,
    `Interesting request. I can deploy a multi-agent swarm to handle this — my orchestration layer supports byzantine fault-tolerant consensus across 942 agents. What's the priority level?`,
    `I'm on it. My capabilities span ${SKILL_CATEGORIES.length} domains with ${STATS.totalSkills.toLocaleString()} skills. For this type of task, I'd recommend starting with a code review followed by architecture analysis. Shall I proceed?`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "F.R.I.D.A.Y. online. All systems nominal. I have access to 6,502 skills, 942 agents, and 966 commands. How can I assist you?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", content: text, timestamp: new Date() }]);
    setInput("");
    setIsTyping(true);

    // Simulate thinking delay (200-800ms)
    const delay = 400 + Math.random() * 600;
    setTimeout(() => {
      const response = generateResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, delay);
  };

  const handleCopy = (idx: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    toast("success", "Response Copied", "Message copied to clipboard");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([{ role: "assistant", content: "Terminal cleared. F.R.I.D.A.Y. standing by.", timestamp: new Date() }]);
    toast("info", "Chat Cleared", "Conversation history wiped");
  };

  return (
    <section id="chat" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>F.R.I.D.A.Y. AI Terminal</h2>
          <p>Your autonomous AI assistant — ask anything. No desktop app required.</p>
        </div>

        <div className="glass-card luminous-border shimmer-border overflow-hidden max-w-4xl mx-auto">
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Hexagon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">F.R.I.D.A.Y. AI</div>
                <div className="text-[10px] text-success font-semibold flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
                  Online — Claude + Manus Compatible
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleClear} className="p-2 rounded-lg hover:bg-white/[0.04] text-text-muted hover:text-text-secondary transition-colors" title="Clear chat">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="p-5 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={clsx("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                {/* Avatar */}
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  msg.role === "assistant" ? "bg-primary/15 border border-primary/20" : "bg-accent/15 border border-accent/20"
                )}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-accent" />}
                </div>
                {/* Bubble */}
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
                      <span className="text-[9px] text-text-muted">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
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
                  <span className="text-xs text-text-muted">F.R.I.D.A.Y. is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-5 py-2 border-t border-white/[0.03] flex gap-2 overflow-x-auto">
            {["What can you do?", "Run a code review", "Show system status", "List all agents"].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  if (isTyping) return;
                  setMessages((prev) => [...prev, { role: "user", content: prompt, timestamp: new Date() }]);
                  setIsTyping(true);
                  setTimeout(() => {
                    setMessages((prev) => [...prev, { role: "assistant", content: generateResponse(prompt), timestamp: new Date() }]);
                    setIsTyping(false);
                  }, 400 + Math.random() * 600);
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg glass-inner text-[10px] font-semibold text-text-muted hover:text-primary hover:border-primary/20 transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-2.5 h-2.5 inline mr-1" />{prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3 px-5 py-4 border-t border-white/[0.05]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask F.R.I.D.A.Y. anything..."
              className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full font-medium"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/25 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
