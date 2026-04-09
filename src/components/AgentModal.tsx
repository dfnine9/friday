"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { X, Copy, Zap, Check, Shield, Clock, Activity } from "lucide-react";
import { useToast } from "./ToastSystem";

type Agent = { name: string; specialty: string; tier: string; tierColor: string };
type ModalContextType = { openAgent: (agent: Agent) => void };
const ModalContext = createContext<ModalContextType>({ openAgent: () => {} });
export const useAgentModal = () => useContext(ModalContext);

export function AgentModalProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const openAgent = (a: Agent) => setAgent(a);
  const close = () => { setAgent(null); setCopied(false); };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify({ agent: agent?.name, tier: agent?.tier, specialty: agent?.specialty }, null, 2));
    setCopied(true);
    toast("success", "Config Copied", `${agent?.name} configuration copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = () => {
    toast("action", `Launching ${agent?.name}`, `Spawning agent with ${agent?.specialty} capabilities`);
    close();
  };

  return (
    <ModalContext.Provider value={{ openAgent }}>
      {children}
      {agent && (
        <div className="fixed inset-0 z-[80] modal-backdrop flex items-center justify-center p-4" onClick={close}>
          <div className="glass-card !rounded-2xl w-full max-w-md overflow-hidden shimmer-border animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: agent.tierColor, boxShadow: `0 0 8px ${agent.tierColor}60` }} />
                <h3 className="text-base font-bold text-text-primary font-mono">{agent.name}</h3>
              </div>
              <button onClick={close} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-text-muted hover:text-text-secondary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tier</span>
                <div className="text-sm font-bold mt-0.5" style={{ color: agent.tierColor }}>{agent.tier}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Specialty</span>
                <div className="text-sm text-text-primary mt-0.5">{agent.specialty}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Shield className="w-3.5 h-3.5" />, label: "Status", value: "Active", color: "#07CA6B" },
                  { icon: <Clock className="w-3.5 h-3.5" />, label: "Latency", value: `${12 + Math.floor(Math.random() * 30)}ms`, color: "#1856FF" },
                  { icon: <Activity className="w-3.5 h-3.5" />, label: "Tasks", value: `${100 + Math.floor(Math.random() * 900)}`, color: "#7c3aed" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-inner rounded-lg p-3 text-center">
                    <div className="w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
                    <div className="text-[10px] text-text-muted">{stat.label}</div>
                    <div className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-white/[0.05]">
              <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-inner text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Config"}
              </button>
              <button onClick={handleLaunch} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/20 border border-primary/25 text-xs font-bold text-primary hover:bg-primary/30 transition-colors">
                <Zap className="w-3.5 h-3.5" />
                Launch Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
