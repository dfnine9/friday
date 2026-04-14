"use client";

import { useState, useRef } from "react";
import {
  Home, Mic, MessageCircle, LayoutDashboard, Cpu, BarChart3, Zap,
  ChevronDown, Volume2, Brain, Boxes, TrendingUp, Settings,
  Download, Terminal,
} from "lucide-react";
import { TABS } from "@/data/friday-data";
import ArcReactorLogo from "./ArcReactorLogo";
import clsx from "clsx";

const ICON_MAP: Record<string, React.ReactNode> = {
  home:             <Home            className="w-3.5 h-3.5" />,
  mic:              <Mic             className="w-3.5 h-3.5" />,
  "message-circle": <MessageCircle  className="w-3.5 h-3.5" />,
  "layout-dashboard": <LayoutDashboard className="w-3.5 h-3.5" />,
  cpu:              <Cpu             className="w-3.5 h-3.5" />,
  "bar-chart":      <BarChart3       className="w-3.5 h-3.5" />,
  zap:              <Zap             className="w-3.5 h-3.5" />,
};

type DItem = { icon: React.ReactNode; label: string; desc: string; action?: string };

// Dropdown menu definitions — each item can optionally trigger a sub-action in the target tab
const MENUS: Record<string, DItem[]> = {
  voice: [
    { icon: <Mic       className="w-3.5 h-3.5" />, label: "Voice Interface",  desc: "Talk to Friday in real time"        },
    { icon: <Volume2   className="w-3.5 h-3.5" />, label: "Audio Settings",   desc: "Configure voice input & API key",   action: "open-settings" },
    { icon: <Brain     className="w-3.5 h-3.5" />, label: "Voice Commands",   desc: "View available voice commands",     action: "show-commands" },
  ],
  chat: [
    { icon: <MessageCircle className="w-3.5 h-3.5" />, label: "New Chat",     desc: "Start a fresh conversation",        action: "new-chat"     },
    { icon: <Brain     className="w-3.5 h-3.5" />, label: "Conversations",    desc: "View conversation history",         action: "show-history" },
    { icon: <Settings  className="w-3.5 h-3.5" />, label: "API Keys",         desc: "Configure AI model & API keys",     action: "open-settings" },
  ],
  overview: [
    { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: "Dashboard",  desc: "System overview & branding"         },
    { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Performance",     desc: "Real-time performance rings",       action: "scroll-performance" },
    { icon: <Boxes     className="w-3.5 h-3.5" />, label: "Capabilities",     desc: "Browse all available modules",      action: "scroll-capabilities" },
  ],
  agents: [
    { icon: <Cpu       className="w-3.5 h-3.5" />, label: "All Agents",       desc: "Browse 922+ specialized agents",    action: "scroll-agents"       },
    { icon: <Brain     className="w-3.5 h-3.5" />, label: "Skills Library",   desc: "6,500+ skills across 33 repos",     action: "scroll-skills"       },
    { icon: <Boxes     className="w-3.5 h-3.5" />, label: "Integrations",     desc: "Connected services & APIs",         action: "scroll-integrations" },
  ],
  analytics: [
    { icon: <BarChart3  className="w-3.5 h-3.5" />, label: "Live Charts",     desc: "Real-time performance analytics",   action: "scroll-analytics" },
    { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Key Metrics",     desc: "KPIs and system gauges",            action: "scroll-status"    },
    { icon: <Settings  className="w-3.5 h-3.5" />, label: "Timeline",         desc: "System activity timeline",          action: "scroll-timeline"  },
  ],
  tools: [
    { icon: <Terminal  className="w-3.5 h-3.5" />, label: "Terminal",         desc: "Interactive command line interface", action: "scroll-terminal"  },
    { icon: <Zap       className="w-3.5 h-3.5" />, label: "Actions",          desc: "Quick command shortcuts",           action: "scroll-actions"   },
    { icon: <Download  className="w-3.5 h-3.5" />, label: "Downloads",        desc: "Packages & resources",              action: "scroll-downloads" },
  ],
};

type NavbarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function enter(id: string) {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    if (MENUS[id]) setOpenMenu(id);
  }

  function leave() {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180);
  }

  // Navigate to tab + optionally dispatch a sub-action for the target component
  function navigate(tabId: string, action?: string) {
    onTabChange(tabId);
    setOpenMenu(null);
    if (action) {
      // Small delay so React mounts the new tab component before the event fires
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("nav-action", { detail: action }));
      }, 120);
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, rgba(6,6,18,1) 0%, rgba(6,6,18,0.98) 70%, rgba(6,6,18,0.92) 100%)",
      }}
    >
      {/* Arc reactor — clicks to voice tab */}
      <button
        onClick={() => navigate("voice")}
        className="mt-3 mb-1 transition-transform hover:scale-125 active:scale-95"
        title="Talk to Friday"
      >
        <ArcReactorLogo size="sm" />
      </button>
      <span className="text-[9px] font-bold text-text-muted tracking-[0.2em] mb-2 uppercase">
        F.R.I.D.A.Y.
      </span>

      {/* Tab row */}
      <div className="flex items-center gap-1 pb-3">
        {TABS.map(({ id, label, icon }) => {
          const hasMenu = !!MENUS[id];
          const isActive = activeTab === id;
          const isOpen = openMenu === id;

          return (
            <div
              key={id}
              className="relative"
              onMouseEnter={() => enter(id)}
              onMouseLeave={leave}
            >
              {/* Tab button */}
              <button
                onClick={() => navigate(id)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all",
                  isActive
                    ? "bg-white/[0.08] text-text-primary border border-white/[0.1]"
                    : "text-text-muted hover:text-text-secondary hover:bg-white/[0.03] border border-transparent"
                )}
              >
                {ICON_MAP[icon]}
                <span className="hidden sm:inline">{label}</span>
                {hasMenu && (
                  <ChevronDown
                    className={clsx(
                      "w-2.5 h-2.5 transition-transform duration-200 hidden sm:block",
                      isOpen && "rotate-180"
                    )}
                  />
                )}
              </button>

              {/* Dropdown panel — always mounted, opacity/transform animated */}
              {hasMenu && (
                <div
                  className="absolute top-full left-1/2 mt-2 w-56 rounded-2xl overflow-hidden"
                  style={{
                    transform: `translateX(-50%) translateY(${isOpen ? "0px" : "-6px"})`,
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? "auto" : "none",
                    transition: "opacity 0.18s ease, transform 0.18s ease",
                    background: "rgba(10,10,24,0.94)",
                    backdropFilter: "blur(28px)",
                    WebkitBackdropFilter: "blur(28px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 20px 56px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={() => enter(id)}
                  onMouseLeave={leave}
                >
                  <div className="p-1.5">
                    {MENUS[id].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(id, item.action)}
                        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left group"
                      >
                        <div className="mt-0.5 text-primary shrink-0">{item.icon}</div>
                        <div>
                          <div className="text-[11px] font-semibold text-text-primary group-hover:text-white transition-colors">
                            {item.label}
                          </div>
                          <div className="text-[9px] text-text-muted mt-0.5 leading-relaxed">
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
