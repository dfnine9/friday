"use client";

import { useState } from "react";
import { INTEGRATIONS } from "@/data/friday-data";
import { useToast } from "./ToastSystem";
import { Loader2, Bell } from "lucide-react";
import clsx from "clsx";

export default function IntegrationsSection() {
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleConnect = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnecting((prev) => new Set(prev).add(name));
    toast("info", `Connecting ${name}`, "Establishing secure connection...");
    setTimeout(() => {
      setConnecting((prev) => { const next = new Set(prev); next.delete(name); return next; });
      setStatuses((prev) => ({ ...prev, [name]: "connected" }));
      toast("success", `${name} Connected`, "Integration is now active and ready");
    }, 2000);
  };

  const handleNotify = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStatuses((prev) => ({ ...prev, [name]: "notified" }));
    toast("info", "Notification Set", `You'll be notified when ${name} is available`);
  };

  return (
    <section id="integrations" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Integration Hub</h2>
          <p>Connected systems and protocols. Click Connect to activate available integrations.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {INTEGRATIONS.map((int) => {
            const overrideStatus = statuses[int.name];
            const isConnecting = connecting.has(int.name);
            const effectiveStatus = overrideStatus || int.status;
            return (
              <div key={int.name} className="glass-card interactive-card click-glow p-5 text-center group relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-0 group-hover:opacity-[0.08] transition-opacity" style={{ background: int.color }} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center glass-inner">
                    {isConnecting
                      ? <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      : <span className="text-lg font-bold" style={{ color: int.color }}>{int.name.charAt(0)}</span>
                    }
                  </div>
                  <h4 className="text-xs font-bold text-text-primary mb-0.5">{int.name}</h4>
                  <p className="text-[10px] text-text-muted mb-3">{int.description}</p>

                  {effectiveStatus === "connected" && (
                    <span className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border inline-block bg-success/10 text-success border-success/20">Connected</span>
                  )}
                  {effectiveStatus === "available" && !isConnecting && (
                    <button onClick={(e) => handleConnect(int.name, e)} className="text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                      Connect
                    </button>
                  )}
                  {effectiveStatus === "coming-soon" && overrideStatus !== "notified" && (
                    <button onClick={(e) => handleNotify(int.name, e)} className="text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border bg-white/[0.04] text-text-muted border-white/[0.08] hover:text-text-secondary hover:border-white/[0.12] transition-colors flex items-center gap-1 mx-auto">
                      <Bell className="w-2.5 h-2.5" /> Notify Me
                    </button>
                  )}
                  {overrideStatus === "notified" && (
                    <span className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border inline-block bg-primary/10 text-primary border-primary/20">Notified</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
