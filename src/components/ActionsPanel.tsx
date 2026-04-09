"use client";

import { useState } from "react";
import { Zap, Terminal, Play, Copy, Check, Search, Keyboard, Command } from "lucide-react";
import GlassCard, { SectionHeader } from "./GlassCard";
import { QUICK_ACTIONS } from "@/data/friday-data";
import clsx from "clsx";

export default function ActionsPanel() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(QUICK_ACTIONS.map((a) => a.category))];
  const filtered = QUICK_ACTIONS.filter(
    (a) => (!search || a.name.toLowerCase().includes(search.toLowerCase()) || a.command.toLowerCase().includes(search.toLowerCase())) &&
      (!selectedCategory || a.category === selectedCategory)
  );

  const handleCopy = (command: string) => { navigator.clipboard.writeText(command); setCopiedId(command); setTimeout(() => setCopiedId(null), 2000); };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <SectionHeader title="Quick Actions" subtitle="Launch skills, run commands, trigger agents — one click" icon={<Zap className="w-5 h-5" />} />

      <div className="space-y-3">
        <div className="glass-card !rounded-2xl flex items-center gap-3 px-5 py-3.5">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search actions or commands..."
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full font-medium" />
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] text-text-muted bg-white/[0.06] border border-white/[0.08] font-mono">/</kbd>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSelectedCategory(null)}
            className={clsx("px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
              !selectedCategory ? "bg-primary/20 text-primary border-primary/25" : "glass-card !py-1.5 !px-3.5 text-text-muted hover:text-text-secondary border-transparent")}>All</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={clsx("px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                selectedCategory === cat ? "bg-primary/20 text-primary border-primary/25" : "glass-card !py-1.5 !px-3.5 text-text-muted hover:text-text-secondary border-transparent")}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {filtered.map((action) => (
          <GlassCard key={action.command} className="group relative overflow-hidden cursor-pointer" luminous>
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500" style={{ background: action.color }} />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${action.color}15`, border: `1px solid ${action.color}20` }}>
                  <Zap className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div className="flex items-center gap-2">
                  {action.hotkey && <kbd className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono border border-white/[0.08] text-text-muted bg-white/[0.04]">{action.hotkey}</kbd>}
                  <span className="text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border"
                    style={{ background: `${action.color}10`, color: action.color, borderColor: `${action.color}20` }}>{action.category}</span>
                </div>
              </div>
              <h4 className="text-sm font-bold text-text-primary">{action.name}</h4>
              <p className="text-[11px] text-text-muted mt-1">{action.description}</p>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.05]">
                <Terminal className="w-3 h-3 text-text-muted shrink-0" />
                <code className="text-[12px] font-mono font-bold text-primary flex-1">{action.command}</code>
                <button onClick={(e) => { e.stopPropagation(); handleCopy(action.command); }} className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                  {copiedId === action.command ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
                </button>
                <button className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors group/play">
                  <Play className="w-3.5 h-3.5 text-text-muted group-hover/play:text-primary transition-colors" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="flex items-center justify-center gap-4 py-4" hover={false}>
        <Keyboard className="w-4 h-4 text-text-muted" />
        <span className="text-xs text-text-secondary font-medium">Press</span>
        <kbd className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] text-primary bg-primary/10 border border-primary/20 font-mono font-bold">
          <Command className="w-3 h-3" />K
        </kbd>
        <span className="text-xs text-text-secondary font-medium">for the command palette, or</span>
        <kbd className="px-2 py-1 rounded-lg text-[11px] text-primary bg-primary/10 border border-primary/20 font-mono font-bold">/</kbd>
        <span className="text-xs text-text-secondary font-medium">in Claude Code</span>
      </GlassCard>
    </div>
  );
}
