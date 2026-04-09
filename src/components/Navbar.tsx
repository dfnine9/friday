"use client";

import { Mic, MessageCircle, LayoutDashboard, Cpu, BarChart3, Zap } from "lucide-react";
import { TABS } from "@/data/friday-data";
import ArcReactorLogo from "./ArcReactorLogo";
import clsx from "clsx";

const ICON_MAP: Record<string, React.ReactNode> = {
  mic: <Mic className="w-4 h-4" />,
  "message-circle": <MessageCircle className="w-4 h-4" />,
  "layout-dashboard": <LayoutDashboard className="w-4 h-4" />,
  cpu: <Cpu className="w-4 h-4" />,
  "bar-chart": <BarChart3 className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
};

type NavbarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
      style={{ background: "rgba(8,8,15,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between w-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ArcReactorLogo size="sm" />
          <span className="text-sm font-bold text-text-primary tracking-tight">
            F.R.I.D.A.Y.
          </span>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-1">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all",
                activeTab === id
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-text-muted hover:text-text-secondary hover:bg-white/[0.03] border border-transparent"
              )}
            >
              {ICON_MAP[icon]}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Right: Search + Status */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-text-muted hover:text-primary transition-colors border border-white/[0.05]"
          >
            <span>Search</span>
            <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono">⌘K</kbd>
          </button>
          <div className="flex items-center gap-2">
            <div className="status-online animate-pulse-dot" style={{ width: 6, height: 6 }} />
            <span className="text-[10px] font-bold text-success tracking-wide hidden sm:inline">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
