"use client";

import { USAGE_DATA, SKILL_GROWTH } from "@/data/friday-data";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !rounded-xl px-4 py-3 text-xs shadow-lg">
      <p className="text-text-muted font-mono font-bold mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsSection() {
  return (
    <section id="analytics" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Analytics</h2>
          <p>Usage patterns, growth trajectories, and domain distribution across the platform</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Usage Activity */}
          <div className="glass-card luminous-border p-6 lg:col-span-2">
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
                    <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1856FF" stopOpacity={0.4} /><stop offset="100%" stopColor="#1856FF" stopOpacity={0.02} /></linearGradient>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} /></linearGradient>
                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#07CA6B" stopOpacity={0.25} /><stop offset="100%" stopColor="#07CA6B" stopOpacity={0.02} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="skills" name="Skills" stroke="#1856FF" strokeWidth={2.5} fill="url(#gs)" />
                  <Area type="monotone" dataKey="agents" name="Agents" stroke="#7c3aed" strokeWidth={2} fill="url(#ga)" />
                  <Area type="monotone" dataKey="commands" name="Commands" stroke="#07CA6B" strokeWidth={2} fill="url(#gc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Growth */}
          <div className="glass-card luminous-border p-6">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Skill Growth</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SKILL_GROWTH}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} width={40} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" name="Skills" stroke="#1856FF" strokeWidth={3} dot={{ r: 4, fill: "#1856FF", stroke: "#08080f", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Distribution */}
          <div className="glass-card luminous-border p-6">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Domain Distribution</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Eng", count: 1842 }, { name: "Sec", count: 634 }, { name: "Ops", count: 521 }, { name: "AI", count: 487 },
                  { name: "FE", count: 445 }, { name: "BE", count: 412 }, { name: "DB", count: 389 }, { name: "Cloud", count: 356 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#555a70", fontSize: 10 }} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Skills" radius={[6, 6, 0, 0]}>
                    {["#1856FF", "#EA2143", "#7c3aed", "#1856FF", "#E89558", "#07CA6B", "#3A344E", "#06b6d4"].map((c, i) => <Cell key={i} fill={c} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dot({ label, color }: { label: string; color: string }) {
  return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}50` }} /><span className="text-[10px] font-semibold text-text-muted">{label}</span></div>;
}
