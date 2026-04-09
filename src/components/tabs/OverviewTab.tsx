"use client";

import HeroSection from "@/components/HeroSection";
import MetricsSection from "@/components/MetricsSection";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import PerformanceSection from "@/components/PerformanceSection";
import Footer from "@/components/Footer";

export default function OverviewTab() {
  return (
    <div className="overflow-y-auto h-[calc(100vh-92px)]">
      <HeroSection />
      <MetricsSection />
      <CapabilitiesSection />
      <PerformanceSection />
      <Footer />
    </div>
  );
}
