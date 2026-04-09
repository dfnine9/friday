"use client";

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
import IntegrationsSection from "@/components/IntegrationsSection";
import Footer from "@/components/Footer";

export default function FridayDashboard() {
  return (
    <div className="relative dot-grid">
      {/* ═══ AMBIENT BLOB LAYER ═══
          These colored orbs span the full page height.
          Glass panels blur them → visible refraction → real glassmorphism. */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="ambient-blob animate-blob" style={{ width: 600, height: 600, background: "radial-gradient(circle, #1856FF 0%, transparent 70%)", top: "-5%", left: "5%", opacity: 0.22 }} />
        <div className="ambient-blob animate-blob" style={{ width: 500, height: 500, background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", top: "25%", right: "0%", opacity: 0.18, animationDelay: "-7s" }} />
        <div className="ambient-blob animate-blob" style={{ width: 450, height: 450, background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", top: "50%", left: "30%", opacity: 0.15, animationDelay: "-14s" }} />
        <div className="ambient-blob animate-blob" style={{ width: 400, height: 400, background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)", top: "70%", left: "-5%", opacity: 0.1, animationDelay: "-4s" }} />
        <div className="ambient-blob animate-blob" style={{ width: 350, height: 350, background: "radial-gradient(circle, #07CA6B 0%, transparent 70%)", top: "10%", right: "20%", opacity: 0.1, animationDelay: "-10s" }} />
        <div className="ambient-blob animate-blob" style={{ width: 500, height: 500, background: "radial-gradient(circle, #E89558 0%, transparent 70%)", top: "85%", right: "10%", opacity: 0.12, animationDelay: "-16s" }} />
      </div>

      {/* Navigation */}
      <Navbar />

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
        <IntegrationsSection />
        <Footer />
      </main>
    </div>
  );
}
