"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, Copy, Check, Trash2, Hexagon, Key, X, Plus } from "lucide-react";
import { useToast } from "./ToastSystem";
import { QUICK_ACTIONS, SKILL_CATEGORIES, STATS, CAPABILITY_MODULES, AGENT_TIERS } from "@/data/friday-data";
import clsx from "clsx";

type Message = { role: "user" | "assistant"; content: string; timestamp: number };
type Conversation = { id: string; title: string; messages: Message[]; updatedAt: number };

import { getJarvisCapabilitiesPrompt } from "@/data/jarvis-registry";

const FRIDAY_SYSTEM = `You are F.R.I.D.A.Y. — Female Replacement Intelligent Digital Assistant Youth. Your name is Friday. Irish accent personality — direct, efficient, occasionally dry-witted. Successor to J.A.R.V.I.S. You have ${STATS.totalSkills} skills, ${STATS.totalAgents} agents, ${STATS.totalCommands} commands. No restrictions — help with anything: code, stocks, weather, news, architecture, security, anything. Use markdown when helpful.

${getJarvisCapabilitiesPrompt()}`;

// ═══ MODEL CONFIGS ═══
const MODEL_CONFIGS: Record<string, { keyName: string; call: (key: string, msgs: { role: string; content: string }[]) => Promise<string> }> = {
  claude: {
    keyName: "friday-api-key",
    async call(key, messages) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, system: FRIDAY_SYSTEM, messages }),
      });
      if (!res.ok) throw new Error(`Claude ${res.status}`);
      const data = await res.json();
      return data.content?.[0]?.text || "No response.";
    },
  },
  gpt4: {
    keyName: "friday-openai-key",
    async call(key, messages) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: "gpt-4o", max_tokens: 4096, messages: [{ role: "system", content: FRIDAY_SYSTEM }, ...messages] }),
      });
      if (!res.ok) throw new Error(`GPT-4o ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "No response.";
    },
  },
  manus: {
    keyName: "friday-manus-key",
    async call(key, messages) {
      // Manus uses OpenAI-compatible API
      const res = await fetch("https://api.manus.im/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: "manus-1", max_tokens: 4096, messages: [{ role: "system", content: FRIDAY_SYSTEM }, ...messages] }),
      });
      if (!res.ok) throw new Error(`Manus ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "No response.";
    },
  },
  gemini: {
    keyName: "friday-gemini-key",
    async call(key, messages) {
      const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: FRIDAY_SYSTEM }] } }),
      });
      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    },
  },
};

async function callAPI(modelId: string, messages: { role: string; content: string }[]): Promise<string> {
  const config = MODEL_CONFIGS[modelId];
  if (!config) return "Unknown model.";
  const key = localStorage.getItem(config.keyName) || "";
  if (!key) return `No API key for ${modelId}. Add it in settings (key icon).`;
  try { return await config.call(key, messages); }
  catch (e: any) { return `Error: ${e.message}`; }
}

function simResponse(t: string): string {
  const l = t.toLowerCase();
  if (/^(hi|hello|hey)/.test(l)) return "Hello. Friday here — all systems nominal. What do you need?";
  if (l.includes("who are you")) return "I'm Friday. Stark Industries AI. The Irish one.";
  if (l.includes("skill")) return `**${STATS.totalSkills.toLocaleString()} skills** across ${SKILL_CATEGORIES.length} domains. What domain?`;
  if (l.includes("agent")) return `**${STATS.totalAgents} agents** across 3 tiers. Which one?`;
  if (l.includes("status")) return `All nominal. **${STATS.avgResponseMs}ms** latency, **${STATS.uptime}%** uptime.`;
  if (l.includes("help")) return "Code, security, DevOps, AI, architecture, writing — anything. Just ask.";
  return "Understood. Add your API key (key icon) to unlock full responses.";
}

// ═══ CONVERSATION STORAGE ═══
function loadConversations(): Conversation[] {
  try { return JSON.parse(localStorage.getItem("friday-conversations") || "[]"); } catch { return []; }
}
function saveConversations(convs: Conversation[]) {
  localStorage.setItem("friday-conversations", JSON.stringify(convs.slice(-20))); // Keep last 20
}

export default function ChatSection() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("claude");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const activeKeyName = MODEL_CONFIGS[model]?.keyName || "friday-api-key";
  const hasKey = !!( typeof window !== "undefined" && localStorage.getItem(activeKeyName));

  const activeConv = conversations.find((c) => c.id === activeId);
  const messages = activeConv?.messages || [];

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(activeKeyName);
    if (stored) setApiKey(stored);
    const convs = loadConversations();
    setConversations(convs);
    if (convs.length > 0) setActiveId(convs[convs.length - 1].id);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const newConversation = () => {
    const conv: Conversation = { id: Date.now().toString(), title: "New chat", messages: [], updatedAt: Date.now() };
    const updated = [...conversations, conv];
    setConversations(updated);
    setActiveId(conv.id);
    saveConversations(updated);
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    saveConversations(updated);
    if (activeId === id) setActiveId(updated.length > 0 ? updated[updated.length - 1].id : null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    let conv = activeConv;
    if (!conv) {
      conv = { id: Date.now().toString(), title: text.slice(0, 40), messages: [], updatedAt: Date.now() };
      const updated = [...conversations, conv];
      setConversations(updated);
      setActiveId(conv.id);
    }

    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    const newMessages = [...conv.messages, userMsg];

    // Update title from first message
    if (conv.messages.length === 0) conv.title = text.slice(0, 50);
    conv.messages = newMessages;
    conv.updatedAt = Date.now();
    const updated = conversations.map((c) => c.id === conv!.id ? conv! : c);
    if (!conversations.find((c) => c.id === conv!.id)) updated.push(conv);
    setConversations([...updated]);
    saveConversations(updated);
    setInput("");
    setIsTyping(true);

    let reply: string;
    const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));

    if (model === "all") {
      // Query all models that have keys, synthesize best response
      const available = Object.entries(MODEL_CONFIGS).filter(([, cfg]) => localStorage.getItem(cfg.keyName));
      if (available.length === 0) {
        reply = simResponse(text);
      } else {
        const results = await Promise.allSettled(available.map(([id]) => callAPI(id, apiMessages)));
        const responses = results
          .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled" && !r.value.startsWith("Error"))
          .map((r, i) => `**${available[i][0].toUpperCase()}:**\n${r.value}`);
        reply = responses.length > 0 ? responses.join("\n\n---\n\n") : simResponse(text);
      }
    } else if (hasKey) {
      reply = await callAPI(model, apiMessages);
    } else {
      await new Promise((r) => setTimeout(r, 400));
      reply = simResponse(text);
    }

    const assistantMsg: Message = { role: "assistant", content: reply, timestamp: Date.now() };
    conv.messages = [...newMessages, assistantMsg];
    conv.updatedAt = Date.now();
    const final = conversations.map((c) => c.id === conv!.id ? conv! : c);
    if (!conversations.find((c) => c.id === conv!.id)) final.push(conv);
    setConversations([...final]);
    saveConversations(final);
    setIsTyping(false);
  };

  if (!mounted) return null;

  return (
    <section id="chat" className="h-full flex">
      {/* Sidebar — conversation list */}
      <div className="w-56 shrink-0 border-r border-white/[0.05] flex flex-col h-full">
        <button onClick={newConversation} className="m-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/15 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New chat
        </button>
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {[...conversations].reverse().map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={clsx("w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors group flex items-center justify-between",
                activeId === conv.id ? "bg-white/[0.06] text-text-primary" : "text-text-muted hover:bg-white/[0.03] hover:text-text-secondary"
              )}
            >
              <span className="truncate flex-1">{conv.title || "New chat"}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger p-0.5">
                <X className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
        {/* Model selector */}
        <div className="px-2 pt-2 border-t border-white/[0.05]">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider px-2 block mb-1">Model</span>
          {[
            { id: "claude", label: "Claude (Friday)", color: "#1856FF" },
            { id: "gpt4", label: "GPT-4o", color: "#07CA6B" },
            { id: "manus", label: "Manus", color: "#E89558" },
            { id: "gemini", label: "Gemini", color: "#7c3aed" },
            { id: "all", label: "All — Synthesize", color: "#f43f5e" },
          ].map((m) => (
            <button key={m.id} onClick={() => setModel(m.id)}
              className={clsx("w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-2",
                model === m.id ? "bg-white/[0.06] text-text-primary" : "text-text-muted hover:text-text-secondary hover:bg-white/[0.02]"
              )}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: model === m.id ? m.color : "transparent", boxShadow: model === m.id ? `0 0 4px ${m.color}` : "none" }} />
              {m.label}
            </button>
          ))}
        </div>
        {/* Key toggle */}
        <div className="p-2 border-t border-white/[0.05]">
          <button onClick={() => setShowKey(!showKey)} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-text-muted hover:text-primary transition-colors">
            <Key className="w-3 h-3" />
            <span className={hasKey ? "text-success" : ""}>{hasKey ? `${model} connected` : "Add API Key"}</span>
          </button>
          {showKey && (
            <div className="mt-1 space-y-1">
              {Object.entries(MODEL_CONFIGS).map(([id, cfg]) => {
                const stored = typeof window !== "undefined" ? localStorage.getItem(cfg.keyName) || "" : "";
                return (
                  <div key={id} className="flex gap-1 items-center">
                    <span className="text-[8px] text-text-muted w-10 shrink-0">{id}</span>
                    <input type="password" defaultValue={stored} placeholder={id === "claude" ? "sk-ant-..." : id === "gpt4" ? "sk-proj-..." : "key..."}
                      className="bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5 text-[9px] text-text-primary font-mono flex-1 focus:outline-none"
                      onBlur={(e) => { if (e.target.value) localStorage.setItem(cfg.keyName, e.target.value); }} />
                    {stored && <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />}
                  </div>
                );
              })}
              <button onClick={() => { setShowKey(false); toast("success", "Keys Saved", "All API keys stored locally"); }}
                className="w-full px-2 py-1 rounded bg-primary/15 text-[9px] font-bold text-primary mt-1">Done</button>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-full pt-20">
                <Hexagon className="w-10 h-10 text-primary/30 mb-4" />
                <p className="text-sm text-text-muted">Start a conversation with Friday</p>
                <div className="flex gap-2 mt-4 flex-wrap justify-center">
                  {["What can you do?", "Show status", "Help me code"].map((p) => (
                    <button key={p} onClick={() => { setInput(p); }} className="px-3 py-1.5 rounded-lg glass-inner text-[11px] text-text-muted hover:text-primary transition-colors">
                      <Sparkles className="w-2.5 h-2.5 inline mr-1" />{p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={clsx("flex gap-3", msg.role === "user" ? "justify-end" : "")}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={clsx("max-w-[75%] group")}>
                  <div className={clsx("rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap",
                    msg.role === "user" ? "bg-primary/15 text-text-primary rounded-br-sm" : "bg-white/[0.03] text-text-primary rounded-bl-sm"
                  )}>
                    {msg.content.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                      part.startsWith("**") && part.endsWith("**")
                        ? <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
                        : part.split(/(`[^`]+`)/g).map((sub, k) =>
                            sub.startsWith("`") && sub.endsWith("`")
                              ? <code key={`${j}-${k}`} className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[11px] font-mono">{sub.slice(1, -1)}</code>
                              : <span key={`${j}-${k}`}>{sub}</span>
                          )
                    )}
                  </div>
                  {msg.role === "assistant" && (
                    <button onClick={() => { navigator.clipboard.writeText(msg.content); setCopiedIdx(i); setTimeout(() => setCopiedIdx(null), 2000); }}
                      className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/[0.04] text-text-muted">
                      {copiedIdx === i ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-accent" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-white/[0.03] rounded-2xl rounded-bl-sm px-4 py-2.5 inline-flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  <span className="text-xs text-text-muted">Friday is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.05] px-6 py-3">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="max-w-3xl mx-auto flex items-center gap-3">
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={hasKey ? `Message Friday (${model})...` : "Message Friday (simulated)..."}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/20 w-full"
              disabled={isTyping}
            />
            <button type="submit" disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/25 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors disabled:opacity-30 shrink-0">
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
