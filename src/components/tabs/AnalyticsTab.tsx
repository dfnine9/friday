"use client";

import AnalyticsSection from "@/components/AnalyticsSection";
import StatusSection from "@/components/StatusSection";
import TimelineSection from "@/components/TimelineSection";

export default function AnalyticsTab() {
  return (
    <div className="overflow-y-auto h-[calc(100vh-64px)]">
      <AnalyticsSection />
      <StatusSection />
      <TimelineSection />
    </div>
  );
}
