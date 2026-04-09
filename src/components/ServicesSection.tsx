"use client";

import { useState } from "react";
import { Network, RefreshCw, ChevronDown } from "lucide-react";
import { StatusBadge } from "./GlassCard";
import { SERVICES } from "@/data/friday-data";
import { useToast } from "./ToastSystem";
import clsx from "clsx";

export default function ServicesSection() {
  const [restarting, setRestarting] = useState<Set<string>>(new Set());
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const { toast } = useToast();
  const online = SERVICES.filter((s) => s.status === "online").length;

  const handleRestart = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRestarting((prev) => new Set(prev).add(name));
    toast("info", `Restarting ${name}`, "Service restart initiated...");
    setTimeout(() => {
      setRestarting((prev) => { const next = new Set(prev); next.delete(name); return next; });
      toast("success", `${name} Restarted`, "Service is back online and healthy");
    }, 2000);
  };

  return (
    <section id="services" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Connected Services</h2>
          <p>{online} of {SERVICES.length} services online. Click to expand details, restart on demand.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SERVICES.map((svc) => {
            const isExpanded = expandedService === svc.name;
            const isRestarting = restarting.has(svc.name);
            return (
              <button
                key={svc.name}
                onClick={() => setExpandedService(isExpanded ? null : svc.name)}
                className={clsx("glass-card interactive-card click-glow px-5 py-4 text-left w-full", isExpanded && "card-selected")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: svc.status === "online" ? "rgba(7,202,107,0.08)" : "rgba(232,149,88,0.08)", border: `1px solid ${svc.status === "online" ? "rgba(7,202,107,0.15)" : "rgba(232,149,88,0.15)"}` }}>
                      <Network className="w-4 h-4" style={{ color: svc.status === "online" ? "#07CA6B" : "#E89558" }} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text-primary block">{svc.name}</span>
                      <span className="text-[10px] text-text-muted">{svc.category} &middot; {svc.uptime}% uptime</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-text-muted">{svc.latency}ms</span>
                    <StatusBadge status={svc.status} />
                    <ChevronDown className={clsx("w-3.5 h-3.5 text-text-muted transition-transform", isExpanded && "rotate-180")} />
                  </div>
                </div>
                {/* Expanded details */}
                <div className={clsx("overflow-hidden transition-all duration-300", isExpanded ? "max-h-[100px] opacity-100 mt-3" : "max-h-0 opacity-0")}>
                  <div className="flex items-center gap-3 pt-3 border-t border-white/[0.05]">
                    <div className="flex-1 grid grid-cols-3 gap-3 text-center">
                      <div><div className="text-[10px] text-text-muted">Latency</div><div className="text-xs font-bold text-primary">{svc.latency}ms</div></div>
                      <div><div className="text-[10px] text-text-muted">Uptime</div><div className="text-xs font-bold text-success">{svc.uptime}%</div></div>
                      <div><div className="text-[10px] text-text-muted">Region</div><div className="text-xs font-bold text-text-secondary">US-East</div></div>
                    </div>
                    <button
                      onClick={(e) => handleRestart(svc.name, e)}
                      disabled={isRestarting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-[11px] font-bold text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={clsx("w-3 h-3", isRestarting && "animate-spin")} />
                      {isRestarting ? "Restarting..." : "Restart"}
                    </button>
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
