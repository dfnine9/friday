"use client";

import { AGENT_TIERS } from "@/data/friday-data";
import { useAgentModal } from "./AgentModal";

export default function AgentsSection() {
  const { openAgent } = useAgentModal();

  return (
    <section id="agents" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Agent Fleet</h2>
          <p>942 autonomous agents organized in tiered hierarchies. Click any agent for details.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
          {AGENT_TIERS.map((tier) => (
            <div key={tier.tier} className="glass-card luminous-border p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}44)`, boxShadow: `0 0 12px ${tier.color}30` }} />
              <div className="flex items-center gap-3 mb-2 pt-1">
                <div className="w-3.5 h-3.5 rounded-full" style={{ background: tier.color, boxShadow: `0 0 10px ${tier.color}60` }} />
                <h3 className="text-lg font-bold" style={{ color: tier.color }}>{tier.tier}</h3>
                <span className="text-[10px] font-bold text-text-muted ml-auto">{tier.agents.length} agents</span>
              </div>
              <p className="text-xs text-text-muted mb-4">{tier.description}</p>
              <div className="space-y-1">
                {tier.agents.map((agent) => (
                  <button
                    key={agent.name}
                    onClick={() => openAgent({ name: agent.name, specialty: agent.specialty, tier: tier.tier, tierColor: tier.color })}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors group click-glow text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-1.5 h-5 rounded-full opacity-30 group-hover:opacity-100 transition-opacity shrink-0" style={{ background: tier.color }} />
                      <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors font-mono truncate">{agent.name}</span>
                    </div>
                    <span className="text-[10px] text-text-muted truncate ml-3 max-w-[140px] text-right group-hover:text-primary transition-colors">{agent.specialty}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
