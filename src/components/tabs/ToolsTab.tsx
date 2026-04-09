"use client";

import ActionsSection from "@/components/ActionsSection";
import TerminalSection from "@/components/TerminalSection";
import DownloadSection from "@/components/DownloadSection";

export default function ToolsTab() {
  return (
    <div className="overflow-y-auto h-[calc(100vh-92px)]">
      <ActionsSection />
      <TerminalSection />
      <DownloadSection />
    </div>
  );
}
