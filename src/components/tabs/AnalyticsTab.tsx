"use client";

import { useEffect } from "react";
import AnalyticsSection from "@/components/AnalyticsSection";
import StatusSection from "@/components/StatusSection";
import TimelineSection from "@/components/TimelineSection";

export default function AnalyticsTab() {
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail;
      const target =
        action === "scroll-analytics" ? "section-analytics" :
        action === "scroll-status" ? "section-status" :
        action === "scroll-timeline" ? "section-timeline" : null;
      if (target) document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("nav-action", handler);
    return () => window.removeEventListener("nav-action", handler);
  }, []);

  return (
    <div className="overflow-y-auto h-[calc(100vh-104px)]">
      <div id="section-analytics"><AnalyticsSection /></div>
      <div id="section-status"><StatusSection /></div>
      <div id="section-timeline"><TimelineSection /></div>
    </div>
  );
}
