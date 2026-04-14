"use client";

/**
 * F.R.I.D.A.Y. — Full-screen voice-first AI interface.
 * Direct adaptation of ethanplusai/jarvis.
 * Orb fills the screen, voice always-on, minimal controls.
 * Dashboard accessible via menu.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, MoreVertical } from "lucide-react";
import VoiceOrb, { type OrbState } from "@/components/VoiceOrb";
import { MODELS, getActiveModelId, hasKey, hasAnyKey, callAPI, callAllModels, callFast } from "@/lib/model-configs";
import { fridayBrain } from "@/lib/friday-brain";
import { fishSpeak, hasFishKey, createFishAudioPlayer } from "@/lib/fish-tts";
import FridaySettings from "@/components/FridaySettings";
import { ToastProvider } from "@/components/ToastSystem";
import { AgentModalProvider } from "@/components/AgentModal";
import clsx from "clsx";

// Lazy-load dashboard for menu access
import dynamic from "next/dynamic";
const DashboardView = dynamic(() => import("@/components/DashboardView"), { ssr: false });

// ─── Memory ───────────────────────────────────────────────────────
function getMemory(): string[] {
  try { return JSON.parse(localStorage.getItem("friday-memory") || "[]"); } catch { return []; }
}
function addMemory(fact: string) {
  const mem = getMemory();
  mem.push(fact);
  localStorage.setItem("friday-memory", JSON.stringify(mem.slice(-50)));
}

export default function JarvisApp() {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [model, setModel] = useState("claude");
  const [mounted, setMounted] = useState(false);
  const [fishAnalyser, setFishAnalyser] = useState<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const fishPlayerRef = useRef<ReturnType<typeof createFishAudioPlayer> | null>(null);

  const isLive = mounted && hasKey(model);

  useEffect(() => {
    setMounted(true);
    synthRef.current = window.speechSynthesis;
    setModel(getActiveModelId());
    // Create Fish Audio player for JARVIS voice
    const player = createFishAudioPlayer();
    fishPlayerRef.current = player;
    setFishAnalyser(player.getAnalyser());
    player.onFinished(() => setOrbState("idle"));
  }, []);

  // Settings changed
  useEffect(() => {
    const handler = () => setModel(getActiveModelId());
    window.addEventListener("friday-settings-changed", handler);
    return () => window.removeEventListener("friday-settings-changed", handler);
  }, []);

  // ─── Speech synthesis (Fish Audio JARVIS voice → browser fallback) ───
  const speak = useCallback(async (text: string) => {
    if (isMuted) { setOrbState("idle"); return; }

    setOrbState("speaking");

    // Try Fish Audio TTS first (JARVIS voice)
    if (hasFishKey() && fishPlayerRef.current) {
      const audio = await fishSpeak(text);
      if (audio) {
        fishPlayerRef.current.play(audio);
        return; // onFinished callback handles → idle
      }
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
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onend = () => setOrbState("idle");
    utterance.onerror = () => setOrbState("idle");
    synthRef.current.speak(utterance);
  }, [isMuted]);

  // ─── Process input (shared by voice + text) ─────────────────────
  const processInput = useCallback(async (text: string) => {
    setTranscript(text);
    setOrbState("thinking");
    setResponse("");

    const lower = text.toLowerCase();
    if (lower.includes("remember") || lower.includes("my name is") || lower.includes("i like") || lower.includes("i work")) {
      addMemory(text);
    }

    let reply: string;
    const newHistory = [...history, { role: "user", content: text }];

    // Full-power API call with tools — fridayBrain only if network is completely dead
    try {
      reply = await callFast(newHistory);
    } catch {
      reply = fridayBrain(text);
    }

    setResponse(reply);
    setHistory([...newHistory, { role: "assistant", content: reply }].slice(-30));
    speak(reply);
  }, [model, isLive, history, speak]);

  // ─── Text send ──────────────────────────────────────────────────
  const handleTextSend = useCallback(() => {
    const text = textInput.trim();
    if (!text || orbState === "thinking") return;
    setTextInput("");
    processInput(text);
  }, [textInput, orbState, processInput]);

  // ─── Voice recognition ──────────────────────────────────────────
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
    if (!SR) return;
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
  }, [isListening, orbState, processInput]);

  // Spacebar
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

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = () => setShowMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showMenu]);

  const activeModelConfig = MODELS.find((m) => m.id === model);

  // ─── Dashboard mode ─────────────────────────────────────────────
  if (showDashboard) {
    return (
      <ToastProvider>
        <AgentModalProvider>
          <DashboardView onBack={() => setShowDashboard(false)} />
        </AgentModalProvider>
      </ToastProvider>
    );
  }

  // ─── JARVIS full-screen voice interface ─────────────────────────
  return (
    <ToastProvider>
      <AgentModalProvider>
        <div className="jarvis-root" suppressHydrationWarning>
          <FridaySettings open={showSettings} onClose={() => setShowSettings(false)} />

          {/* Orb — fills entire screen, CLICK TO TALK */}
          <div className="jarvis-canvas" onClick={() => { if (orbState !== "thinking") toggleListening(); }} style={{ cursor: orbState === "thinking" ? "wait" : "pointer" }}>
            <VoiceOrb state={orbState} analyser={fishAnalyser} className="w-full h-full" />
          </div>

          {/* Controls — top right, matching reference exactly */}
          <div className="jarvis-controls">
            <button
              onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); if (!isMuted) { recognitionRef.current?.stop(); setIsListening(false); setOrbState("idle"); } }}
              className={clsx("jarvis-btn", isMuted && "jarvis-btn-muted")}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="jarvis-btn"
              title="Menu"
            >
              <MoreVertical className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Dropdown menu — matching reference */}
          {showMenu && (
            <div className="jarvis-menu">
              <button onClick={() => { setShowSettings(true); setShowMenu(false); }}>Settings</button>
              <button onClick={() => { setShowDashboard(true); setShowMenu(false); }}>Dashboard</button>
              <button onClick={() => { setShowMenu(false); window.location.reload(); }}>Restart</button>
            </div>
          )}

          {/* Hint — only shown on first load */}
          {orbState === "idle" && !transcript && (
            <div className="jarvis-hint">tap the orb to speak</div>
          )}

          {/* Label */}
          <div className="jarvis-label">F.R.I.D.A.Y.</div>
        </div>
      </AgentModalProvider>
    </ToastProvider>
  );
}
