"use client";

import { MCU_APPEARANCES } from "@/data/friday-data";

export default function TimelineSection() {
  return (
    <section id="timeline" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Origin Timeline</h2>
          <p>F.R.I.D.A.Y.&apos;s operational history — from first activation to autonomous supercomputer</p>
        </div>
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.06] -translate-x-1/2 hidden md:block" />
          <div className="space-y-8 md:space-y-0">
            {MCU_APPEARANCES.map((entry, i) => (
              <div key={entry.year} className={`md:flex items-center gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} mb-8`}>
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="glass-card depth-card luminous-border p-6 inline-block max-w-md">
                    <div className="text-3xl font-bold text-primary mb-1">{entry.year}</div>
                    <h4 className="text-sm font-bold text-text-primary mb-2">{entry.film}</h4>
                    <p className="text-xs text-text-muted leading-relaxed">{entry.role}</p>
                  </div>
                </div>
                {/* Center dot */}
                <div className="hidden md:flex items-center justify-center shrink-0">
                  <div className="w-4 h-4 rounded-full bg-primary/30 border-2 border-primary" style={{ boxShadow: "0 0 12px rgba(24,86,255,0.4)" }} />
                </div>
                <div className="flex-1" />
              </div>
            ))}
            {/* Present */}
            <div className="md:flex items-center gap-8">
              <div className="flex-1 md:text-right">
                <div className="glass-card depth-card glow-primary p-6 inline-block max-w-md">
                  <div className="text-3xl font-bold text-primary mb-1">2026</div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">F.R.I.D.A.Y. v2.0 — Autonomous Platform</h4>
                  <p className="text-xs text-text-muted leading-relaxed">9,510 skills. 996 agents. Multi-agent orchestration. Zero-latency command execution. The most advanced AI operations platform ever built.</p>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center shrink-0">
                <div className="w-5 h-5 rounded-full bg-primary animate-breathe" />
              </div>
              <div className="flex-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
