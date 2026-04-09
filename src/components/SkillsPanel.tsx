"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import GlassCard from "./GlassCard";
import { SKILL_CATEGORIES, TOP_AGENTS } from "@/data/friday-data";
import clsx from "clsx";

export default function SkillsPanel() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = SKILL_CATEGORIES.filter(
    (c) =>
      !search || c.name.toLowerCase().includes(search.toLowerCase())
  ).filter((c) => !selectedCategory || c.name === selectedCategory);

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-text-primary tracking-wide"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            SKILL MATRIX
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            6,502 skills across 12 domains — 942 autonomous agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("grid")}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              view === "grid" ? "bg-primary-dim text-primary" : "text-text-muted hover:text-text-secondary"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              view === "list" ? "bg-primary-dim text-primary" : "text-text-muted hover:text-text-secondary"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card rounded-xl flex items-center gap-3 px-4 py-3">
        <Search className="w-4 h-4 text-text-muted shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skill categories..."
          className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full"
        />
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-[10px] px-2 py-0.5 rounded-full bg-primary-dim text-primary shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {/* Skill Categories */}
      <div>
        <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <Filter className="w-3 h-3" />
          Skill Domains
        </h3>
        <div
          className={clsx(
            "gap-3 stagger",
            view === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "flex flex-col"
          )}
        >
          {filteredCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.name ? null : cat.name)
              }
              className={clsx(
                "glass-card rounded-xl p-4 text-left transition-all duration-200 group",
                selectedCategory === cat.name && "ring-1 ring-primary/30 glow-primary"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: `${cat.color}15`, color: cat.color }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-sm font-semibold text-text-primary">{cat.name}</h4>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="text-lg font-bold font-mono"
                  style={{ fontFamily: "var(--font-oswald)", color: cat.color }}
                >
                  {cat.count}
                </span>
                <span className="text-[10px] text-text-muted">skills</span>
              </div>
              {/* Bar */}
              <div className="mt-3 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(cat.count / SKILL_CATEGORIES[0].count) * 100}%`,
                    background: cat.color,
                    boxShadow: `0 0 8px ${cat.color}40`,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Tiers */}
      <div>
        <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
          Agent Tiers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 stagger">
          {TOP_AGENTS.map((tier) => (
            <GlassCard key={tier.tier} padding="lg">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: tier.color, boxShadow: `0 0 8px ${tier.color}60` }}
                />
                <h4
                  className="text-sm font-bold tracking-wide"
                  style={{ fontFamily: "var(--font-oswald)", color: tier.color }}
                >
                  {tier.tier}
                </h4>
                <span className="text-[10px] text-text-muted ml-auto">
                  {tier.agents.length} agents
                </span>
              </div>
              <div className="space-y-1.5">
                {tier.agents.map((agent) => (
                  <div
                    key={agent}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <div
                      className="w-1 h-4 rounded-full opacity-40 group-hover:opacity-100 transition-opacity"
                      style={{ background: tier.color }}
                    />
                    <span className="text-xs text-text-secondary font-mono group-hover:text-text-primary transition-colors truncate">
                      {agent}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
