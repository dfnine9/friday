"use client";

import {
  Cpu,
  Bot,
  Terminal,
  Zap,
  Shield,
  Globe,
  Building2,
  HeartPulse,
  Network,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Hexagon,
} from "lucide-react";
import GlassCard, { StatCard, StatusBadge, SectionHeader } from "./GlassCard";
import {
  STATS,
  SERVICES,
  SKILL_CATEGORIES,
  CAPABILITY_MODULES,
  FRIDAY_META,
} from "@/data/friday-data";

const ICON_MAP: Record<string, React.ReactNode> = {
  cpu: <Cpu className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  building: <Building2 className="w-5 h-5" />,
  "heart-pulse": <HeartPulse className="w-5 h-5" />,
  network: <Network className="w-5 h-5" />,
};

export default function OverviewPanel() {
  const onlineCount = SERVICES.filter((s) => s.status === "online").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ═══ HERO BANNER ═══ */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden luminous-border">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-transparent to-accent" />
        </div>
        <div className="absolute top-[-60px] right-[-40px] w-[240px] h-[240px] rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="absolute bottom-[-40px] left-[-20px] w-[180px] h-[180px] rounded-full bg-accent/[0.03] blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 animate-float">
                <Hexagon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                  {FRIDAY_META.codename}
                </h2>
                <p className="text-sm text-text-secondary mt-0.5 font-medium">
                  {FRIDAY_META.fullName}
                </p>
                <p className="text-xs text-text-muted mt-2 max-w-xl leading-relaxed">
                  The autonomous AI supercomputer. Successor to J.A.R.V.I.S. with
                  enhanced multi-agent orchestration, real-time threat intelligence,
                  internet-scale OSINT, and zero-latency command execution across
                  6,502 skills and 942 autonomous agents.
                </p>
              </div>
            </div>

            {/* Live status */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success-dim">
              <div className="status-online animate-pulse-dot" />
              <span className="text-xs font-bold text-success tracking-wide">
                ALL SYSTEMS NOMINAL
              </span>
            </div>
          </div>

          {/* Compact hardware stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Neural Cores", value: "8 Active", icon: <Cpu className="w-3.5 h-3.5" />, color: "#1856FF" },
              { label: "Context Window", value: "1M tokens", icon: <Activity className="w-3.5 h-3.5" />, color: "#6C5CE7" },
              { label: "Skill Modules", value: "6,502", icon: <Terminal className="w-3.5 h-3.5" />, color: "#07CA6B" },
              { label: "Agent Fleet", value: "942", icon: <Bot className="w-3.5 h-3.5" />, color: "#E89558" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-inner"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${item.color}0D`, color: item.color }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-medium text-text-muted">{item.label}</div>
                  <div className="text-sm font-bold text-text-primary">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          label="Total Skills"
          value={STATS.totalSkills}
          sub="Across 12 domains"
          trend={{ value: "+602", positive: true }}
          color="#1856FF"
          icon={<Cpu className="w-4 h-4" />}
        />
        <StatCard
          label="Active Agents"
          value={STATS.totalAgents}
          sub="30 repositories"
          trend={{ value: "+48", positive: true }}
          color="#6C5CE7"
          icon={<Bot className="w-4 h-4" />}
        />
        <StatCard
          label="Commands"
          value={STATS.totalCommands}
          sub="Slash commands"
          trend={{ value: "+72", positive: true }}
          color="#07CA6B"
          icon={<Terminal className="w-4 h-4" />}
        />
        <StatCard
          label="Avg Response"
          value={`${STATS.avgResponseMs}ms`}
          sub={`${STATS.uptime}% uptime`}
          trend={{ value: "-12ms", positive: true }}
          color="#E89558"
          icon={<Zap className="w-4 h-4" />}
        />
      </div>

      {/* ═══ CAPABILITY MODULES ═══ */}
      <div>
        <SectionHeader
          title="Capability Modules"
          subtitle="F.R.I.D.A.Y. operational systems — mapped from MCU demonstrated abilities"
          icon={<Shield className="w-5 h-5" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 stagger">
          {CAPABILITY_MODULES.map((mod) => (
            <GlassCard key={mod.id} className="group relative overflow-hidden">
              {/* Accent stripe */}
              <div
                className="absolute top-0 left-0 w-1 h-full rounded-r-full"
                style={{ background: mod.color }}
              />
              <div className="pl-3">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${mod.color}0D`, color: mod.color }}
                  >
                    {ICON_MAP[mod.icon] || <Cpu className="w-5 h-5" />}
                  </div>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{
                      background: mod.status === "active" ? "rgba(7,202,107,0.08)" : "rgba(24,86,255,0.08)",
                      color: mod.status === "active" ? "#07CA6B" : "#1856FF",
                    }}
                  >
                    {mod.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-text-primary">{mod.name}</h4>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  {mod.description}
                </p>
                <div className="flex gap-4 mt-3 pt-3 border-t border-black/[0.04]">
                  {mod.metrics.map((m) => (
                    <div key={m.label}>
                      <span className="text-[10px] text-text-muted">{m.label}</span>
                      <div className="text-sm font-bold" style={{ color: mod.color }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ═══ TWO COLUMN: DISTRIBUTION + HEALTH ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Skill Distribution */}
        <GlassCard padding="lg">
          <SectionHeader
            title="Skill Distribution"
            subtitle="12 categories"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <div className="space-y-3 mt-4">
            {SKILL_CATEGORIES.slice(0, 8).map((cat) => (
              <div key={cat.name} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-text-secondary">
                    {cat.name}
                  </span>
                  <span className="text-xs font-bold font-mono text-text-muted">
                    {cat.count.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-black/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 group-hover:opacity-90"
                    style={{
                      width: `${(cat.count / SKILL_CATEGORIES[0].count) * 100}%`,
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}99)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* System Health */}
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader
              title="System Health"
              icon={<Activity className="w-5 h-5" />}
            />
            <span className="text-xs font-bold text-success bg-success-dim px-2.5 py-1 rounded-full">
              {onlineCount}/{SERVICES.length} Online
            </span>
          </div>
          <div className="space-y-1.5">
            {SERVICES.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-black/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-1.5 h-6 rounded-full ${
                      svc.status === "online"
                        ? "bg-success"
                        : svc.status === "degraded"
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                  />
                  <div>
                    <span className="text-xs font-semibold text-text-primary">
                      {svc.name}
                    </span>
                    <span className="text-[10px] text-text-muted ml-2">{svc.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono font-bold text-text-muted">
                    {svc.latency}ms
                  </span>
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
