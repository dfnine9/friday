"use client";

import { useState } from "react";
import { Cpu, Shield, Globe, Building2, HeartPulse, Network, ChevronDown, Zap } from "lucide-react";
import { CAPABILITY_MODULES } from "@/data/friday-data";
import { useToast } from "./ToastSystem";
import clsx from "clsx";

const ICONS: Record<string, React.ReactNode> = {
  cpu: <Cpu className="w-6 h-6" />, shield: <Shield className="w-6 h-6" />,
  globe: <Globe className="w-6 h-6" />, building: <Building2 className="w-6 h-6" />,
  "heart-pulse": <HeartPulse className="w-6 h-6" />, network: <Network className="w-6 h-6" />,
};

export default function CapabilitiesSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const handleDeploy = (name: string) => {
    toast("action", `Deploying ${name}`, "Module initialization sequence started");
  };

  return (
    <section id="capabilities" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Capability Modules</h2>
          <p>Operational systems mapped from MCU-demonstrated abilities. Click to expand details.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITY_MODULES.map((mod) => {
            const isExpanded = expandedId === mod.id;
            return (
              <div key={mod.id} className={clsx("glass-card interactive-card luminous-border p-6 group relative overflow-hidden", isExpanded && "card-selected")} onClick={() => toggleExpand(mod.id)}>
                <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, ${mod.color}, transparent)`, boxShadow: `0 0 12px ${mod.color}30` }} />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${mod.color}12`, border: `1px solid ${mod.color}18`, color: mod.color }}>
                    {ICONS[mod.icon] || <Cpu className="w-6 h-6" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border" style={{ background: "rgba(7,202,107,0.08)", color: "#07CA6B", borderColor: "rgba(7,202,107,0.2)" }}>
                      {mod.status}
                    </span>
                    <ChevronDown className={clsx("w-4 h-4 text-text-muted transition-transform", isExpanded && "rotate-180")} />
                  </div>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-1">{mod.name}</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-4">{mod.description}</p>

                {/* Expanded details */}
                <div className={clsx("overflow-hidden transition-all duration-300", isExpanded ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0")}>
                  <div className="text-[10px] text-text-muted italic mb-3 px-3 py-2 glass-inner rounded-lg">
                    MCU: {mod.mcuReference}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeploy(mod.name); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/15 border border-primary/20 text-xs font-bold text-primary hover:bg-primary/25 transition-colors mb-3"
                  >
                    <Zap className="w-3.5 h-3.5" /> Deploy Module
                  </button>
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
