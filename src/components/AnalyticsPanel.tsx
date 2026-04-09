"use client";

import { useState, useEffect } from "react";
import GlassCard, { SectionHeader } from "./GlassCard";
import { USAGE_DATA, SKILL_GROWTH, STATS } from "@/data/friday-data";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !rounded-xl px-4 py-3 text-xs shadow-lg !border-black/[0.06]">
      <p className="text-text-muted font-mono font-bold mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary font-medium">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

export default function AnalyticsPanel() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Analytics"
          subtitle="Usage patterns, growth metrics, and performance data"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <div className="flex gap-0.5 glass-card !rounded-xl !p-1">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                timeRange === range
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <MetricCard
          label="Tasks Completed"
          value={1247}
          change="+18.2%"
          positive
          color="#1856FF"
          icon={<Target className="w-4 h-4" />}
        />
        <MetricCard
          label="Avg Latency"
          value={STATS.avgResponseMs}
          suffix="ms"
          change="-12.4%"
          positive
          color="#07CA6B"
          icon={<Clock className="w-4 h-4" />}
        />
        <MetricCard
          label="Active Sessions"
          value={147}
          change="+5.1%"
          positive
          color="#6C5CE7"
          icon={<Activity className="w-4 h-4" />}
        />
        <MetricCard
          label="Skills Growth"
          value={602}
          prefix="+"
          change="+38.6%"
          positive
          color="#E89558"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Usage Activity Chart */}
      <GlassCard padding="lg" luminous>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">
              Usage Activity
            </h3>
          </div>
          <div className="flex items-center gap-5">
            <LegendDot label="Skills" color="#1856FF" />
            <LegendDot label="Agents" color="#6C5CE7" />
            <LegendDot label="Commands" color="#07CA6B" />
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={USAGE_DATA}>
              <defs>
                <linearGradient id="gSkills" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1856FF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1856FF" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gAgents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gCommands" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#07CA6B" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#07CA6B" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9196A8", fontSize: 10, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9196A8", fontSize: 10, fontWeight: 600 }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="skills"
                name="Skills"
                stroke="#1856FF"
                strokeWidth={2.5}
                fill="url(#gSkills)"
              />
              <Area
                type="monotone"
                dataKey="agents"
                name="Agents"
                stroke="#6C5CE7"
                strokeWidth={2}
                fill="url(#gAgents)"
              />
              <Area
                type="monotone"
                dataKey="commands"
                name="Commands"
                stroke="#07CA6B"
                strokeWidth={2}
                fill="url(#gCommands)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Two Column: Growth + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Skill Growth */}
        <GlassCard padding="lg">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">
              Skill Growth Trajectory
            </h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SKILL_GROWTH}>
                <defs>
                  <linearGradient id="gGrowth" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1856FF" />
                    <stop offset="100%" stopColor="#6C5CE7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9196A8", fontSize: 10, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9196A8", fontSize: 10, fontWeight: 600 }}
                  width={45}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Skills"
                  stroke="url(#gGrowth)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#1856FF", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{
                    r: 6,
                    fill: "#1856FF",
                    stroke: "#fff",
                    strokeWidth: 3,
                    style: { filter: "drop-shadow(0 0 6px rgba(24,86,255,0.4))" },
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Category Distribution Bar */}
        <GlassCard padding="lg">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">
              Domain Distribution
            </h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Eng", count: 1842 },
                  { name: "Sec", count: 634 },
                  { name: "Ops", count: 521 },
                  { name: "AI", count: 487 },
                  { name: "FE", count: 445 },
                  { name: "BE", count: 412 },
                  { name: "DB", count: 389 },
                  { name: "Cloud", count: 356 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9196A8", fontSize: 10, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9196A8", fontSize: 10, fontWeight: 600 }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Skills" radius={[6, 6, 0, 0]}>
                  {[
                    "#1856FF", "#EA2143", "#6C5CE7", "#1856FF",
                    "#E89558", "#07CA6B", "#3A344E", "#1856FF",
                  ].map((color, i) => (
                    <Cell key={i} fill={color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Performance Rings */}
      <GlassCard className="flex items-center justify-center gap-10 py-8" hover={false} luminous>
        <PerformanceRing label="Uptime" value={99.97} color="#07CA6B" />
        <PerformanceRing label="Accuracy" value={98.5} color="#1856FF" />
        <PerformanceRing label="Efficiency" value={94.2} color="#6C5CE7" />
        <PerformanceRing label="Reliability" value={99.1} color="#E89558" />
      </GlassCard>
    </div>
  );
}

function MetricCard({
  label,
  value,
  prefix,
  suffix,
  change,
  positive,
  color,
  icon,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: string;
  positive: boolean;
  color: string;
  icon: React.ReactNode;
}) {
  const animated = useAnimatedNumber(value);
  return (
    <GlassCard className="relative overflow-hidden">
      <div
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-[0.03]"
        style={{ background: color }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-text-muted">{label}</span>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${color}0D`, color }}
          >
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold" style={{ color }}>
          {prefix}
          {animated.toLocaleString()}
          {suffix}
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          {positive ? (
            <ArrowUpRight className="w-3 h-3 text-success" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-danger" />
          )}
          <span
            className={`text-[11px] font-bold ${
              positive ? "text-success" : "text-danger"
            }`}
          >
            {change}
          </span>
          <span className="text-[10px] text-text-muted ml-1">vs last period</span>
        </div>
      </div>
    </GlassCard>
  );
}

function LegendDot({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-[11px] font-semibold text-text-muted">{label}</span>
    </div>
  );
}

function PerformanceRing({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const size = 90;
  const strokeWidth = 5;
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(0,0,0,0.04)"
            strokeWidth={strokeWidth}
          />
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
            style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold" style={{ color }}>
            {value}%
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
    </div>
  );
}
