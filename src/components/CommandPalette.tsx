"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Command, ArrowRight, Terminal, Cpu, Bot, Hash, CornerDownLeft } from "lucide-react";
import { QUICK_ACTIONS, SKILL_CATEGORIES, AGENT_TIERS, NAV_SECTIONS } from "@/data/friday-data";
import { useToast } from "./ToastSystem";
import clsx from "clsx";

type PaletteItem = {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: "command" | "skill" | "agent" | "section";
  action: () => void;
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Build searchable items
  const allItems: PaletteItem[] = [
    ...QUICK_ACTIONS.map((a) => ({
      id: a.command,
      label: a.name,
      description: a.command,
      category: "Commands",
      icon: "command" as const,
      action: () => {
        navigator.clipboard.writeText(a.command);
        toast("action", `Executing ${a.name}`, `Command ${a.command} copied and launched`);
      },
    })),
    ...SKILL_CATEGORIES.map((s) => ({
      id: `skill-${s.name}`,
      label: s.name,
      description: `${s.count} skills — ${s.description}`,
      category: "Skills",
      icon: "skill" as const,
      action: () => {
        document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" });
        toast("info", `${s.name} Domain`, `${s.count.toLocaleString()} skills available`);
      },
    })),
    ...AGENT_TIERS.flatMap((tier) =>
      tier.agents.map((a) => ({
        id: `agent-${a.name}`,
        label: a.name,
        description: `${tier.tier} tier — ${a.specialty}`,
        category: "Agents",
        icon: "agent" as const,
        action: () => {
          document.getElementById("agents")?.scrollIntoView({ behavior: "smooth" });
          toast("action", `Agent: ${a.name}`, `${a.specialty}`);
        },
      }))
    ),
    ...NAV_SECTIONS.filter((s) => s.id !== "hero").map((s) => ({
      id: `section-${s.id}`,
      label: s.label,
      description: `Navigate to ${s.label} section`,
      category: "Navigation",
      icon: "section" as const,
      action: () => {
        document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
      },
    })),
  ];

  const filtered = query
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 12);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Arrow key navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
        setOpen(false);
      }
    },
    [filtered, selectedIndex]
  );

  useEffect(() => { setSelectedIndex(0); }, [query]);

  if (!open) return null;

  const ICON_MAP = {
    command: <Terminal className="w-3.5 h-3.5" />,
    skill: <Cpu className="w-3.5 h-3.5" />,
    agent: <Bot className="w-3.5 h-3.5" />,
    section: <Hash className="w-3.5 h-3.5" />,
  };

  return (
    <div className="fixed inset-0 z-[90] modal-backdrop flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="glass-card !rounded-2xl w-full max-w-xl overflow-hidden shimmer-border" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
          <Search className="w-5 h-5 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, skills, agents..."
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full font-medium"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] text-text-muted bg-white/[0.06] border border-white/[0.08] font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-text-muted">No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <>
              {/* Group by category */}
              {["Commands", "Skills", "Agents", "Navigation"].map((cat) => {
                const items = filtered.filter((i) => i.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="px-5 py-1.5">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{cat}</span>
                    </div>
                    {items.map((item) => {
                      const idx = filtered.indexOf(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => { item.action(); setOpen(false); }}
                          className={clsx(
                            "w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors",
                            idx === selectedIndex ? "bg-primary/10 text-primary" : "hover:bg-white/[0.03] text-text-secondary"
                          )}
                        >
                          <div className={clsx("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", idx === selectedIndex ? "bg-primary/20 text-primary" : "bg-white/[0.04] text-text-muted")}>
                            {ICON_MAP[item.icon]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate">{item.label}</div>
                            <div className="text-[10px] text-text-muted truncate">{item.description}</div>
                          </div>
                          {idx === selectedIndex && (
                            <div className="flex items-center gap-1 text-[10px] text-primary shrink-0">
                              <CornerDownLeft className="w-3 h-3" /> Enter
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/[0.05] text-[10px] text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">↑↓ Navigate</span>
            <span className="flex items-center gap-1"><CornerDownLeft className="w-2.5 h-2.5" /> Select</span>
            <span>ESC Close</span>
          </div>
          <span>{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
}
