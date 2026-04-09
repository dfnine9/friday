"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronRight,
  Sparkles,
  Users,
  Cpu,
} from "lucide-react";
import GlassCard, { SectionHeader } from "./GlassCard";
import { SKILL_CATEGORIES, AGENT_TIERS, STATS } from "@/data/friday-data";
import clsx from "clsx";

export default function SkillsPanel() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = SKILL_CATEGORIES.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  ).filter((c) => !selectedCategory || c.name === selectedCategory);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Skill Matrix"
          subtitle={`${STATS.totalSkills.toLocaleString()} skills across ${SKILL_CATEGORIES.length} domains — ${STATS.totalAgents} autonomous agents`}
          icon={<Cpu className="w-5 h-5" />}
        />
        <div className="flex items-center gap-1 glass-card !rounded-xl !p-1">
          <button
            onClick={() => setView("grid")}
            className={clsx(
              "p-2 rounded-lg transition-all",
              view === "grid"
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={clsx(
              "p-2 rounded-lg transition-all",
              view === "list"
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card !rounded-2xl flex items-center gap-3 px-5 py-3.5">
        <Search className="w-4 h-4 text-text-muted shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skill domains..."
          className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full font-medium"
        />
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-[11px] px-3 py-1 rounded-full bg-primary text-white font-semibold shrink-0 hover:bg-primary-hover transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Skill Domains */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
            Skill Domains
          </span>
        </div>
        <div
          className={clsx(
            "gap-4 stagger",
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
                "glass-card !rounded-2xl p-5 text-left transition-all duration-200 group relative overflow-hidden",
                selectedCategory === cat.name && "ring-2 ring-primary/20 glow-primary"
              )}
            >
              {/* Hover accent */}
              <div
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500"
                style={{ background: cat.color }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${cat.color}0D`, color: cat.color }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="text-sm font-bold text-text-primary">{cat.name}</h4>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
                <div className="flex items-baseline gap-1.5 mt-3">
                  <span
                    className="text-xl font-bold"
                    style={{ color: cat.color }}
                  >
                    {cat.count.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-medium text-text-muted">skills</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 rounded-full bg-black/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(cat.count / SKILL_CATEGORIES[0].count) * 100}%`,
                      background: cat.color,
                    }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Tiers */}
      <div>
        <SectionHeader
          title="Agent Fleet"
          subtitle="Tiered autonomous agents with specialized capabilities"
          icon={<Users className="w-5 h-5" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 stagger">
          {AGENT_TIERS.map((tier) => (
            <GlassCard key={tier.tier} padding="lg" className="relative overflow-hidden">
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}66)` }}
              />
              <div className="flex items-center gap-3 mb-1 pt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: tier.color, boxShadow: `0 0 8px ${tier.color}40` }}
                />
                <h4 className="text-sm font-bold text-text-primary">
                  {tier.tier}
                </h4>
                <span className="text-[10px] font-bold text-text-muted ml-auto">
                  {tier.agents.length} agents
                </span>
              </div>
              <p className="text-[10px] text-text-muted mb-3">{tier.description}</p>
              <div className="space-y-1">
                {tier.agents.map((agent) => (
                  <div
                    key={agent.name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/[0.02] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-1.5 h-5 rounded-full opacity-30 group-hover:opacity-100 transition-opacity shrink-0"
                        style={{ background: tier.color }}
                      />
                      <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors truncate font-mono">
                        {agent.name}
                      </span>
                    </div>
                    <span className="text-[9px] text-text-muted truncate ml-2 max-w-[120px]">
                      {agent.specialty}
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
