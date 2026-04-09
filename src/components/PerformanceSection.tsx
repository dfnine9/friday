"use client";

const rings = [
  { label: "Uptime", value: 99.97, color: "#07CA6B" },
  { label: "Accuracy", value: 98.5, color: "#1856FF" },
  { label: "Efficiency", value: 94.2, color: "#7c3aed" },
  { label: "Reliability", value: 99.1, color: "#E89558" },
  { label: "Throughput", value: 96.8, color: "#06b6d4" },
];

function Ring({ label, value, color }: { label: string; value: number; color: string }) {
  const size = 100; const sw = 5; const r = (size - sw * 2) / 2;
  const c = 2 * Math.PI * r; const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset} style={{ filter: `drop-shadow(0 0 6px ${color}50)` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
    </div>
  );
}

export default function PerformanceSection() {
  return (
    <section id="performance" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Performance</h2>
          <p>System reliability metrics across all operational dimensions</p>
        </div>
        <div className="glass-card luminous-border p-8 md:p-12 flex items-center justify-center gap-10 flex-wrap">
          {rings.map((r) => <Ring key={r.label} {...r} />)}
        </div>
      </div>
    </section>
  );
}
