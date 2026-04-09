"use client";

import { AGENT_TIERS } from "@/data/friday-data";

export default function AgentsSection() {
  return (
    <section id="agents" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Agent Fleet</h2>
          <p>942 autonomous agents organized in tiered hierarchies with specialized capabilities</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
          {AGENT_TIERS.map((tier) => (
            <div key={tier.tier} className="glass-card depth-card luminous-border p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}44)`, boxShadow: `0 0 12px ${tier.color}30` }} />
              <div className="flex items-center gap-3 mb-2 pt-1">
                <div className="w-3.5 h-3.5 rounded-full" style={{ background: tier.color, boxShadow: `0 0 10px ${tier.color}60` }} />
                <h3 className="text-lg font-bold" style={{ color: tier.color }}>{tier.tier}</h3>
                <span className="text-[10px] font-bold text-text-muted ml-auto">{tier.agents.length} agents</span>
              </div>
              <p className="text-xs text-text-muted mb-4">{tier.description}</p>
              <div className="space-y-1">
                {tier.agents.map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group cursor-pointer">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-1.5 h-5 rounded-full opacity-30 group-hover:opacity-100 transition-opacity shrink-0" style={{ background: tier.color }} />
                      <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors font-mono truncate">{agent.name}</span>
                    </div>
                    <span className="text-[10px] text-text-muted truncate ml-3 max-w-[140px] text-right">{agent.specialty}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
