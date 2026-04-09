"use client";

import { useState } from "react";
import { Zap, Terminal, Play, Copy, Check, Search } from "lucide-react";
import GlassCard from "./GlassCard";
import { QUICK_ACTIONS } from "@/data/friday-data";
import clsx from "clsx";

export default function ActionsPanel() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(QUICK_ACTIONS.map((a) => a.category))];

  const filtered = QUICK_ACTIONS.filter(
    (a) =>
      (!search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.command.toLowerCase().includes(search.toLowerCase())) &&
      (!selectedCategory || a.category === selectedCategory)
  );

  const handleCopy = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedId(command);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2
          className="text-xl font-bold text-text-primary tracking-wide"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          QUICK ACTIONS
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          Launch skills, run commands, trigger agents instantly
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="glass-card rounded-xl flex items-center gap-3 px-4 py-2.5 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions..."
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
              !selectedCategory
                ? "bg-primary-dim text-primary"
                : "glass-card text-text-muted hover:text-text-secondary"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-primary-dim text-primary"
                  : "glass-card text-text-muted hover:text-text-secondary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
        {filtered.map((action) => (
          <GlassCard
            key={action.command}
            className="relative overflow-hidden group cursor-pointer"
          >
            {/* Ambient glow */}
            <div
              className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500"
              style={{ background: action.color }}
            />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${action.color}15` }}
                >
                  <Zap className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
                  style={{ background: `${action.color}12`, color: action.color }}
                >
                  {action.category}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-text-primary">{action.name}</h4>
              <p className="text-[11px] text-text-muted mt-0.5">{action.description}</p>

              {/* Command */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                <Terminal className="w-3 h-3 text-text-muted" />
                <code className="text-[11px] font-mono text-primary flex-1">
                  {action.command}
                </code>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(action.command);
                  }}
                  className="p-1 rounded hover:bg-white/[0.05] transition-colors"
                >
                  {copiedId === action.command ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <Copy className="w-3 h-3 text-text-muted" />
                  )}
                </button>
                <button className="p-1 rounded hover:bg-primary-dim transition-colors group/play">
                  <Play className="w-3 h-3 text-text-muted group-hover/play:text-primary" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Command Palette Hint */}
      <GlassCard className="flex items-center justify-center gap-3 py-3">
        <Terminal className="w-4 h-4 text-text-muted" />
        <span className="text-xs text-text-secondary">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-border-glass text-primary">
            /
          </kbd>{" "}
          in Claude Code to run any command directly
        </span>
      </GlassCard>
    </div>
  );
}
