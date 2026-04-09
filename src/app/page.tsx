"use client";

import { useState, useEffect } from "react";
import { ToastProvider } from "@/components/ToastSystem";
import { AgentModalProvider } from "@/components/AgentModal";
import CommandPalette from "@/components/CommandPalette";
import Navbar from "@/components/Navbar";

// Tab components — only the active one renders
import HomeTab from "@/components/tabs/HomeTab";
import VoiceTab from "@/components/tabs/VoiceTab";
import ChatTab from "@/components/tabs/ChatTab";
import OverviewTab from "@/components/tabs/OverviewTab";
import AgentsTab from "@/components/tabs/AgentsTab";
import AnalyticsTab from "@/components/tabs/AnalyticsTab";
import ToolsTab from "@/components/tabs/ToolsTab";

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  home: HomeTab,
  voice: VoiceTab,
  chat: ChatTab,
  overview: OverviewTab,
  agents: AgentsTab,
  analytics: AnalyticsTab,
  tools: ToolsTab,
};

export default function FridayDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const ActiveTabComponent = TAB_COMPONENTS[activeTab] || HomeTab;

  // Listen for tab switch events from Quick Launch buttons
  useEffect(() => {
    const handler = (e: Event) => setActiveTab((e as CustomEvent).detail);
    window.addEventListener("switch-tab", handler);
    return () => window.removeEventListener("switch-tab", handler);
  }, []);

  return (
    <ToastProvider>
      <AgentModalProvider>
        <div className="relative dot-grid cosmic-bg h-screen overflow-hidden" suppressHydrationWarning>
          {/* Flickering stars */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={`star-${i}`} className="star" />
          ))}
          {/* Shooting stars */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`shoot-${i}`} className="shooting-star" />
          ))}

          {/* Always-visible navigation */}
          <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
          <CommandPalette />

          {/* Active tab content — offset for centered nav */}
          <div className="pt-[92px] relative z-[1] h-full">
            <ActiveTabComponent />
          </div>
        </div>
      </AgentModalProvider>
    </ToastProvider>
  );
}
