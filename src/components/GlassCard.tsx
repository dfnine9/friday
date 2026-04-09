"use client";

import clsx from "clsx";
import { type ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "primary" | "accent" | "none";
  padding?: "sm" | "md" | "lg";
};

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = "none",
  padding = "md",
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        "glass-card rounded-xl transition-all duration-300",
        hover && "depth-card",
        glow === "primary" && "glow-primary",
        glow === "accent" && "glow-accent",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  color = "#00BD7D",
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <GlassCard className="relative overflow-hidden group">
      {/* Ambient glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
        style={{ background: color }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
            {label}
          </span>
          {icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${color}15` }}
            >
              <div style={{ color }}>{icon}</div>
            </div>
          )}
        </div>
        <div
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-oswald)", color }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {sub && (
          <p className="text-[11px] text-text-muted mt-1">{sub}</p>
        )}
      </div>
    </GlassCard>
  );
}

export function StatusBadge({
  status,
}: {
  status: "online" | "degraded" | "offline";
}) {
  const config = {
    online: { color: "#16A34A", bg: "rgba(22,163,74,0.12)", label: "Online" },
    degraded: { color: "#D97706", bg: "rgba(217,119,6,0.12)", label: "Degraded" },
    offline: { color: "#DC2626", bg: "rgba(220,38,38,0.12)", label: "Offline" },
  };
  const c = config[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: c.bg, color: c.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: c.color,
          boxShadow: status === "online" ? `0 0 6px ${c.color}` : undefined,
        }}
      />
      {c.label}
    </span>
  );
}
