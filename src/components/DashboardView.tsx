"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import HomeTab from "@/components/tabs/HomeTab";
import VoiceTab from "@/components/tabs/VoiceTab";
import ChatTab from "@/components/tabs/ChatTab";
import OverviewTab from "@/components/tabs/OverviewTab";
import AgentsTab from "@/components/tabs/AgentsTab";
import AnalyticsTab from "@/components/tabs/AnalyticsTab";
import ToolsTab from "@/components/tabs/ToolsTab";

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  home: HomeTab, voice: VoiceTab, chat: ChatTab,
  overview: OverviewTab, agents: AgentsTab,
  analytics: AnalyticsTab, tools: ToolsTab,
};

export default function DashboardView({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("home");
  const ActiveTabComponent = TAB_COMPONENTS[activeTab] || HomeTab;

  useEffect(() => {
    const handler = (e: Event) => setActiveTab((e as CustomEvent).detail);
    window.addEventListener("switch-tab", handler);
    return () => window.removeEventListener("switch-tab", handler);
  }, []);

  return (
    <div className="relative dot-grid cosmic-bg h-screen overflow-hidden">
      {/* Back to Friday button */}
      <button
        onClick={onBack}
        className="fixed top-3 left-4 z-[60] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-text-muted hover:text-primary hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.08]"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Friday
      </button>

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <CommandPalette />
      <div className="pt-[104px] relative z-[1] h-full">
        <ActiveTabComponent />
      </div>
    </div>
  );
}
