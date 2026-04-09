"use client";

import { Sparkles } from "lucide-react";
import { SKILL_CATEGORIES } from "@/data/friday-data";

export default function SkillsSection() {
  return (
    <section id="skills" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Skill Matrix</h2>
          <p>6,502 skills across 12 specialized domains — every capability Tony Stark would need</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
          {SKILL_CATEGORIES.map((cat) => (
            <div key={cat.name} className="glass-card depth-card p-5 group relative overflow-hidden text-center">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-[0.1] transition-opacity duration-500" style={{ background: cat.color }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}18`, color: cat.color }}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-text-primary mb-0.5">{cat.name}</h4>
                <p className="text-[10px] text-text-muted leading-relaxed mb-3 line-clamp-2">{cat.description}</p>
                <div className="text-2xl font-bold mb-2" style={{ color: cat.color }}>{cat.count.toLocaleString()}</div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(cat.count / SKILL_CATEGORIES[0].count) * 100}%`, background: cat.color, boxShadow: `0 0 8px ${cat.color}40` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
