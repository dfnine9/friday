"use client";

import { Cpu, Bot, Terminal, Zap, Activity, Wifi } from "lucide-react";
import { STATS } from "@/data/friday-data";
import { useToast } from "./ToastSystem";

const metrics = [
  { label: "Total Skills", value: STATS.totalSkills.toLocaleString(), raw: STATS.totalSkills, sub: "Across 12 domains", trend: "+602", icon: <Cpu className="w-5 h-5" />, color: "#1856FF" },
  { label: "Active Agents", value: STATS.totalAgents.toLocaleString(), raw: STATS.totalAgents, sub: "30 repositories", trend: "+48", icon: <Bot className="w-5 h-5" />, color: "#7c3aed" },
  { label: "Commands", value: STATS.totalCommands.toLocaleString(), raw: STATS.totalCommands, sub: "Slash commands", trend: "+72", icon: <Terminal className="w-5 h-5" />, color: "#07CA6B" },
  { label: "Avg Response", value: `${STATS.avgResponseMs}ms`, raw: STATS.avgResponseMs, sub: "P99 latency", trend: "-12ms", icon: <Zap className="w-5 h-5" />, color: "#E89558" },
  { label: "Uptime", value: `${STATS.uptime}%`, raw: STATS.uptime, sub: "99.97% SLA", trend: "+0.02%", icon: <Activity className="w-5 h-5" />, color: "#07CA6B" },
  { label: "Connections", value: STATS.activeConnections.toLocaleString(), raw: STATS.activeConnections, sub: "Active sessions", trend: "+23", icon: <Wifi className="w-5 h-5" />, color: "#1856FF" },
];

export default function MetricsSection() {
  const { toast } = useToast();

  const handleClick = (m: typeof metrics[0]) => {
    navigator.clipboard.writeText(`${m.label}: ${m.value}`);
    toast("success", "Copied to clipboard", `${m.label}: ${m.value}`);
  };

  return (
    <section id="metrics" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Core Metrics</h2>
          <p>Real-time telemetry from the F.R.I.D.A.Y. autonomous operations platform. Click any card to copy.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <button
              key={m.label}
              onClick={() => handleClick(m)}
              className="glass-card interactive-card click-glow luminous-border p-6 group relative overflow-hidden text-left hud-scanline"
            >
              <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-[0.06] group-hover:opacity-[0.12] transition-opacity" style={{ background: m.color }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-text-muted">{m.label}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${m.color}15`, border: `1px solid ${m.color}20`, color: m.color }}>
                    {m.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold" style={{ color: m.color }}>{m.value}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-text-muted">{m.sub}</span>
                  <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">{m.trend}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
