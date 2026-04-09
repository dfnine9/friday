"use client";

import { useState, useEffect } from "react";
import GlassCard, { StatusBadge, SectionHeader } from "./GlassCard";
import { SERVICES, STATS } from "@/data/friday-data";
import {
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Thermometer,
  Network,
  RefreshCw,
  Activity,
  Gauge,
} from "lucide-react";

function useAnimatedValue(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // quartic ease-out
      setValue(target * eased);
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
  size = 110,
}: {
  value: number;
  max?: number;
  label: string;
  color: string;
  size?: number;
}) {
  const animated = useAnimatedValue(value);
  const strokeWidth = 6;
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (animated / max) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(0,0,0,0.04)"
            strokeWidth={strokeWidth}
          />
          {/* Value */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 4px ${color}40)`,
              transition: "stroke-dashoffset 0.1s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>
            {Math.round(animated)}
          </span>
          <span className="text-[9px] font-semibold text-text-muted">%</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
    </div>
  );
}

export default function StatusPanel() {
  const [refreshing, setRefreshing] = useState(false);
  const onlineCount = SERVICES.filter((s) => s.status === "online").length;
  const degradedCount = SERVICES.filter((s) => s.status === "degraded").length;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="System Status"
          subtitle="Real-time monitoring of all F.R.I.D.A.Y. subsystems"
          icon={<Activity className="w-5 h-5" />}
        />
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Resource Gauges */}
      <GlassCard padding="lg" luminous>
        <div className="flex items-center gap-2 mb-6">
          <Gauge className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">
            Resource Utilization
          </h3>
        </div>
        <div className="flex items-center justify-around flex-wrap gap-6">
          <CircularGauge value={34} label="CPU" color="#1856FF" />
          <CircularGauge value={62} label="Memory" color="#6C5CE7" />
          <CircularGauge value={28} label="GPU" color="#07CA6B" />
          <CircularGauge value={45} label="Storage" color="#E89558" />
          <CircularGauge value={18} label="Network" color="#EA2143" />
        </div>
      </GlassCard>

      {/* Hardware Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <HardwareCard icon={<Cpu className="w-4 h-4" />} label="Neural Cores" value="8 / 8 Active" color="#1856FF" />
        <HardwareCard icon={<MemoryStick className="w-4 h-4" />} label="Context Window" value="1,000,000 tokens" color="#6C5CE7" />
        <HardwareCard icon={<HardDrive className="w-4 h-4" />} label="Vector Store" value="2.4M embeddings" color="#07CA6B" />
        <HardwareCard icon={<Thermometer className="w-4 h-4" />} label="Inference Temp" value="0.7 balanced" color="#E89558" />
      </div>

      {/* Connected Services */}
      <GlassCard padding="lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">
              Connected Services
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-success bg-success-dim px-2.5 py-1 rounded-full">
              <span className="status-online" style={{ width: 6, height: 6 }} />
              {onlineCount} Online
            </span>
            {degradedCount > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-warning bg-warning-dim px-2.5 py-1 rounded-full">
                <span className="status-degraded" style={{ width: 6, height: 6 }} />
                {degradedCount} Degraded
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SERVICES.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-black/[0.015] transition-colors border border-transparent hover:border-black/[0.03] group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      svc.status === "online"
                        ? "rgba(7,202,107,0.06)"
                        : svc.status === "degraded"
                        ? "rgba(232,149,88,0.06)"
                        : "rgba(234,33,67,0.06)",
                  }}
                >
                  <Network
                    className="w-4 h-4"
                    style={{
                      color:
                        svc.status === "online"
                          ? "#07CA6B"
                          : svc.status === "degraded"
                          ? "#E89558"
                          : "#EA2143",
                    }}
                  />
                </div>
                <div>
                  <span className="text-xs font-semibold text-text-primary block">
                    {svc.name}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {svc.category} &middot; {svc.uptime}% uptime
                  </span>
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
    <GlassCard className="group relative overflow-hidden">
      <div
        className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
        style={{ background: color }}
      />
      <div className="relative">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
          style={{ background: `${color}0D`, color }}
        >
          {icon}
        </div>
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm font-bold text-text-primary mt-1 font-mono">
          {value}
        </div>
      </div>
    </GlassCard>
  );
}
