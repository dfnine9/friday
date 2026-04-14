"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, Check, Zap, Volume2 } from "lucide-react";
import { MODELS, getActiveModelId, setActiveModelId } from "@/lib/model-configs";
import { getFishApiKey, getFishVoiceId, setFishApiKey, setFishVoiceId, hasFishKey } from "@/lib/fish-tts";
import { API_BASE } from "@/lib/api-base";
import clsx from "clsx";

type Props = { open: boolean; onClose: () => void };

export default function FridaySettings({ open, onClose }: Props) {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [activeModel, setActive] = useState("claude");
  const [fishKey, setFishKeyState] = useState("");
  const [fishVoice, setFishVoiceState] = useState("");

  useEffect(() => {
    if (!open) return;
    const loaded: Record<string, string> = {};
    for (const m of MODELS) {
      loaded[m.id] = localStorage.getItem(m.keyName) || "";
    }
    setKeys(loaded);
    setActive(getActiveModelId());
    setFishKeyState(getFishApiKey());
    setFishVoiceState(getFishVoiceId());
  }, [open]);

  function save() {
    for (const m of MODELS) {
      const val = keys[m.id]?.trim();
      if (val) localStorage.setItem(m.keyName, val);
      else localStorage.removeItem(m.keyName);
    }
    setActiveModelId(activeModel);
    if (fishKey.trim()) setFishApiKey(fishKey.trim());
    if (fishVoice.trim()) setFishVoiceId(fishVoice.trim());

    // Also write to sidecar config file (~/friday-config.json) for desktop mode
    const sidecarConfig: Record<string, string> = {};
    const claudeKey = keys["claude"]?.trim();
    if (claudeKey) sidecarConfig.ANTHROPIC_API_KEY = claudeKey;
    if (fishKey.trim()) sidecarConfig.FISH_API_KEY = fishKey.trim();
    if (fishVoice.trim()) sidecarConfig.FISH_VOICE_ID = fishVoice.trim();
    if (Object.keys(sidecarConfig).length > 0) {
      fetch(`${API_BASE}/api/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sidecarConfig),
      }).catch(() => {}); // Silently fail if sidecar not running
    }

    window.dispatchEvent(new CustomEvent("friday-settings-changed"));
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "rgba(10,10,26,0.96)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-primary">Friday AI Settings</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-text-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="px-5 text-[10px] text-text-muted mb-4">
          Connect your API keys to unlock full AI power. Keys are stored locally in your browser — never sent to our servers.
        </p>

        {/* Model cards */}
        <div className="px-5 space-y-2.5 max-h-[400px] overflow-y-auto">
          {MODELS.map((m) => {
            const connected = !!(keys[m.id]?.trim());
            return (
              <div
                key={m.id}
                className={clsx(
                  "rounded-xl border p-3 transition-all",
                  connected ? "border-white/[0.08] bg-white/[0.02]" : "border-white/[0.04] bg-transparent"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: connected ? m.color : "rgba(255,255,255,0.15)", boxShadow: connected ? `0 0 6px ${m.color}` : "none" }} />
                    <span className="text-xs font-bold text-text-primary">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {connected && (
                      <span className="text-[9px] font-bold text-success flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> CONNECTED
                      </span>
                    )}
                    <a
                      href={m.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-primary transition-colors"
                      title="Get API key"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <input
                  type="password"
                  value={keys[m.id] || ""}
                  onChange={(e) => setKeys({ ...keys, [m.id]: e.target.value })}
                  placeholder={m.placeholder}
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[11px] text-text-primary font-mono placeholder:text-text-muted/50 focus:outline-none focus:border-primary/25 transition-colors"
                />
              </div>
            );
          })}
        </div>

        {/* Fish Audio Voice */}
        <div className="px-5 mt-4">
          <div className="rounded-xl border p-3 border-white/[0.06] bg-white/[0.01]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-text-primary">JARVIS Voice (Fish Audio)</span>
              </div>
              <div className="flex items-center gap-2">
                {fishKey.trim() && (
                  <span className="text-[9px] font-bold text-success flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> ACTIVE
                  </span>
                )}
                <a href="https://fish.audio/app/api-keys" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[9px] text-text-muted block mb-1">Fish Audio API Key</label>
                <input type="password" value={fishKey} onChange={(e) => setFishKeyState(e.target.value)}
                  placeholder="e3f52b..."
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[11px] text-text-primary font-mono placeholder:text-text-muted/50 focus:outline-none focus:border-primary/25" />
              </div>
              <div>
                <label className="text-[9px] text-text-muted block mb-1">Voice Model ID</label>
                <input type="text" value={fishVoice} onChange={(e) => setFishVoiceState(e.target.value)}
                  placeholder="761d793cc4bb..."
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[11px] text-text-primary font-mono placeholder:text-text-muted/50 focus:outline-none focus:border-primary/25" />
              </div>
            </div>
            <p className="text-[8px] text-text-muted mt-2">When connected, Friday speaks with the JARVIS voice clone. Without it, browser speech synthesis is used as fallback.</p>
          </div>
        </div>

        {/* Active model selector */}
        <div className="px-5 mt-4">
          <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Active Model</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {MODELS.map((m) => {
              const connected = !!(keys[m.id]?.trim());
              const isActive = activeModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActive(m.id)}
                  disabled={!connected}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                    isActive
                      ? "text-white border-white/[0.15]"
                      : connected
                        ? "text-text-muted border-transparent hover:text-text-secondary hover:border-white/[0.06]"
                        : "text-text-muted/30 border-transparent cursor-not-allowed"
                  )}
                  style={isActive ? { background: `${m.color}20`, borderColor: `${m.color}40` } : {}}
                >
                  {m.label.split(" ")[0]}
                </button>
              );
            })}
            <button
              onClick={() => setActive("all")}
              className={clsx(
                "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                activeModel === "all"
                  ? "bg-danger/15 text-danger border-danger/25"
                  : "text-text-muted border-transparent hover:text-text-secondary"
              )}
            >
              All
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="px-5 pt-4 pb-5">
          <button
            onClick={save}
            className="w-full py-2.5 rounded-xl bg-primary/15 border border-primary/20 text-xs font-bold text-primary hover:bg-primary/25 transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
