"use client";

import { useState, useEffect } from "react";
import { USAGE_DATA, SKILL_GROWTH } from "@/data/friday-data";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-card !rounded-xl px-4 py-3 text-xs shadow-lg" style={{ background: "rgba(16,18,30,0.9)" }}>
      <p className="text-text-muted font-mono font-bold mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => {
        if (!p || !p.dataKey) return null;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color || "#888" }} />
            <span className="text-text-secondary">{p.name || p.dataKey}:</span>
            <span className="font-bold" style={{ color: p.color || "#888" }}>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
          </div>
        );
      })}
    </div>
  );
};

const BAR_COLORS = ["#1856FF", "#EA2143", "#7c3aed", "#1856FF", "#E89558", "#07CA6B", "#3A344E", "#06b6d4"];
const BAR_DATA = [
  { name: "Eng", count: 1842, fill: "#1856FF" },
  { name: "Sec", count: 634, fill: "#EA2143" },
  { name: "Ops", count: 521, fill: "#7c3aed" },
  { name: "AI", count: 487, fill: "#1856FF" },
  { name: "FE", count: 445, fill: "#E89558" },
  { name: "BE", count: 412, fill: "#07CA6B" },
  { name: "DB", count: 389, fill: "#3A344E" },
  { name: "Cloud", count: 356, fill: "#06b6d4" },
];

function Dot({ label, color }: { label: string; color: string }) {
  return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}50` }} /><span className="text-[10px] font-semibold text-text-muted">{label}</span></div>;
}

export default function AnalyticsSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section id="analytics" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Analytics</h2>
          <p>Usage patterns, growth trajectories, and domain distribution across the platform</p>
        </div>
        {mounted && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Usage Activity */}
            <div className="glass-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Usage Activity (24h)</h3>
                <div className="flex items-center gap-4">
                  <Dot label="Skills" color="#1856FF" /><Dot label="Agents" color="#7c3aed" /><Dot label="Commands" color="#07CA6B" />
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={USAGE_DATA}>
                    <defs>
                      <linearGradient id="gs2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1856FF" stopOpacity={0.4} /><stop offset="100%" stopColor="#1856FF" stopOpacity={0.02} /></linearGradient>
                      <linearGradient id="ga2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} /></linearGradient>
                      <linearGradient id="gc2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#07CA6B" stopOpacity={0.25} /><stop offset="100%" stopColor="#07CA6B" stopOpacity={0.02} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="skills" name="Skills" stroke="#1856FF" strokeWidth={2.5} fill="url(#gs2)" />
                    <Area type="monotone" dataKey="agents" name="Agents" stroke="#7c3aed" strokeWidth={2} fill="url(#ga2)" />
                    <Area type="monotone" dataKey="commands" name="Commands" stroke="#07CA6B" strokeWidth={2} fill="url(#gc2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Growth */}
            <div className="glass-card p-6">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Skill Growth</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SKILL_GROWTH}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} width={40} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="count" name="Skills" stroke="#1856FF" strokeWidth={3} dot={{ r: 4, fill: "#1856FF", stroke: "#08080f", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Distribution — NO Cell components, use fill prop on data */}
            <div className="glass-card p-6">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Domain Distribution</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BAR_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Skills" radius={[6, 6, 0, 0]} fill="#1856FF" fillOpacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
