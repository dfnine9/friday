"use client";

import { ToastProvider } from "@/components/ToastSystem";
import { AgentModalProvider } from "@/components/AgentModal";
import CommandPalette from "@/components/CommandPalette";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MetricsSection from "@/components/MetricsSection";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import SkillsSection from "@/components/SkillsSection";
import AgentsSection from "@/components/AgentsSection";
import StatusSection from "@/components/StatusSection";
import ServicesSection from "@/components/ServicesSection";
import ActionsSection from "@/components/ActionsSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import PerformanceSection from "@/components/PerformanceSection";
import TimelineSection from "@/components/TimelineSection";
import TerminalSection from "@/components/TerminalSection";
import ChatSection from "@/components/ChatSection";
import DownloadSection from "@/components/DownloadSection";
import IntegrationsSection from "@/components/IntegrationsSection";
import Footer from "@/components/Footer";
import LazySection from "@/components/LazySection";

export default function FridayDashboard() {
  return (
    <ToastProvider>
      <AgentModalProvider>
        <div className="relative dot-grid" suppressHydrationWarning>
          {/* ═══ AMBIENT BLOBS ═══ */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="ambient-blob animate-blob" style={{ width: 600, height: 600, background: "radial-gradient(circle, #1856FF 0%, transparent 70%)", top: "-5%", left: "0%", opacity: 0.2 }} />
            <div className="ambient-blob animate-blob" style={{ width: 500, height: 500, background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", top: "30%", right: "-5%", opacity: 0.16, animationDelay: "-7s" }} />
            <div className="ambient-blob animate-blob" style={{ width: 450, height: 450, background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", top: "60%", left: "20%", opacity: 0.14, animationDelay: "-14s" }} />
            <div className="ambient-blob animate-blob" style={{ width: 500, height: 500, background: "radial-gradient(circle, #E89558 0%, transparent 70%)", top: "85%", right: "10%", opacity: 0.12, animationDelay: "-20s" }} />
          </div>

          <Navbar />
          <CommandPalette />

          <main className="relative z-[1]">
            <HeroSection />
            <MetricsSection />
            <CapabilitiesSection />
            <SkillsSection />
            <AgentsSection />
            <LazySection><StatusSection /></LazySection>
            <LazySection><ServicesSection /></LazySection>
            <LazySection><ActionsSection /></LazySection>
            <LazySection><AnalyticsSection /></LazySection>
            <LazySection><PerformanceSection /></LazySection>
            <LazySection><TimelineSection /></LazySection>
            <LazySection><TerminalSection /></LazySection>
            <LazySection><ChatSection /></LazySection>
            <LazySection><DownloadSection /></LazySection>
            <LazySection><IntegrationsSection /></LazySection>
            <Footer />
          </main>
        </div>
      </AgentModalProvider>
    </ToastProvider>
  );
}
