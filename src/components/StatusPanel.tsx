"use client";

import { useState, useEffect } from "react";
import GlassCard, { StatusBadge } from "./GlassCard";
import { SERVICES, STATS } from "@/data/friday-data";
import {
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Thermometer,
  Network,
  Shield,
  RefreshCw,
} from "lucide-react";

function useAnimatedValue(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function CircularGauge({
  value,
  max = 100,
  label,
  color,
  size = 100,
}: {
  value: number;
  max?: number;
  label: string;
  color: string;
  size?: number;
}) {
  const animated = useAnimatedValue(value);
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (animated / max) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={5}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 6px ${color}60)`,
              transition: "stroke-dashoffset 0.3s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-lg font-bold font-mono"
            style={{ color, fontFamily: "var(--font-oswald)" }}
          >
            {Math.round(animated)}%
          </span>
        </div>
      </div>
      <span className="text-[10px] text-text-muted">{label}</span>
    </div>
  );
}

export default function StatusPanel() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-text-primary tracking-wide"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            SYSTEM STATUS
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time monitoring of all F.R.I.D.A.Y. subsystems
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-xs text-text-secondary hover:text-primary transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Resource Gauges */}
      <GlassCard padding="lg">
        <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-5 flex items-center gap-2">
          <Cpu className="w-3 h-3" />
          Resource Utilization
        </h3>
        <div className="flex items-center justify-around flex-wrap gap-4">
          <CircularGauge value={34} label="CPU" color="#00BD7D" />
          <CircularGauge value={62} label="Memory" color="#60a5fa" />
          <CircularGauge value={28} label="GPU" color="#a78bfa" />
          <CircularGauge value={45} label="Storage" color="#f59e0b" />
          <CircularGauge value={18} label="Network" color="#14b8a6" />
        </div>
      </GlassCard>

      {/* Hardware Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <HardwareCard icon={<Cpu className="w-4 h-4" />} label="Neural Cores" value="8 / 8 Active" color="#00BD7D" />
        <HardwareCard icon={<MemoryStick className="w-4 h-4" />} label="Context Window" value="1,000,000 tokens" color="#60a5fa" />
        <HardwareCard icon={<HardDrive className="w-4 h-4" />} label="Vector Store" value="2.4M embeddings" color="#a78bfa" />
        <HardwareCard icon={<Thermometer className="w-4 h-4" />} label="Inference Temp" value="0.7 balanced" color="#f59e0b" />
      </div>

      {/* Services Grid */}
      <GlassCard padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Server className="w-3 h-3" />
            Connected Services
          </h3>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              {SERVICES.filter((s) => s.status === "online").length} Online
            </span>
            <span className="flex items-center gap-1 text-warning">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              {SERVICES.filter((s) => s.status === "degraded").length} Degraded
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SERVICES.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.03]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      svc.status === "online"
                        ? "rgba(22,163,74,0.1)"
                        : svc.status === "degraded"
                        ? "rgba(217,119,6,0.1)"
                        : "rgba(220,38,38,0.1)",
                  }}
                >
                  {svc.name.includes("Claude") ? (
                    <Shield className="w-4 h-4 text-primary" />
                  ) : (
                    <Network className="w-4 h-4 text-text-muted" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-medium text-text-primary">{svc.name}</span>
                  <div className="text-[10px] text-text-muted">
                    {svc.uptime}% uptime
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] font-mono text-text-muted">{svc.latency}ms</span>
                </div>
                <StatusBadge status={svc.status} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function HardwareCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <GlassCard className="relative overflow-hidden group">
      <div
        className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity"
        style={{ background: color }}
      />
      <div className="relative">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider">{label}</div>
        <div className="text-sm font-medium text-text-primary mt-0.5 font-mono">{value}</div>
      </div>
    </GlassCard>
  );
}
