"use client";

import { useState, useEffect } from "react";
import { Hexagon } from "lucide-react";
import { NAV_SECTIONS } from "@/data/friday-data";
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
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/25 flex items-center justify-center">
            <Hexagon className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
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

        {/* Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="status-online animate-pulse-dot" style={{ width: 6, height: 6 }} />
          <span className="text-[10px] font-bold text-success tracking-wide hidden sm:inline">
            ONLINE
          </span>
        </div>
      </div>
    </nav>
  );
}
