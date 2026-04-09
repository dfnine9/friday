"use client";

import { StatCard } from "./GlassCard";
import { STATS, SERVICES, SKILL_CATEGORIES } from "@/data/friday-data";
import {
  Cpu,
  Bot,
  Terminal,
  GitBranch,
  Clock,
  Zap,
  Activity,
  TrendingUp,
} from "lucide-react";
import GlassCard, { StatusBadge } from "./GlassCard";

export default function OverviewPanel() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        {/* Radial glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h2
                className="text-3xl font-bold tracking-wider text-primary mb-1"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                F.R.I.D.A.Y.
              </h2>
              <p className="text-sm text-text-secondary max-w-lg">
                Female Replacement Intelligent Digital Assistant Youth — The autonomous
                AI supercomputer. Successor to J.A.R.V.I.S. with enhanced multi-agent
                orchestration, real-time skill synthesis, and zero-latency command execution.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-mono text-primary">SYSTEM ACTIVE</span>
            </div>
          </div>

          {/* Core metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
            <MiniStat icon="●" label="Neural Cores" value="8" color="#00BD7D" />
            <MiniStat icon="◆" label="Memory Nodes" value="1M ctx" color="#60a5fa" />
            <MiniStat icon="▲" label="Skill Modules" value="6,502" color="#a78bfa" />
            <MiniStat icon="■" label="Active Agents" value="942" color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <StatCard
          label="Total Skills"
          value={STATS.totalSkills}
          sub="+602 this month"
          color="#00BD7D"
          icon={<Cpu className="w-4 h-4" />}
        />
        <StatCard
          label="Active Agents"
          value={STATS.totalAgents}
          sub="30 repositories"
          color="#60a5fa"
          icon={<Bot className="w-4 h-4" />}
        />
        <StatCard
          label="Commands"
          value={STATS.totalCommands}
          sub="966 slash commands"
          color="#a78bfa"
          icon={<Terminal className="w-4 h-4" />}
        />
        <StatCard
          label="Avg Response"
          value={`${STATS.avgResponseMs}ms`}
          sub="99.97% uptime"
          color="#14b8a6"
          icon={<Zap className="w-4 h-4" />}
        />
      </div>

      {/* Two column: Categories + Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Skill Categories */}
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Skill Distribution
            </h3>
            <span className="text-[10px] font-mono text-text-muted">12 CATEGORIES</span>
          </div>
          <div className="space-y-2.5">
            {SKILL_CATEGORIES.slice(0, 8).map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-20 truncate">{cat.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(cat.count / SKILL_CATEGORIES[0].count) * 100}%`,
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                      boxShadow: `0 0 8px ${cat.color}30`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono text-text-muted w-10 text-right">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* System Health */}
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              System Health
            </h3>
            <span className="text-[10px] font-mono text-text-muted">
              {SERVICES.filter((s) => s.status === "online").length}/{SERVICES.length} ONLINE
            </span>
          </div>
          <div className="space-y-2">
            {SERVICES.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{
                      background:
                        svc.status === "online"
                          ? "#16A34A"
                          : svc.status === "degraded"
                          ? "#D97706"
                          : "#DC2626",
                    }}
                  />
                  <span className="text-xs text-text-secondary">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-text-muted">{svc.latency}ms</span>
                  <StatusBadge status={svc.status} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.03]">
      <span style={{ color }} className="text-sm">
        {icon}
      </span>
      <div>
        <div className="text-[10px] text-text-muted">{label}</div>
        <div className="text-sm font-bold font-mono" style={{ color }}>
          {value}
        </div>
      </div>
    </div>
  );
}
