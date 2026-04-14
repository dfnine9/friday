"use client";

import { ChevronDown, Cpu, Activity, Terminal, Bot } from "lucide-react";
import { FRIDAY_META } from "@/data/friday-data";
import ArcReactorLogo from "./ArcReactorLogo";

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center">
      <div className="section-inner text-center">
        {/* Arc Reactor Logo */}
        <div className="mb-10 flex justify-center">
          <ArcReactorLogo size="hero" />
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
          across 9,510 skills and 996 autonomous agents.
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
            { label: "Skill Modules", value: "9,510", icon: <Terminal className="w-4 h-4" />, color: "#07CA6B" },
            { label: "Agent Fleet", value: "996", icon: <Bot className="w-4 h-4" />, color: "#E89558" },
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
