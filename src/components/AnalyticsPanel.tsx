"use client";

import { useState } from "react";
import GlassCard from "./GlassCard";
import { USAGE_DATA, SKILL_GROWTH, STATS } from "@/data/friday-data";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      <p className="text-text-muted mb-1 font-mono">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPanel() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-text-primary tracking-wide"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            ANALYTICS
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Usage patterns, growth metrics, and performance data
          </p>
        </div>
        <div className="flex gap-1 glass-card rounded-lg p-0.5">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                timeRange === range
                  ? "bg-primary-dim text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <QuickStat
          label="Tasks Today"
          value="1,247"
          change="+18%"
          color="#00BD7D"
          icon={<Target className="w-4 h-4" />}
        />
        <QuickStat
          label="Avg Latency"
          value={`${STATS.avgResponseMs}ms`}
          change="-12%"
          color="#60a5fa"
          icon={<Clock className="w-4 h-4" />}
        />
        <QuickStat
          label="Active Sessions"
          value="147"
          change="+5%"
          color="#a78bfa"
          icon={<Activity className="w-4 h-4" />}
        />
        <QuickStat
          label="Skill Growth"
          value="+602"
          change="+38%"
          color="#14b8a6"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Usage Chart */}
      <GlassCard padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-3 h-3" />
            Usage Activity (24h)
          </h3>
          <div className="flex items-center gap-4">
            <LegendDot label="Skills" color="#00BD7D" />
            <LegendDot label="Agents" color="#60a5fa" />
            <LegendDot label="Commands" color="#a78bfa" />
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={USAGE_DATA}>
              <defs>
                <linearGradient id="gSkills" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00BD7D" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00BD7D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAgents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCommands" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#555a70", fontSize: 10 }}
                tickFormatter={(v) => `${v}:00`}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#555a70", fontSize: 10 }}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="skills"
                name="Skills"
                stroke="#00BD7D"
                strokeWidth={2}
                fill="url(#gSkills)"
              />
              <Area
                type="monotone"
                dataKey="agents"
                name="Agents"
                stroke="#60a5fa"
                strokeWidth={2}
                fill="url(#gAgents)"
              />
              <Area
                type="monotone"
                dataKey="commands"
                name="Commands"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="url(#gCommands)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Two column: Growth + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Skill Growth */}
        <GlassCard padding="lg">
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            Skill Growth Trajectory
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SKILL_GROWTH}>
                <defs>
                  <linearGradient id="gGrowth" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00BD7D" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#555a70", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#555a70", fontSize: 10 }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Skills"
                  stroke="url(#gGrowth)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#00BD7D", stroke: "#00BD7D" }}
                  activeDot={{ r: 5, fill: "#00BD7D", stroke: "#080a10", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Category Distribution Bar */}
        <GlassCard padding="lg">
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-3 h-3" />
            Category Distribution
          </h3>
          <div className="h-44">
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
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#555a70", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#555a70", fontSize: 10 }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Skills"
                  fill="#00BD7D"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Performance Ring */}
      <GlassCard className="flex items-center justify-center gap-8 py-6">
        <PerformanceRing label="Uptime" value={99.97} color="#00BD7D" />
        <PerformanceRing label="Accuracy" value={98.5} color="#60a5fa" />
        <PerformanceRing label="Efficiency" value={94.2} color="#a78bfa" />
        <PerformanceRing label="Reliability" value={99.1} color="#14b8a6" />
      </GlassCard>
    </div>
  );
}

function QuickStat({
  label,
  value,
  change,
  color,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  color: string;
  icon: React.ReactNode;
}) {
  const isPositive = change.startsWith("+");
  return (
    <GlassCard className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold" style={{ fontFamily: "var(--font-oswald)", color }}>
        {value}
      </div>
      <div className={`flex items-center gap-1 mt-1 text-[10px] ${isPositive ? "text-success" : "text-danger"}`}>
        <ArrowUpRight className={`w-3 h-3 ${!isPositive ? "rotate-90" : ""}`} />
        {change}
      </div>
    </GlassCard>
  );
}

function LegendDot({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-[10px] text-text-muted">{label}</span>
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
  const size = 80;
  const r = 32;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={4}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 4px ${color}50)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold font-mono" style={{ color }}>
            {value}%
          </span>
        </div>
      </div>
      <span className="text-[10px] text-text-muted">{label}</span>
    </div>
  );
}
