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
    <div className="h-screen flex bg-background grid-bg">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/[0.02] rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-[#a78bfa]/[0.015] rounded-full blur-[80px]" />
      </div>

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-[1]">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Panel />
          </div>
        </main>
      </div>
    </div>
  );
}
