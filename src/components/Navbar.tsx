"use client";

import { Home, Mic, MessageCircle, LayoutDashboard, Cpu, BarChart3, Zap } from "lucide-react";
import { TABS } from "@/data/friday-data";
import ArcReactorLogo from "./ArcReactorLogo";
import clsx from "clsx";

const ICON_MAP: Record<string, React.ReactNode> = {
  home: <Home className="w-3.5 h-3.5" />,
  mic: <Mic className="w-3.5 h-3.5" />,
  "message-circle": <MessageCircle className="w-3.5 h-3.5" />,
  "layout-dashboard": <LayoutDashboard className="w-3.5 h-3.5" />,
  cpu: <Cpu className="w-3.5 h-3.5" />,
  "bar-chart": <BarChart3 className="w-3.5 h-3.5" />,
  zap: <Zap className="w-3.5 h-3.5" />,
};

type NavbarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center"
      style={{ background: "linear-gradient(180deg, rgba(6,6,18,0.95) 0%, rgba(6,6,18,0.7) 80%, transparent 100%)" }}>

      {/* Mini arc reactor logo — easter egg: clicks to voice/Friday page */}
      <button
        onClick={() => onTabChange("voice")}
        className="mt-3 mb-1 transition-transform hover:scale-125 active:scale-95"
        title="Talk to Friday"
      >
        <ArcReactorLogo size="sm" />
      </button>
      <span className="text-[9px] font-bold text-text-muted tracking-[0.2em] mb-2 uppercase">F.R.I.D.A.Y.</span>

      {/* Tabs — horizontal underneath */}
      <div className="flex items-center gap-1 pb-3">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all",
              activeTab === id
                ? "bg-white/[0.08] text-text-primary border border-white/[0.1]"
                : "text-text-muted hover:text-text-secondary hover:bg-white/[0.03] border border-transparent"
            )}
          >
            {ICON_MAP[icon]}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
