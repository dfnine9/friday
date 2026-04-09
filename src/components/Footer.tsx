"use client";

import { Hexagon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="section border-t border-white/[0.04]">
      <div className="section-inner text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 mb-4">
          <Hexagon className="w-6 h-6 text-primary" strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-1">F.R.I.D.A.Y.</h3>
        <p className="text-xs text-text-muted mb-6">
          Female Replacement Intelligent Digital Assistant Youth<br />
          Stark Industries — Advanced AI Division
        </p>
        <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
          <Stat label="Skills" value="6,502" />
          <span className="text-white/[0.08]">|</span>
          <Stat label="Agents" value="942" />
          <span className="text-white/[0.08]">|</span>
          <Stat label="Commands" value="966" />
          <span className="text-white/[0.08]">|</span>
          <Stat label="Uptime" value="99.97%" />
        </div>
        <div className="flex items-center justify-center gap-6 text-[10px] text-text-muted">
          <span>v2.0.0</span>
          <span>&middot;</span>
          <span>Powered by Claude Opus 4.6</span>
          <span>&middot;</span>
          <span>Deployed on Vercel Edge</span>
        </div>
      </div>
    </footer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-bold text-primary">{value}</div>
      <div className="text-[10px] text-text-muted">{label}</div>
    </div>
  );
}
