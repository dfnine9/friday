"use client";

import { useEffect } from "react";
import ActionsSection from "@/components/ActionsSection";
import TerminalSection from "@/components/TerminalSection";
import DownloadSection from "@/components/DownloadSection";

export default function ToolsTab() {
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail;
      const target =
        action === "scroll-terminal" ? "section-terminal" :
        action === "scroll-actions" ? "section-actions" :
        action === "scroll-downloads" ? "section-downloads" : null;
      if (target) document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("nav-action", handler);
    return () => window.removeEventListener("nav-action", handler);
  }, []);

  return (
    <div className="overflow-y-auto h-[calc(100vh-104px)]">
      <div id="section-actions"><ActionsSection /></div>
      <div id="section-terminal"><TerminalSection /></div>
      <div id="section-downloads"><DownloadSection /></div>
    </div>
  );
}
