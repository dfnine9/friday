// ═══════════════════════════════════════════════════════════════
// Fish Audio TTS — JARVIS/FRIDAY voice synthesis
// Replaces browser SpeechSynthesis with Fish Audio's voice clone.
// Returns AudioBuffer playable through AudioContext + AnalyserNode
// so the particle orb reacts to the voice.
// ═══════════════════════════════════════════════════════════════

import { API_BASE } from "@/lib/api-base";
const FISH_TTS_URL = "https://api.fish.audio/v1/tts";
const FISH_API_KEY = "";
const FISH_VOICE_ID = "";
const STORAGE_KEY_API = "friday-fish-api-key";
const STORAGE_KEY_VOICE = "friday-fish-voice-id";

export function getFishApiKey(): string {
  if (typeof window === "undefined") return FISH_API_KEY;
  return localStorage.getItem(STORAGE_KEY_API) || FISH_API_KEY;
}

export function getFishVoiceId(): string {
  if (typeof window === "undefined") return FISH_VOICE_ID;
  return localStorage.getItem(STORAGE_KEY_VOICE) || FISH_VOICE_ID;
}

export function setFishApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY_API, key);
}

export function setFishVoiceId(id: string) {
  localStorage.setItem(STORAGE_KEY_VOICE, id);
}

export function hasFishKey(): boolean {
  return true; // JARVIS voice always available — key hardcoded
}

/** Strip markdown for cleaner TTS output */
function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#{1,3}\s/g, "")
    .replace(/\n/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Synthesize speech via Fish Audio TTS API.
 * Returns raw ArrayBuffer of audio (mp3) that can be decoded by AudioContext.
 * Falls back to null if no API key or request fails.
 */
export async function fishSpeak(text: string): Promise<ArrayBuffer | null> {
  const clean = cleanForSpeech(text);
  if (!clean) return null;

  try {
    // Call our own API route (avoids CORS, keeps key server-side)
    const res = await fetch(`${API_BASE}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: clean }),
    });

    if (!res.ok) {
      console.warn(`[fish-tts] ${res.status}: ${res.statusText}`);
      return null;
    }

    return await res.arrayBuffer();
  } catch (err) {
    console.warn("[fish-tts] request failed:", err);
    return null;
  }
}

// ─── AudioPlayer for Fish Audio output ────────────────────────
// Manages an AudioContext + AnalyserNode so the orb visualization
// can react to the JARVIS voice in real-time.

export interface FishAudioPlayer {
  play(buffer: ArrayBuffer): Promise<void>;
  stop(): void;
  getAnalyser(): AnalyserNode;
  onFinished(cb: () => void): void;
}

export function createFishAudioPlayer(): FishAudioPlayer {
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  analyser.connect(ctx.destination);

  let currentSource: AudioBufferSourceNode | null = null;
  let finishedCb: (() => void) | null = null;

  return {
    async play(arrayBuffer: ArrayBuffer) {
      // Resume if suspended (browser autoplay policy)
      if (ctx.state === "suspended") await ctx.resume();

      // Stop any current playback
      if (currentSource) {
        try { currentSource.stop(); } catch { /* already stopped */ }
        currentSource = null;
      }

      try {
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyser);
        currentSource = source;

        source.onended = () => {
          if (currentSource === source) {
            currentSource = null;
            finishedCb?.();
          }
        };

        source.start();
      } catch (err) {
        console.error("[fish-audio] decode error:", err);
        finishedCb?.();
      }
    },

    stop() {
      if (currentSource) {
        try { currentSource.stop(); } catch { /* already stopped */ }
        currentSource = null;
      }
    },

    getAnalyser() {
      return analyser;
    },

    onFinished(cb: () => void) {
      finishedCb = cb;
    },
  };
}
