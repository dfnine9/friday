"use client";

import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import MetricsSection from "@/components/MetricsSection";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import PerformanceSection from "@/components/PerformanceSection";
import Footer from "@/components/Footer";

export default function OverviewTab() {
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail;
      const target =
        action === "scroll-performance" ? "section-performance" :
        action === "scroll-capabilities" ? "section-capabilities" : null;
      if (target) document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("nav-action", handler);
    return () => window.removeEventListener("nav-action", handler);
  }, []);

  return (
    <div className="overflow-y-auto h-[calc(100vh-104px)]">
      <HeroSection />
      <MetricsSection />
      <div id="section-capabilities"><CapabilitiesSection /></div>
      <div id="section-performance"><PerformanceSection /></div>
      <Footer />
    </div>
  );
}
