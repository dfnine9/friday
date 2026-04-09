"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Cpu,
  Zap,
  BarChart3,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Hexagon,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "skills", label: "Skills & Agents", icon: Cpu },
  { id: "status", label: "System Status", icon: Activity },
  { id: "actions", label: "Quick Actions", icon: Zap },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "glass-strong h-full flex flex-col transition-all duration-300 relative z-10",
        collapsed ? "w-[68px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border-glass shrink-0">
        <div className="relative">
          <Hexagon className="w-8 h-8 text-primary" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold text-primary font-mono tracking-tighter">
              FR
            </span>
          </div>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1
              className="text-sm font-bold tracking-widest text-text-primary"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              F.R.I.D.A.Y.
            </h1>
            <p className="text-[10px] text-text-muted tracking-wide">
              SUPERCOMPUTER v2.0
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary-dim text-primary glow-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
              )}
            >
              <Icon
                className={clsx(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-text-muted group-hover:text-text-secondary"
                )}
              />
              {!collapsed && (
                <span className="text-[13px] font-medium truncate">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 space-y-1 border-t border-border-glass pt-3">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-white/[0.03] transition-colors">
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-[13px]">Settings</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full glass-strong flex items-center justify-center text-text-muted hover:text-primary transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
