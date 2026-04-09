"use client";

import { useState } from "react";
import { ToastProvider } from "@/components/ToastSystem";
import { AgentModalProvider } from "@/components/AgentModal";
import CommandPalette from "@/components/CommandPalette";
import Navbar from "@/components/Navbar";

// Tab components — only the active one renders
import VoiceTab from "@/components/tabs/VoiceTab";
import ChatTab from "@/components/tabs/ChatTab";
import OverviewTab from "@/components/tabs/OverviewTab";
import AgentsTab from "@/components/tabs/AgentsTab";
import AnalyticsTab from "@/components/tabs/AnalyticsTab";
import ToolsTab from "@/components/tabs/ToolsTab";

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  voice: VoiceTab,
  chat: ChatTab,
  overview: OverviewTab,
  agents: AgentsTab,
  analytics: AnalyticsTab,
  tools: ToolsTab,
};

export default function FridayDashboard() {
  const [activeTab, setActiveTab] = useState("voice");
  const ActiveTabComponent = TAB_COMPONENTS[activeTab] || VoiceTab;

  return (
    <ToastProvider>
      <AgentModalProvider>
        <div className="relative dot-grid cosmic-bg h-screen overflow-hidden" suppressHydrationWarning>
          {/* Ambient blobs — reduced to 2 for performance */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="ambient-blob" style={{ width: 500, height: 500, background: "radial-gradient(circle, #1856FF 0%, transparent 70%)", top: "-10%", left: "-5%", opacity: 0.18 }} />
            <div className="ambient-blob" style={{ width: 400, height: 400, background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", bottom: "-10%", right: "-5%", opacity: 0.14 }} />
          </div>

          {/* Always-visible navigation */}
          <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
          <CommandPalette />

          {/* Active tab content — only ONE tab renders at a time */}
          <div className="pt-16 relative z-[1] h-full">
            <ActiveTabComponent />
          </div>
        </div>
      </AgentModalProvider>
    </ToastProvider>
  );
}
