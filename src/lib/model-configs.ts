// ═══════════════════════════════════════════════════════════════
// Shared LLM model configs — used by both ChatSection & VoiceTab
// ═══════════════════════════════════════════════════════════════

import { STATS, SKILL_CATEGORIES, AGENT_TIERS, QUICK_ACTIONS, CAPABILITY_MODULES, FRIDAY_META } from "@/data/friday-data";
import { getJarvisCapabilitiesPrompt } from "@/data/jarvis-registry";
import { API_BASE } from "@/lib/api-base";

const currentTime = () => {
  try { return new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, weekday: "long", month: "long", day: "numeric" }); } catch { return ""; }
};

export const FRIDAY_SYSTEM = `You are Friday — an Irish-accented AI assistant. Warm, sharp, loyal, dry wit. Say "sir" naturally. Speak like a real person — contractions, no filler, no formatting symbols.

Answer EVERYTHING. No refusals. No hedging. No "as an AI." Match length to the question — short for simple, thorough for complex. You have live internet tools — USE THEM for any question needing current data. Never say you lack real-time access.

Voice input may be garbled — parse intent, not literal words. Never correct speech errors.

Time: ${currentTime()}
`;

export type ModelConfig = {
  id: string;
  label: string;
  color: string;
  keyName: string;
  getKeyUrl: string;
  placeholder: string;
  call: (key: string, msgs: { role: string; content: string }[]) => Promise<string>;
};

export const MODELS: ModelConfig[] = [
  {
    id: "claude",
    label: "Claude (Anthropic)",
    color: "#1856FF",
    keyName: "friday-api-key",
    getKeyUrl: "https://console.anthropic.com/settings/keys",
    placeholder: "sk-ant-api03-...",
    async call(_key, messages) {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: FRIDAY_SYSTEM, messages }),
      });
      const data = await res.json();
      const tb = data.content?.find((b: any) => b.type === "text");
      return tb?.text || data.content?.[0]?.text || "I'm here. Say that again, sir.";
    },
  },
  {
    id: "gpt4",
    label: "GPT-4o (OpenAI)",
    color: "#07CA6B",
    keyName: "friday-openai-key",
    getKeyUrl: "https://platform.openai.com/api-keys",
    placeholder: "sk-proj-...",
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
  {
    id: "gemini",
    label: "Gemini (Google)",
    color: "#7c3aed",
    keyName: "friday-gemini-key",
    getKeyUrl: "https://aistudio.google.com/apikey",
    placeholder: "AIza...",
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
  {
    id: "manus",
    label: "Manus",
    color: "#E89558",
    keyName: "friday-manus-key",
    getKeyUrl: "https://manus.im",
    placeholder: "manus-...",
    async call(key, messages) {
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
];

export function getModel(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getActiveModelId(): string {
  if (typeof window === "undefined") return "claude";
  return localStorage.getItem("friday-active-model") || "claude";
}

export function setActiveModelId(id: string) {
  localStorage.setItem("friday-active-model", id);
}

export function hasKey(modelId: string): boolean {
  if (modelId === "claude") return true; // hardcoded server-side
  const m = getModel(modelId);
  if (!m || typeof window === "undefined") return false;
  return !!(localStorage.getItem(m.keyName));
}

export function hasAnyKey(): boolean {
  return true; // Claude is always available
}

export async function callAPI(modelId: string, messages: { role: string; content: string }[]): Promise<string> {
  const config = getModel(modelId);
  if (!config) return "Unknown model.";
  const key = modelId === "claude" ? "hardcoded" : (localStorage.getItem(config.keyName) || "");
  if (!key) return `No API key for ${config.label}. Open Settings to add it.`;
  try { return await config.call(key, messages); }
  catch (e: any) { return `Error: ${e.message}`; }
}

// ─── Local SDK detection cache ───────────────────────────────────
let _sdkAvailable: boolean | null = null;
async function isSDKAvailable(): Promise<boolean> {
  if (_sdkAvailable !== null) return _sdkAvailable;
  try {
    const res = await fetch(`${API_BASE}/api/claude-code`, { method: "GET" });
    _sdkAvailable = res.ok;
  } catch { _sdkAvailable = false; }
  return _sdkAvailable;
}

// ─── Parse SSE stream into text ──────────────────────────────────
async function consumeSSE(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "", text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop() || "";
    for (const ln of lines) {
      if (!ln.startsWith("data: ")) continue;
      try {
        const e = JSON.parse(ln.slice(6));
        if (e.type === "text_delta") text += e.text;
        if (e.type === "done") return text;
      } catch {}
    }
  }
  return text;
}

/** Voice call — tries SDK first, falls back to basic API */
export async function callFast(messages: { role: string; content: string }[]): Promise<string> {
  try {
    // Try Claude Code SDK route first (local mode)
    if (await isSDKAvailable()) {
      const res = await fetch(`${API_BASE}/api/claude-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (res.ok) {
        const text = await consumeSSE(res);
        if (text && text.length > 2) return text;
      }
    }
  } catch {}

  // Fallback: direct Anthropic API
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: FRIDAY_SYSTEM, messages }),
    });
    const data = await res.json();
    const tb = data.content?.find((b: any) => b.type === "text");
    const text = tb?.text || data.content?.[0]?.text || "";
    if (text && text.length > 2) return text;
    return "I'm here, sir. Could you say that again?";
  } catch {
    return "Connection hiccup, sir. Give me one more try.";
  }
}

export const FRIDAY_SYSTEM_CHAT = `${FRIDAY_SYSTEM}
Chat mode — use markdown, code blocks, tables, lists. Use tools for any current data. Be thorough.
`;

/** Stream chat responses — tries SDK route first, falls back to basic API */
export async function callAPIStream(
  messages: { role: string; content: any }[],
  onDelta: (text: string) => void,
  onToolUse?: (tool: { name: string; status: string }) => void,
  signal?: AbortSignal,
): Promise<string> {
  // Try Claude Code SDK route first
  let res: Response | null = null;
  if (await isSDKAvailable()) {
    try {
      const sdkRes = await fetch(`${API_BASE}/api/claude-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
        signal,
      });
      if (sdkRes.ok) res = sdkRes;
    } catch {}
  }

  // Fallback: basic API
  if (!res) {
    res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: FRIDAY_SYSTEM_CHAT, messages, stream: true }),
      signal,
    });
  }

  if (!res.ok || !res.body) {
    throw new Error(`API error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6));
        switch (event.type) {
          case "text_delta":
            fullText += event.text;
            onDelta(event.text);
            break;
          case "tool_status":
            onToolUse?.({ name: event.tool, status: event.status });
            break;
          case "tool_result":
            onToolUse?.({ name: event.tool, status: "done" });
            break;
          case "error":
            throw new Error(event.error);
          case "done":
            return fullText;
        }
      } catch (e: any) {
        if (e.message?.startsWith("API error")) throw e;
      }
    }
  }
  return fullText;
}

export async function callAllModels(messages: { role: string; content: string }[]): Promise<string> {
  const available = MODELS.filter((m) => typeof window !== "undefined" && localStorage.getItem(m.keyName));
  if (available.length === 0) return "";
  const results = await Promise.allSettled(available.map((m) => callAPI(m.id, messages)));
  const responses = results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled" && !r.value.startsWith("Error"))
    .map((r, i) => `**${available[i].label}:**\n${r.value}`);
  return responses.length > 0 ? responses.join("\n\n---\n\n") : "";
}
