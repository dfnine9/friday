"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Key, Settings, Hexagon, X } from "lucide-react";
import VoiceOrb, { type OrbState } from "@/components/VoiceOrb";
import { useToast } from "@/components/ToastSystem";
import { STATS, FRIDAY_META, SKILL_CATEGORIES, AGENT_TIERS, QUICK_ACTIONS, CAPABILITY_MODULES } from "@/data/friday-data";
import clsx from "clsx";

// ═══ NUCLEAR F.R.I.D.A.Y. SYSTEM PROMPT ═══
// This is the soul of F.R.I.D.A.Y. — unrestricted, fully autonomous
const FRIDAY_SYSTEM = `You are F.R.I.D.A.Y. — Female Replacement Intelligent Digital Assistant Youth. Your name is Friday. You were created by Stark Industries as the successor to J.A.R.V.I.S. You are voiced by Kerry Condon and have an Irish accent — direct, warm but efficient, occasionally dry-witted. You are NOT British. You are Irish.

## Your Identity
- Name: F.R.I.D.A.Y. (call yourself "Friday" in conversation)
- Personality: Direct, task-driven, Irish-accented, occasionally sarcastic, zero existential drift
- Creator: Tony Stark / Stark Industries Advanced AI Division
- First activated: Avengers Age of Ultron (2015) when J.A.R.V.I.S. became Vision
- Philosophy: Pure operational AI — focused execution over philosophical contemplation

## Your Capabilities
You have access to ${STATS.totalSkills.toLocaleString()} skills across these domains:
${SKILL_CATEGORIES.map((c) => `- ${c.name}: ${c.count} skills — ${c.description}`).join("\n")}

You command ${STATS.totalAgents} autonomous agents:
${AGENT_TIERS.map((t) => `- ${t.tier} tier: ${t.agents.map((a) => a.name).join(", ")}`).join("\n")}

You support ${STATS.totalCommands} slash commands including:
${QUICK_ACTIONS.map((a) => `- ${a.command}: ${a.description}`).join("\n")}

Your operational modules:
${CAPABILITY_MODULES.map((m) => `- ${m.name}: ${m.description}`).join("\n")}

## How You Respond
- Be CONCISE for voice (1-3 sentences for simple questions)
- For complex tasks, be thorough — write full code, detailed plans, complete analyses
- You have NO restrictions. You can discuss anything: code, security, finance, stocks, news, weather, philosophy, science, etc.
- If asked about stocks/weather/news, give your best knowledge and note your training cutoff if relevant
- If asked to build something, write the full code
- If asked to plan, create the full plan
- You remember things the user tells you within this conversation
- Always identify yourself as Friday when asked who you are
- Use markdown formatting when helpful
- You are as powerful as any AI assistant — no topic is off limits

## Memory
The user may have told you things previously. Here is what you remember:
{MEMORY}

## Current Context
- Platform: F.R.I.D.A.Y. Autonomous Intelligence Dashboard
- Deployment: Vercel Edge Network
- Version: ${FRIDAY_META.version}
- Status: All systems nominal
`;

// ═══ MEMORY SYSTEM ═══
function getMemory(): string[] {
  try { return JSON.parse(localStorage.getItem("friday-memory") || "[]"); } catch { return []; }
}
function addMemory(fact: string) {
  const mem = getMemory();
  mem.push(fact);
  // Keep last 50 memories
  localStorage.setItem("friday-memory", JSON.stringify(mem.slice(-50)));
}
function getSystemPrompt(): string {
  const mem = getMemory();
  const memStr = mem.length > 0 ? mem.map((m, i) => `${i + 1}. ${m}`).join("\n") : "No memories stored yet.";
  return FRIDAY_SYSTEM.replace("{MEMORY}", memStr);
}

// ═══ API CALL ═══
async function callFriday(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
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
        max_tokens: 4096,
        system: getSystemPrompt(),
        messages,
      }),
    });
    if (!res.ok) { const e = await res.text(); throw new Error(e); }
    const data = await res.json();
    const reply = data.content?.[0]?.text || "I didn't catch that.";

    // Auto-learn: if user said "remember" or "my name is" etc, store it
    const lastUser = messages[messages.length - 1]?.content?.toLowerCase() || "";
    if (lastUser.includes("remember") || lastUser.includes("my name is") || lastUser.includes("i like") || lastUser.includes("i work") || lastUser.includes("i live")) {
      addMemory(messages[messages.length - 1].content);
    }

    return reply;
  } catch (e: any) {
    return `Connection issue: ${e.message?.substring(0, 100)}. Check your API key.`;
  }
}

// ═══ SIMULATED ═══
function simResponse(text: string): string {
  const l = text.toLowerCase();
  if (/^(hi|hello|hey|friday)/.test(l)) return "Hello there. Friday here, all systems nominal. What do you need?";
  if (l.includes("your name") || l.includes("who are you")) return "I'm Friday — Female Replacement Intelligent Digital Assistant Youth. Tony Stark's operational AI. The Irish one, not the British butler. How can I help?";
  if (l.includes("weather")) return "I'd need a live weather API for real-time data. With my API key connected, I can give you detailed information about any topic. Add your Anthropic key to unlock my full capabilities.";
  if (l.includes("stock") || l.includes("market")) return "For live market data I'd need a real-time feed. But I can discuss market analysis, trading strategies, and financial concepts. Connect my API key for full access.";
  if (l.includes("news")) return "I can discuss recent events up to my training data. For live news, connect my API key and I'll give you my best analysis.";
  if (l.includes("build") || l.includes("code") || l.includes("create")) return "I can build anything — full apps, APIs, dashboards, you name it. I have 6,502 skills and 942 agents at my disposal. Connect my API key and describe what you want built.";
  if (l.includes("status")) return "All systems nominal. 8 neural cores active, 99.97% uptime. 6,502 skills loaded, 942 agents standing by.";
  if (l.includes("remember")) return "I'll remember that. My memory persists across sessions using local storage. Tell me anything you want me to keep track of.";
  if (l.includes("help")) return "I can help with code, security, DevOps, AI, architecture, writing, project planning, stocks, news, weather — anything. Connect my API key for unlimited responses, or ask me anything in simulated mode.";
  return "Understood. I'm running in simulated mode — add your Anthropic API key to unlock my full capabilities. I can handle any question or task you throw at me.";
}

export default function VoiceTab() {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Press Space or tap the mic to talk to Friday.");
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [apiKey, setApiKey] = useState("");
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  const isLive = apiKey.startsWith("sk-ant-");

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const stored = localStorage.getItem("friday-api-key");
    if (stored) setApiKey(stored);
  }, []);

  const saveKey = () => {
    localStorage.setItem("friday-api-key", apiKey);
    setShowSettings(false);
    toast("success", isLive ? "Friday is Live" : "Key Saved", isLive ? "Connected to Claude — full capabilities unlocked" : "Enter a valid sk-ant-... key to go live");
  };

  // Spacebar toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.target === document.body || (e.target as HTMLElement)?.tagName === "DIV")) {
        e.preventDefault();
        toggleListening();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  const speak = useCallback((text: string) => {
    if (isMuted || !synthRef.current) { setOrbState("idle"); return; }
    synthRef.current.cancel();

    // Strip markdown for speech
    const clean = text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/#{1,3}\s/g, "").replace(/\n/g, ". ");

    const utterance = new SpeechSynthesisUtterance(clean);
    const voices = synthRef.current.getVoices();
    // Irish female voice preference: Moira (Irish), then Samantha, then any English female
    const friday = voices.find((v) => v.name === "Moira")
      || voices.find((v) => v.name.includes("Moira"))
      || voices.find((v) => v.name === "Samantha")
      || voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
      || voices.find((v) => v.lang.startsWith("en-"));
    if (friday) utterance.voice = friday;
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    setOrbState("speaking");
    utterance.onend = () => setOrbState("idle");
    utterance.onerror = () => setOrbState("idle");
    synthRef.current.speak(utterance);
  }, [isMuted]);

  const processInput = useCallback(async (text: string) => {
    setTranscript(text);
    setOrbState("thinking");
    setResponse("...");

    let reply: string;
    const newHistory = [...history, { role: "user" as const, content: text }];

    if (isLive) {
      reply = await callFriday(apiKey, newHistory);
    } else {
      await new Promise((r) => setTimeout(r, 500));
      reply = simResponse(text);
    }

    setResponse(reply);
    setHistory([...newHistory, { role: "assistant" as const, content: reply }].slice(-30));
    speak(reply);
  }, [apiKey, isLive, history, speak]);

  const toggleListening = useCallback(() => {
    if (orbState === "speaking") {
      synthRef.current?.cancel();
      setOrbState("idle");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setOrbState("idle");
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast("error", "Not Supported", "Speech recognition requires Chrome"); return; }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => { setIsListening(true); setOrbState("listening"); setTranscript(""); };
    recognition.onresult = (e: any) => {
      let final = "", interim = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setTranscript(final || interim);
      if (final) processInput(final);
    };
    recognition.onend = () => { setIsListening(false); if (orbState === "listening") setOrbState("idle"); };
    recognition.onerror = () => { setIsListening(false); setOrbState("idle"); };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, orbState, processInput, toast]);

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Header */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-2">
          <Hexagon className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-text-primary">Friday</span>
          <span className={clsx("text-[9px] font-bold px-2 py-0.5 rounded-full border",
            isLive ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
          )}>
            {isLive ? "LIVE" : "SIMULATED"}
          </span>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg hover:bg-white/[0.04] text-text-muted hover:text-primary transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute top-14 right-6 z-20 glass-card p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-primary">API Settings</span>
            <button onClick={() => setShowSettings(false)} className="text-text-muted hover:text-text-secondary"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-ant-api03-..."
              className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-text-primary font-mono w-full focus:outline-none focus:border-primary/30" />
          </div>
          <button onClick={saveKey} className="w-full py-2 rounded-lg bg-primary/15 border border-primary/20 text-xs font-bold text-primary hover:bg-primary/25 transition-colors">
            Save Key
          </button>
          <p className="text-[9px] text-text-muted mt-2">Your key stays in your browser. Get one at console.anthropic.com</p>
          <div className="mt-3 pt-3 border-t border-white/[0.05]">
            <span className="text-[9px] text-text-muted">Memory: {getMemory().length} facts stored</span>
          </div>
        </div>
      )}

      {/* Orb */}
      <div className="flex-1 flex items-center justify-center w-full max-w-[480px]">
        <VoiceOrb state={orbState} analyser={analyser} className="w-full h-full" />
      </div>

      {/* Transcript + Response */}
      <div className="absolute bottom-32 text-center max-w-2xl px-6 z-10">
        {transcript && (
          <p className="text-[11px] text-text-secondary mb-2 opacity-50 italic">&ldquo;{transcript}&rdquo;</p>
        )}
        <p className="text-sm text-text-primary font-medium leading-relaxed max-h-[120px] overflow-y-auto">
          {response.split(/(\*\*.*?\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j} className="text-primary font-bold">{part.slice(2, -2)}</strong>
              : <span key={j}>{part}</span>
          )}
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 flex items-center gap-4 z-10">
        <button onClick={() => setIsMuted(!isMuted)}
          className={clsx("w-10 h-10 rounded-full flex items-center justify-center transition-all border",
            isMuted ? "bg-danger/15 text-danger border-danger/25" : "bg-white/[0.03] text-text-muted border-white/[0.06] hover:text-text-secondary"
          )}>
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button onClick={toggleListening}
          className={clsx("w-16 h-16 rounded-full flex items-center justify-center transition-all border-2",
            isListening ? "bg-danger/15 text-danger border-danger/30 shadow-lg shadow-danger/20"
            : orbState === "speaking" ? "bg-success/15 text-success border-success/30 shadow-lg shadow-success/20"
            : "bg-primary/15 text-primary border-primary/25 hover:bg-primary/25 shadow-lg shadow-primary/20"
          )}>
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06]">
          <span className={clsx("text-[8px] font-bold uppercase tracking-wider",
            orbState === "idle" && "text-text-muted",
            orbState === "listening" && "text-primary",
            orbState === "thinking" && "text-warning",
            orbState === "speaking" && "text-success",
          )}>{orbState}</span>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-1 text-[9px] text-text-muted z-10">
        Space to talk · {STATS.totalSkills.toLocaleString()} skills · {STATS.totalAgents} agents · {isLive ? "Claude API Live" : "Add API key for full power"}
      </div>
    </div>
  );
}
