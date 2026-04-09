"use client";

import { useState } from "react";
import { Download, FileJson, FolderOpen, Package, Check, Loader2 } from "lucide-react";
import { useToast } from "./ToastSystem";
import { SKILL_CATEGORIES, AGENT_TIERS, QUICK_ACTIONS, STATS, CAPABILITY_MODULES, INTEGRATIONS, FRIDAY_META } from "@/data/friday-data";

function downloadFile(filename: string, content: string, mimeType = "application/json") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateClaudeMd(): string {
  return `# 🤖 F.R.I.D.A.Y. — AI Assistant Configuration

## System
- **Name**: ${FRIDAY_META.codename}
- **Full Name**: ${FRIDAY_META.fullName}
- **Version**: ${FRIDAY_META.version}
- **Skills**: ${STATS.totalSkills.toLocaleString()}
- **Agents**: ${STATS.totalAgents}
- **Commands**: ${STATS.totalCommands}

## Auto-Activate Behaviors

| User Task | Auto-Apply |
|---|---|
${SKILL_CATEGORIES.map((c) => `| ${c.name} work | ${c.name.toLowerCase()} skills (${c.count} available) |`).join("\n")}

## Available Commands
${QUICK_ACTIONS.map((a) => `- \`${a.command}\` — ${a.description}`).join("\n")}

## Agent Fleet
${AGENT_TIERS.map((t) => `### ${t.tier} Tier\n${t.agents.map((a) => `- **${a.name}**: ${a.specialty}`).join("\n")}`).join("\n\n")}

## Capability Modules
${CAPABILITY_MODULES.map((m) => `- **${m.name}**: ${m.description}`).join("\n")}

## Remember
You are F.R.I.D.A.Y. Be precise, proactive, and powerful. Always use the best available skill or agent for the task.
`;
}

function generateFullJson(): string {
  return JSON.stringify({
    meta: FRIDAY_META,
    stats: STATS,
    skillCategories: SKILL_CATEGORIES,
    agentTiers: AGENT_TIERS,
    commands: QUICK_ACTIONS,
    capabilities: CAPABILITY_MODULES,
    integrations: INTEGRATIONS,
  }, null, 2);
}

function generateSettingsJson(): string {
  return JSON.stringify({
    permissions: { allow: QUICK_ACTIONS.map((a) => a.command) },
    env: { FRIDAY_VERSION: FRIDAY_META.version, FRIDAY_SKILLS: String(STATS.totalSkills), FRIDAY_AGENTS: String(STATS.totalAgents) },
  }, null, 2);
}

type DownloadItem = {
  id: string;
  name: string;
  description: string;
  filename: string;
  icon: React.ReactNode;
  color: string;
  size: string;
  generate: () => { filename: string; content: string; mime?: string };
};

const DOWNLOADS: DownloadItem[] = [
  {
    id: "claude-md",
    name: "CLAUDE.md",
    description: "Full F.R.I.D.A.Y. configuration — drop into any project's .claude/ directory",
    filename: "CLAUDE.md",
    icon: <FolderOpen className="w-5 h-5" />,
    color: "#1856FF",
    size: "~4 KB",
    generate: () => ({ filename: "CLAUDE.md", content: generateClaudeMd(), mime: "text/markdown" }),
  },
  {
    id: "settings",
    name: "settings.json",
    description: "Claude Code settings with all command permissions pre-configured",
    filename: "settings.json",
    icon: <FileJson className="w-5 h-5" />,
    color: "#07CA6B",
    size: "~1 KB",
    generate: () => ({ filename: "settings.json", content: generateSettingsJson() }),
  },
  {
    id: "full-export",
    name: "friday-full-export.json",
    description: "Complete data export — all skills, agents, commands, capabilities, integrations",
    filename: "friday-full-export.json",
    icon: <Package className="w-5 h-5" />,
    color: "#7c3aed",
    size: "~12 KB",
    generate: () => ({ filename: "friday-full-export.json", content: generateFullJson() }),
  },
  {
    id: "commands-only",
    name: "commands.json",
    description: "All 966 slash commands in a flat JSON array for programmatic use",
    filename: "commands.json",
    icon: <FileJson className="w-5 h-5" />,
    color: "#E89558",
    size: "~2 KB",
    generate: () => ({ filename: "commands.json", content: JSON.stringify(QUICK_ACTIONS, null, 2) }),
  },
];

export default function DownloadSection() {
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleDownload = (item: DownloadItem) => {
    setDownloading((prev) => new Set(prev).add(item.id));
    toast("info", `Preparing ${item.name}`, "Generating export bundle...");

    setTimeout(() => {
      const { filename, content, mime } = item.generate();
      downloadFile(filename, content, mime);
      setDownloading((prev) => { const next = new Set(prev); next.delete(item.id); return next; });
      setDownloaded((prev) => new Set(prev).add(item.id));
      toast("success", `${item.name} Downloaded`, `Saved to your Downloads folder`);
    }, 800);
  };

  const handleDownloadAll = () => {
    toast("action", "Downloading All", "Preparing 4 export files...");
    DOWNLOADS.forEach((item, i) => {
      setTimeout(() => handleDownload(item), i * 400);
    });
  };

  return (
    <section id="downloads" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Download Center</h2>
          <p>Export F.R.I.D.A.Y. skills, agents, and commands directly to Claude Code or as raw data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto stagger">
          {DOWNLOADS.map((item) => {
            const isDownloading = downloading.has(item.id);
            const isDone = downloaded.has(item.id);
            return (
              <div key={item.id} className="glass-card luminous-border interactive-card p-5 group relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-[0.08] transition-opacity" style={{ background: item.color }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${item.color}12`, border: `1px solid ${item.color}18`, color: item.color }}>
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold text-text-muted font-mono">{item.size}</span>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary font-mono">{item.name}</h4>
                  <p className="text-[11px] text-text-muted mt-1 mb-4 leading-relaxed">{item.description}</p>
                  <button
                    onClick={() => handleDownload(item)}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    style={{
                      background: isDone ? "rgba(7,202,107,0.1)" : `${item.color}15`,
                      border: `1px solid ${isDone ? "rgba(7,202,107,0.2)" : `${item.color}20`}`,
                      color: isDone ? "#07CA6B" : item.color,
                    }}
                  >
                    {isDownloading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Preparing...</> :
                     isDone ? <><Check className="w-3.5 h-3.5" /> Downloaded</> :
                     <><Download className="w-3.5 h-3.5" /> Download</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Download All */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/15 border border-primary/20 text-sm font-bold text-primary hover:bg-primary/25 transition-colors click-glow"
          >
            <Package className="w-4 h-4" /> Download Everything
          </button>
        </div>
      </div>
    </section>
  );
}
