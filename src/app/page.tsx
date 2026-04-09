"use client";

import ClientOnly from "@/components/ClientOnly";
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

export default function FridayDashboard() {
  return (
    <ClientOnly>
      <ToastProvider>
        <AgentModalProvider>
          <div className="relative dot-grid">
            {/* ═══ AMBIENT BLOB LAYER ═══ */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="ambient-blob animate-blob" style={{ width: 700, height: 700, background: "radial-gradient(circle, #1856FF 0%, transparent 70%)", top: "-8%", left: "0%", opacity: 0.25 }} />
              <div className="ambient-blob animate-blob" style={{ width: 600, height: 600, background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", top: "20%", right: "-5%", opacity: 0.2, animationDelay: "-7s" }} />
              <div className="ambient-blob animate-blob" style={{ width: 550, height: 550, background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", top: "45%", left: "25%", opacity: 0.18, animationDelay: "-14s" }} />
              <div className="ambient-blob animate-blob" style={{ width: 500, height: 500, background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)", top: "65%", left: "-8%", opacity: 0.12, animationDelay: "-4s" }} />
              <div className="ambient-blob animate-blob" style={{ width: 450, height: 450, background: "radial-gradient(circle, #07CA6B 0%, transparent 70%)", top: "8%", right: "15%", opacity: 0.12, animationDelay: "-10s" }} />
              <div className="ambient-blob animate-blob" style={{ width: 600, height: 600, background: "radial-gradient(circle, #E89558 0%, transparent 70%)", top: "80%", right: "5%", opacity: 0.14, animationDelay: "-16s" }} />
              <div className="ambient-blob animate-blob" style={{ width: 400, height: 400, background: "radial-gradient(circle, #1856FF 0%, transparent 70%)", top: "55%", right: "30%", opacity: 0.1, animationDelay: "-20s" }} />
            </div>

            {/* Navigation + Command Palette */}
            <Navbar />
            <CommandPalette />

            {/* Sections */}
            <main className="relative z-[1]">
              <HeroSection />
              <MetricsSection />
              <CapabilitiesSection />
              <SkillsSection />
              <AgentsSection />
              <StatusSection />
              <ServicesSection />
              <ActionsSection />
              <AnalyticsSection />
              <PerformanceSection />
              <TimelineSection />
              <TerminalSection />
              <ChatSection />
              <DownloadSection />
              <IntegrationsSection />
              <Footer />
            </main>
          </div>
        </AgentModalProvider>
      </ToastProvider>
    </ClientOnly>
  );
}
