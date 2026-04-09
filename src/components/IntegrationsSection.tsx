"use client";

import { INTEGRATIONS } from "@/data/friday-data";
import clsx from "clsx";

export default function IntegrationsSection() {
  return (
    <section id="integrations" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Integration Hub</h2>
          <p>Connected systems and protocols powering the F.R.I.D.A.Y. autonomous platform</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
          {INTEGRATIONS.map((int) => (
            <div key={int.name} className="glass-card depth-card p-5 text-center group relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-0 group-hover:opacity-[0.08] transition-opacity" style={{ background: int.color }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center glass-inner">
                  <span className="text-lg font-bold" style={{ color: int.color }}>{int.name.charAt(0)}</span>
                </div>
                <h4 className="text-xs font-bold text-text-primary mb-0.5">{int.name}</h4>
                <p className="text-[10px] text-text-muted mb-3">{int.description}</p>
                <span className={clsx(
                  "text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border inline-block",
                  int.status === "connected" && "bg-success/10 text-success border-success/20",
                  int.status === "available" && "bg-primary/10 text-primary border-primary/20",
                  int.status === "coming-soon" && "bg-white/[0.04] text-text-muted border-white/[0.08]",
                )}>
                  {int.status.replace("-", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
