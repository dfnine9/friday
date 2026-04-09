"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Wifi, Clock } from "lucide-react";

export default function TopBar() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="glass-strong h-14 flex items-center justify-between px-6 border-b border-border-glass shrink-0 z-10">
      {/* Left: Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search className="w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search skills, agents, commands..."
          className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-text-muted border border-border-glass font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Right: Status + Time */}
      <div className="flex items-center gap-5">
        {/* Connection */}
        <div className="flex items-center gap-2 text-[11px]">
          <Wifi className="w-3.5 h-3.5 text-primary" />
          <span className="text-text-secondary hidden sm:inline">147 Active</span>
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
          <Bell className="w-4 h-4 text-text-muted" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Clock */}
        <div className="flex items-center gap-2 text-text-secondary">
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          <div className="text-right">
            <div className="text-[12px] font-mono font-medium text-primary tracking-wider">
              {time}
            </div>
            <div className="text-[10px] text-text-muted">{date}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
