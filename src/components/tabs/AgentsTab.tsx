"use client";

import SkillsSection from "@/components/SkillsSection";
import AgentsSection from "@/components/AgentsSection";
import ServicesSection from "@/components/ServicesSection";
import IntegrationsSection from "@/components/IntegrationsSection";

export default function AgentsTab() {
  return (
    <div className="overflow-y-auto h-[calc(100vh-92px)]">
      <SkillsSection />
      <AgentsSection />
      <ServicesSection />
      <IntegrationsSection />
    </div>
  );
}
