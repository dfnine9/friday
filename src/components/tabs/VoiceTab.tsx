"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Hexagon } from "lucide-react";
import VoiceOrb, { type OrbState } from "@/components/VoiceOrb";
import { useToast } from "@/components/ToastSystem";
import { STATS, FRIDAY_META } from "@/data/friday-data";
import clsx from "clsx";

const FRIDAY_SYSTEM_PROMPT = `You are F.R.I.D.A.Y. (Female Replacement Intelligent Digital Assistant Youth). You speak with a direct, slightly Irish-accented personality. You are the successor to J.A.R.V.I.S. Keep responses SHORT — 1-3 sentences max since you're speaking aloud. Be confident, concise, occasionally witty. You have ${STATS.totalSkills} skills and ${STATS.totalAgents} agents at your disposal.`;

async function callClaude(apiKey: string, text: string, history: { role: string; content: string }[]): Promise<string> {
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
        max_tokens: 256, // Short for voice
        system: FRIDAY_SYSTEM_PROMPT,
        messages: [...history, { role: "user", content: text }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text || "I didn't catch that.";
  } catch {
    return "I'm having trouble connecting. Check your API key.";
  }
}

function simResponse(text: string): string {
  const l = text.toLowerCase();
  if (/^(hi|hello|hey)/.test(l)) return "Hello. F.R.I.D.A.Y. online, all systems nominal. What do you need?";
  if (l.includes("status")) return "All systems nominal. 8 neural cores active, 99.97% uptime, 6,502 skills loaded.";
  if (l.includes("who are you")) return "I'm F.R.I.D.A.Y., your autonomous AI assistant. Successor to J.A.R.V.I.S. How can I help?";
  if (l.includes("help")) return "I can help with code, security, DevOps, architecture, and more. Just ask.";
  return "Understood. Could you be more specific about what you need?";
}

export default function VoiceTab() {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Click the microphone or press Space to start speaking.");
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  const apiKey = typeof window !== "undefined" ? localStorage.getItem("friday-api-key") || "" : "";
  const isLive = apiKey.startsWith("sk-ant-");

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
  }, []);

  // Spacebar toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        toggleListening();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  const speak = useCallback((text: string) => {
    if (isMuted || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a female English voice
    const voices = synthRef.current.getVoices();
    const friday = voices.find((v) => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Moira") || (v.lang.startsWith("en") && v.name.toLowerCase().includes("female")))
      || voices.find((v) => v.lang.startsWith("en-") && v.name.includes("Google"))
      || voices.find((v) => v.lang.startsWith("en"));
    if (friday) utterance.voice = friday;
    utterance.rate = 1.05;
    utterance.pitch = 1.1;

    // Create analyser for orb audio reactivity
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const dest = ctx.createMediaStreamDestination();
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 128;

    setOrbState("speaking");
    utterance.onend = () => { setOrbState("idle"); setAnalyser(null); };
    utterance.onerror = () => { setOrbState("idle"); setAnalyser(null); };
    synthRef.current.speak(utterance);
  }, [isMuted]);

  const processInput = useCallback(async (text: string) => {
    setTranscript(text);
    setOrbState("thinking");
    setResponse("...");

    let reply: string;
    if (isLive) {
      reply = await callClaude(apiKey, text, history);
    } else {
      await new Promise((r) => setTimeout(r, 500));
      reply = simResponse(text);
    }

    setResponse(reply);
    setHistory((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: reply }].slice(-20));
    speak(reply);
  }, [apiKey, isLive, history, speak]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setOrbState("idle");
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast("error", "Not Supported", "Speech recognition requires Chrome");
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => { setIsListening(true); setOrbState("listening"); setTranscript(""); };
    recognition.onresult = (e: any) => {
      let final = "";
      let interim = "";
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
      {/* Status text */}
      <div className="absolute top-6 text-center z-10">
        <div className="flex items-center gap-2 justify-center mb-1">
          <Hexagon className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-text-primary">{FRIDAY_META.codename}</span>
        </div>
        <p className="text-[10px] text-text-muted">
          {isLive ? "Live — Claude API" : "Simulated"} · Press Space or click mic · {STATS.totalSkills.toLocaleString()} skills
        </p>
      </div>

      {/* Orb */}
      <div className="flex-1 flex items-center justify-center w-full max-w-[500px]">
        <VoiceOrb state={orbState} analyser={analyser} className="w-full h-full" />
      </div>

      {/* Transcript + Response */}
      <div className="absolute bottom-28 text-center max-w-lg px-4 z-10">
        {transcript && (
          <p className="text-xs text-text-secondary mb-2 opacity-60">&ldquo;{transcript}&rdquo;</p>
        )}
        <p className="text-sm text-text-primary font-medium leading-relaxed">{response}</p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 flex items-center gap-4 z-10">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={clsx("w-10 h-10 rounded-full flex items-center justify-center transition-all",
            isMuted ? "bg-danger/20 text-danger border border-danger/30" : "bg-white/[0.04] text-text-muted border border-white/[0.06] hover:text-text-secondary"
          )}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleListening}
          className={clsx(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all",
            isListening
              ? "bg-danger/20 text-danger border-2 border-danger/40 shadow-lg shadow-danger/20"
              : "bg-primary/20 text-primary border-2 border-primary/30 hover:bg-primary/30 shadow-lg shadow-primary/20"
          )}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.04] border border-white/[0.06]">
          <span className={clsx("text-[9px] font-bold uppercase tracking-wider",
            orbState === "idle" && "text-text-muted",
            orbState === "listening" && "text-primary",
            orbState === "thinking" && "text-warning",
            orbState === "speaking" && "text-success",
          )}>
            {orbState}
          </span>
        </div>
      </div>
    </div>
  );
}
