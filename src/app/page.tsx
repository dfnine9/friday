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
    <div className="h-screen flex dot-grid relative overflow-hidden">
      {/* ═══ AMBIENT BLOB LAYER ═══
          These colored orbs sit behind everything.
          The glass panels blur them, creating visible refraction.
          This is the soul of glassmorphism — without them it's just gray boxes. */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Primary blue blob — top left */}
        <div
          className="ambient-blob animate-blob"
          style={{
            width: 500, height: 500,
            background: "radial-gradient(circle, #1856FF 0%, transparent 70%)",
            top: "-5%", left: "10%",
            opacity: 0.25,
          }}
        />
        {/* Accent purple blob — center right */}
        <div
          className="ambient-blob animate-blob"
          style={{
            width: 450, height: 450,
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            top: "30%", right: "5%",
            opacity: 0.2,
            animationDelay: "-7s",
          }}
        />
        {/* Cyan blob — bottom center */}
        <div
          className="ambient-blob animate-blob"
          style={{
            width: 400, height: 400,
            background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            bottom: "0%", left: "35%",
            opacity: 0.18,
            animationDelay: "-14s",
          }}
        />
        {/* Rose blob — bottom left */}
        <div
          className="ambient-blob animate-blob"
          style={{
            width: 350, height: 350,
            background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)",
            bottom: "15%", left: "-5%",
            opacity: 0.12,
            animationDelay: "-4s",
          }}
        />
        {/* Green blob — top right */}
        <div
          className="ambient-blob animate-blob"
          style={{
            width: 300, height: 300,
            background: "radial-gradient(circle, #07CA6B 0%, transparent 70%)",
            top: "5%", right: "25%",
            opacity: 0.12,
            animationDelay: "-10s",
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-[1]">
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
