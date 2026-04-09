"use client";

import { Cpu, Shield, Globe, Building2, HeartPulse, Network } from "lucide-react";
import { CAPABILITY_MODULES } from "@/data/friday-data";

const ICONS: Record<string, React.ReactNode> = {
  cpu: <Cpu className="w-6 h-6" />, shield: <Shield className="w-6 h-6" />,
  globe: <Globe className="w-6 h-6" />, building: <Building2 className="w-6 h-6" />,
  "heart-pulse": <HeartPulse className="w-6 h-6" />, network: <Network className="w-6 h-6" />,
};

export default function CapabilitiesSection() {
  return (
    <section id="capabilities" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Capability Modules</h2>
          <p>Operational systems mapped from MCU-demonstrated abilities into enterprise AI infrastructure</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {CAPABILITY_MODULES.map((mod) => (
            <div key={mod.id} className="glass-card depth-card luminous-border p-6 group relative overflow-hidden">
              {/* Accent stripe */}
              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, ${mod.color}, transparent)`, boxShadow: `0 0 12px ${mod.color}30` }} />
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${mod.color}12`, border: `1px solid ${mod.color}18`, color: mod.color }}>
                  {ICONS[mod.icon] || <Cpu className="w-6 h-6" />}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border"
                  style={{ background: "rgba(7,202,107,0.08)", color: "#07CA6B", borderColor: "rgba(7,202,107,0.2)" }}>
                  {mod.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary mb-1">{mod.name}</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-4">{mod.description}</p>
              <div className="text-[10px] text-text-muted italic mb-4 px-3 py-2 glass-inner rounded-lg">
                MCU: {mod.mcuReference}
              </div>
              <div className="flex gap-6 pt-3 border-t border-white/[0.05]">
                {mod.metrics.map((m) => (
                  <div key={m.label}>
                    <span className="text-[10px] text-text-muted block">{m.label}</span>
                    <span className="text-sm font-bold" style={{ color: mod.color }}>{m.value}</span>
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
