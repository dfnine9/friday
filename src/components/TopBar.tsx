"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Wifi, Clock, Command } from "lucide-react";

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
          weekday: "long",
          month: "short",
          day: "numeric",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="glass-bar h-16 flex items-center justify-between px-6 shrink-0 z-10">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/[0.03] border border-black/[0.04] flex-1 group focus-within:border-primary/20 focus-within:bg-white focus-within:shadow-sm transition-all">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search skills, agents, commands..."
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full font-medium"
          />
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] text-text-muted bg-white border border-black/[0.06] font-mono shadow-sm">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Active connections */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-dim">
          <Wifi className="w-3.5 h-3.5 text-success" />
          <span className="text-[11px] font-semibold text-success">147 Active</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-black/[0.03] transition-colors">
          <Bell className="w-[18px] h-[18px] text-text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-black/[0.06]" />

        {/* Clock */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-dim flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[13px] font-bold text-text-primary font-mono tracking-wider">
              {time}
            </div>
            <div className="text-[11px] text-text-muted font-medium">{date}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
