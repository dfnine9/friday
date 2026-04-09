"use client";

import { useState, useEffect } from "react";
import { NAV_SECTIONS } from "@/data/friday-data";
import ArcReactorLogo from "./ArcReactorLogo";
import clsx from "clsx";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" }
    );

    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-sidebar py-3 shadow-lg shadow-black/20"
          : "py-4 bg-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2.5 shrink-0">
          <ArcReactorLogo size="sm" />
          <span className="text-sm font-bold text-text-primary tracking-tight">
            F.R.I.D.A.Y.
          </span>
        </a>

        {/* Section Links */}
        <div className="hidden md:flex items-center gap-1 overflow-x-auto">
          {NAV_SECTIONS.filter((s) => s.id !== "hero").map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap",
                activeSection === id
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-text-muted hover:text-text-secondary hover:bg-white/[0.03]"
              )}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Cmd+K + Status */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-inner text-[10px] font-bold text-text-muted hover:text-primary hover:border-primary/20 transition-colors border border-white/[0.05]"
          >
            <span>Search</span>
            <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono">⌘K</kbd>
          </button>
          <div className="flex items-center gap-2">
            <div className="status-online animate-pulse-dot" style={{ width: 6, height: 6 }} />
            <span className="text-[10px] font-bold text-success tracking-wide hidden sm:inline">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
