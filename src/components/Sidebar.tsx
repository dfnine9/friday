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
  HelpCircle,
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
        "glass-sidebar h-full flex flex-col transition-all duration-300 relative z-20 shrink-0",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-white/[0.05] shrink-0">
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30 animate-breathe">
            <Hexagon className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="text-[15px] font-bold tracking-tight text-text-primary leading-tight">
              F.R.I.D.A.Y.
            </h1>
            <p className="text-[10px] text-text-muted font-medium tracking-wide">
              AUTONOMOUS AI v2.0
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {!collapsed && (
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2 block">
            Navigation
          </span>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/10"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03] border border-transparent"
              )}
            >
              <Icon
                className={clsx(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-text-muted group-hover:text-text-secondary"
                )}
              />
              {!collapsed && (
                <span className="text-[13px] font-semibold truncate">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-3 space-y-0.5 border-t border-white/[0.04] pt-3">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-white/[0.03] transition-colors">
          <HelpCircle className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Documentation</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-white/[0.03] transition-colors">
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Settings</span>}
        </button>
      </div>

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-[80px] w-7 h-7 rounded-full glass-card !rounded-full flex items-center justify-center text-text-muted hover:text-primary transition-all z-30"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
