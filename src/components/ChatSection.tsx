"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Sparkles, Copy, Check, Trash2, Hexagon, Settings, X, Plus, Paperclip, Image as ImageIcon, Globe, Cloud, TrendingUp, Newspaper, Calculator, Clock } from "lucide-react";
import { useToast } from "./ToastSystem";
import { MODELS, getActiveModelId, setActiveModelId, hasKey, hasAnyKey, callAPI, callAllModels, callAPIStream } from "@/lib/model-configs";
import { fridayBrain } from "@/lib/friday-brain";
import FridaySettings from "./FridaySettings";
import clsx from "clsx";

type ImageAttachment = { data: string; name: string; type: string };
type ToolStatus = { name: string; status: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  images?: ImageAttachment[];
  tools?: ToolStatus[];
  isStreaming?: boolean;
};
type Conversation = { id: string; title: string; messages: Message[]; updatedAt: number };

// Tool icon mapping
const TOOL_ICONS: Record<string, any> = {
  web_search: Globe, get_weather: Cloud, get_stocks: TrendingUp,
  get_news: Newspaper, calculate: Calculator, get_time: Clock,
};

function loadConversations(): Conversation[] {
  try { return JSON.parse(localStorage.getItem("friday-conversations") || "[]"); } catch { return []; }
}
function saveConversations(convs: Conversation[]) {
  localStorage.setItem("friday-conversations", JSON.stringify(convs.slice(-20)));
}

// ─── Markdown Renderer ─────────────────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactElement[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start/end
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        const code = codeLines.join("\n");
        elements.push(
          <div key={`code-${i}`} className="relative group my-2">
            {codeLang && <span className="absolute top-1 left-3 text-[9px] text-text-muted/50 font-mono">{codeLang}</span>}
            <pre className="bg-black/40 border border-white/[0.06] rounded-lg p-3 pt-5 overflow-x-auto text-[12px] font-mono text-text-secondary leading-relaxed">
              <code>{code}</code>
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="absolute top-1.5 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-text-muted transition-opacity"
              title="Copy code"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        );
        codeLines = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    // Headers
    if (line.startsWith("### ")) { elements.push(<h3 key={i} className="text-sm font-bold text-text-primary mt-3 mb-1">{renderInline(line.slice(4))}</h3>); continue; }
    if (line.startsWith("## ")) { elements.push(<h2 key={i} className="text-base font-bold text-text-primary mt-4 mb-1">{renderInline(line.slice(3))}</h2>); continue; }

    // Bullet lists
    if (/^[-*] /.test(line)) { elements.push(<div key={i} className="flex gap-2 ml-2"><span className="text-primary mt-0.5">-</span><span>{renderInline(line.slice(2))}</span></div>); continue; }
    // Numbered lists
    if (/^\d+\. /.test(line)) { const num = line.match(/^(\d+)\. /)?.[1]; elements.push(<div key={i} className="flex gap-2 ml-2"><span className="text-primary font-mono text-xs mt-0.5">{num}.</span><span>{renderInline(line.replace(/^\d+\. /, ""))}</span></div>); continue; }

    // Blockquotes
    if (line.startsWith("> ")) { elements.push(<blockquote key={i} className="border-l-2 border-primary/30 pl-3 text-text-secondary italic">{renderInline(line.slice(2))}</blockquote>); continue; }

    // Empty line
    if (line.trim() === "") { elements.push(<div key={i} className="h-2" />); continue; }

    // Regular text
    elements.push(<p key={i}>{renderInline(line)}</p>);
  }

  return <>{elements}</>;
}

function renderInline(text: string): (string | React.ReactElement)[] {
  // Bold, inline code, links
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`|\[([^\]]+)\]\([^)]+\))/g);
  return parts.map((part, j) => {
    if (part?.startsWith("**") && part?.endsWith("**"))
      return <strong key={j} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>;
    if (part?.startsWith("`") && part?.endsWith("`"))
      return <code key={j} className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[11px] font-mono">{part.slice(1, -1)}</code>;
    return part || "";
  }).filter(Boolean);
}

// ─── Image compressor ──────────────────────────────────────────
function compressImage(file: File): Promise<ImageAttachment> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 1024;
        let w = img.width, h = img.height;
        if (w > max || h > max) {
          if (w > h) { h = (h / w) * max; w = max; }
          else { w = (w / h) * max; h = max; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        const data = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
        resolve({ data, name: file.name, type: "image/jpeg" });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ChatSection() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [model, setModel] = useState("claude");
  const [showSettings, setShowSettings] = useState(false);
  const [keyState, setKeyState] = useState(false);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [activeTools, setActiveTools] = useState<ToolStatus[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const activeConv = conversations.find((c) => c.id === activeId);
  const messages = activeConv?.messages || [];
  const currentHasKey = mounted && hasKey(model);

  useEffect(() => {
    setMounted(true);
    setModel(getActiveModelId());
    const convs = loadConversations();
    setConversations(convs);
    if (convs.length > 0) setActiveId(convs[convs.length - 1].id);
  }, []);

  useEffect(() => {
    const handler = () => { setKeyState((k) => !k); setModel(getActiveModelId()); };
    window.addEventListener("friday-settings-changed", handler);
    return () => window.removeEventListener("friday-settings-changed", handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail;
      if (action === "new-chat") newConversation();
      if (action === "open-settings") setShowSettings(true);
    };
    window.addEventListener("nav-action", handler);
    return () => window.removeEventListener("nav-action", handler);
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping, streamingText]);

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

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    const newImages = await Promise.all(Array.from(files).slice(0, 4).map(compressImage));
    setImages((prev) => [...prev, ...newImages].slice(0, 4));
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && images.length === 0) || isTyping) return;

    let conv = activeConv;
    if (!conv) {
      conv = { id: Date.now().toString(), title: text.slice(0, 40), messages: [], updatedAt: Date.now() };
      const updated = [...conversations, conv];
      setConversations(updated);
      setActiveId(conv.id);
    }

    const userMsg: Message = { role: "user", content: text, timestamp: Date.now(), images: images.length > 0 ? [...images] : undefined };
    const newMessages = [...conv.messages, userMsg];

    if (conv.messages.length === 0) conv.title = text.slice(0, 50);
    conv.messages = newMessages;
    conv.updatedAt = Date.now();
    const updated = conversations.map((c) => c.id === conv!.id ? conv! : c);
    if (!conversations.find((c) => c.id === conv!.id)) updated.push(conv);
    setConversations([...updated]);
    saveConversations(updated);
    setInput("");
    setImages([]);
    setIsTyping(true);
    setStreamingText("");
    setActiveTools([]);

    let reply: string;

    // Build API messages — include images as content blocks
    const apiMessages = newMessages.map((m) => {
      if (m.images && m.images.length > 0) {
        return {
          role: m.role,
          content: [
            ...m.images.map((img) => ({
              type: "image" as const,
              source: { type: "base64" as const, media_type: img.type as any, data: img.data },
            })),
            { type: "text" as const, text: m.content || "What do you see in this image?" },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    try {
      if (model === "claude" && currentHasKey) {
        // Streaming mode for Claude
        const controller = new AbortController();
        abortRef.current = controller;
        const tools: ToolStatus[] = [];

        reply = await callAPIStream(
          apiMessages,
          (delta) => setStreamingText((prev) => prev + delta),
          (tool) => {
            tools.push(tool);
            setActiveTools([...tools]);
          },
          controller.signal,
        );
      } else if (model === "all" && hasAnyKey()) {
        const allReply = await callAllModels(apiMessages as any);
        reply = (allReply && !allReply.startsWith("Error")) ? allReply : fridayBrain(text);
      } else if (currentHasKey) {
        const apiReply = await callAPI(model, apiMessages as any);
        reply = apiReply.startsWith("Error") ? fridayBrain(text) : apiReply;
      } else {
        reply = fridayBrain(text);
      }
    } catch (e: any) {
      reply = streamingText || fridayBrain(text);
    }

    const assistantMsg: Message = { role: "assistant", content: reply, timestamp: Date.now(), tools: activeTools.length > 0 ? [...activeTools] : undefined };
    conv.messages = [...newMessages, assistantMsg];
    conv.updatedAt = Date.now();
    const final = conversations.map((c) => c.id === conv!.id ? conv! : c);
    if (!conversations.find((c) => c.id === conv!.id)) final.push(conv);
    setConversations([...final]);
    saveConversations(final);
    setIsTyping(false);
    setStreamingText("");
    setActiveTools([]);
    abortRef.current = null;
  };

  if (!mounted) return null;

  const activeModelConfig = MODELS.find((m) => m.id === model);

  return (
    <section id="chat" className="h-full flex">
      <FridaySettings open={showSettings} onClose={() => setShowSettings(false)} />
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />

      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-white/[0.05] flex flex-col h-full">
        <button onClick={newConversation} className="m-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/15 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New chat
        </button>
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {[...conversations].reverse().map((conv) => (
            <button key={conv.id} onClick={() => setActiveId(conv.id)}
              className={clsx("w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors group flex items-center justify-between",
                activeId === conv.id ? "bg-white/[0.06] text-text-primary" : "text-text-muted hover:bg-white/[0.03] hover:text-text-secondary"
              )}>
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
          {[...MODELS, { id: "all", label: "All — Synthesize", color: "#f43f5e", keyName: "" }].map((m) => (
            <button key={m.id} onClick={() => { setModel(m.id); setActiveModelId(m.id); }}
              className={clsx("w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-2",
                model === m.id ? "bg-white/[0.06] text-text-primary" : "text-text-muted hover:text-text-secondary hover:bg-white/[0.02]"
              )}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: model === m.id ? m.color : "transparent", boxShadow: model === m.id ? `0 0 4px ${m.color}` : "none" }} />
              {m.label}
              {m.keyName && hasKey(m.id) && <Check className="w-2.5 h-2.5 text-success ml-auto" />}
            </button>
          ))}
        </div>

        <div className="p-2 pb-4 border-t border-white/[0.05]">
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-semibold text-text-muted hover:text-primary transition-colors hover:bg-white/[0.03]">
            <Settings className="w-3.5 h-3.5" />
            <span>{hasAnyKey() ? "Manage API Keys" : "Connect API Keys"}</span>
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-full pt-20">
                <Hexagon className="w-10 h-10 text-primary/30 mb-4" />
                <p className="text-sm text-text-muted">Start a conversation with Friday</p>
                <p className="text-[10px] text-text-muted/60 mt-1 mb-4">
                  {currentHasKey
                    ? `Connected to ${activeModelConfig?.label || model} — streaming, tools, vision enabled`
                    : "Offline mode — ask weather, time, math, definitions, code & more"
                  }
                </p>
                <div className="flex gap-2 mt-2 flex-wrap justify-center max-w-lg">
                  {["What's the weather in NYC?", "AAPL stock price", "Latest AI news", "Calculate 2^10 + sqrt(144)", "Tell me a joke", "Help me code a React hook"].map((p) => (
                    <button key={p} onClick={() => setInput(p)} className="px-3 py-1.5 rounded-lg glass-inner text-[11px] text-text-muted hover:text-primary transition-colors">
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
                <div className={clsx("max-w-[80%] group")}>
                  {/* Tool indicators */}
                  {msg.tools && msg.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {msg.tools.filter((t, idx, arr) => arr.findIndex((x) => x.name === t.name) === idx).map((t, j) => {
                        const Icon = TOOL_ICONS[t.name] || Globe;
                        return (
                          <span key={j} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/15 text-[9px] font-semibold text-primary/80">
                            <Icon className="w-2.5 h-2.5" />
                            {t.name.replace(/_/g, " ")}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {/* Images */}
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {msg.images.map((img, j) => (
                        <img key={j} src={`data:${img.type};base64,${img.data}`} alt={img.name} className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                      ))}
                    </div>
                  )}
                  <div className={clsx("rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                    msg.role === "user" ? "bg-primary/15 text-text-primary rounded-br-sm whitespace-pre-wrap" : "bg-white/[0.03] text-text-primary rounded-bl-sm"
                  )}>
                    {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
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

            {/* Streaming response */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="max-w-[80%]">
                  {/* Active tool indicators */}
                  {activeTools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {activeTools.filter((t, idx, arr) => arr.findIndex((x) => x.name === t.name) === idx).map((t, j) => {
                        const Icon = TOOL_ICONS[t.name] || Globe;
                        return (
                          <span key={j} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/15 text-[9px] font-semibold text-primary/80 animate-pulse">
                            <Icon className="w-2.5 h-2.5" />
                            {t.status === "done" ? t.name.replace(/_/g, " ") : `${t.name.replace(/_/g, " ")}...`}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="bg-white/[0.03] rounded-2xl rounded-bl-sm px-4 py-2.5 text-[13px] leading-relaxed">
                    {streamingText ? (
                      <>{renderMarkdown(streamingText)}<span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" /></>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                        <span className="text-xs text-text-muted">Friday is thinking...</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image preview bar */}
        {images.length > 0 && (
          <div className="border-t border-white/[0.05] px-6 py-2">
            <div className="max-w-3xl mx-auto flex gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={`data:${img.type};base64,${img.data}`} alt={img.name} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                  <button onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/[0.05] px-6 py-3">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="max-w-3xl mx-auto flex items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 transition-colors shrink-0"
              title="Attach image">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={currentHasKey ? `Message Friday (${activeModelConfig?.label.split(" ")[0] || model}) — streaming + tools + vision...` : "Message Friday (offline)..."}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/20 w-full"
              disabled={isTyping}
            />
            <button type="submit" disabled={(!input.trim() && images.length === 0) || isTyping}
              className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/25 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors disabled:opacity-30 shrink-0">
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
