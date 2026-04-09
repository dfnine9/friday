"use client";

import { Hexagon, ChevronDown, Cpu, Activity, Terminal, Bot } from "lucide-react";
import { FRIDAY_META } from "@/data/friday-data";

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center">
      <div className="section-inner text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20 mb-8 animate-float">
          <Hexagon className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-text-primary mb-3">
          {FRIDAY_META.codename}
        </h1>
        <p className="text-lg md:text-xl text-text-secondary font-medium mb-2">
          {FRIDAY_META.fullName}
        </p>
        <p className="text-sm text-text-muted max-w-xl mx-auto leading-relaxed mb-10">
          The autonomous AI supercomputer. Successor to J.A.R.V.I.S. with multi-agent
          orchestration, real-time threat intelligence, and zero-latency command execution
          across 6,502 skills and 942 autonomous agents.
        </p>

        {/* Status */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card mb-12">
          <div className="status-online animate-pulse-dot" />
          <span className="text-xs font-bold text-success tracking-wider">ALL SYSTEMS NOMINAL</span>
        </div>

        {/* Hero Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
          {[
            { label: "Neural Cores", value: "8", icon: <Cpu className="w-4 h-4" />, color: "#1856FF" },
            { label: "Context Window", value: "1M", icon: <Activity className="w-4 h-4" />, color: "#7c3aed" },
            { label: "Skill Modules", value: "6,502", icon: <Terminal className="w-4 h-4" />, color: "#07CA6B" },
            { label: "Agent Fleet", value: "942", icon: <Bot className="w-4 h-4" />, color: "#E89558" },
          ].map((m) => (
            <div key={m.label} className="glass-card p-4 text-center group">
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${m.color}15`, border: `1px solid ${m.color}20`, color: m.color }}
              >
                {m.icon}
              </div>
              <div className="text-2xl font-bold mb-0.5" style={{ color: m.color }}>
                {m.value}
              </div>
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <a href="#metrics" className="inline-flex flex-col items-center gap-2 text-text-muted hover:text-primary transition-colors">
          <span className="text-[10px] font-semibold uppercase tracking-widest">Explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
