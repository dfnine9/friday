"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Settings, Hexagon, X, Send } from "lucide-react";
import VoiceOrb, { type OrbState } from "@/components/VoiceOrb";
import { useToast } from "@/components/ToastSystem";
import { STATS } from "@/data/friday-data";
import { MODELS, getActiveModelId, hasKey, hasAnyKey, callAPI, callAllModels } from "@/lib/model-configs";
import { fridayBrain } from "@/lib/friday-brain";
import { fishSpeak, hasFishKey, createFishAudioPlayer } from "@/lib/fish-tts";
import FridaySettings from "@/components/FridaySettings";
import clsx from "clsx";

// ═══ MEMORY SYSTEM ═══
function getMemory(): string[] {
  try { return JSON.parse(localStorage.getItem("friday-memory") || "[]"); } catch { return []; }
}
function addMemory(fact: string) {
  const mem = getMemory();
  mem.push(fact);
  localStorage.setItem("friday-memory", JSON.stringify(mem.slice(-50)));
}

export default function VoiceTab() {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Press Space or tap the mic to talk to Friday.");
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [model, setModel] = useState("claude");
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const fishPlayerRef = useRef<ReturnType<typeof createFishAudioPlayer> | null>(null);
  const { toast } = useToast();

  const isLive = hasKey(model);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    setModel(getActiveModelId());
    const player = createFishAudioPlayer();
    fishPlayerRef.current = player;
    player.onFinished(() => setOrbState("idle"));
  }, []);

  // Re-read model when settings change
  useEffect(() => {
    const handler = () => setModel(getActiveModelId());
    window.addEventListener("friday-settings-changed", handler);
    return () => window.removeEventListener("friday-settings-changed", handler);
  }, []);

  // Nav-action events from dropdown menus
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail;
      if (action === "open-settings") setShowSettings(true);
      if (action === "show-commands") setShowCommands(true);
    };
    window.addEventListener("nav-action", handler);
    return () => window.removeEventListener("nav-action", handler);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (isMuted) { setOrbState("idle"); return; }
    setOrbState("speaking");

    // Try Fish Audio TTS (JARVIS voice) first
    if (hasFishKey() && fishPlayerRef.current) {
      const audio = await fishSpeak(text);
      if (audio) { fishPlayerRef.current.play(audio); return; }
    }

    // Fallback: browser SpeechSynthesis
    if (!synthRef.current) { setOrbState("idle"); return; }
    synthRef.current.cancel();
    const clean = text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/#{1,3}\s/g, "").replace(/\n/g, ". ");
    const utterance = new SpeechSynthesisUtterance(clean);
    const voices = synthRef.current.getVoices();
    const friday = voices.find((v) => v.name === "Moira")
      || voices.find((v) => v.name.includes("Moira"))
      || voices.find((v) => v.name === "Samantha")
      || voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
      || voices.find((v) => v.lang.startsWith("en-"));
    if (friday) utterance.voice = friday;
    utterance.onend = () => setOrbState("idle");
    utterance.onerror = () => setOrbState("idle");
    synthRef.current.speak(utterance);
  }, [isMuted]);

  const processInput = useCallback(async (text: string) => {
    setTranscript(text);
    setOrbState("thinking");
    setResponse("...");

    // Auto-learn memory
    const lower = text.toLowerCase();
    if (lower.includes("remember") || lower.includes("my name is") || lower.includes("i like") || lower.includes("i work") || lower.includes("i live")) {
      addMemory(text);
    }

    let reply: string;
    const newHistory = [...history, { role: "user" as const, content: text }];

    try {
      if (model === "all" && hasAnyKey()) {
        reply = await callAllModels(newHistory) || fridayBrain(text);
      } else if (isLive) {
        reply = await callAPI(model, newHistory);
      } else {
        reply = fridayBrain(text);
      }
    } catch {
      reply = fridayBrain(text);
    }

    setResponse(reply);
    setHistory([...newHistory, { role: "assistant" as const, content: reply }].slice(-30));
    speak(reply);
  }, [model, isLive, history, speak]);

  const handleTextSend = useCallback(() => {
    const text = textInput.trim();
    if (!text || orbState === "thinking") return;
    setTextInput("");
    processInput(text);
  }, [textInput, orbState, processInput]);

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

  // Spacebar toggle — skip when typing in text input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.code === "Space" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        toggleListening();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleListening]);

  const activeModelConfig = MODELS.find((m) => m.id === model);

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden px-4">
      <FridaySettings open={showSettings} onClose={() => setShowSettings(false)} />

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-2">
          <Hexagon className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-text-primary">Friday</span>
          <span className={clsx("text-[9px] font-bold px-2 py-0.5 rounded-full border",
            isLive ? "bg-success/10 text-success border-success/20" : "bg-primary/10 text-primary border-primary/20"
          )}>
            {isLive ? `LIVE — ${activeModelConfig?.label.split(" ")[0] || model}` : "OFFLINE"}
          </span>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg hover:bg-white/[0.04] text-text-muted hover:text-primary transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Voice commands panel */}
      {showCommands && (
        <div className="absolute top-14 right-6 z-20 glass-card p-4 w-80 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-primary">Voice Commands</span>
            <button onClick={() => setShowCommands(false)} className="text-text-muted hover:text-text-secondary"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-2">
            {[
              { cmd: "Space bar", desc: "Push-to-talk toggle" },
              { cmd: "\"What can you do?\"", desc: "List capabilities" },
              { cmd: "\"Show status\"", desc: "System health report" },
              { cmd: "\"What's the weather?\"", desc: "Current conditions" },
              { cmd: "\"Calculate 15 * 37\"", desc: "Math evaluation" },
              { cmd: "\"What is [topic]?\"", desc: "Definitions & knowledge" },
              { cmd: "\"Tell me a joke\"", desc: "Tech humor" },
              { cmd: "\"Remember [fact]\"", desc: "Save to memory" },
              { cmd: "\"Help me code [task]\"", desc: "Code generation" },
              { cmd: "\"Recommend a book\"", desc: "Recommendations" },
            ].map((c) => (
              <div key={c.cmd} className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03]">
                <code className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono shrink-0">{c.cmd}</code>
                <span className="text-[10px] text-text-muted">{c.desc}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-white/[0.05]">
            <p className="text-[9px] text-text-muted">Friday works offline for weather, time, math, definitions, code, and 50+ topics. Connect an API key for unlimited AI.</p>
          </div>
        </div>
      )}

      {/* Orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <VoiceOrb state={orbState} analyser={analyser} className="w-full h-full" />
      </div>

      {/* Transcript + Response */}
      <div className="absolute bottom-44 text-center max-w-2xl px-6 z-10">
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

      {/* Text input */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-10">
        <form onSubmit={(e) => { e.preventDefault(); handleTextSend(); }} className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={orbState === "thinking" ? "Friday is thinking..." : "Type a message to Friday..."}
            disabled={orbState === "thinking"}
            className="bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/25 w-full backdrop-blur-sm"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || orbState === "thinking"}
            className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/25 transition-colors disabled:opacity-30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 flex items-center gap-4 z-10">
        <button onClick={() => setIsMuted(!isMuted)}
          className={clsx("w-10 h-10 rounded-full flex items-center justify-center transition-all border",
            isMuted ? "bg-danger/15 text-danger border-danger/25" : "bg-white/[0.03] text-text-muted border-white/[0.06] hover:text-text-secondary"
          )}>
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button onClick={toggleListening}
          className={clsx("w-14 h-14 rounded-full flex items-center justify-center transition-all border-2",
            isListening ? "bg-danger/15 text-danger border-danger/30 shadow-lg shadow-danger/20"
            : orbState === "speaking" ? "bg-success/15 text-success border-success/30 shadow-lg shadow-success/20"
            : "bg-primary/15 text-primary border-primary/25 hover:bg-primary/25 shadow-lg shadow-primary/20"
          )}>
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
    </div>
  );
}
