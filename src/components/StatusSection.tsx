"use client";

import { useState, useEffect } from "react";
import { Cpu, MemoryStick, HardDrive, Thermometer } from "lucide-react";

function useAnimatedValue(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    const el = document.getElementById("status");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - startTime) / duration, 1);
      setValue(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);
  return value;
}

function Gauge({ value, label, color, size = 120 }: { value: number; label: string; color: string; size?: number }) {
  const animated = useAnimatedValue(value);
  const sw = 5; const r = (size - sw * 2) / 2; const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c - (animated / 100) * c} style={{ filter: `drop-shadow(0 0 8px ${color}50)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{Math.round(animated)}</span>
          <span className="text-[9px] font-semibold text-text-muted">%</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
    </div>
  );
}

export default function StatusSection() {
  return (
    <section id="status" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>System Status</h2>
          <p>Real-time resource utilization across all F.R.I.D.A.Y. neural subsystems</p>
        </div>
        <div className="glass-card luminous-border p-8 md:p-12 mb-8">
          <div className="flex items-center justify-around flex-wrap gap-8">
            <Gauge value={34} label="CPU" color="#1856FF" />
            <Gauge value={62} label="Memory" color="#7c3aed" />
            <Gauge value={28} label="GPU" color="#07CA6B" />
            <Gauge value={45} label="Storage" color="#E89558" />
            <Gauge value={18} label="Network" color="#EA2143" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {[
            { icon: <Cpu className="w-5 h-5" />, label: "Neural Cores", value: "8 / 8 Active", color: "#1856FF" },
            { icon: <MemoryStick className="w-5 h-5" />, label: "Context Window", value: "1,000,000 tokens", color: "#7c3aed" },
            { icon: <HardDrive className="w-5 h-5" />, label: "Vector Store", value: "2.4M embeddings", color: "#07CA6B" },
            { icon: <Thermometer className="w-5 h-5" />, label: "Inference Temp", value: "0.7 balanced", color: "#E89558" },
          ].map((item) => (
            <div key={item.label} className="glass-card depth-card p-5 group relative overflow-hidden text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${item.color}15`, border: `1px solid ${item.color}20`, color: item.color }}>{item.icon}</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.label}</div>
              <div className="text-sm font-bold text-text-primary mt-1 font-mono">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
