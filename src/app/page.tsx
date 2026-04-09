"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import OverviewPanel from "@/components/OverviewPanel";
import SkillsPanel from "@/components/SkillsPanel";
import StatusPanel from "@/components/StatusPanel";
import ActionsPanel from "@/components/ActionsPanel";
import AnalyticsPanel from "@/components/AnalyticsPanel";

const PANELS: Record<string, React.ComponentType> = {
  overview: OverviewPanel,
  skills: SkillsPanel,
  status: StatusPanel,
  actions: ActionsPanel,
  analytics: AnalyticsPanel,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const Panel = PANELS[activeTab] ?? OverviewPanel;

  return (
    <div className="h-screen flex mesh-bg">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-[1400px] mx-auto">
            <Panel />
          </div>
        </main>
      </div>
    </div>
  );
}
