"use client";

import { Network } from "lucide-react";
import { StatusBadge } from "./GlassCard";
import { SERVICES } from "@/data/friday-data";

export default function ServicesSection() {
  const online = SERVICES.filter((s) => s.status === "online").length;
  return (
    <section id="services" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Connected Services</h2>
          <p>{online} of {SERVICES.length} services online — continuous health monitoring across all subsystems</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
          {SERVICES.map((svc) => (
            <div key={svc.name} className="glass-card depth-card px-5 py-4 flex items-center justify-between">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
