"use client";

import { useState } from "react";
import { Zap, Terminal, Copy, Check, Play, Loader2 } from "lucide-react";
import { QUICK_ACTIONS } from "@/data/friday-data";
import { useToast } from "./ToastSystem";

export default function ActionsSection() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = (cmd: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cmd);
    setCopiedId(cmd);
    toast("success", "Command Copied", `${cmd} ready to paste`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRun = (cmd: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRunningId(cmd);
    toast("action", `Executing ${name}`, `Running ${cmd}...`);
    setTimeout(() => {
      setRunningId(null);
      toast("success", `${name} Complete`, `${cmd} finished successfully`);
    }, 2500);
  };

  return (
    <section id="actions" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>One-click access to 966 commands. Copy to clipboard or execute directly.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {QUICK_ACTIONS.map((action) => {
            const isRunning = runningId === action.command;
            return (
              <div key={action.command} className="glass-card interactive-card luminous-border p-5 group relative overflow-hidden click-glow">
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500" style={{ background: action.color }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${action.color}12`, border: `1px solid ${action.color}18` }}>
                      {isRunning ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: action.color }} /> : <Zap className="w-5 h-5" style={{ color: action.color }} />}
                    </div>
                    <div className="flex items-center gap-2">
                      {action.hotkey && <kbd className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono border border-white/[0.08] text-text-muted bg-white/[0.04]">{action.hotkey}</kbd>}
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border" style={{ background: `${action.color}0A`, color: action.color, borderColor: `${action.color}20` }}>{action.category}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary">{action.name}</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">{action.description}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05]">
                    <Terminal className="w-3 h-3 text-text-muted shrink-0" />
                    <code className="text-xs font-mono font-bold text-primary flex-1">{action.command}</code>
                    <button onClick={(e) => handleCopy(action.command, action.name, e)} className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors" title="Copy command">
                      {copiedId === action.command ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
                    </button>
                    <button onClick={(e) => handleRun(action.command, action.name, e)} disabled={isRunning} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50" title="Execute command">
                      {isRunning ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" /> : <Play className="w-3.5 h-3.5 text-text-muted hover:text-primary transition-colors" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
