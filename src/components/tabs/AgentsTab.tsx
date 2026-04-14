"use client";

import { useEffect } from "react";
import SkillsSection from "@/components/SkillsSection";
import AgentsSection from "@/components/AgentsSection";
import ServicesSection from "@/components/ServicesSection";
import IntegrationsSection from "@/components/IntegrationsSection";

export default function AgentsTab() {
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail;
      const target =
        action === "scroll-agents" ? "section-agents" :
        action === "scroll-skills" ? "section-skills" :
        action === "scroll-integrations" ? "section-integrations" : null;
      if (target) document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("nav-action", handler);
    return () => window.removeEventListener("nav-action", handler);
  }, []);

  return (
    <div className="overflow-y-auto h-[calc(100vh-104px)]">
      <div id="section-skills"><SkillsSection /></div>
      <div id="section-agents"><AgentsSection /></div>
      <ServicesSection />
      <div id="section-integrations"><IntegrationsSection /></div>
    </div>
  );
}
