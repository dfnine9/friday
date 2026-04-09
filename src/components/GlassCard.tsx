"use client";

import clsx from "clsx";
import { type ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "primary" | "success" | "none";
  padding?: "none" | "sm" | "md" | "lg";
  luminous?: boolean;
};

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = "none",
  padding = "md",
  luminous = false,
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        "glass-card",
        hover && "depth-card",
        glow === "primary" && "glow-primary",
        glow === "success" && "glow-success",
        luminous && "luminous-border",
        padding === "none" && "p-0",
        padding === "sm" && "p-3",
        padding === "md" && "p-5",
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
  trend,
  color = "#1856FF",
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: { value: string; positive: boolean };
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <GlassCard className="relative overflow-hidden group">
      {/* Subtle corner accent */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
        style={{ background: color }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-text-muted">
            {label}
          </span>
          {icon && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${color}0D` }}
            >
              <div style={{ color }}>{icon}</div>
            </div>
          )}
        </div>
        <div className="animate-count-up">
          <span
            className="text-[28px] font-bold tracking-tight leading-none"
            style={{ color }}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          {sub && (
            <p className="text-[11px] text-text-muted">{sub}</p>
          )}
          {trend && (
            <span
              className={clsx(
                "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                trend.positive
                  ? "bg-success-dim text-success"
                  : "bg-danger-dim text-danger"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
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
    online: {
      dot: "status-online",
      bg: "bg-success-dim",
      text: "text-success",
      label: "Online",
    },
    degraded: {
      dot: "status-degraded",
      bg: "bg-warning-dim",
      text: "text-warning",
      label: "Degraded",
    },
    offline: {
      dot: "status-offline",
      bg: "bg-danger-dim",
      text: "text-danger",
      label: "Offline",
    },
  };
  const c = config[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold",
        c.bg,
        c.text
      )}
    >
      <span className={c.dot} />
      {c.label}
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-dim flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-text-primary tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
