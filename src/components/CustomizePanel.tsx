"use client";

import { useState, useEffect } from "react";
import {
  X, Eye, EyeOff, Palette, Layout, Gauge, Monitor, RotateCcw,
  TrendingUp, Newspaper, Clock, Cloud, Activity, Zap,
} from "lucide-react";
import {
  type DashboardConfig, type WidgetId, type AccentColor, type TickerSpeed,
  ACCENT_COLORS, TICKER_SPEEDS, WIDGET_META, DEFAULT_CONFIG,
  loadConfig, saveConfig,
} from "@/lib/dashboard-config";
import clsx from "clsx";

const WIDGET_ICONS: Record<WidgetId, React.ReactNode> = {
  market:  <TrendingUp className="w-3.5 h-3.5" />,
  news:    <Newspaper  className="w-3.5 h-3.5" />,
  clock:   <Clock      className="w-3.5 h-3.5" />,
  weather: <Cloud      className="w-3.5 h-3.5" />,
  system:  <Activity   className="w-3.5 h-3.5" />,
  actions: <Zap        className="w-3.5 h-3.5" />,
};

type Props = {
  open: boolean;
  onClose: () => void;
  config: DashboardConfig;
  onChange: (config: DashboardConfig) => void;
};

export default function CustomizePanel({ open, onClose, config, onChange }: Props) {
  function update(partial: Partial<DashboardConfig>) {
    const next = { ...config, ...partial };
    onChange(next);
    saveConfig(next);
  }

  function toggleWidget(id: WidgetId) {
    const hidden = config.hiddenWidgets.includes(id)
      ? config.hiddenWidgets.filter((w) => w !== id)
      : [...config.hiddenWidgets, id];
    update({ hiddenWidgets: hidden });
  }

  function moveWidget(id: WidgetId, to: "left" | "right") {
    const left = config.left.filter((w) => w !== id);
    const right = config.right.filter((w) => w !== id);
    if (to === "left") left.push(id);
    else right.push(id);
    update({ left, right });
  }

  function resetAll() {
    onChange({ ...DEFAULT_CONFIG });
    saveConfig({ ...DEFAULT_CONFIG });
  }

  if (!open) return null;

  const allWidgets: WidgetId[] = ["market", "news", "clock", "weather", "system", "actions"];

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity" />

      {/* Panel — slides in from right */}
      <div
        className="absolute top-0 right-0 w-[380px] max-w-full h-full overflow-y-auto"
        style={{
          background: "rgba(8, 10, 18, 0.95)",
          borderLeft: "1px solid rgba(14, 165, 233, 0.1)",
          backdropFilter: "blur(24px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-primary tracking-wide">Customize Dashboard</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-text-muted"><X className="w-4 h-4" /></button>
        </div>

        {/* ── Accent Color ── */}
        <section className="px-5 py-4 border-b border-white/[0.04]">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[2px] mb-3">Accent Color</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(ACCENT_COLORS) as [AccentColor, { hex: string; label: string }][]).map(([key, { hex, label }]) => (
              <button
                key={key}
                onClick={() => update({ accentColor: key })}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[10px] font-semibold",
                  config.accentColor === key
                    ? "border-white/[0.15] bg-white/[0.06] text-text-primary"
                    : "border-white/[0.04] text-text-muted hover:border-white/[0.08]"
                )}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: hex, boxShadow: config.accentColor === key ? `0 0 8px ${hex}` : "none" }} />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Widget Visibility ── */}
        <section className="px-5 py-4 border-b border-white/[0.04]">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[2px] mb-3">Widgets</h3>
          <div className="space-y-1.5">
            {allWidgets.map((id) => {
              const hidden = config.hiddenWidgets.includes(id);
              const inLeft = config.left.includes(id);
              return (
                <div key={id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/[0.02]">
                  <div className="text-primary">{WIDGET_ICONS[id]}</div>
                  <span className="text-xs font-semibold text-text-primary flex-1">{WIDGET_META[id].label}</span>

                  {/* Column toggle */}
                  {!hidden && config.layoutMode === "two-col" && (
                    <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-0.5">
                      <button
                        onClick={() => moveWidget(id, "left")}
                        className={clsx("px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all",
                          inLeft ? "bg-primary/20 text-primary" : "text-text-muted hover:text-text-secondary"
                        )}
                      >L</button>
                      <button
                        onClick={() => moveWidget(id, "right")}
                        className={clsx("px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all",
                          !inLeft ? "bg-primary/20 text-primary" : "text-text-muted hover:text-text-secondary"
                        )}
                      >R</button>
                    </div>
                  )}

                  {/* Visibility toggle */}
                  <button onClick={() => toggleWidget(id)} className={clsx("p-1 rounded-lg transition-colors", hidden ? "text-danger/60 hover:text-danger" : "text-success/60 hover:text-success")}>
                    {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Layout Mode ── */}
        <section className="px-5 py-4 border-b border-white/[0.04]">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[2px] mb-3">Layout</h3>
          <div className="flex gap-2">
            {([["two-col", "Two Column", "Default layout with sidebar"] as const, ["one-col", "Single Column", "Full-width stacked layout"] as const]).map(([mode, label, desc]) => (
              <button
                key={mode}
                onClick={() => update({ layoutMode: mode })}
                className={clsx(
                  "flex-1 px-3 py-3 rounded-xl border transition-all text-left",
                  config.layoutMode === mode
                    ? "border-primary/25 bg-primary/10"
                    : "border-white/[0.06] hover:border-white/[0.1]"
                )}
              >
                <Layout className={clsx("w-4 h-4 mb-1", config.layoutMode === mode ? "text-primary" : "text-text-muted")} />
                <div className="text-[10px] font-bold text-text-primary">{label}</div>
                <div className="text-[8px] text-text-muted mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Ticker ── */}
        <section className="px-5 py-4 border-b border-white/[0.04]">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[2px] mb-3">Stock Ticker</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-secondary">Show Ticker</span>
            <button
              onClick={() => update({ tickerVisible: !config.tickerVisible })}
              className={clsx("w-9 h-5 rounded-full transition-all relative",
                config.tickerVisible ? "bg-primary/30" : "bg-white/[0.08]"
              )}
            >
              <div className={clsx("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                config.tickerVisible ? "left-[18px]" : "left-0.5"
              )} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Speed</span>
            <div className="flex gap-1">
              {(Object.entries(TICKER_SPEEDS) as [TickerSpeed, { dur: string; label: string }][]).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => update({ tickerSpeed: key })}
                  className={clsx("px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all",
                    config.tickerSpeed === key ? "bg-primary/20 text-primary" : "text-text-muted hover:text-text-secondary"
                  )}
                >{label}</button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Compact Mode ── */}
        <section className="px-5 py-4 border-b border-white/[0.04]">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[2px] mb-3">Display</h3>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-text-secondary">Compact Mode</div>
              <div className="text-[9px] text-text-muted">Tighter spacing, smaller text</div>
            </div>
            <button
              onClick={() => update({ compact: !config.compact })}
              className={clsx("w-9 h-5 rounded-full transition-all relative",
                config.compact ? "bg-primary/30" : "bg-white/[0.08]"
              )}
            >
              <div className={clsx("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                config.compact ? "left-[18px]" : "left-0.5"
              )} />
            </button>
          </div>

          {/* Background theme */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Background</span>
            <div className="flex gap-1">
              {(["cosmic", "dark", "midnight"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => update({ bgTheme: theme })}
                  className={clsx("px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all",
                    config.bgTheme === theme ? "bg-primary/20 text-primary" : "text-text-muted hover:text-text-secondary"
                  )}
                >{theme}</button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Reset ── */}
        <section className="px-5 py-4">
          <button
            onClick={resetAll}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-danger/20 text-danger/70 text-xs font-semibold hover:bg-danger/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
          </button>
        </section>
      </div>
    </div>
  );
}
