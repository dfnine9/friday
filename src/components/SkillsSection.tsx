"use client";

import { useState } from "react";
import { Sparkles, Check, X as XIcon } from "lucide-react";
import { SKILL_CATEGORIES } from "@/data/friday-data";
import { useToast } from "./ToastSystem";
import clsx from "clsx";

export default function SkillsSection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); } else { next.add(name); }
      return next;
    });
  };

  const selectAll = () => { setSelected(new Set(SKILL_CATEGORIES.map((c) => c.name))); toast("info", "All domains selected", "12 of 12 skill domains active"); };
  const clearAll = () => { setSelected(new Set()); };
  const hasFilter = selected.size > 0;
  const selectedCount = hasFilter ? SKILL_CATEGORIES.filter((c) => selected.has(c.name)).reduce((sum, c) => sum + c.count, 0) : 0;

  return (
    <section id="skills" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Skill Matrix</h2>
          <p>6,502 skills across 12 specialized domains. Click cards to filter and select domains.</p>
        </div>

        {/* Filter controls */}
        {hasFilter && (
          <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
            <span className="text-xs font-bold text-primary">{selected.size} of 12 domains selected ({selectedCount.toLocaleString()} skills)</span>
            <button onClick={selectAll} className="text-[11px] font-bold text-text-muted hover:text-primary px-3 py-1 rounded-lg glass-inner transition-colors flex items-center gap-1.5">
              <Check className="w-3 h-3" /> Select All
            </button>
            <button onClick={clearAll} className="text-[11px] font-bold text-text-muted hover:text-danger px-3 py-1 rounded-lg glass-inner transition-colors flex items-center gap-1.5">
              <XIcon className="w-3 h-3" /> Clear
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SKILL_CATEGORIES.map((cat) => {
            const isSelected = selected.has(cat.name);
            const isDimmed = hasFilter && !isSelected;
            return (
              <button
                key={cat.name}
                onClick={() => { toggle(cat.name); if (!isSelected) toast("info", `${cat.name} selected`, `${cat.count.toLocaleString()} skills in domain`); }}
                className={clsx(
                  "glass-card interactive-card click-glow p-5 group relative overflow-hidden text-center",
                  isSelected && "card-selected",
                  isDimmed && "card-dimmed"
                )}
              >
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-[0.1] transition-opacity duration-500" style={{ background: cat.color }} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}18`, color: cat.color }}>
                    {isSelected ? <Check className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <h4 className="text-sm font-bold text-text-primary mb-0.5">{cat.name}</h4>
                  <p className="text-[10px] text-text-muted leading-relaxed mb-3 line-clamp-2">{cat.description}</p>
                  <div className="text-2xl font-bold mb-2" style={{ color: cat.color }}>{cat.count.toLocaleString()}</div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(cat.count / SKILL_CATEGORIES[0].count) * 100}%`, background: cat.color, boxShadow: `0 0 8px ${cat.color}40` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
